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

  // Create saved_fishes table
  db.run(`
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
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_saved_fishes_user_id 
    ON saved_fishes(user_id)
  `);

  console.log("✅ Saved fishes table created");

  // Create places table for popular fishing spots
  db.run(`
    CREATE TABLE IF NOT EXISTS places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      region TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      latitude REAL,
      longitude REAL,
      fish_species_count INTEGER DEFAULT 0,
      is_trending BOOLEAN DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Places table created");

  // Create saved_places table
  db.run(`
    CREATE TABLE IF NOT EXISTS saved_places (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      place_id INTEGER NOT NULL,
      notes TEXT,
      visited BOOLEAN DEFAULT 0,
      visit_date TEXT,
      saved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE,
      UNIQUE(user_id, place_id)
    )
  `);

  // Create indexes
  db.run(`
    CREATE INDEX IF NOT EXISTS idx_saved_places_user_id 
    ON saved_places(user_id)
  `);

  db.run(`
    CREATE INDEX IF NOT EXISTS idx_saved_places_place_id 
    ON saved_places(place_id)
  `);

  console.log("✅ Saved places table created");

  // Insert sample places data
  const samplePlaces = [
    {
      name: "Kerala Coast",
      region: "Kerala",
      description: "Rich marine biodiversity along the Arabian Sea coast",
      image_url:
        "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400",
      latitude: 10.8505,
      longitude: 76.2711,
      fish_species_count: 8,
      is_trending: 1,
    },
    {
      name: "Ganges River",
      region: "Uttar Pradesh",
      description:
        "One of the most sacred rivers with diverse freshwater species",
      image_url:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400",
      latitude: 25.3176,
      longitude: 82.9739,
      fish_species_count: 12,
      is_trending: 0,
    },
    {
      name: "Bay of Bengal",
      region: "West Bengal",
      description: "Largest bay in the world with abundant marine life",
      image_url:
        "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400",
      latitude: 21.0,
      longitude: 90.0,
      fish_species_count: 10,
      is_trending: 1,
    },
    {
      name: "Goa Beaches",
      region: "Goa",
      description: "Popular coastal destination with vibrant fishing culture",
      image_url:
        "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400",
      latitude: 15.2993,
      longitude: 74.124,
      fish_species_count: 6,
      is_trending: 1,
    },
    {
      name: "Chilika Lake",
      region: "Odisha",
      description: "Asia's largest brackish water lagoon",
      image_url:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
      latitude: 19.7165,
      longitude: 85.4939,
      fish_species_count: 7,
      is_trending: 0,
    },
    {
      name: "Andaman Islands",
      region: "Andaman and Nicobar",
      description: "Pristine coral reefs and diverse marine ecosystem",
      image_url:
        "https://images.unsplash.com/photo-1540202404-a2f2a7275e22?w=400",
      latitude: 11.7401,
      longitude: 92.6586,
      fish_species_count: 15,
      is_trending: 1,
    },
  ];

  const insertStmt = db.prepare(`
    INSERT INTO places (name, region, description, image_url, latitude, longitude, fish_species_count, is_trending)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  samplePlaces.forEach((place) => {
    insertStmt.run([
      place.name,
      place.region,
      place.description,
      place.image_url,
      place.latitude,
      place.longitude,
      place.fish_species_count,
      place.is_trending,
    ]);
  });

  insertStmt.free();
  console.log("✅ Sample places data inserted");

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
