const Alert = require("../models/Alert");
const { sendAlertEmail } = require("../services/emailService");
const { emitNewAlert } = require("../sockets/socket");

// Helper function to build query filters based on user role
const buildRoleQuery = (req, extraFilter = {}) => {
    const query = { ...extraFilter };
    if (req.user && req.user.role !== "admin") {
        query.user = req.user.id || req.user._id;
    }
    return query;
};

// Create Alert
exports.createAlert = async (req, res) => {
    try {
        // Automatically attach the logged-in user's ID to the alert document
        const alertData = {
            ...req.body,
            user: req.user ? (req.user.id || req.user._id) : req.body.user,
        };

        const alert = await Alert.create(alertData);

        // 1. Send real-time alert to React Dashboard via WebSockets
        try {
            emitNewAlert(alert);
        } catch (socketErr) {
            console.warn("Socket broadcast failed:", socketErr.message);
        }

        // 2. If severity is Critical, send email alert
        if (alert.severity === "Critical") {
            const recipientEmail = process.env.ADMIN_EMAIL || req.user?.email;
            if (recipientEmail) {
                // Sent asynchronously so it won't delay API response
                sendAlertEmail(recipientEmail, alert).catch((err) =>
                    console.error("Critical Alert Email Failed:", err.message)
                );
            }
        }

        res.status(201).json({
            success: true,
            data: alert,
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

// Get All Alerts (Filtered by Role)
exports.getAlerts = async (req, res) => {
    try {
        const query = buildRoleQuery(req);
        const alerts = await Alert.find(query).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: alerts.length,
            data: alerts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Get Single Alert (Ownership check for regular users)
exports.getAlert = async (req, res) => {
    try {
        const query = buildRoleQuery(req, { _id: req.params.id });
        const alert = await Alert.findOne(query);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found or unauthorized",
            });
        }

        res.json({
            success: true,
            data: alert,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Delete Alert (Ownership check for regular users)
exports.deleteAlert = async (req, res) => {
    try {
        const query = buildRoleQuery(req, { _id: req.params.id });
        const alert = await Alert.findOne(query);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found or unauthorized",
            });
        }

        await alert.deleteOne();

        res.json({
            success: true,
            message: "Alert deleted",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Update Alert Status (Ownership check for regular users)
exports.updateAlertStatus = async (req, res) => {
    try {
        const query = buildRoleQuery(req, { _id: req.params.id });
        const alert = await Alert.findOne(query);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found or unauthorized",
            });
        }

        alert.status = req.body.status || alert.status;
        await alert.save();

        res.status(200).json({
            success: true,
            data: alert,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// Dashboard Statistics (Filtered by Role)
exports.getAlertStats = async (req, res) => {
    try {
        const baseQuery = buildRoleQuery(req);

        const total = await Alert.countDocuments(baseQuery);
        const active = await Alert.countDocuments({ ...baseQuery, status: "Active" });
        const resolved = await Alert.countDocuments({ ...baseQuery, status: "Resolved" });
        const critical = await Alert.countDocuments({ ...baseQuery, severity: "Critical" });

        res.json({
            success: true,
            data: {
                total,
                active,
                resolved,
                critical,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};