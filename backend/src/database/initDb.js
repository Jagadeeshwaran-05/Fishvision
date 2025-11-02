const { initDatabase, getDb, saveDatabase } = require("../config/database");

async function initializeDatabaseSchema() {
  console.log("Initializing database...");

  await initDatabase();
  const db = getDb();

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      first_name TEXT,
      last_name TEXT,
      phone_number TEXT,
      gender TEXT,
      date_of_birth TEXT,
      profile_image TEXT,
      location TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Users table created");

  // Save the database
  saveDatabase();

  console.log("Database initialization complete!");
}

// Run initialization
initializeDatabaseSchema()
  .then(() => {
    console.log("Database setup successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Database initialization failed:", error);
    process.exit(1);
  });
