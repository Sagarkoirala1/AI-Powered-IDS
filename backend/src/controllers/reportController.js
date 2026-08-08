const Alert = require("../models/Alert");
const { Parser } = require("json2csv");

/**
 * Export Threat Report as CSV
 * Route: GET /api/reports/csv
 */
exports.downloadCSVReport = async (req, res) => {
  try {
    const alerts = await Alert.find().sort({ createdAt: -1 }).lean();

    if (!alerts.length) {
      return res.status(404).json({
        success: false,
        message: "No alert data available to generate report.",
      });
    }

    // Define CSV fields
    const fields = [
      { label: "Alert ID", value: "_id" },
      { label: "Attack Type", value: "attackType" },
      { label: "Severity", value: "severity" },
      { label: "Source IP", value: "sourceIP" },
      { label: "Destination IP", value: "destinationIP" },
      { label: "Protocol", value: "protocol" },
      { label: "Confidence (%)", value: "confidence" },
      { label: "Status", value: "status" },
      { label: "Timestamp", value: "createdAt" },
    ];

    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(alerts);

    // Set Download Headers
    const fileName = `Security_Report_${Date.now()}.csv`;
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    return res.status(200).send(csvData);
  } catch (error) {
    console.error("Report Export Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to generate CSV security report.",
      error: error.message,
    });
  }
};