const express = require("express");
const router = express.Router();

const { predictAttack } = require("../controllers/predictionController");

router.post("/predict", predictAttack);

module.exports = router;