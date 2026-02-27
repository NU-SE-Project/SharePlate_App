# SharePlate Slide-by-Slide PPT Script (With Speaker Notes)

## Slide 1: Title

**On slide**

- SharePlate: Reducing Food Waste Through Smart Redistribution
- SE3040 - Application Frameworks
- Team Name / Members
- Date

**Speaker notes**
Good [morning/afternoon]. Today we present SharePlate, a platform designed to connect restaurants with food banks and reduce edible food waste. This project was developed as part of SE3040 Application Frameworks. We will walk through our planning, architecture, database, APIs, implementation progress, and technical decisions.

---

## Slide 2: Problem and Motivation

**On slide**

- Restaurants discard surplus food daily.
- Food banks and shelters face supply shortages.
- Existing donation processes are manual and inefficient.
- Need for a secure, trackable digital coordination system.

**Speaker notes**
The core problem is a coordination gap. Surplus food exists, but organizations that need it often cannot access it in time. Manual coordination causes delays, low visibility, and trust issues. SharePlate addresses this by introducing a structured digital workflow from donation listing to verified pickup.

---

## Slide 3: Project Objectives and Scope

**On slide**

- Main objectives:
- Reduce food waste
- Improve food access for food banks
- Ensure secure and traceable operations
- In scope:
- Multi-role system (restaurant, foodbank, admin)
- Donation, request, approval, pickup workflows
- OTP verification, notifications, geolocation support

**Speaker notes**
Our objectives are both social and technical: reduce waste, improve access, and maintain accountability. We implemented role-based workflows for three user roles and covered the full cycle from posting food to completing pickup with OTP verification. We also included notifications and nearby-user discovery.

---

## Slide 4: Project Planning and Development Phases

**On slide**

- Phase 1: Requirement analysis and architecture design
- Phase 2: Backend foundation and security setup
- Phase 3: Donation and request modules
- Phase 4: OTP, email, and session hardening
- Phase 5: Real-time notifications and geospatial features
- Phase 6: Testing, refinement, and documentation

**Speaker notes**
We executed the project in phased iterations. First we defined user stories and architecture. Then we built authentication and middleware foundations. Next, we implemented core business workflows, followed by security hardening and realtime/location features. Finally, we focused on stabilization and documentation for demonstration readiness.

---

## Slide 5: High-Level System Architecture

**On slide**

- Architecture style: Modular Monolithic Backend
- Layers:
- API Layer (Express controllers/routes)
- Business Layer (services/modules)
- Data Layer (MongoDB via Mongoose)
- Cross-cutting: Auth, RBAC, Validation, Error handling
- Background/Realtime: Cron jobs + Socket.IO

**Speaker notes**
SharePlate uses a modular monolith. This gives us clean separation by domain while keeping deployment simple for an academic project. Requests pass through middleware, then controllers and services, and finally Mongoose models. Background OTP cleanup and real-time notifications are handled through dedicated runtime components.

---

## Slide 6: Component-Level Architecture

**On slide**

- Core modules:
- Auth module: register, login, refresh, logout, password reset, email verification
- User module: profile + admin controls
- Donation module: create/manage food listings
- Request modules: donation requests and food-need requests
- Pickup module: OTP generation/verification
- Notification + Nearby services

**Speaker notes**
At component level, each module owns a clear responsibility. Authentication handles identity and sessions. Donation and request modules manage supply-demand interactions. Pickup uses OTP for real-world handover verification. We also added notification and geospatial services to improve responsiveness and matching.

---

## Slide 7: Database Schema Design

**On slide**

- Database: MongoDB, ODM: Mongoose
- Main collections:
- `users`, `refreshtokens`, `donations`, `requests`
- `foodrequests`, `acceptances`, `pickups`, `notifications`
- Key design choices:
- Reference-based relationships
- GeoJSON location for proximity search
- TTL and compound indexes for performance/integrity

**Speaker notes**
Our schema is normalized with references between domain entities. Users and donations form the core relationship, then requests, acceptances, and pickups track workflow state. We use GeoJSON points in user profiles for nearby search and important indexes for unique constraints, query speed, and automatic refresh-token expiration cleanup.

---

## Slide 8: API Design Overview

**On slide**

- API style: RESTful JSON (`/api/*`)
- Security model:
- Access token (Bearer JWT)
- Refresh token (HTTP-only cookie)
- Endpoint groups:
- Auth, User, Donation, Request, Pickup, Notifications, Nearby
- Validation via Zod and centralized error middleware

**Speaker notes**
Our API follows REST conventions and returns JSON responses with standard HTTP codes. Security uses short-lived access tokens and rotating refresh tokens in secure cookies. Endpoints are grouped by business domain, and request validation plus centralized error handling keeps responses consistent and safer.

---

## Slide 9: Framework and Technology Stack Justification

**On slide**

- Node.js + Express:
- Fast development, modular routing, middleware ecosystem
- MongoDB + Mongoose:
- Flexible document schema, fast iteration, geospatial support
- Security and utility stack:
- `helmet`, `bcryptjs`, `jsonwebtoken`, `express-rate-limit`, `zod`
- Realtime/Background:
- `socket.io`, `node-cron`, `nodemailer`, SMS integration

**Speaker notes**
We chose technologies that balance rapid implementation with production-relevant practices. Node and Express are ideal for API-heavy systems. MongoDB supports evolving requirements and geospatial features. Security libraries handle authentication and hardening, while Socket.IO and cron jobs enable real-time and maintenance operations.

---

## Slide 10: Progress Completion Status

**On slide**

- Estimated backend completion: ~82%
- Implemented strongly:
- Auth/session management
- User/RBAC controls
- Donation and request workflows
- OTP verification and cleanup job
- Remaining hardening:
- Full auth coverage on all routes
- Naming/schema consistency improvements
- Additional integration and end-to-end testing

**Speaker notes**
Most core backend capabilities are implemented and functional. The project is feature-complete for demo and evaluation purposes. Remaining work is primarily hardening and consistency: securing all endpoints uniformly, standardizing field naming across modules, and increasing end-to-end test coverage.

---

## Slide 11: Risks, Limitations, and Mitigation

**On slide**

- Risks:
- Race conditions in quantity updates
- External service dependency failures (SMTP/SMS)
- Security misconfiguration in production environments
- Mitigations:
- Transaction-based updates where critical
- Graceful fallback and retries for integrations
- Strict environment configuration and secret handling

**Speaker notes**
We identified critical risks around consistency, integrations, and deployment security. Our mitigation strategy includes transactional logic for quantity-sensitive updates, fallback behavior for external services, and stricter production environment controls for tokens, cookies, and CORS.

---

## Slide 12: Conclusion and Impact

**On slide**

- SharePlate provides:
- Practical food redistribution workflow
- Secure multi-role coordination
- Trackable lifecycle from donation to pickup
- Future extensions:
- Frontend/mobile integration
- Analytics dashboard and reporting
- Automated recommendations and route optimization

**Speaker notes**
In conclusion, SharePlate demonstrates a practical and scalable backend platform for reducing food waste through structured coordination. It already supports secure end-to-end workflows and can be expanded with richer client apps, analytics, and intelligent matching in future phases.

---

## Optional Slide 13: Live Demo Plan

**On slide**

- Demo sequence:
- Register/login as restaurant and food bank
- Create donation
- Create and approve request
- Generate and verify pickup OTP
- Trigger test notification

**Speaker notes**
For the demo, we will show the full operational path. First we authenticate users by role, then create a donation and submit a food bank request. Next, we approve the request and complete the process with OTP verification. Finally, we show notification behavior.
