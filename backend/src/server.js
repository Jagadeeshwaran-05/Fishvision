require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const { initDatabase } = require("./config/database");

// Import routes
const authRoutes = require("./routes/authRoutes");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create data directory if it doesn't exist
const fs = require("fs");
const dataDir = path.join(__dirname, "../data");
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Initialize database and start server
async function startServer() {
  try {
    await initDatabase();
    console.log("✅ Database initialized");

    // Routes
    // Serve uploaded files (profile images and annotated images)
    app.use(
      "/uploads",
      express.static(path.join(__dirname, "../data/uploads"))
    );

    // Classification route (calls Python script)
    const classifyRoutes = require("./routes/classifyRoutes");
    app.use("/api/classify", classifyRoutes);

    app.use("/api/auth", authRoutes);

    // Saved fishes routes
    const savedFishRoutes = require("./routes/savedFishRoutes");
    app.use("/api/saved-fishes", savedFishRoutes);

    // Places routes (public)
    const placeRoutes = require("./routes/placeRoutes");
    app.use("/api/places", placeRoutes);

    // Saved places routes (protected)
    const savedPlaceRoutes = require("./routes/savedPlaceRoutes");
    app.use("/api/saved-places", savedPlaceRoutes);

    // Health check
    app.get("/api/health", (req, res) => {
      res.json({
        success: true,
        message: "Fish Classify API is running",
        timestamp: new Date().toISOString(),
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({
        success: false,
        message: "Route not found",
      });
    });

    // Error handler
    app.use((err, req, res, next) => {
      console.error("Error:", err);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: process.env.NODE_ENV === "development" ? err.message : undefined,
      });
    });

    // Start server
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Network: http://192.168.1.3:${PORT}/api/health`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
      console.log(`📱 For Expo Go: Use http://192.168.1.3:${PORT}/api`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
