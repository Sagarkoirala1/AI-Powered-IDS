const express = require("express");

const router = express.Router();

const {
    predictAttack,
    predictCSV
} = require("../controllers/predictionController");

const {
    protect
} = require("../middleware/authMiddleware");

const upload =
    require("../middleware/uploadMiddleware");


// ============================================================
// SINGLE FLOW PREDICTION
// ============================================================

router.post(
    "/",
    protect,
    predictAttack
);


// ============================================================
// CSV PREDICTION
// ============================================================

router.post(
    "/csv",
    protect,
    upload.single("file"),
    predictCSV
);


module.exports = router;