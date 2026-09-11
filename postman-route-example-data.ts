/*

========================================
1. REGISTER USER
========================================
POST /api/auth/register

{
  "name": "John",
  "email": "john@example.com",
  "password": "Password@123",
  "profile": {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "+8801712345678",
    "country": "Bangladesh",
    "address": "Dhaka, Bangladesh",
    "bio": "Software Developer"
  }
}

========================================
2. VERIFY EMAIL
========================================
POST /api/auth/verify-email

{
  "email": "john@example.com",
  "otp": "123456"
}

========================================
3. LOGIN USER
========================================
POST /api/auth/login

{
  "email": "john@example.com",
  "password": "Password@123"
}

========================================
4. GOOGLE LOGIN
========================================
POST /api/auth/google

{
  "idToken": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}

========================================
5. FORGOT PASSWORD
========================================
POST /api/auth/forgot-password

{
  "email": "john@example.com"
}

========================================
6. RESET PASSWORD
========================================
POST /api/auth/reset-password

{
  "email": "john@example.com",
  "newPassword": "NewPassword@456",
  "otp": "654321"
}

========================================
7. GET ME (Current User)
========================================
GET /api/auth/me
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Roles Allowed: ADMIN, INVESTOR, SHARK

(No body)

========================================
8. REFRESH TOKEN
========================================
POST /api/auth/refresh-token

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

*/

/*

9. APPLY AS SHARK
========================================
POST /api/user/apply-as-shark

Authorization: Bearer INVESTOR_ACCESS_TOKEN

No Body

=====================

10. GET SHARK APPLICATIONS
========================================
GET /api/admin/accept-shark

Authorization: Bearer ADMIN_ACCESS_TOKEN

No Body
===================
11. ACCEPT SHARK APPLICATION
========================================
PATCH /api/admin/accept-shark/:userId

Authorization: Bearer ADMIN_ACCESS_TOKEN

No Body


*/

/*
{
  "email": "asifsifat99@gmail.com",
  "password": "NewPassword@456"
}

{
  "email": "tadmin@gmail.com",
  "password": "T@admin12345."
}



*/

