// backend/promoteAdmin.js
require('dotenv').config(); // Load environment variables from .env
const mongoose = require('mongoose');
const User = require('./src/models/User'); // Adjust path if your User model is elsewhere

// PASTE YOUR USER ID HERE within the quotes
const userIdToPromote = 'YOUR_USER_ID_FROM_LOCAL_STORAGE';

const promoteUserToAdmin = async () => {
    try {
        // 1. Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB connected...");

        // 2. Find the user and update the role
        const user = await User.findByIdAndUpdate(
            userIdToPromote,
            { role: 'admin' }, // This is the command to change the role
            { new: true } // Return the updated document
        );

        if (!user) {
            console.error("User not found. Please check your User ID.");
        } else {
            console.log(`Success! User ${user.email} (ID: ${user._id}) has been updated to role: ${user.role}`);
        }

        // 3. Disconnect
        mongoose.disconnect();
        console.log("MongoDB disconnected.");

    } catch (error) {
        console.error("Error updating user:", error);
        mongoose.disconnect();
    }
};

promoteUserToAdmin();