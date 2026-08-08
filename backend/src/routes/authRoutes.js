const express = require("express");
const router = express.Router();

const {
    registerUser,
    verifyOTP,
    loginUser,
} = require("../controllers/authController");

// Register (Generates & emails OTP)
router.post("/register", registerUser);

// Verify OTP (Activates account & returns JWT)
router.post("/verify-otp", verifyOTP);

// Login (Requires verified account)
router.post("/login", loginUser);

module.exports = router;