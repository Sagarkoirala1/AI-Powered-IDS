console.log("PredictionController Loaded");

const csv = require("csv-parser");

const { sendAlertEmail } = require("../services/emailService");
const Alert = require("../models/Alert");
const User = require("../models/User");
const aiService = require("../services/aiService");


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
// HELPER: SEND EMAIL TO ADMIN + NETWORK USER
// ============================================================

const sendSevereAttackEmail = async (alert) => {

    try {

        const users = await User.find({
            role: {
                $in: ["admin", "network"]
            }
        }).select("email username role");

        if (!users.length) {

            console.log(
                "No admin/network users found for email notification."
            );

            return;
        }

        for (const user of users) {

            if (!user.email) {
                continue;
            }

            try {

                await sendAlertEmail(
                    user.email,
                    alert
                );

                console.log(
                    `Alert email sent to ${user.role}: ${user.email}`
                );

            } catch (emailError) {

                console.error(
                    `Failed to send email to ${user.email}:`,
                    emailError.message
                );

            }
        }

    } catch (error) {

        console.error(
            "Failed to find notification users:",
            error.message
        );

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

        const {
            sourceIP,
            destinationIP,
            protocol,
            features
        } = req.body;


        // ------------------------------------------------------
        // 1. Validate features
        // ------------------------------------------------------

        if (!features || typeof features !== "object") {

            return res.status(400).json({
                success: false,
                message: "Features are required"
            });

        }


        console.log(
            "Feature count received:",
            Object.keys(features).length
        );


        // ------------------------------------------------------
        // 2. Send to XGBoost ML service
        // ------------------------------------------------------

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


        console.log("==================================");
        console.log("AI Prediction:", attack);
        console.log("Confidence:", confidence);
        console.log("==================================");


        // ------------------------------------------------------
        // 3. BENIGN
        // ------------------------------------------------------

        if (attack === "BENIGN") {

            console.log(
                "BENIGN traffic - no alert created"
            );

            return res.status(200).json({

                success: true,

                prediction: attack,

                confidence,

                detected: false,

                message: "No intrusion detected."

            });

        }


        // ------------------------------------------------------
        // 4. Determine severity
        // ------------------------------------------------------

        const severity = getSeverity(attack);


        console.log("Attack:", attack);
        console.log("Severity:", severity);


        // ------------------------------------------------------
        // 5. Create MongoDB alert
        // ------------------------------------------------------

        const alert = await Alert.create({

            sourceIP: sourceIP || "Unknown",

            destinationIP:
                destinationIP || "Unknown",

            protocol:
                protocol || "Unknown",

            attackType: attack,

            severity,

            confidence,

            status: "Active"

        });


        console.log(
            "Alert created:",
            alert._id
        );


        // ------------------------------------------------------
        // 6. Email severe attacks
        // ------------------------------------------------------

        if (
            severity === "Critical" ||
            severity === "High"
        ) {

            await sendSevereAttackEmail(alert);

        }


        // ------------------------------------------------------
        // 7. Return response
        // ------------------------------------------------------

        return res.status(200).json({

            success: true,

            prediction: attack,

            confidence,

            detected: true,

            alert

        });


    } catch (error) {

        console.error(
            "Prediction Controller Error:",
            error
        );

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

        // ------------------------------------------------------
        // 1. Check uploaded file
        // ------------------------------------------------------

        if (!req.file) {

            return res.status(400).json({

                success: false,

                message: "CSV file is required"

            });

        }


        console.log(
            "CSV file:",
            req.file.originalname
        );

        console.log(
            "CSV size:",
            req.file.size,
            "bytes"
        );


        // ------------------------------------------------------
        // 2. Parse CSV
        // ------------------------------------------------------

        const rows = [];


        await new Promise((resolve, reject) => {

            const stream = require("stream");

            const readable =
                new stream.Readable();

            readable.push(req.file.buffer);
            readable.push(null);


            readable
                .pipe(csv())
                .on("data", (row) => {

                    rows.push(row);

                })
                .on("end", resolve)
                .on("error", reject);

        });


        console.log(
            "CSV rows:",
            rows.length
        );


        if (!rows.length) {

            return res.status(400).json({

                success: false,

                message: "CSV file contains no data"

            });

        }


        // ------------------------------------------------------
        // 3. Limit demo size
        // ------------------------------------------------------

        const MAX_ROWS = 100;

        const rowsToProcess =
            rows.slice(0, MAX_ROWS);


        console.log(
            `Processing ${rowsToProcess.length} rows...`
        );


        // ------------------------------------------------------
        // 4. Prediction results
        // ------------------------------------------------------

        const results = [];

        let benignCount = 0;
        let attackCount = 0;
        let criticalCount = 0;
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;


        // ------------------------------------------------------
        // 5. Process each CSV row
        // ------------------------------------------------------

        for (let i = 0; i < rowsToProcess.length; i++) {

            const row = rowsToProcess[i];


            try {

                console.log(
                    `Processing row ${i + 1}/${rowsToProcess.length}`
                );


                // --------------------------------------------------
                // Extract optional network information
                // --------------------------------------------------

                const sourceIP =
                    row.Source_IP ||
                    row.SourceIP ||
                    row["Source IP"] ||
                    "CSV";

                const destinationIP =
                    row.Destination_IP ||
                    row.DestinationIP ||
                    row["Destination IP"] ||
                    "CSV";

                const protocol =
                    row.Protocol ||
                    row.protocol ||
                    "Unknown";


                // --------------------------------------------------
                // IMPORTANT:
                //
                // We send the complete CSV row.
                //
                // FastAPI uses feature_names.pkl to select
                // the exact 70 model features.
                //
                // Therefore extra columns such as Label,
                // Source_IP etc. are okay.
                // --------------------------------------------------

                const aiResult =
                    await aiService.predict(row);


                if (
                    !aiResult ||
                    !aiResult.success
                ) {

                    results.push({

                        row: i + 1,

                        success: false,

                        error:
                            aiResult?.error ||
                            "AI prediction failed"

                    });

                    continue;

                }


                const attack =
                    aiResult.prediction;

                const confidence =
                    aiResult.confidence;


                // --------------------------------------------------
                // BENIGN
                // --------------------------------------------------

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


                // --------------------------------------------------
                // ATTACK
                // --------------------------------------------------

                attackCount++;


                const severity =
                    getSeverity(attack);


                // Count severity

                if (severity === "Critical") {
                    criticalCount++;
                }

                else if (severity === "High") {
                    highCount++;
                }

                else if (severity === "Medium") {
                    mediumCount++;
                }

                else {
                    lowCount++;
                }


                // --------------------------------------------------
                // Create MongoDB alert
                // --------------------------------------------------

                const alert =
                    await Alert.create({

                        sourceIP,

                        destinationIP,

                        protocol,

                        attackType: attack,

                        severity,

                        confidence,

                        status: "Active"

                    });


                console.log(
                    `Alert created for row ${i + 1}:`,
                    attack,
                    severity
                );


                // --------------------------------------------------
                // Email severe attack
                // --------------------------------------------------

                if (
                    severity === "Critical" ||
                    severity === "High"
                ) {

                    await sendSevereAttackEmail(
                        alert
                    );

                }


                // --------------------------------------------------
                // Store result
                // --------------------------------------------------

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

                console.error(
                    `Row ${i + 1} failed:`,
                    rowError.message
                );


                results.push({

                    row: i + 1,

                    success: false,

                    error: rowError.message

                });

            }

        }


        // ------------------------------------------------------
        // 6. Final summary
        // ------------------------------------------------------

        const summary = {

            totalRows: rowsToProcess.length,

            processed:
                results.length,

            benign:
                benignCount,

            attacks:
                attackCount,

            critical:
                criticalCount,

            high:
                highCount,

            medium:
                mediumCount,

            low:
                lowCount

        };


        console.log("==================================");
        console.log("CSV PROCESSING COMPLETE");
        console.log("==================================");

        console.log(summary);


        // ------------------------------------------------------
        // 7. Return result
        // ------------------------------------------------------

        return res.status(200).json({

            success: true,

            message:
                "CSV processed successfully",

            summary,

            results

        });


    } catch (error) {

        console.error(
            "CSV Prediction Error:",
            error
        );


        return res.status(500).json({

            success: false,

            message:
                "CSV prediction failed",

            error:
                error.message

        });

    }

};