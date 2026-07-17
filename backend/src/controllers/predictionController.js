const axios = require("axios");

exports.predictAttack = async (req, res) => {
    try {
        const { features } = req.body;

        const response = await axios.post(
            "http://127.0.0.1:8000/predict",
            { features }
        );

        res.json(response.data);

    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            success: false,
            message: "AI Service Error"
        });
    }
};