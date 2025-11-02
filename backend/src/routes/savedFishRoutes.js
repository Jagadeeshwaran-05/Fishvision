const express = require("express");
const SavedFishController = require("../controllers/savedFishController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get statistics
router.get("/stats", SavedFishController.getStats);

// CRUD operations
router.post("/", SavedFishController.saveFish);
router.get("/", SavedFishController.getSavedFishes);
router.get("/:id", SavedFishController.getSavedFish);
router.put("/:id", SavedFishController.updateSavedFish);
router.delete("/:id", SavedFishController.deleteSavedFish);

module.exports = router;
