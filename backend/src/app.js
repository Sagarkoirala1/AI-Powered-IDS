const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const alertRoutes = require("./routes/alertRoutes");
const predictionRoutes = require("./routes/predictionRoutes");

const app = express();

// Middleware
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/predict", predictionRoutes);

// Test Route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "AI Powered IDS Backend Running"
    });
});

module.exports = app;