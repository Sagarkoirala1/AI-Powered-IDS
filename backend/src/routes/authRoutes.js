const express = require("express");
const router = express.Router();

const {
  registerUser,
  verifyOTP,
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  getProfile,
} = require("../controllers/authController");

// Register
router.post("/register", registerUser);

// Verify registration OTP
router.post("/verify-otp", verifyOTP);

// Login
router.post("/login", loginUser);

// Current logged-in user
router.get("/profile", getProfile);

// Forgot password
router.post("/forgot-password", forgotPassword);

// Verify reset OTP
router.post("/verify-reset-otp", verifyResetOTP);

// Reset password
router.post("/reset-password", resetPassword);

module.exports = router;