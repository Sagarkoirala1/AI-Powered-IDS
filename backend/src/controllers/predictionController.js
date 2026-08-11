console.log("PredictionController Loaded");

const csv = require("csv-parser");
const { sendAlertEmail } = require("../services/emailService");
const Alert = require("../models/Alert");
const User = require("../models/User");
const aiService = require("../services/aiService");
const { emitNewAlert } = require("../sockets/socket");

// ============================================================
// HELPER: DETERMINE SEVERITY
// ============================================================
const getSeverity = (attack) => {
    switch (attack) {
        case "DDoS":
            return "Critical";
        case "BruteForce":
            return "High";
        case "UnauthorizedAccess":
            return "High";
        case "PortScan":
            return "Medium";
        default:
            return "Low";
    }
};

// ============================================================
// HELPER: SEND CRITICAL EMAIL ONLY TO THE AFFECTED USER / ADMIN
// ============================================================
const sendCriticalAlertEmail = async (alert, user) => {
    try {
        // RULE: Send email ONLY if severity is explicitly Critical
        if (alert.severity !== "Critical") {
            return;
        }

        // Target the specific user's email, fallback to admin email if user email is missing
        const recipientEmail = user?.email || process.env.ADMIN_EMAIL;

        if (!recipientEmail) {
            console.log("No recipient email found for critical alert notification.");
            return;
        }

        await sendAlertEmail(recipientEmail, alert);
        console.log(`🚨 Critical Alert email successfully sent to: ${recipientEmail}`);
    } catch (emailError) {
        console.error("Failed to send critical alert email:", emailError.message);
    }
};

// ============================================================
// NORMAL SINGLE-FLOW PREDICTION
// POST /api/predict
// ============================================================
exports.predictAttack = async (req, res) => {
    console.log("==================================");
    console.log("predictAttack called");
    console.log("==================================");

    try {
        const { sourceIP, destinationIP, protocol, features } = req.body;

        if (!features || typeof features !== "object") {
            return res.status(400).json({
                success: false,
                message: "Features are required"
            });
        }

        const aiResult = await aiService.predict(features);

        if (!aiResult || !aiResult.success) {
            return res.status(500).json({
                success: false,
                message: "AI prediction failed",
                error: aiResult?.error || "Unknown AI service error"
            });
        }

        const attack = aiResult.prediction;
        const confidence = aiResult.confidence;

        if (attack === "BENIGN") {
            return res.status(200).json({
                success: true,
                prediction: attack,
                confidence,
                detected: false,
                message: "No intrusion detected."
            });
        }

        const severity = getSeverity(attack);

        // Attach logged-in user info (ID & Email) to the alert
        const userId = req.user ? (req.user.id || req.user._id) : null;
        const userEmail = req.user ? req.user.email : null;

        const alert = await Alert.create({
            userId,
            userEmail,
            sourceIP: sourceIP || "Unknown",
            destinationIP: destinationIP || "Unknown",
            protocol: protocol || "Unknown",
            attackType: attack,
            severity,
            confidence,
            status: "Active"
        });

        // Broadcast live via Socket.io
        try {
            emitNewAlert(alert);
        } catch (socketErr) {
            console.warn("Socket broadcast failed:", socketErr.message);
        }

        // Trigger email ONLY if Critical
        if (severity === "Critical") {
            sendCriticalAlertEmail(alert, req.user).catch((err) =>
                console.error("Critical Alert Email Failed:", err.message)
            );
        }

        return res.status(200).json({
            success: true,
            prediction: attack,
            confidence,
            detected: true,
            alert
        });

    } catch (error) {
        console.error("Prediction Controller Error:", error);
        return res.status(500).json({
            success: false,
            message: "Prediction failed",
            error: error.message
        });
    }
};

// ============================================================
// CSV PREDICTION
// POST /api/predict/csv
// ============================================================
exports.predictCSV = async (req, res) => {
    console.log("==================================");
    console.log("CSV Prediction Request Received");
    console.log("==================================");

    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "CSV file is required"
            });
        }

        const rows = [];
        await new Promise((resolve, reject) => {
            const stream = require("stream");
            const readable = new stream.Readable();
            readable.push(req.file.buffer);
            readable.push(null);

            readable
                .pipe(csv())
                .on("data", (row) => rows.push(row))
                .on("end", resolve)
                .on("error", reject);
        });

        if (!rows.length) {
            return res.status(400).json({
                success: false,
                message: "CSV file contains no data"
            });
        }

        const MAX_ROWS = 100;
        const rowsToProcess = rows.slice(0, MAX_ROWS);

        const results = [];
        let benignCount = 0;
        let attackCount = 0;
        let criticalCount = 0;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;

        const userId = req.user ? (req.user.id || req.user._id) : null;
        const userEmail = req.user ? req.user.email : null;

        for (let i = 0; i < rowsToProcess.length; i++) {
            const row = rowsToProcess[i];

            try {
                const sourceIP = row.Source_IP || row.SourceIP || row["Source IP"] || "CSV";
                const destinationIP = row.Destination_IP || row.DestinationIP || row["Destination IP"] || "CSV";
                const protocol = row.Protocol || row.protocol || "Unknown";

                const aiResult = await aiService.predict(row);

                if (!aiResult || !aiResult.success) {
                    results.push({
                        row: i + 1,
                        success: false,
                        error: aiResult?.error || "AI prediction failed"
                    });
                    continue;
                }

                const attack = aiResult.prediction;
                const confidence = aiResult.confidence;

                if (attack === "BENIGN") {
                    benignCount++;
                    results.push({
                        row: i + 1,
                        success: true,
                        prediction: "BENIGN",
                        confidence,
                        detected: false
                    });
                    continue;
                }

                attackCount++;
                const severity = getSeverity(attack);

                if (severity === "Critical") criticalCount++;
                else if (severity === "High") highCount++;
                else if (severity === "Medium") mediumCount++;
                else lowCount++;

                const alert = await Alert.create({
                    userId,
                    userEmail,
                    sourceIP,
                    destinationIP,
                    protocol,
                    attackType: attack,
                    severity,
                    confidence,
                    status: "Active"
                });

                // Send email ONLY if severity is Critical
                if (severity === "Critical") {
                    await sendCriticalAlertEmail(alert, req.user);
                }

                results.push({
                    row: i + 1,
                    success: true,
                    prediction: attack,
                    confidence,
                    detected: true,
                    severity,
                    alertId: alert._id
                });

            } catch (rowError) {
                results.push({
                    row: i + 1,
                    success: false,
                    error: rowError.message
                });
            }
        }

        const summary = {
            totalRows: rowsToProcess.length,
            processed: results.length,
            benign: benignCount,
            attacks: attackCount,
            critical: criticalCount,
            high: highCount,
            medium: mediumCount,
            low: lowCount
        };

        return res.status(200).json({
            success: true,
            message: "CSV processed successfully",
            summary,
            results
        });

    } catch (error) {
        console.error("CSV Prediction Error:", error);
        return res.status(500).json({
            success: false,
            message: "CSV prediction failed",
            error: error.message
        });
    }
};