const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../../data/fishclassify.db");
let db;

async function initDatabase() {
  const SQL = await initSqlJs();

  let shouldInitSchema = false;

  try {
    const filebuffer = fs.readFileSync(dbPath);

    if (filebuffer.length > 0) {
      db = new SQL.Database(filebuffer);
      console.log("✅ Loaded existing database");
    } else {
      db = new SQL.Database();
      shouldInitSchema = true;
      console.log("📝 Created new database (empty file existed)");
    }
  } catch (err) {
    // Create new database if doesn't exist
    db = new SQL.Database();
    shouldInitSchema = true;
    console.log("📝 Created new database");
  }

  // Create schema if needed
  if (shouldInitSchema) {
    db.exec(`
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

    console.log("✅ Database schema created");

    // Save the new database
    saveDatabase();
  }

  // Enable foreign keys
  db.exec("PRAGMA foreign_keys = ON");

  return db;
}

function saveDatabase() {
  if (db) {
    const data = db.export();
    const buffer = Buffer.from(data);

    // Ensure directory exists
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(dbPath, buffer);
  }
}

// Auto-save on process exit
process.on("exit", saveDatabase);
process.on("SIGINT", () => {
  saveDatabase();
  process.exit();
});

module.exports = { initDatabase, getDb: () => db, saveDatabase };
