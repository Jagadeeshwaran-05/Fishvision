# Fish Classify Backend

Backend API for the Fish Classification mobile application with offline-first capabilities.

## Features

### ✅ Step 1: Authentication (COMPLETED)

- User registration (signup)
- User login (signin)
- JWT-based authentication
- Password hashing with bcrypt
- Input validation
- SQLite database for offline support

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite (better-sqlite3) - for offline functionality
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi

## Installation

```bash
# Install dependencies
npm install

# Initialize database
npm run init-db

# Start development server
npm run dev

# Start production server
npm start
```

## Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # Database connection
│   ├── controllers/
│   │   └── authController.js    # Authentication logic
│   ├── database/
│   │   └── initDb.js            # Database initialization
│   ├── middleware/
│   │   ├── auth.js              # JWT authentication middleware
│   │   └── validation.js        # Request validation
│   ├── models/
│   │   └── User.js              # User model
│   ├── routes/
│   │   └── authRoutes.js        # Auth routes
│   └── server.js                # Express app & server
├── data/
│   └── fishclassify.db          # SQLite database (created after init)
├── .env                          # Environment variables
├── .gitignore
├── package.json
└── README.md
```

## API Endpoints

### Authentication

#### Sign Up

```
POST /api/auth/signup
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

#### Sign In

```
POST /api/auth/signin
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User

```
GET /api/auth/me
Authorization: Bearer <token>
```

## Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
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
```

## Testing with cURL or Postman

### Sign Up

```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"Ryan Gosling","email":"ryan@example.com","password":"password123","confirmPassword":"password123"}'
```

### Sign In

```bash
curl -X POST http://localhost:3000/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"ryan@example.com","password":"password123"}'
```

### Get Current User

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Next Steps

- [ ] Step 2: User Profile Management
- [ ] Step 3: Fish Classification Integration
- [ ] Step 4: Fish Details from rfishbase (India only)
- [ ] Step 5: Saved Fishes Management
- [ ] Step 6: Home Dashboard with Species by Location

## Notes

- The app is designed to work completely offline
- SQLite database is stored locally in the `data/` directory
- JWT tokens are valid for 7 days by default
- All passwords are hashed using bcrypt before storage
