const express = require("express");
const router = express.Router();
const savedPlaceController = require("../controllers/savedPlaceController");
const authMiddleware = require("../middleware/auth");

// All routes require authentication
router.use(authMiddleware);

// Stats route must come before /:id to avoid matching "stats" as an id
router.get("/stats", savedPlaceController.getStats);

router.post("/", savedPlaceController.savePlace);
router.get("/", savedPlaceController.getSavedPlaces);
router.get("/:id", savedPlaceController.getSavedPlace);
router.put("/:id", savedPlaceController.updateSavedPlace);
router.delete("/:id", savedPlaceController.deleteSavedPlace);

module.exports = router;
