const axios = require("axios");

const ML_API_URL =
    process.env.ML_API_URL || "http://127.0.0.1:8000";

/*
 * Convert frontend/CICIDS feature names
 * to the names expected by the XGBoost ML API.
 *
 * Example:
 * "Destination Port" -> "Destination_Port"
 * "Flow Duration"    -> "Flow_Duration"
 */
const normalizeFeatures = (features) => {
    const normalized = {};

    for (const [key, value] of Object.entries(features)) {
        const normalizedKey = key
            .trim()
            .replace(/\s+/g, "_");

        normalized[normalizedKey] = value;
    }

    return normalized;
};


const predict = async (features) => {
    try {

        console.log("==================================");
        console.log("Sending features to XGBoost...");
        console.log("Original feature count:", Object.keys(features).length);

        // Convert feature names
        const normalizedFeatures = normalizeFeatures(features);

        console.log(
            "Normalized feature count:",
            Object.keys(normalizedFeatures).length
        );

        console.log(
            "First features:",
            Object.keys(normalizedFeatures).slice(0, 10)
        );

        console.log("==================================");


        // Send to ML API
        const response = await axios.post(
            `${ML_API_URL}/predict`,
            {
                features: normalizedFeatures
            },
            {
                timeout: 30000
            }
        );


        const result = response.data;


        console.log("==================================");
        console.log("AI Prediction:", result.prediction);
        console.log("Confidence:", result.confidence);
        console.log("Detected:", result.detected);
        console.log("==================================");


        return {
            success: true,
            prediction: result.prediction,
            confidence: result.confidence,
            detected: result.detected,
            flow_id: result.flow_id
        };


    } catch (error) {

        console.error("==================================");
        console.error("ML SERVICE ERROR");
        console.error(
            error.response?.data || error.message
        );
        console.error("==================================");


        return {
            success: false,
            error:
                error.response?.data?.detail ||
                error.response?.data ||
                error.message
        };
    }
};


module.exports = {
    predict
};