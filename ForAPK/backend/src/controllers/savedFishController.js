const SavedFish = require("../models/SavedFish");

class SavedFishController {
  // Save a new fish
  static async saveFish(req, res) {
    try {
      const userId = req.user.id;
      const fishData = req.body;

      // Validate required fields
      if (!fishData.fish_name) {
        return res.status(400).json({
          success: false,
          message: "Fish name is required",
        });
      }

      // Check if already saved
      const alreadySaved = await SavedFish.isAlreadySaved(
        userId,
        fishData.fish_name,
        fishData.scientific_name
      );

      if (alreadySaved) {
        return res.status(409).json({
          success: false,
          message: "This fish is already in your collection",
        });
      }

      const savedFish = await SavedFish.create(userId, fishData);

      res.status(201).json({
        success: true,
        message: "Fish saved successfully",
        data: savedFish,
      });
    } catch (error) {
      console.error("Save fish error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to save fish",
        error: error.message,
      });
    }
  }

  // Get all saved fishes for current user
  static async getSavedFishes(req, res) {
    try {
      const userId = req.user.id;
      const limit = parseInt(req.query.limit) || 100;
      const offset = parseInt(req.query.offset) || 0;

      const savedFishes = await SavedFish.findByUserId(userId, limit, offset);

      res.json({
        success: true,
        data: savedFishes,
        count: savedFishes.length,
      });
    } catch (error) {
      console.error("Get saved fishes error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve saved fishes",
        error: error.message,
      });
    }
  }

  // Get a specific saved fish
  static async getSavedFish(req, res) {
    try {
      const userId = req.user.id;
      const fishId = parseInt(req.params.id);

      if (!fishId) {
        return res.status(400).json({
          success: false,
          message: "Invalid fish ID",
        });
      }

      const savedFish = await SavedFish.findById(fishId, userId);

      if (!savedFish) {
        return res.status(404).json({
          success: false,
          message: "Fish not found",
        });
      }

      res.json({
        success: true,
        data: savedFish,
      });
    } catch (error) {
      console.error("Get saved fish error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve fish",
        error: error.message,
      });
    }
  }

  // Update saved fish
  static async updateSavedFish(req, res) {
    try {
      const userId = req.user.id;
      const fishId = parseInt(req.params.id);
      const updates = req.body;

      if (!fishId) {
        return res.status(400).json({
          success: false,
          message: "Invalid fish ID",
        });
      }

      const result = await SavedFish.update(fishId, userId, updates);

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Fish not found or no changes made",
        });
      }

      res.json({
        success: true,
        message: "Fish updated successfully",
      });
    } catch (error) {
      console.error("Update saved fish error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update fish",
        error: error.message,
      });
    }
  }

  // Delete saved fish
  static async deleteSavedFish(req, res) {
    try {
      const userId = req.user.id;
      const fishId = parseInt(req.params.id);

      if (!fishId) {
        return res.status(400).json({
          success: false,
          message: "Invalid fish ID",
        });
      }

      const result = await SavedFish.delete(fishId, userId);

      if (result.changes === 0) {
        return res.status(404).json({
          success: false,
          message: "Fish not found",
        });
      }

      res.json({
        success: true,
        message: "Fish removed from collection",
      });
    } catch (error) {
      console.error("Delete saved fish error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete fish",
        error: error.message,
      });
    }
  }

  // Get statistics
  static async getStats(req, res) {
    try {
      const userId = req.user.id;
      const stats = await SavedFish.getStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Get stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve statistics",
        error: error.message,
      });
    }
  }
}

module.exports = SavedFishController;
