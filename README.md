🍽️ SharePlate

A full-stack web platform that reduces food waste by connecting restaurants with food banks and shelters.

📌 Overview

SharePlate is a web application designed to minimize food waste by creating a structured and secure system where:

🍽️ Restaurants can donate excess food

🏠 Food banks can request and collect food

🛡️ Admin can manage the system

Instead of throwing away surplus food, restaurants can list donations and shelters can request them in real time.

🚀 Tech Stack
Backend
    Node.js
    Express.js
Database
    MongoDB (Mongoose)
JWT Authentication (Access + Refresh Tokens)
Role-Based Access Control (RBAC)
Zod Validation

🔐 Authentication & Security

Short-lived Access Tokens

HTTP-only cookie-based Refresh Tokens

Refresh token stored in a separate collection (multi-device support)

Token rotation implemented

Passwords hashed using bcrypt

Protected routes using middleware

Role-based access control (401 / 403 handling)

👥 User Roles
Role Capabilities
Restaurant Create and manage food donations
Food Bank View and request donations
Admin Manage users and monitor system

🧩 Core Features
✅ User Management
Register
Login
Logout (single device)
Logout all sessions
Profile management
Protected routes

✅ Food Donation Management
Create / Edit / Delete donation listings
Quantity & expiry tracking
Location-based filtering

✅ Request & Approval System
Partial quantity requests
Approve / Reject logic
Automatic quantity deduction
Status lifecycle management

✅ Pickup & Tracking
Pickup scheduling
Mark donation as completed
Donation history

📚 Academic Context
Developed for:
SE3040 – Application Frameworks
BSc (Hons) in Information Technology – Software Engineering
