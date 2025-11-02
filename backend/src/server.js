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
    console.log(`🔧 Attempting to bind to port ${PORT}...`);
    const server = app.listen(PORT, () => {
      const address = server.address();
      console.log(`✅ Server actually listening on:`, address);

      const os = require("os");
      const networkInterfaces = os.networkInterfaces();
      let localIP = "localhost";

      // Find local IP
      Object.keys(networkInterfaces).forEach((interfaceName) => {
        networkInterfaces[interfaceName].forEach((iface) => {
          if (
            iface.family === "IPv4" &&
            !iface.internal &&
            iface.address.startsWith("192.168")
          ) {
            localIP = iface.address;
          }
        });
      });

      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Local: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Network: http://${localIP}:${PORT}/api/health`);
      console.log(`🔐 Auth endpoint: http://localhost:${PORT}/api/auth`);
      console.log(`📱 For Expo Go: Use http://${localIP}:${PORT}/api`);
    });

    // Handle server errors
    server.on("error", (error) => {
      console.error("❌ Server error:", error);
      if (error.code === "EADDRINUSE") {
        console.error(
          `❌ Port ${PORT} is already in use. Please close the other application or use a different port.`
        );
      }
      process.exit(1);
    });

    server.on("listening", () => {
      console.log("🎉 Server listening event fired");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

module.exports = app;
