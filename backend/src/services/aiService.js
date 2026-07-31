const axios = require("axios");

const AI_URL = "http://127.0.0.1:8000/predict";

exports.predict = async (features) => {

    const response = await axios.post(AI_URL, {

        flow_id: Date.now().toString(),

        features

    });

    return response.data;
};