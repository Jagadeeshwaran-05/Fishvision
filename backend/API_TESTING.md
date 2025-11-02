# Fish Classify Backend API - Testing Guide

## Server Status

✅ Server is running on http://localhost:3000

## Available Endpoints

### 1. Health Check

```bash
curl http://localhost:3000/api/health
```

### 2. Sign Up (Create New User)

```bash
curl -X POST http://localhost:3000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Ryan Gosling\",\"email\":\"ryan@example.com\",\"password\":\"password123\",\"confirmPassword\":\"password123\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "Ryan Gosling",
      "email": "ryan@example.com",
      "first_name": null,
      "last_name": null,
      "phone_number": null,
      "gender": null,
      "date_of_birth": null,
      "profile_image": null,
      "location": null,
      "created_at": "2025-10-27 ...",
      "updated_at": "2025-10-27 ..."
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 3. Sign In (Login)

```bash
curl -X POST http://localhost:3000/api/auth/signin ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"ryan@example.com\",\"password\":\"password123\"}"
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "Ryan Gosling",
      "email": "ryan@example.com",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 4. Get Current User (Protected Route)

**Note:** Replace `YOUR_TOKEN_HERE` with the token from sign-in response

```bash
curl -X GET http://localhost:3000/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Expected Response:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "name": "Ryan Gosling",
      "email": "ryan@example.com",
      ...
    }
  }
}
```

## Testing in PowerShell

### Sign Up

```powershell
$body = @{
    name = "Ryan Gosling"
    email = "ryan@example.com"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $body -ContentType "application/json"
```

### Sign In

```powershell
$body = @{
    email = "ryan@example.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signin" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.token
Write-Host "Token: $token"
```

### Get Current User

```powershell
$headers = @{
    Authorization = "Bearer $token"
}

Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method Get -Headers $headers
```

## Validation Tests

### Invalid Email

```bash
curl -X POST http://localhost:3000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test\",\"email\":\"invalid-email\",\"password\":\"pass123\",\"confirmPassword\":\"pass123\"}"
```

### Password Mismatch

```bash
curl -X POST http://localhost:3000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test\",\"email\":\"test@example.com\",\"password\":\"pass123\",\"confirmPassword\":\"different\"}"
```

### Duplicate Email

Try signing up with the same email twice - the second attempt should fail.

## Database Location

The SQLite database is stored at: `backend/data/fishclassify.db`

## Features Implemented ✅

1. **User Registration**

   - Name, email, password validation
   - Password confirmation
   - Email uniqueness check
   - Password hashing with bcrypt

2. **User Login**

   - Email/password authentication
   - JWT token generation
   - 7-day token expiration

3. **Protected Routes**

   - JWT authentication middleware
   - Token verification
   - User context in requests

4. **Offline Support**
   - SQLite database (sql.js)
   - No external database required
   - Persistent storage

## Next Steps

Once you approve this authentication system, we'll move to:

- **Step 2: User Profile Management** (update profile, upload profile image, etc.)
