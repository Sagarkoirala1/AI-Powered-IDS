const Alert = require("../models/Alert");

// Helper function to build query filters based on user role[cite: 3]
const buildRoleQuery = (req, extraFilter = {}) => {
    const query = { ...extraFilter };
    if (req.user && req.user.role !== "admin") {
        query.userId = req.user.id || req.user._id;
    }
    return query;
};

exports.getDashboard = async (req, res) => {
    try {
        const baseQuery = buildRoleQuery(req);

        // Run all 4 queries simultaneously filtered by user role
        const [total, active, resolved, critical] = await Promise.all([
            Alert.countDocuments(baseQuery),
            Alert.countDocuments({ ...baseQuery, status: "Active" }),
            Alert.countDocuments({ ...baseQuery, status: "Resolved" }),
            Alert.countDocuments({ ...baseQuery, severity: "Critical" }),
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