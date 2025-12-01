# Test Script for Fish Classify Backend API

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Fish Classify Backend API - Test Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/health"
    Write-Host "✅ Success:" -ForegroundColor Green
    $response | ConvertTo-Json
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Sign Up
Write-Host "Test 2: User Sign Up" -ForegroundColor Yellow
$signupBody = @{
    name = "Ryan Gosling"
    email = "ryan@example.com"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $signupBody -ContentType "application/json"
    Write-Host "✅ Success:" -ForegroundColor Green
    Write-Host "User ID: $($signupResponse.data.user.id)" -ForegroundColor Cyan
    Write-Host "Name: $($signupResponse.data.user.name)" -ForegroundColor Cyan
    Write-Host "Email: $($signupResponse.data.user.email)" -ForegroundColor Cyan
    Write-Host "Token: $($signupResponse.data.token.Substring(0, 50))..." -ForegroundColor Cyan
    $global:token = $signupResponse.data.token
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    # If user already exists, try sign in instead
    if ($_.Exception.Message -like "*already registered*") {
        Write-Host "User already exists, trying sign in..." -ForegroundColor Yellow
    }
}
Write-Host ""

# Test 3: Sign In
Write-Host "Test 3: User Sign In" -ForegroundColor Yellow
$signinBody = @{
    email = "ryan@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $signinResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signin" -Method Post -Body $signinBody -ContentType "application/json"
    Write-Host "✅ Success:" -ForegroundColor Green
    Write-Host "User ID: $($signinResponse.data.user.id)" -ForegroundColor Cyan
    Write-Host "Name: $($signinResponse.data.user.name)" -ForegroundColor Cyan
    Write-Host "Email: $($signinResponse.data.user.email)" -ForegroundColor Cyan
    Write-Host "Token: $($signinResponse.data.token.Substring(0, 50))..." -ForegroundColor Cyan
    $global:token = $signinResponse.data.token
} catch {
    Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Current User (Protected Route)
Write-Host "Test 4: Get Current User (Protected)" -ForegroundColor Yellow
if ($global:token) {
    $headers = @{
        Authorization = "Bearer $global:token"
    }
    
    try {
        $meResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/me" -Method Get -Headers $headers
        Write-Host "✅ Success:" -ForegroundColor Green
        Write-Host "User ID: $($meResponse.data.user.id)" -ForegroundColor Cyan
        Write-Host "Name: $($meResponse.data.user.name)" -ForegroundColor Cyan
        Write-Host "Email: $($meResponse.data.user.email)" -ForegroundColor Cyan
    } catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Skipped: No token available" -ForegroundColor Yellow
}
Write-Host ""

# Test 5: Validation - Invalid Email
Write-Host "Test 5: Validation - Invalid Email" -ForegroundColor Yellow
$invalidEmailBody = @{
    name = "Test User"
    email = "invalid-email"
    password = "password123"
    confirmPassword = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $invalidEmailBody -ContentType "application/json"
    Write-Host "❌ Should have failed but didn't" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✅ Validation working:" -ForegroundColor Green
    Write-Host "Message: $($errorResponse.message)" -ForegroundColor Cyan
}
Write-Host ""

# Test 6: Validation - Password Mismatch
Write-Host "Test 6: Validation - Password Mismatch" -ForegroundColor Yellow
$mismatchBody = @{
    name = "Test User"
    email = "test@example.com"
    password = "password123"
    confirmPassword = "different"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $mismatchBody -ContentType "application/json"
    Write-Host "❌ Should have failed but didn't" -ForegroundColor Red
} catch {
    $errorResponse = $_.ErrorDetails.Message | ConvertFrom-Json
    Write-Host "✅ Validation working:" -ForegroundColor Green
    Write-Host "Message: $($errorResponse.message)" -ForegroundColor Cyan
}
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "All Tests Completed!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
