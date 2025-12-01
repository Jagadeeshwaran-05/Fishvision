# Manual Testing Guide for Fish Classify Authentication

## Prerequisites

Make sure the server is running:

```powershell
cd "d:\Finalllll app\backend"
node src/server.js
```

---

## Test 1: Health Check

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health"
```

**Expected Output:**

```json
{
  "success": true,
  "message": "Fish Classify API is running",
  "timestamp": "2025-10-27T..."
}
```

---

## Test 2: Sign Up (Create New User)

```powershell
$signupBody = @{
    name = "John Doe"
    email = "john@example.com"
    password = "SecurePass123"
    confirmPassword = "SecurePass123"
} | ConvertTo-Json

$signupResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $signupBody -ContentType "application/json"

# View the response
$signupResponse | ConvertTo-Json -Depth 5

# Save the token for later use
$token = $signupResponse.data.token
Write-Host "Your token: $token" -ForegroundColor Green
```

**Expected Output:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com",
      ...
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Test 3: Sign In (Login)

```powershell
$signinBody = @{
    email = "john@example.com"
    password = "SecurePass123"
} | ConvertTo-Json

$signinResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signin" -Method Post -Body $signinBody -ContentType "application/json"

# View the response
$signinResponse | ConvertTo-Json -Depth 5

# Save the token
$token = $signinResponse.data.token
Write-Host "Login successful! Token saved." -ForegroundColor Green
```

**Expected Output:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

## Test 4: Get Current User (Protected Route)

**Note:** You must have a valid token from Sign Up or Sign In

```powershell
# Make sure $token variable is set from previous steps
$headers = @{
    Authorization = "Bearer $token"
}

$userResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method Get -Headers $headers

# View the response
$userResponse | ConvertTo-Json -Depth 5
```

**Expected Output:**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com",
      "first_name": null,
      "last_name": null,
      ...
    }
  }
}
```

---

## Test 5: Validation Tests

### Invalid Email Format

```powershell
$invalidEmailBody = @{
    name = "Test User"
    email = "not-an-email"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $invalidEmailBody -ContentType "application/json"
} catch {
    Write-Host "✅ Validation working!" -ForegroundColor Green
    $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
}
```

### Password Mismatch

```powershell
$mismatchBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    confirmPassword = "different123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $mismatchBody -ContentType "application/json"
} catch {
    Write-Host "✅ Validation working!" -ForegroundColor Green
    $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
}
```

### Duplicate Email

```powershell
# Try to sign up with an email that already exists
$duplicateBody = @{
    name = "Another User"
    email = "john@example.com"  # Already exists
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $duplicateBody -ContentType "application/json"
} catch {
    Write-Host "✅ Duplicate check working!" -ForegroundColor Green
    $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
}
```

### Wrong Password on Login

```powershell
$wrongPasswordBody = @{
    email = "john@example.com"
    password = "WrongPassword123"
} | ConvertTo-Json

try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signin" -Method Post -Body $wrongPasswordBody -ContentType "application/json"
} catch {
    Write-Host "✅ Password check working!" -ForegroundColor Green
    $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
}
```

### Invalid Token (Protected Route)

```powershell
$invalidHeaders = @{
    Authorization = "Bearer invalid-token-here"
}

try {
    Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method Get -Headers $invalidHeaders
} catch {
    Write-Host "✅ Token validation working!" -ForegroundColor Green
    $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 5
}
```

---

## Complete Test Workflow

```powershell
# 1. Health Check
Write-Host "`n=== 1. Health Check ===" -ForegroundColor Cyan
Invoke-RestMethod -Uri "http://localhost:3000/api/health" | ConvertTo-Json

# 2. Sign Up
Write-Host "`n=== 2. Sign Up ===" -ForegroundColor Cyan
$signupBody = @{
    name = "Jane Smith"
    email = "jane@example.com"
    password = "MyPassword123"
    confirmPassword = "MyPassword123"
} | ConvertTo-Json

$signupResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $signupBody -ContentType "application/json"
Write-Host "User Created: $($signupResponse.data.user.name)" -ForegroundColor Green
$token = $signupResponse.data.token

# 3. Get Current User
Write-Host "`n=== 3. Get Current User ===" -ForegroundColor Cyan
$headers = @{ Authorization = "Bearer $token" }
$userResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method Get -Headers $headers
Write-Host "Current User: $($userResponse.data.user.email)" -ForegroundColor Green

# 4. Sign In
Write-Host "`n=== 4. Sign In ===" -ForegroundColor Cyan
$signinBody = @{
    email = "jane@example.com"
    password = "MyPassword123"
} | ConvertTo-Json

$signinResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signin" -Method Post -Body $signinBody -ContentType "application/json"
Write-Host "Login Successful!" -ForegroundColor Green

Write-Host "`n=== All Tests Passed! ===" -ForegroundColor Green
```

---

## Using cURL (Alternative)

If you prefer cURL:

```bash
# Health Check
curl http://localhost:3000/api/health

# Sign Up
curl -X POST http://localhost:3000/api/auth/signup ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"John Doe\",\"email\":\"john@example.com\",\"password\":\"password123\",\"confirmPassword\":\"password123\"}"

# Sign In
curl -X POST http://localhost:3000/api/auth/signin ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"john@example.com\",\"password\":\"password123\"}"

# Get Current User (replace YOUR_TOKEN with actual token)
curl -X GET http://localhost:3000/api/auth/me ^
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Using Postman

1. **Download Postman**: https://www.postman.com/downloads/
2. **Import this collection**: Create new requests with the endpoints above
3. **Set up environment variables** for the token

### Postman Collection Structure:

- Folder: "Fish Classify Auth"
  - GET: Health Check
  - POST: Sign Up
  - POST: Sign In
  - GET: Get Current User (with Bearer token)

---

## Troubleshooting

### Server not responding?

```powershell
# Check if server is running
Get-Process -Name node

# If not, start it
cd "d:\Finalllll app\backend"
node src/server.js
```

### Connection refused?

- Make sure server is running on port 3000
- Check if another app is using port 3000

### Token expired?

- Tokens expire after 7 days
- Just sign in again to get a new token

---

## Quick Test Command

Run all tests at once:

```powershell
cd "d:\Finalllll app\backend"
powershell -ExecutionPolicy Bypass -File test-api.ps1
```
