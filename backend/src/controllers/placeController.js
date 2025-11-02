const Place = require("../models/Place");

// Get all places
exports.getPlaces = async (req, res) => {
  try {
    const {
      limit = 10,
      offset = 0,
      trending,
      region,
      sortBy,
      order,
    } = req.query;

    const options = {
      limit: parseInt(limit),
      offset: parseInt(offset),
    };

    if (trending !== undefined) {
      options.trending = trending === "true" || trending === "1";
    }
    if (region) options.region = region;
    if (sortBy) options.sortBy = sortBy;
    if (order) options.order = order;

    const places = Place.getAll(options);
    const total = Place.getCount({
      trending: options.trending,
      region: options.region,
    });

    res.status(200).json({
      success: true,
      data: places,
      pagination: {
        total,
        limit: options.limit,
        offset: options.offset,
        hasMore: offset + places.length < total,
      },
    });
  } catch (error) {
    console.error("Get places error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch places",
      error: error.message,
    });
  }
};

// Get place by ID
exports.getPlace = async (req, res) => {
  try {
    const { id } = req.params;
    const place = Place.getById(parseInt(id));

    if (!place) {
      return res.status(404).json({
        success: false,
        message: "Place not found",
      });
    }

    res.status(200).json({
      success: true,
      data: place,
    });
  } catch (error) {
    console.error("Get place error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch place",
      error: error.message,
    });
  }
};

// Get trending places
exports.getTrending = async (req, res) => {
  try {
    const { limit = 6 } = req.query;
    const places = Place.getTrending(parseInt(limit));

    res.status(200).json({
      success: true,
      data: places,
    });
  } catch (error) {
    console.error("Get trending places error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch trending places",
      error: error.message,
    });
  }
};

// Search places
exports.searchPlaces = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q || q.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const places = Place.search(q.trim(), parseInt(limit));

    res.status(200).json({
      success: true,
      data: places,
      query: q,
    });
  } catch (error) {
    console.error("Search places error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search places",
      error: error.message,
    });
  }
};
