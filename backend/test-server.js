// Simple test server
const express = require("express");
const app = express();
const PORT = 3000;

app.get("/test", (req, res) => {
  res.json({ message: "Test server works!" });
});

const server = app.listen(PORT, () => {
  console.log(`Test server listening on port ${PORT}`);
  console.log(`Test URL: http://localhost:${PORT}/test`);
});

server.on("error", (err) => {
  console.error("Server error:", err);
});
