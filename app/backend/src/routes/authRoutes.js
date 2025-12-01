const express = require("express");
const AuthController = require("../controllers/authController");
const validate = require("../middleware/validation");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// Setup multer for avatar uploads
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "../../data/uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

// Public routes
router.post("/signup", validate("signup"), AuthController.signup);
router.post("/signin", validate("signin"), AuthController.signin);

// Protected routes
router.get("/me", authMiddleware, AuthController.getCurrentUser);
router.put("/profile", authMiddleware, AuthController.updateProfile);
router.put("/profile/password", authMiddleware, AuthController.updatePassword);
router.post(
  "/profile/avatar",
  authMiddleware,
  upload.single("avatar"),
  AuthController.uploadAvatar
);

module.exports = router;
