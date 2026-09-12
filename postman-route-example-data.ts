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


============================

POST /api/user/book-appointment
Authorization: Bearer SHARK_ACCESS_TOKEN

{
  "scheduleId": "",
  "purpose": "Discuss investment opportunities",
  "notes": "I would like to discuss the agricultural investment projects."
}

====================
GET /api/user/schedules



=======================
get -> /admin/appointment-requests




=====================  
patch -> /appointment-requests/:appointmentId/approve

{
  "appointmentUrl": "https://example.com/appointment/d815f636-11d1-4db6-a4e5-d85d340eff2a"
}
=======================

GET /api/user/my-appointment



=====================  

POST /api/payments/create-checkout

{
  "numberOfShares": 2
}
========================
GET /api/payments/my-payments
  
=======================

{{local}}/share/my-shares

get all my share 

=====================  

POST   /api/v1/projects

{
  "title": "Uganda 3,000 Acre Maize Farm",
  "description": "Large-scale maize farming project in Uganda.",
  "imageUrl": "https://example.com/uganda-farm.jpg",
  "location": "Uganda",
  "totalCost": 2500000,
  "currency": "USD",
  "startDate": "2026-10-01",
  "endDate": "2029-10-01"
}

=====================
GET /api/v1/projects?searchTerm=maize&status=FUNDING&page=1&limit=10&sortBy=totalCost&sortOrder=asc


=================================
GET    /api/v1/projects/:id
=======================
GET /api/v1/analytics/admin



=====================  




*/

/*
{
  "email": "asifsifat99@gmail.com",
  "password": "Password@123"
}

{
  "email": "tadmin@gmail.com",
  "password": "T@admin12345."
}



*/

