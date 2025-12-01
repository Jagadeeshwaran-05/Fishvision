const express = require("express");
const router = express.Router();
const placeController = require("../controllers/placeController");

// Public routes
router.get("/", placeController.getPlaces);
router.get("/trending", placeController.getTrending);
router.get("/search", placeController.searchPlaces);
router.get("/:id", placeController.getPlace);

module.exports = router;
