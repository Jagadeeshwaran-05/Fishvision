const { getDb, saveDatabase } = require("../config/database");

class SavedPlace {
  // Save a place for a user
  static create(userId, placeId, notes = null) {
    try {
      const db = getDb();
      const stmt = db.prepare(`
        INSERT INTO saved_places (user_id, place_id, notes)
        VALUES (?, ?, ?)
      `);

      stmt.bind([Number(userId), Number(placeId), notes || null]);
      stmt.step();
      stmt.free();

      const lastId = db.exec("SELECT last_insert_rowid() as id")[0]
        .values[0][0];
      saveDatabase();

      return this.findById(lastId);
    } catch (error) {
      console.error("Error in SavedPlace.create:", error);
      throw error;
    }
  }

  // Get all saved places for a user
  static findByUserId(userId, limit = 100, offset = 0) {
    try {
      if (!userId) {
        return [];
      }

      const db = getDb();
      const query = `
        SELECT 
          sp.*,
          p.name as place_name,
          p.region,
          p.description,
          p.image_url,
          p.latitude,
          p.longitude,
          p.fish_species_count,
          p.is_trending
        FROM saved_places sp
        JOIN places p ON sp.place_id = p.id
        WHERE sp.user_id = ?
        ORDER BY sp.saved_at DESC
        LIMIT ? OFFSET ?
      `;

      const stmt = db.prepare(query);
      stmt.bind([Number(userId), Number(limit), Number(offset)]);

      const savedPlaces = [];
      while (stmt.step()) {
        savedPlaces.push(stmt.getAsObject());
      }
      stmt.free();

      return savedPlaces;
    } catch (error) {
      console.error("Error in SavedPlace.findByUserId:", error);
      throw error;
    }
  }

  // Get a specific saved place
  static findById(id) {
    try {
      const db = getDb();
      const query = `
        SELECT 
          sp.*,
          p.name as place_name,
          p.region,
          p.description,
          p.image_url,
          p.latitude,
          p.longitude,
          p.fish_species_count,
          p.is_trending
        FROM saved_places sp
        JOIN places p ON sp.place_id = p.id
        WHERE sp.id = ?
      `;

      const stmt = db.prepare(query);
      stmt.bind([id]);

      let savedPlace = null;
      if (stmt.step()) {
        savedPlace = stmt.getAsObject();
      }
      stmt.free();

      return savedPlace;
    } catch (error) {
      console.error("Error in SavedPlace.findById:", error);
      throw error;
    }
  }

  // Update saved place
  static update(id, updates) {
    try {
      const db = getDb();
      const { notes, visited, visit_date } = updates;

      const fields = [];
      const values = [];

      if (notes !== undefined) {
        fields.push("notes = ?");
        values.push(notes);
      }
      if (visited !== undefined) {
        fields.push("visited = ?");
        values.push(visited ? 1 : 0);
      }
      if (visit_date !== undefined) {
        fields.push("visit_date = ?");
        values.push(visit_date);
      }

      if (fields.length === 0) {
        throw new Error("No fields to update");
      }

      values.push(id);
      const query = `UPDATE saved_places SET ${fields.join(", ")} WHERE id = ?`;

      const stmt = db.prepare(query);
      stmt.bind(values);
      stmt.run();
      stmt.free();

      const rowsModified = db.getRowsModified();
      saveDatabase();

      if (rowsModified === 0) {
        throw new Error("Saved place not found");
      }

      return this.findById(id);
    } catch (error) {
      console.error("Error in SavedPlace.update:", error);
      throw error;
    }
  }

  // Delete saved place
  static delete(id) {
    try {
      const db = getDb();
      const stmt = db.prepare("DELETE FROM saved_places WHERE id = ?");
      stmt.bind([id]);
      stmt.run();
      stmt.free();

      const rowsModified = db.getRowsModified();
      saveDatabase();

      if (rowsModified === 0) {
        throw new Error("Saved place not found");
      }

      return { success: true, message: "Place removed successfully" };
    } catch (error) {
      console.error("Error in SavedPlace.delete:", error);
      throw error;
    }
  }

  // Get statistics for user's saved places
  static getStats(userId) {
    try {
      if (!userId) {
        return { total: 0, thisMonth: 0, visited: 0 };
      }

      const db = getDb();

      // Total saved places
      const totalStmt = db.prepare(
        "SELECT COUNT(*) as count FROM saved_places WHERE user_id = ?"
      );
      totalStmt.bind([Number(userId)]);
      totalStmt.step();
      const total = totalStmt.getAsObject().count;
      totalStmt.free();

      // Places saved this month
      const monthStmt = db.prepare(`
        SELECT COUNT(*) as count FROM saved_places 
        WHERE user_id = ? 
        AND date(saved_at) >= date('now', 'start of month')
      `);
      monthStmt.bind([Number(userId)]);
      monthStmt.step();
      const thisMonth = monthStmt.getAsObject().count;
      monthStmt.free();

      // Visited places
      const visitedStmt = db.prepare(
        "SELECT COUNT(*) as count FROM saved_places WHERE user_id = ? AND visited = 1"
      );
      visitedStmt.bind([Number(userId)]);
      visitedStmt.step();
      const visited = visitedStmt.getAsObject().count;
      visitedStmt.free();

      return {
        total,
        thisMonth,
        visited,
      };
    } catch (error) {
      console.error("Error in SavedPlace.getStats:", error);
      throw error;
    }
  }

  // Check if place is already saved by user
  static isAlreadySaved(userId, placeId) {
    try {
      if (!userId || !placeId) {
        return false;
      }

      const db = getDb();
      const stmt = db.prepare(
        "SELECT id FROM saved_places WHERE user_id = ? AND place_id = ?"
      );
      stmt.bind([Number(userId), Number(placeId)]);

      const exists = stmt.step();
      stmt.free();

      return exists;
    } catch (error) {
      console.error("Error in SavedPlace.isAlreadySaved:", error);
      throw error;
    }
  }
}

module.exports = SavedPlace;
