const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema(
    {
        // Unique flow identifier returned by AI microservice
        flowId: {
            type: String,
            index: true,
        },
        sourceIP: {
            type: String,
            required: true,
            default: "Unknown",
        },
        destinationIP: {
            type: String,
            required: true,
            default: "Unknown",
        },
        protocol: {
            type: String,
            required: true,
            default: "Unknown",
        },
        attackType: {
            type: String,
            required: true,
        },
        severity: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Low",
            index: true,
        },
        confidence: {
            type: Number,
            required: true,
            min: 0,
            max: 100,
        },
        status: {
            type: String,
            enum: ["Active", "In Progress", "Resolved", "False Positive"],
            default: "Active",
            index: true,
        },
        // Audit fields for resolution tracking
        resolvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        resolvedAt: {
            type: Date,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

// Compound index for high-speed dashboard queries (status + date sorting)
AlertSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Alert", AlertSchema);