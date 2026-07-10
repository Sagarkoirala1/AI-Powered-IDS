const Alert = require("../models/Alert");

// Create Alert
exports.createAlert = async (req, res) => {
    try {
        const alert = await Alert.create(req.body);

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

// Get All Alerts
exports.getAlerts = async (req, res) => {
    try {
        const alerts = await Alert.find().sort({ createdAt: -1 });

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

// Get Single Alert
exports.getAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found",
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

// Delete Alert
exports.deleteAlert = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found",
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
// Update Alert Status
exports.updateAlertStatus = async (req, res) => {
    try {
        const alert = await Alert.findById(req.params.id);

        if (!alert) {
            return res.status(404).json({
                success: false,
                message: "Alert not found",
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
// Dashboard Statistics
exports.getAlertStats = async (req, res) => {
    try {
        const total = await Alert.countDocuments();

        const active = await Alert.countDocuments({
            status: "Active",
        });

        const resolved = await Alert.countDocuments({
            status: "Resolved",
        });

        const critical = await Alert.countDocuments({
            severity: "Critical",
        });

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