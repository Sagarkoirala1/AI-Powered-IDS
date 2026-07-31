const Alert = require("../models/Alert");

exports.getDashboard = async (req, res) => {
    try {
        // Run all 4 queries simultaneously in parallel
        const [total, active, resolved, critical] = await Promise.all([
            Alert.countDocuments(),
            Alert.countDocuments({ status: "Active" }),
            Alert.countDocuments({ status: "Resolved" }),
            Alert.countDocuments({ severity: "Critical" }),
        ]);

        res.status(200).json({
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
            message: "Failed to retrieve dashboard stats: " + error.message,
        });
    }
};