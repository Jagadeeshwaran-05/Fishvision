const { getDb, saveDatabase } = require("../config/database");

class SavedFish {
  // Create saved_fishes table
  static async createTable() {
    const db = getDb();
    db.exec(`
      CREATE TABLE IF NOT EXISTS saved_fishes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        fish_name TEXT NOT NULL,
        scientific_name TEXT,
        common_names TEXT,
        habitat TEXT,
        location TEXT,
        image_url TEXT,
        notes TEXT,
        confidence REAL,
        saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create index for faster queries
    db.exec(`
      CREATE INDEX IF NOT EXISTS idx_saved_fishes_user_id 
      ON saved_fishes(user_id)
    `);

    saveDatabase();
  }

  // Save a fish
  static async create(userId, fishData) {
    const db = getDb();
    try {
      const stmt = db.prepare(`
        INSERT INTO saved_fishes 
        (user_id, fish_name, scientific_name, common_names, habitat, location, image_url, notes, confidence)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run([
        userId,
        fishData.fish_name,
        fishData.scientific_name || null,
        fishData.common_names || null,
        fishData.habitat || null,
        fishData.location || null,
        fishData.image_url || null,
        fishData.notes || null,
        fishData.confidence || null,
      ]);

      stmt.free();
      saveDatabase();

      // Get the last inserted ID
      const idStmt = db.prepare("SELECT last_insert_rowid() as id");
      idStmt.step();
      const result = idStmt.getAsObject();
      idStmt.free();

      return { id: result.id, ...fishData };
    } catch (error) {
      console.error("Create saved fish error:", error);
      throw error;
    }
  }

  // Get all saved fishes for a user
  static async findByUserId(userId, limit = 100, offset = 0) {
    const db = getDb();
    try {
      const stmt = db.prepare(`
        SELECT * FROM saved_fishes 
        WHERE user_id = ? 
        ORDER BY saved_at DESC 
        LIMIT ? OFFSET ?
      `);
      stmt.bind([userId, limit, offset]);

      const results = [];
      while (stmt.step()) {
        results.push(stmt.getAsObject());
      }
      stmt.free();

      return results;
    } catch (error) {
      console.error("Find by user error:", error);
      return [];
    }
  }

  // Get a specific saved fish
  static async findById(id, userId) {
    const db = getDb();
    try {
      const stmt = db.prepare(`
        SELECT * FROM saved_fishes WHERE id = ? AND user_id = ?
      `);
      stmt.bind([id, userId]);

      if (stmt.step()) {
        const result = stmt.getAsObject();
        stmt.free();
        return result;
      }

      stmt.free();
      return null;
    } catch (error) {
      console.error("Find by ID error:", error);
      return null;
    }
  }

  // Update a saved fish
  static async update(id, userId, updates) {
    const db = getDb();
    const allowedFields = ["fish_name", "location", "notes"];
    const updateFields = [];
    const values = [];

    Object.keys(updates).forEach((key) => {
      if (allowedFields.includes(key)) {
        updateFields.push(`${key} = ?`);
        values.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      throw new Error("No valid fields to update");
    }

    values.push(id, userId);

    try {
      const stmt = db.prepare(
        `UPDATE saved_fishes SET ${updateFields.join(
          ", "
        )} WHERE id = ? AND user_id = ?`
      );
      stmt.run(values);
      const changes = db.getRowsModified();
      stmt.free();
      saveDatabase();
      return { changes };
    } catch (error) {
      console.error("Update error:", error);
      throw error;
    }
  }

  // Delete a saved fish
  static async delete(id, userId) {
    const db = getDb();
    try {
      const stmt = db.prepare(
        `DELETE FROM saved_fishes WHERE id = ? AND user_id = ?`
      );
      stmt.run([id, userId]);
      const changes = db.getRowsModified();
      stmt.free();
      saveDatabase();
      return { changes };
    } catch (error) {
      console.error("Delete error:", error);
      throw error;
    }
  }

  // Get statistics
  static async getStats(userId) {
    const db = getDb();
    try {
      const stmt = db.prepare(
        `SELECT 
          COUNT(*) as total_saved,
          COUNT(CASE WHEN saved_at >= date('now', '-30 days') THEN 1 END) as this_month,
          COUNT(DISTINCT habitat) as unique_habitats
         FROM saved_fishes 
         WHERE user_id = ?`
      );
      stmt.bind([userId]);

      if (stmt.step()) {
        const row = stmt.getAsObject();
        stmt.free();
        return row || { total_saved: 0, this_month: 0, unique_habitats: 0 };
      }

      stmt.free();
      return { total_saved: 0, this_month: 0, unique_habitats: 0 };
    } catch (error) {
      console.error("Get stats error:", error);
      return { total_saved: 0, this_month: 0, unique_habitats: 0 };
    }
  }

  // Check if fish is already saved
  static async isAlreadySaved(userId, fishName, scientificName) {
    const db = getDb();
    try {
      const stmt = db.prepare(`
        SELECT id FROM saved_fishes 
        WHERE user_id = ? 
        AND (fish_name = ? OR scientific_name = ?)
        LIMIT 1
      `);
      stmt.bind([userId, fishName, scientificName]);

      const exists = stmt.step();
      stmt.free();
      return exists;
    } catch (error) {
      console.error("Check if saved error:", error);
      return false;
    }
  }
}

module.exports = SavedFish;
