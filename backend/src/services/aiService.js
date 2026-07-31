const axios = require("axios");
const crypto = require("crypto"); // Built-in Node.js module

// Use Environment variable with fallback to local port
const AI_URL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000/predict";

exports.predict = async (features) => {
    try {
        const response = await axios.post(
            AI_URL,
            {
                flow_id: crypto.randomUUID(), // Collision-proof unique identifier
                features
            },
            {
                timeout: 5000 // Abort request if AI service takes > 5 seconds
            }
        );

        return response.data;
    } catch (error) {
        console.error("AI Microservice Error:", error.message);

        // Distinguish between timeout, network failure, and API response errors
        if (error.code === "ECONNREFUSED") {
            throw new Error("AI prediction service is currently offline");
        }
        
        throw new Error(`AI Service Request Failed: ${error.response?.data?.message || error.message}`);
    }
};