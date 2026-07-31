const Alert = require("../models/Alert");
const aiService = require("../services/aiService");

exports.predictAttack = async (req, res) => {
    try {

        const {
            sourceIP,
            destinationIP,
            protocol,
            features
        } = req.body;

        // Validate input
        if (!features) {
            return res.status(400).json({
                success: false,
                message: "Features are required"
            });
        }

        // Call AI Service
        const aiResult = await aiService.predict(features);

        // Check AI response
        if (!aiResult.success) {
            return res.status(500).json({
                success: false,
                message: "AI prediction failed",
                error: aiResult.error
            });
        }

        const attack = aiResult.prediction;
        console.log("==================================");
        console.log("AI Prediction:", attack);
        console.log("Confidence:", aiResult.confidence);
        console.log("==================================");
        const attackName = attack.toLowerCase();

        // Don't create alert for benign traffic
        if (attack.toUpperCase() === "BENIGN") {
            return res.json({
                success: true,
                flow_id: aiResult.flow_id,
                prediction: attack,
                confidence: aiResult.confidence,
                detected: false,
                message: "No intrusion detected."
            });
        }

        // Decide severity
        let severity = "Low";

        if (attackName.includes("dos")) {
            severity = "Critical";
        }
        else if (
            attackName.includes("heartbleed") ||
            attackName.includes("infiltration")
        ) {
            severity = "Critical";
        }
        else if (
            attackName.includes("bot") ||
            attackName.includes("patator") ||
            attackName.includes("web attack")
        ) {
            severity = "High";
        }
        else if (attackName.includes("portscan")) {
            severity = "Medium";
        }

        // Save alert
        const alert = await Alert.create({

            sourceIP: sourceIP || "Unknown",

            destinationIP: destinationIP || "Unknown",

            protocol: protocol || "Unknown",

            attackType: attack,

            severity,

            confidence: aiResult.confidence,

            status: "Active"

        });

        // Return response
        return res.json({

            success: true,

            flow_id: aiResult.flow_id,

            prediction: attack,

            confidence: aiResult.confidence,

            detected: true,

            alert

        });

    }
    catch (err) {

        console.error(err);

        return res.status(500).json({

            success: false,

            message: err.message

        });

    }
};