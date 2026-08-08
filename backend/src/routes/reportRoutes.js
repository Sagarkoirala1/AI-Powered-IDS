const express = require("express");
const router = express.Router();
const { downloadCSVReport } = require("../controllers/reportController");
const { protect } = require("../middleware/authMiddleware");

// Protected Route for downloading reports
router.get("/csv", protect, downloadCSVReport);

module.exports = router;