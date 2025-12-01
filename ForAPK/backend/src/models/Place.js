const { getDb } = require("../config/database");

class Place {
  // Get all places with optional filters
  static getAll(options = {}) {
    try {
      const db = getDb();
      const {
        limit = 10,
        offset = 0,
        trending = null,
        region = null,
        sortBy = "fish_species_count",
        order = "DESC",
      } = options;

      let query = "SELECT * FROM places WHERE 1=1";
      const params = [];

      if (trending !== null) {
        query += " AND is_trending = ?";
        params.push(trending ? 1 : 0);
      }

      if (region) {
        query += " AND region LIKE ?";
        params.push(`%${region}%`);
      }

      query += ` ORDER BY ${sortBy} ${order} LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const stmt = db.prepare(query);
      stmt.bind(params);

      const places = [];
      while (stmt.step()) {
        places.push(stmt.getAsObject());
      }
      stmt.free();

      return places;
    } catch (error) {
      console.error("Error in Place.getAll:", error);
      throw error;
    }
  }

  // Get place by ID
  static getById(id) {
    try {
      const db = getDb();
      const stmt = db.prepare("SELECT * FROM places WHERE id = ?");
      stmt.bind([id]);

      let place = null;
      if (stmt.step()) {
        place = stmt.getAsObject();
      }
      stmt.free();

      return place;
    } catch (error) {
      console.error("Error in Place.getById:", error);
      throw error;
    }
  }

  // Get trending places
  static getTrending(limit = 6) {
    try {
      return this.getAll({ trending: true, limit });
    } catch (error) {
      console.error("Error in Place.getTrending:", error);
      throw error;
    }
  }

  // Search places by name or region
  static search(searchTerm, limit = 20) {
    try {
      const db = getDb();
      const query = `
        SELECT * FROM places 
        WHERE name LIKE ? OR region LIKE ? OR description LIKE ?
        ORDER BY fish_species_count DESC
        LIMIT ?
      `;

      const searchPattern = `%${searchTerm}%`;
      const stmt = db.prepare(query);
      stmt.bind([searchPattern, searchPattern, searchPattern, limit]);

      const places = [];
      while (stmt.step()) {
        places.push(stmt.getAsObject());
      }
      stmt.free();

      return places;
    } catch (error) {
      console.error("Error in Place.search:", error);
      throw error;
    }
  }

  // Get places count
  static getCount(filters = {}) {
    try {
      const db = getDb();
      let query = "SELECT COUNT(*) as count FROM places WHERE 1=1";
      const params = [];

      if (filters.trending !== undefined) {
        query += " AND is_trending = ?";
        params.push(filters.trending ? 1 : 0);
      }

      if (filters.region) {
        query += " AND region LIKE ?";
        params.push(`%${filters.region}%`);
      }

      const stmt = db.prepare(query);
      stmt.bind(params);

      let count = 0;
      if (stmt.step()) {
        count = stmt.getAsObject().count;
      }
      stmt.free();

      return count;
    } catch (error) {
      console.error("Error in Place.getCount:", error);
      throw error;
    }
  }
}

module.exports = Place;
