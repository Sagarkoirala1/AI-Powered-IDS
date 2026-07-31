const Alert = require("../models/Alert");

exports.getDashboard = async (req, res) => {

    const total = await Alert.countDocuments();

    const active = await Alert.countDocuments({
        status: "Active"
    });

    const resolved = await Alert.countDocuments({
        status: "Resolved"
    });

    const critical = await Alert.countDocuments({
        severity: "Critical"
    });

    res.json({
        total,
        active,
        resolved,
        critical
    });

};