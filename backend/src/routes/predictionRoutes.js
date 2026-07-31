const express = require("express");
const router = express.Router();

const { predictAttack } = require("../controllers/predictionController");
router.post("/", predictAttack);

module.exports = router;