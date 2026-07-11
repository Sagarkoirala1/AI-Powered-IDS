const express = require("express");
const router = express.Router();

const {
    createAlert,
    getAlerts,
    getAlert,
    deleteAlert,
    updateAlertStatus,
    getAlertStats,
} = require("../controllers/alertController");

const { protect } = require("../middleware/authMiddleware");

// All routes require login
router.post("/", protect, createAlert);
router.get("/stats", protect, getAlertStats);
router.get("/", protect, getAlerts);
router.get("/:id", protect, getAlert);
router.put("/:id/status", protect, updateAlertStatus);
router.delete("/:id", protect, deleteAlert);


module.exports = router;