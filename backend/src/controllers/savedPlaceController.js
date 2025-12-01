const SavedPlace = require("../models/SavedPlace");
const Place = require("../models/Place");

// Save a place
exports.savePlace = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { place_id, notes } = req.body;

    // Validate required fields
    if (!place_id) {
      return res.status(400).json({
        success: false,
        message: "place_id is required",
      });
    }

    // Check if place exists
    const place = Place.getById(place_id);
    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    // Check if already saved
    const alreadySaved = SavedPlace.isAlreadySaved(userId, place_id);
    if (alreadySaved) {
      return res.status(409).json({
        success: false,
        message: "Place already saved",
      });
    }

    // Save the place
    const savedPlace = SavedPlace.create(userId, place_id, notes);

    res.status(201).json({
      success: true,
      message: "Place saved successfully",
      data: savedPlace,
    });
  } catch (error) {
    console.error("Save place error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save place",
      error: error.message,
    });
  }
};

// Get all saved places
exports.getSavedPlaces = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { limit = 100, offset = 0 } = req.query;

    const savedPlaces = SavedPlace.findByUserId(
      userId,
      parseInt(limit),
      parseInt(offset)
    );

    res.status(200).json({
      success: true,
      data: savedPlaces,
      count: savedPlaces.length,
    });
  } catch (error) {
    console.error("Get saved places error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved places",
      error: error.message,
    });
  }
};

// Get a specific saved place
exports.getSavedPlace = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    const savedPlace = SavedPlace.findById(parseInt(id));

    if (!savedPlace) {
      return res.status(404).json({
        success: false,
        message: "Saved place not found",
      });
    }

    // Verify ownership
    if (savedPlace.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    res.status(200).json({
      success: true,
      data: savedPlace,
    });
  } catch (error) {
    console.error("Get saved place error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch saved place",
      error: error.message,
    });
  }
};

// Update saved place
exports.updateSavedPlace = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const updates = req.body;

    // Verify ownership
    const savedPlace = SavedPlace.findById(parseInt(id));
    if (!savedPlace) {
      return res.status(404).json({
        success: false,
        message: "Saved place not found",
      });
    }

    if (savedPlace.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const updatedPlace = SavedPlace.update(parseInt(id), updates);

    res.status(200).json({
      success: true,
      message: "Place updated successfully",
      data: updatedPlace,
    });
  } catch (error) {
    console.error("Update saved place error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update place",
      error: error.message,
    });
  }
};

// Delete saved place
exports.deleteSavedPlace = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id } = req.params;

    // Verify ownership
    const savedPlace = SavedPlace.findById(parseInt(id));
    if (!savedPlace) {
      return res.status(404).json({
        success: false,
        message: "Saved place not found",
      });
    }

    if (savedPlace.user_id !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    SavedPlace.delete(parseInt(id));

    res.status(200).json({
      success: true,
      message: "Place removed successfully",
    });
  } catch (error) {
    console.error("Delete saved place error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to remove place",
      error: error.message,
    });
  }
};

// Get statistics
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const stats = SavedPlace.getStats(userId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message,
    });
  }
};
