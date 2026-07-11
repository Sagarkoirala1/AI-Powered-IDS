const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
    {
        sourceIP: {
            type: String,
            required: true,
        },
        destinationIP: {
            type: String,
            required: true,
        },
        protocol: {
            type: String,
            required: true,
        },
        attackType: {
            type: String,
            required: true,
        },
        severity: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Low",
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        status: {
            type: String,
            enum: ["Active", "Resolved"],
            default: "Active",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Alert", AlertSchema);