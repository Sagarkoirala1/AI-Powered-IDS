const jwt = require("jsonwebtoken");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const { sendOTPEmail } = require("../services/emailService");
const crypto = require("crypto");
const bcrypt = require("bcrypt");

// ============================================================
// REGISTER USER (Default Role set to "user")
// ============================================================
const registerUser = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const userExists = await User.findOne({
      $or: [{ email: normalizedEmail }, { username }],
    });

    if (userExists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    // Explicitly hash password here
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // --- FIX: Ensure default role is "user", not "admin" ---
    const user = await User.create({
      username,
      email: normalizedEmail,
      password: hashedPassword,
      role: role || "admin", // If frontend doesn't send a role, it defaults to "user"
      isVerified: false,
      otp,
      otpExpiresAt,
    });

    // Send registration OTP
    await sendOTPEmail(user.email, otp);

    return res.status(201).json({
      success: true,
      message: "Registration successful. Please enter the OTP sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// VERIFY REGISTRATION OTP
// ============================================================
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    const storedOtp = user.otp ? String(user.otp).trim() : null;
    const inputOtp = String(otp).trim();
    const isExpired = !user.otpExpiresAt || new Date(user.otpExpiresAt).getTime() < Date.now();
    console.log("OTP DEBUG:");
    console.log("Email:", email);
    console.log("Stored OTP:", storedOtp);
    console.log("Input OTP:", inputOtp);
    console.log("Expires:", user.otpExpiresAt);
    console.log("Expired:", isExpired);

    if (storedOtp !== inputOtp || isExpired) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code",
      });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiresAt = undefined;

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("OTP Verification Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// DIRECT LOGIN
// ============================================================
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    console.log(`\n--- LOGIN ATTEMPT FOR: ${email} ---`);

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and Password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      console.log("-> FAILED: User not found.");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // Use model method to compare password
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      console.log("-> FAILED: Password mismatch.");
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      console.log("-> FAILED: Account not verified.");
      return res.status(403).json({
        success: false,
        message: "Please verify your email via OTP before logging in.",
      });
    }

    console.log("-> SUCCESS: User logged in successfully!");

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// FORGOT PASSWORD - SEND RESET OTP
// ============================================================
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email",
      });
    }

    const resetOtp = crypto.randomInt(100000, 999999).toString();
    const resetOtpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    user.otp = resetOtp;
    user.otpExpiresAt = resetOtpExpiresAt;
    await user.save();

    await sendOTPEmail(user.email, resetOtp);

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// VERIFY RESET OTP
// ============================================================
const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP code are required",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const storedOtp = user.otp ? String(user.otp).trim() : null;
    const inputOtp = String(otp).trim();
    const isExpired = !user.otpExpiresAt || new Date(user.otpExpiresAt).getTime() < Date.now();

    if (storedOtp !== inputOtp || isExpired) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP code",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    // Clear OTP fields, set reset token and expiry (15 mins)
    user.otp = undefined;
    user.otpExpiresAt = undefined;
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

    await user.save();

    return res.status(200).json({
      success: true,
      message: "OTP verified. Proceed to reset password.",
      resetToken,
    });
  } catch (error) {
    console.error("Verify Reset OTP Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// RESET PASSWORD
// ============================================================
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, reset token, and new password are required",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      resetPasswordToken: resetToken,
      resetPasswordExpires: { $gt: new Date() }, // Check if token is not expired
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired reset token. Please request a new OTP.",
      });
    }

    // Explicitly hash the new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password, ensure account is verified, clear reset fields
    const result = await User.updateOne(
      { _id: user._id },
      {
        $set: {
          password: hashedPassword,
          isVerified: true,
        },
        $unset: {
          resetPasswordToken: 1,
          resetPasswordExpires: 1,
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Update failed — user not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset successful. You can now log in.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ============================================================
// RESEND REGISTRATION OTP
// ============================================================
const resendRegisterOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Account is already verified",
      });
    }

    // Generate a new 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // OTP valid for 10 minutes
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Replace old OTP
    user.otp = otp;
    user.otpExpiresAt = otpExpiresAt;

    await user.save();

    // Send new OTP
    await sendOTPEmail(user.email, otp);

    console.log(`Registration OTP resent to ${user.email}`);

    return res.status(200).json({
      success: true,
      message: "A new verification OTP has been sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Resend Registration OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ============================================================
// GET CURRENT USER PROFILE
// ============================================================
const getProfile = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No authentication token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = {
  registerUser,
  verifyOTP,
  resendRegisterOTP,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getProfile,
};