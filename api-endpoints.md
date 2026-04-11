# SharePlate API Endpoint Documentation

## Overview

Base URL: `http://localhost:5000`

All protected endpoints expect an access token in the `Authorization` header:

```http
Authorization: Bearer <access_token>
```

Authentication uses a short-lived access token plus a refresh token stored in an `httpOnly` cookie named `refreshToken` on the `/api/auth` path. The refresh cookie is issued by login and Google sign-in flows, and is rotated on `/api/auth/refresh`.

Role checks are enforced by middleware. When a route says `restaurant`, `foodbank`, or `admin`, the authenticated user's role must match.

Request bodies are JSON unless the endpoint is marked `multipart/form-data`.

## How to Read This File Quickly
1. Check **Quick Navigation** to jump to a module.

## Quick Navigation

- [Auth](#auth)
- [User](#user)
- [Restaurant Donation Listings](#restaurant-donation-listings)
- [Donation Requests for Restaurant Listings](#donation-requests-for-restaurant-listings)
- [Foodbank Requests to Restaurants](#foodbank-requests-to-restaurants)
- [Accept Foodbank Requests](#accept-foodbank-requests)
- [Pickup OTP](#pickup-otp)
- [Complaints](#complaints)
- [Dashboard](#dashboard)
- [Settings](#settings)
- [Nearby / Distance Test](#nearby--distance-test)
- [Notification Test](#notification-test)



## Standard Auth User Shape
Several auth endpoints return the same user shape:

```json
{
  "id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "_id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "name": "Sample User",
  "email": "user@example.com",
  "role": "restaurant",
  "emailVerified": true,
  "address": "123 Main St, Colombo",
  "contactNumber": "+94771234567",
  "location": {
    "type": "Point",
    "coordinates": [79.8612, 6.9271]
  },
  "isActive": true,
  "verificationStatus": "verified"
}
```

## Public Utility Routes

### GET /api

Auth: none

Response:

```json
"API running"
```

### GET /

Auth: none

Response:

```json
{ "message": "SharePlate API running" }
```

### GET /verify-email

Auth: none

Purpose: browser redirect compatibility route for email verification links. It redirects to the frontend with the `token` query parameter preserved.

Example:

```text
GET /verify-email?token=abc123
```

Response: `302` redirect to the frontend verify page.

### GET /reset-password

Auth: none

Purpose: browser redirect compatibility route for password reset links. It redirects to the frontend with the `token` query parameter preserved.

Example:

```text
GET /reset-password?token=abc123
```

Response: `302` redirect to the frontend reset page.

## Auth

Base path: `/api/auth`

Rate limited: yes, the auth router is protected by a per-minute limiter.

### POST /api/auth/register

Auth: none

Request body: `application/json`

```json
{
  "name": "Green Kitchen",
  "email": "contact@greenkitchen.com",
  "password": "Strong@Pass1",
  "address": "45 Galle Road, Colombo",
  "contactNumber": "+94771234567",
  "role": "restaurant",
  "location": {
    "type": "Point",
    "coordinates": [79.8612, 6.9271]
  }
}
```

Response: `201 Created`

```json
{
  "message": "Registered successfully",
  "user": {
    "id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "_id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "name": "Green Kitchen",
    "email": "contact@greenkitchen.com",
    "role": "restaurant",
    "emailVerified": false,
    "address": "45 Galle Road, Colombo",
    "contactNumber": "+94771234567",
    "location": {
      "type": "Point",
      "coordinates": [79.8612, 6.9271]
    },
    "isActive": true,
    "verificationStatus": "unverified",
    "createdAt": "2026-04-12T08:30:00.000Z"
  }
}
```

Notes: the server sends an email verification link after registration. Login remains blocked until email verification is complete.

### POST /api/auth/login

Auth: none

Request body:

```json
{
  "email": "contact@greenkitchen.com",
  "password": "Strong@Pass1"
}
```

Response: `200 OK`

The response includes `accessToken` and `user`, and the server sets an `httpOnly` `refreshToken` cookie.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "_id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "name": "Green Kitchen",
    "email": "contact@greenkitchen.com",
    "role": "restaurant",
    "emailVerified": true,
    "address": "45 Galle Road, Colombo",
    "contactNumber": "+94771234567",
    "location": {
      "type": "Point",
      "coordinates": [79.8612, 6.9271]
    },
    "isActive": true,
    "verificationStatus": "verified"
  }
}
```

### POST /api/auth/google

Auth: none

Request body:

```json
{
  "credential": "google-id-token-from-client"
}
```

Response cases:

If the Google account is not yet linked to a SharePlate account:

```json
{
  "requiresOnboarding": true,
  "onboardingToken": "eyJhbGciOiJIUzI1NiIs...",
  "profile": {
    "email": "newuser@gmail.com",
    "name": "New User",
    "emailVerified": true
  }
}
```

If the Google account is already linked:

```json
{
  "requiresOnboarding": false,
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "refresh-token-value",
  "user": {
    "id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "_id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "name": "Green Kitchen",
    "email": "contact@greenkitchen.com",
    "role": "restaurant",
    "emailVerified": true,
    "address": "45 Galle Road, Colombo",
    "contactNumber": "+94771234567",
    "location": {
      "type": "Point",
      "coordinates": [79.8612, 6.9271]
    },
    "isActive": true,
    "verificationStatus": "verified"
  }
}
```

### POST /api/auth/google/complete

Auth: none

Purpose: completes Google onboarding for a new account.

Request body:

```json
{
  "onboardingToken": "eyJhbGciOiJIUzI1NiIs...",
  "name": "New User",
  "password": "Strong@Pass1",
  "address": "45 Galle Road, Colombo",
  "contactNumber": "+94771234567",
  "role": "foodbank",
  "location": {
    "type": "Point",
    "coordinates": [79.8612, 6.9271]
  }
}
```

Response: `200 OK`

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "_id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "name": "New User",
    "email": "newuser@gmail.com",
    "role": "foodbank",
    "emailVerified": true,
    "address": "45 Galle Road, Colombo",
    "contactNumber": "+94771234567",
    "location": {
      "type": "Point",
      "coordinates": [79.8612, 6.9271]
    },
    "isActive": true,
    "verificationStatus": "unverified"
  }
}
```

### POST /api/auth/refresh

Auth: none, but requires the `refreshToken` cookie.

Request: no body.

Response: `200 OK`

The server rotates the refresh token cookie and returns a new access token.

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "_id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "name": "Green Kitchen",
    "email": "contact@greenkitchen.com",
    "role": "restaurant",
    "emailVerified": true,
    "address": "45 Galle Road, Colombo",
    "contactNumber": "+94771234567",
    "location": {
      "type": "Point",
      "coordinates": [79.8612, 6.9271]
    },
    "isActive": true,
    "verificationStatus": "verified"
  }
}
```

### POST /api/auth/logout

Auth: none, but requires the `refreshToken` cookie.

Response:

```json
{ "message": "Logged out" }
```

### POST /api/auth/logout-all

Auth: required

Roles: any authenticated user

Purpose: revokes all active sessions for the current user.

Response:

```json
{ "message": "Logged out from all devices" }
```

### POST /api/auth/send-verification

Auth: required

Roles: any authenticated user

Response:

```json
{ "message": "Verification email sent successfully" }
```

### GET /api/auth/verify-email

Auth: none

Query parameter:

```text
token=<email-verification-token>
```

Response:

```json
{ "message": "Email verified successfully! You can now login." }
```

### POST /api/auth/resend-verification

Auth: none

Request body:

```json
{ "email": "contact@greenkitchen.com" }
```

Response:

```json
{ "message": "If that email exists, a verification link has been sent" }
```

### POST /api/auth/forgot-password

Auth: none

Request body:

```json
{ "email": "contact@greenkitchen.com" }
```

Response:

```json
{ "message": "If that email exists, a reset link has been sent" }
```

### POST /api/auth/reset-password

Auth: none

Request body:

```json
{
  "token": "password-reset-token",
  "password": "NewStrong@Pass1"
}
```

Response:

```json
{ "message": "Password reset successful. Please login with your new password." }
```

### GET /api/auth/validate-reset-token

Auth: none

Query parameter:

```text
token=<password-reset-token>
```

Response:

```json
{ "valid": true }
```

### POST /api/auth/change-password

Auth: required

Request body:

```json
{
  "currentPassword": "OldStrong@Pass1",
  "newPassword": "NewStrong@Pass2"
}
```

Response:

```json
{ "message": "Password changed successfully" }
```

## User

Base path: `/api/user`

### GET /api/user/me

Auth: required

Response:

```json
{
  "user": {
    "name": "Green Kitchen",
    "email": "contact@greenkitchen.com",
    "role": "restaurant",
    "address": "45 Galle Road, Colombo",
    "contactNumber": "+94771234567",
    "location": {
      "type": "Point",
      "coordinates": [79.8612, 6.9271]
    }
  }
}
```

### PATCH /api/user/me

Auth: required

Body requires all of these fields:

```json
{
  "name": "Green Kitchen Updated",
  "address": "45 Galle Road, Colombo 03",
  "contactNumber": "+94771234567",
  "location": {
    "type": "Point",
    "coordinates": [79.8615, 6.9275]
  }
}
```

Response:

```json
{
  "message": "Profile updated",
  "user": {
    "name": "Green Kitchen Updated"
  }
}
```

### GET /api/user/stats

Auth: required

Roles: admin only

Response:

```json
{
  "totalUsers": 120,
  "totalFoodBanks": 18,
  "totalRestaurants": 42,
  "totalDonations": 215,
  "activeRequests": 33
}
```

### GET /api/user/

Auth: required

Roles: admin only

Purpose: paginated/list query of users through the admin list service.

Response: service-defined listing object, typically including users and paging metadata.

### PATCH /api/user/:id

Auth: required

Roles: admin only

Body requires these fields:

```json
{
  "role": "foodbank",
  "isActive": true,
  "verificationStatus": "verified",
  "verifiedAt": "2026-04-12T08:30:00.000Z",
  "name": "Updated Name",
  "address": "45 Galle Road, Colombo",
  "contactNumber": "+94771234567",
  "location": {
    "type": "Point",
    "coordinates": [79.8612, 6.9271]
  }
}
```

Response:

```json
{
  "message": "User updated",
  "user": {}
}
```

### DELETE /api/user/:id

Auth: required

Roles: admin only

Purpose: soft delete, which deactivates the account.

Response: service-defined result, typically a success message and the affected user id.

## Restaurant Donation Listings

Base path: `/api/foodsdonate`

### POST /api/foodsdonate/

Auth: required

Roles: restaurant only

Request: `multipart/form-data`

Fields:

| Field | Required | Notes |
| --- | --- | --- |
| restaurant_id | yes | Must be a valid user id |
| foodName | yes | Donation title |
| description | no | Free text |
| foodType | no | Example: `veg`, `non-veg` |
| totalQuantity | yes | Must be greater than 0 |
| expiryTime | yes | ISO datetime |
| pickupWindowStart | yes | ISO datetime |
| pickupWindowEnd | yes | ISO datetime, must be after start and before expiry |
| image | no | Uploaded file field; stored in Cloudinary |
| imageUrl | no | Optional direct URL, overridden by uploaded file |

Response: `201 Created`

```json
{
  "_id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "restaurant_id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "foodName": "Rice and Curry",
  "description": "Fresh lunch surplus",
  "foodType": "veg",
  "totalQuantity": 20,
  "remainingQuantity": 20,
  "expiryTime": "2026-04-13T10:00:00.000Z",
  "pickupWindowStart": "2026-04-12T12:00:00.000Z",
  "pickupWindowEnd": "2026-04-12T15:00:00.000Z",
  "imageUrl": "https://res.cloudinary.com/...",
  "status": "available"
}
```

### GET /api/foodsdonate/

Auth: required

Roles: foodbank or restaurant

Query examples: `status`, `foodType`

Response: array of donations with populated restaurant data and attached request list.

```json
[
  {
    "_id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "foodName": "Rice and Curry",
    "remainingQuantity": 12,
    "restaurant_id": {
      "name": "Green Kitchen",
      "address": "45 Galle Road, Colombo",
      "location": {
        "type": "Point",
        "coordinates": [79.8612, 6.9271]
      }
    },
    "requests": []
  }
]
```

### GET /api/foodsdonate/restaurant/:restaurant_id

Auth: required

Roles: restaurant or admin

Response: same donation list format, filtered by restaurant id.

### GET /api/foodsdonate/:id

Auth: required

Roles: restaurant or foodbank

Response: single donation object populated with restaurant info.

### PUT /api/foodsdonate/:id

Auth: required

Roles: restaurant only

Request: `multipart/form-data` or JSON

Fields: any donation fields to update. If `image` is uploaded, it replaces `imageUrl`.

Response: updated donation object.

### DELETE /api/foodsdonate/:id

Auth: required

Roles: restaurant only

Response:

```json
{ "message": "Donation deleted successfully" }
```

## Donation Requests for Restaurant Listings

Base path: `/api/request`

### GET /api/request/restaurant/:restaurant_id

Auth: required

Roles: restaurant only

Response:

```json
{
  "requests": [
    {
      "_id": "66f1f2b7f2f2f2f2f2f2f2f2",
      "status": "pending"
    }
  ]
}
```

### GET /api/request/donation/:donationId

Auth: required

Roles: restaurant or admin

Response:

```json
{
  "requests": []
}
```

### GET /api/request/:foodBank_id

Auth: required

Roles: foodbank only

Response:

```json
{
  "requests": []
}
```

### POST /api/request/:food_id

Auth: required

Roles: foodbank only

Request body:

```json
{
  "restaurant_id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "foodBank_id": "66f1f2b7f2f2f2f2f2f2f2f3",
  "requestedQuantity": 5
}
```

Response: `201 Created`

```json
{
  "message": "Request created successfully",
  "request": {
    "food_id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "restaurant_id": "66f1f2b7f2f2f2f2f2f2f2f2",
    "foodBank_id": "66f1f2b7f2f2f2f2f2f2f2f3",
    "requestedQuantity": 5,
    "status": "pending"
  }
}
```

### PUT /api/request/approve/:request_id

Auth: required

Roles: restaurant only

Response:

```json
{
  "message": "Request approved",
  "request": {
    "status": "approved"
  }
}
```

### PUT /api/request/reject/:request_id

Auth: required

Roles: restaurant only

Response:

```json
{
  "message": "Request rejected",
  "request": {
    "status": "rejected"
  }
}
```

## Foodbank Requests to Restaurants

Base path: `/api/foodbank-request`

### POST /api/foodbank-request/

Auth: required

Roles: foodbank only

Request body:

```json
{
  "foodbank_id": "66f1f2b7f2f2f2f2f2f2f2f3",
  "foodName": "Canned Beans",
  "foodType": "veg",
  "requestedQuantity": 15
}
```

Response: `201 Created`

```json
{
  "message": "Request created successfully",
  "request": {
    "foodbank_id": "66f1f2b7f2f2f2f2f2f2f2f3",
    "foodName": "Canned Beans",
    "foodType": "veg",
    "requestedQuantity": 15,
    "remainingQuantity": 15,
    "status": "open"
  },
  "notificationSummary": {
    "restaurantCount": 3,
    "smsSentCount": 3,
    "smsFailedCount": 0,
    "skipped": false
  }
}
```

### GET /api/foodbank-request/

Auth: required

Roles: restaurant or foodbank

Response:

```json
{
  "message": "Requests retrieved successfully",
  "requests": []
}
```

### GET /api/foodbank-request/foodbank/:foodbankId

Auth: required

Roles: foodbank or admin

Response:

```json
{
  "message": "Requests retrieved successfully",
  "requests": []
}
```

### PUT /api/foodbank-request/:id

Auth: required

Roles: foodbank only

Request body may contain:

```json
{
  "foodName": "Updated Name",
  "foodType": "non-veg",
  "requestedQuantity": 20,
  "status": "open"
}
```

Response:

```json
{
  "message": "Request updated successfully",
  "request": {}
}
```

### DELETE /api/foodbank-request/:id

Auth: required

Roles: foodbank only

Response:

```json
{
  "message": "Request deleted",
  "request": {}
}
```

## Accept Foodbank Requests

Base path: `/api/accepts/foodbank-request`

### POST /api/accepts/foodbank-request/:donateId

Auth: required

Roles: restaurant only

Request body:

```json
{
  "quantity": 5
}
```

Optional body field:

```json
{
  "restaurantId": "66f1f2b7f2f2f2f2f2f2f2f2",
  "quantity": 5
}
```

Response:

```json
{
  "message": "Accepted successfully",
  "remainingQuantity": 10,
  "status": "pending"
}
```

On success, the API also creates a pickup OTP record.

## Pickup OTP

Base path: `/api/pickup`

### POST /api/pickup/generate

Auth: required

Roles: restaurant only

Request body:

```json
{
  "request_id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "restaurant_id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "foodbank_id": "66f1f2b7f2f2f2f2f2f2f2f3"
}
```

Response: `201 Created`

```json
{
  "message": "OTP generated successfully",
  "pickupId": "66f1f2b7f2f2f2f2f2f2f2f4",
  "otp": "123456"
}
```

### POST /api/pickup/verify

Auth: required

Roles: restaurant only

Request body:

```json
{
  "pickupId": "66f1f2b7f2f2f2f2f2f2f2f4",
  "otp": "123456"
}
```

Success response:

```json
{ "message": "Pickup verified successfully" }
```

Failure may include attempts left:

```json
{ "message": "Invalid OTP", "attemptsLeft": 2 }
```

### POST /api/pickup/resend

Auth: required

Roles: restaurant only

Request body:

```json
{ "pickupId": "66f1f2b7f2f2f2f2f2f2f2f4" }
```

Response:

```json
{ "message": "New OTP generated", "otp": "654321" }
```

### GET /api/pickup/:id

Auth: required

Roles: admin, restaurant, foodbank

Response: pickup document.

Example:

```json
{
  "_id": "66f1f2b7f2f2f2f2f2f2f2f4",
  "request_id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "restaurant_id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "foodbank_id": "66f1f2b7f2f2f2f2f2f2f2f3",
  "verified": false,
  "status": "generated"
}
```

## Complaints

Base path: `/api/complaints`

### POST /api/complaints/

Auth: required

Roles: restaurant or foodbank

Request body:

```json
{
  "complaineeId": "66f1f2b7f2f2f2f2f2f2f2f2",
  "subject": "Late pickup",
  "description": "The pickup was delayed for over 30 minutes."
}
```

Response: `201 Created`

```json
{
  "message": "Complaint submitted successfully",
  "complaint": {
    "complainer": "66f1f2b7f2f2f2f2f2f2f2f3",
    "complainee": "66f1f2b7f2f2f2f2f2f2f2f2",
    "subject": "Late pickup",
    "description": "The pickup was delayed for over 30 minutes.",
    "status": "pending"
  }
}
```

### GET /api/complaints/my

Auth: required

Roles: restaurant or foodbank

Response: array of the current user's complaints.

### GET /api/complaints/targets

Auth: required

Roles: restaurant or foodbank

Purpose: returns the list of users the current role can complain about.

Response:

```json
[
  {
    "name": "Target User",
    "email": "target@example.com",
    "role": "foodbank",
    "address": "45 Galle Road, Colombo"
  }
]
```

### GET /api/complaints/

Auth: required

Roles: admin only

Response: array of all complaints with both sides populated.

### PATCH /api/complaints/:id/reply

Auth: required

Roles: admin only

Request body:

```json
{ "adminReply": "We have reviewed the case and contacted both parties." }
```

Response:

```json
{
  "message": "Complaint replied and resolved",
  "complaint": {
    "status": "resolved"
  }
}
```

## Dashboard

Base path: `/api/dashboard`

### GET /api/dashboard/landing

Auth: none

Response:

```json
{
  "success": true,
  "data": {
    "stats": {
      "liveListings": 12,
      "activeDonors": 8,
      "openRequests": 5
    },
    "activity": [],
    "generatedAt": "2026-04-12T08:30:00.000Z"
  }
}
```

### GET /api/dashboard/restaurant

Auth: required

Roles: restaurant only

Response:

```json
{
  "success": true,
  "data": {
    "profile": {},
    "stats": {},
    "recentActivity": {},
    "alerts": [],
    "charts": {},
    "notifications": []
  }
}
```

## Settings

Base path: `/api/settings`

### GET /api/settings/distance

Auth: required

Roles: any authenticated user

Response:

```json
{
  "key": "max_distance",
  "value": 20
}
```

### PUT /api/settings/distance

Auth: required

Roles: admin only

Request body:

```json
{ "value": 25 }
```

Response:

```json
{
  "key": "max_distance",
  "value": 25
}
```

Validation: the value must be numeric and between 5 and 100.

## Nearby / Distance Test

Base path: `/api/nearby`

### POST /api/nearby/nearby

Auth: none

Request body:

```json
{
  "latitude": 6.9271,
  "longitude": 79.8612,
  "role": "restaurant"
}
```

Response: array of nearby users matching the role and distance filter.

### POST /api/nearby/route-details

Auth: none

Request body:

```json
{
  "originLat": 6.9271,
  "originLng": 79.8612,
  "destLat": 6.9340,
  "destLng": 79.8420
}
```

Response:

```json
{
  "success": true,
  "distanceKm": "3.14",
  "durationMins": 12
}
```

## Notification Test

Base path: `/api/notifications`

### POST /api/notifications/test

Auth: none

Request body:

```json
{
  "user_id": "66f1f2b7f2f2f2f2f2f2f2f2",
  "message": "Test notification"
}
```

Response:

```json
{
  "success": true,
  "message": "Notification sent successfully"
}
```

## Common Error Patterns

The API returns status codes and JSON error messages from route handlers and the global error middleware. Common examples include:

```json
{ "message": "Unauthorized" }
```

```json
{ "message": "Forbidden: insufficient permissions" }
```

```json
{ "message": "Too many requests, try again later." }
```

For validation failures, the response shape depends on the validator and error middleware, but the message usually points to the exact missing or invalid field.

## Notes

The current backend exposes a notification test endpoint only. There is no public `GET /api/notifications` route in the router set at the moment.
