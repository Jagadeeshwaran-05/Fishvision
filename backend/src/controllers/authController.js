const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

class AuthController {
  // Sign up
  static async signup(req, res) {
    try {
      const { name, email, password } = req.validatedData;

      // Check if user already exists
      if (User.emailExists(email)) {
        return res.status(400).json({
          success: false,
          message: "Email already registered",
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create user
      const userId = User.create({
        name,
        email,
        password: hashedPassword,
      });

      // Generate JWT token
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      // Get user data (without password)
      const user = User.findById(userId);
      const { password: _, ...userWithoutPassword } = user;

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({
        success: false,
        message: "Error creating user",
        error: error.message,
      });
    }
  }

  // Sign in
  static async signin(req, res) {
    try {
      const { email, password } = req.validatedData;

      // Find user by email
      const user = User.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Compare password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN,
      });

      // Remove password from user object
      const { password: _, ...userWithoutPassword } = user;

      res.status(200).json({
        success: true,
        message: "Login successful",
        data: {
          user: userWithoutPassword,
          token,
        },
      });
    } catch (error) {
      console.error("Signin error:", error);
      res.status(500).json({
        success: false,
        message: "Error signing in",
        error: error.message,
      });
    }
  }

  // Get current user
  static async getCurrentUser(req, res) {
    try {
      res.status(200).json({
        success: true,
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      console.error("Get current user error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching user data",
        error: error.message,
      });
    }
  }

  // Update profile fields
  static async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const profileData = req.body || {};

      // If email is being changed, ensure uniqueness
      if (profileData.email) {
        const existing = User.findByEmail(profileData.email);
        if (existing && existing.id !== userId) {
          return res.status(400).json({
            success: false,
            message: "Email already in use by another account",
          });
        }
      }

      const ok = User.updateProfile(userId, profileData);

      if (!ok) {
        return res.status(500).json({
          success: false,
          message: "Failed to update profile",
        });
      }

      const updated = User.findById(userId);
      const { password: _, ...userWithoutPassword } = updated;

      res
        .status(200)
        .json({ success: true, data: { user: userWithoutPassword } });
    } catch (error) {
      console.error("Update profile error:", error);
      res
        .status(500)
        .json({ success: false, message: "Error updating profile" });
    }
  }

  // Change password
  static async updatePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body || {};

      if (!currentPassword || !newPassword) {
        return res
          .status(400)
          .json({ success: false, message: "Missing passwords" });
      }

      const user = User.findById(userId);
      if (!user) {
        return res
          .status(404)
          .json({ success: false, message: "User not found" });
      }

      const valid = await bcrypt.compare(currentPassword, user.password);
      if (!valid) {
        return res
          .status(401)
          .json({ success: false, message: "Current password is incorrect" });
      }

      const hashed = await bcrypt.hash(newPassword, 10);
      const ok = User.setPassword(userId, hashed);

      if (!ok) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to update password" });
      }

      res.status(200).json({ success: true, message: "Password updated" });
    } catch (error) {
      console.error("Update password error:", error);
      res
        .status(500)
        .json({ success: false, message: "Error updating password" });
    }
  }

  // Upload profile avatar
  static async uploadAvatar(req, res) {
    try {
      const userId = req.user.id;

      if (!req.file) {
        return res
          .status(400)
          .json({ success: false, message: "No file uploaded" });
      }

      // Save stored path (relative)
      const storedPath = `uploads/${req.file.filename}`;

      const ok = User.updateProfile(userId, { profile_image: storedPath });
      if (!ok) {
        return res
          .status(500)
          .json({ success: false, message: "Failed to save avatar" });
      }

      const updated = User.findById(userId);
      const { password: _, ...userWithoutPassword } = updated;

      res
        .status(200)
        .json({ success: true, data: { user: userWithoutPassword } });
    } catch (error) {
      console.error("Upload avatar error:", error);
      res
        .status(500)
        .json({ success: false, message: "Error uploading avatar" });
    }
  }
}

module.exports = AuthController;
