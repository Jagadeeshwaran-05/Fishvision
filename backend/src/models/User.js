const { getDb, saveDatabase } = require("../config/database");

class User {
  // Create a new user
  static create({ name, email, password }) {
    const db = getDb();

    try {
      db.run("INSERT INTO users (name, email, password) VALUES (?, ?, ?)", [
        name,
        email,
        password,
      ]);

      const result = db.exec("SELECT last_insert_rowid() as id");
      saveDatabase();

      if (result && result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0];
      }
      return null;
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  // Find user by email
  static findByEmail(email) {
    const db = getDb();

    try {
      const result = db.exec("SELECT * FROM users WHERE email = ?", [email]);

      if (!result || result.length === 0 || result[0].values.length === 0) {
        return null;
      }

      const columns = result[0].columns;
      const values = result[0].values[0];
      const user = {};
      columns.forEach((col, index) => {
        user[col] = values[index];
      });

      return user;
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }

  // Find user by ID
  static findById(id) {
    const db = getDb();

    try {
      const result = db.exec("SELECT * FROM users WHERE id = ?", [id]);

      if (!result || result.length === 0 || result[0].values.length === 0) {
        return null;
      }

      const columns = result[0].columns;
      const values = result[0].values[0];
      const user = {};
      columns.forEach((col, index) => {
        user[col] = values[index];
      });

      return user;
    } catch (error) {
      console.error("Error finding user by ID:", error);
      return null;
    }
  }

  // Update user profile
  static updateProfile(id, profileData) {
    const db = getDb();
    const fields = [];
    const values = [];
    // Allow updating common profile fields including name/email and profile_image
    if (profileData.name !== undefined) {
      fields.push("name = ?");
      values.push(profileData.name);
    }
    if (profileData.email !== undefined) {
      fields.push("email = ?");
      values.push(profileData.email);
    }
    if (profileData.first_name !== undefined) {
      fields.push("first_name = ?");
      values.push(profileData.first_name);
    }
    if (profileData.last_name !== undefined) {
      fields.push("last_name = ?");
      values.push(profileData.last_name);
    }
    if (profileData.phone_number !== undefined) {
      fields.push("phone_number = ?");
      values.push(profileData.phone_number);
    }
    if (profileData.gender !== undefined) {
      fields.push("gender = ?");
      values.push(profileData.gender);
    }
    if (profileData.date_of_birth !== undefined) {
      fields.push("date_of_birth = ?");
      values.push(profileData.date_of_birth);
    }
    if (profileData.location !== undefined) {
      fields.push("location = ?");
      values.push(profileData.location);
    }
    if (profileData.profile_image !== undefined) {
      fields.push("profile_image = ?");
      values.push(profileData.profile_image);
    }

    if (fields.length === 0) {
      return false;
    }

    fields.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id);

    try {
      db.run(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
      saveDatabase();
      return true;
    } catch (error) {
      console.error("Error updating user profile:", error);
      return false;
    }
  }

  // Set (replace) password hash for user
  static setPassword(id, hashedPassword) {
    const db = getDb();

    try {
      db.run(
        `UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
        [hashedPassword, id]
      );
      saveDatabase();
      return true;
    } catch (error) {
      console.error("Error setting user password:", error);
      return false;
    }
  }

  // Check if email exists
  static emailExists(email) {
    const db = getDb();

    try {
      const result = db.exec(
        "SELECT COUNT(*) as count FROM users WHERE email = ?",
        [email]
      );

      if (result && result.length > 0 && result[0].values.length > 0) {
        return result[0].values[0][0] > 0;
      }
      return false;
    } catch (error) {
      console.error("Error checking email existence:", error);
      return false;
    }
  }
}

module.exports = User;
