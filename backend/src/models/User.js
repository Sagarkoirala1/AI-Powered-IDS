const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: [true, "Username is required"],
            unique: true,
            trim: true,
            minlength: [3, "Username must be at least 3 characters"]
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            trim: true,
            lowercase: true,
            match: [/^\S+@\S+\.\S+$/, "Please fill a valid email address"]
        },
        password: {
            type: String,
            required: [true, "Password is required"],
            minlength: [6, "Password must be at least 6 characters"]
        },
        role: {
            type: String,
            enum: ["admin", "analyst"],
            default: "admin"
        },
        // OTP Verification Fields
        isVerified: {
            type: Boolean,
            default: false
        },
        otp: {
            type: String
        },
        otpExpiresAt: {
            type: Date
        }
    },
    { timestamps: true }
);

// Correct Async Pre-Save Hook (No 'next' parameter required)
UserSchema.pre("save", async function () {
    // If password hasn't been modified (e.g. updating OTP fields), skip hashing
    if (!this.isModified("password")) {
        return;
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Helper method to compare passwords
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);