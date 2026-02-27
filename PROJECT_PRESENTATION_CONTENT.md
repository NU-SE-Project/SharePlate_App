# SharePlate Project Presentation Content

## 1. Project Planning

### 1.1 Problem Statement

Food waste from restaurants and food insecurity in communities happen at the same time. SharePlate addresses this mismatch by providing a controlled platform where restaurants donate excess food and food banks request, receive, and verify pickups securely.

### 1.2 Project Goals

- Reduce edible food waste through structured donation workflows.
- Enable food banks to access nearby available food quickly.
- Provide transparent tracking from donation creation to pickup completion.
- Enforce security, accountability, and role-based access.

### 1.3 Scope

In scope:

- Multi-role user management (`restaurant`, `foodbank`, `admin`).
- Donation lifecycle management.
- Two request flows:
- Flow A: Food bank requests existing restaurant donations.
- Flow B: Food bank posts need; restaurants accept.
- OTP-based pickup verification.
- Authentication with JWT access + refresh tokens.
- Email verification and password reset.
- Notification support (DB + Socket.IO + test endpoint).

Out of scope in current repository snapshot:

- Frontend codebase (not present in this repo).
- Payment/monetization.
- Advanced analytics dashboard UI.

### 1.4 Stakeholders

- Restaurants: publish and manage surplus food.
- Food Banks: discover/request food and confirm collection.
- Admin: user oversight, account status control, governance.
- Beneficiaries/Community: indirect impact via redistributed food.

### 1.5 Development Plan (Suggested Academic/Team Plan)

Phase 1: Requirements and design

- Define user stories, RBAC matrix, and key use cases.
- Produce ER/schema draft and API contract draft.

Phase 2: Core backend foundation

- Set up Express app, MongoDB connection, shared middleware, validation.
- Implement authentication and authorization.

Phase 3: Core business modules

- Donation CRUD.
- Request + approval/rejection logic.
- Quantity management and status transitions.

Phase 4: Security and reliability

- Refresh token rotation and session management.
- Email verification and password reset.
- OTP verification and cleanup job.

Phase 5: Real-time and proximity features

- Socket.IO notifications.
- Geospatial nearby-user query.

Phase 6: Testing, hardening, documentation

- End-to-end API testing.
- Fix data consistency issues and edge cases.
- Final architecture/API/schema documentation.

### 1.6 Risk Register (Key Risks + Mitigation)

- Race conditions in quantity updates.
- Mitigation: transactional updates where needed, consistent status checks.
- Security misconfiguration in CORS/cookies.
- Mitigation: strict production env config and secrets management.
- Inconsistent field naming across modules.
- Mitigation: shared schema conventions and integration tests.
- External service dependency (SMTP/SMS downtime).
- Mitigation: graceful fallback and retry strategy.

### 1.7 Success Metrics (KPIs)

- Donation-to-collection conversion rate.
- Average time from donation posting to collection.
- Quantity of food redistributed per week.
- Number of active verified restaurants/food banks.
- Failed authentication/OTP attempts trend.

---

## 2. System Architecture

### 2.1 High-Level Architecture (Current Implementation)

SharePlate follows a modular monolithic backend architecture:

- Presentation/API Layer: Express routes and controllers.
- Application Layer: service modules containing business logic.
- Data Layer: Mongoose models over MongoDB collections.
- Cross-cutting Layer: auth, RBAC, validation, error handling, logging, rate limiting.
- Background/Realtime Layer: node-cron cleanup job + Socket.IO notifications.
- External Integrations: SMTP (email), Notify.lk (SMS).

### 2.2 Runtime Request Flow

1. Client calls REST endpoint.
2. Middleware pipeline runs (`helmet`, CORS, parser, validation, auth/RBAC as needed).
3. Controller validates request context and delegates to service/model operations.
4. Mongoose persists or queries MongoDB.
5. Optional side effects execute (send email/SMS, create notification, socket emit).
6. Standard JSON response or centralized error response is returned.

### 2.3 Component Definitions

- `server.js`: bootstraps DB connection, cron job, HTTP server, Socket.IO init.
- `src/app.js`: middleware stack + API route registration.
- `modules/auth`: registration/login/refresh/logout, password reset, email verification.
- `modules/user`: profile management and admin user management.
- `modules/donation/shop`: restaurant donation CRUD.
- `modules/donation/foodbank`: food bank request against donation + approve/reject flow.
- `modules/request/foodbank`: food banks create �needs� requests.
- `modules/request/shop`: restaurants accept food bank needs with quantity updates.
- `modules/pickup`: OTP generation, resend, verification for handover confirmation.
- `modules/notification`: test notification endpoint and notification persistence.
- `middlewares`: `authMiddleware`, `roleMiddleware`, validation, error handling.
- `services`: geospatial nearby-user search, SMS notification, socket notification support.
- `utils`: email utilities, cron cleanup, input validation schemas.

### 2.4 Architecture Characteristics

Strengths:

- Clear module boundaries.
- Good security baseline (Helmet, rate limit, JWT, hashed passwords, refresh token hashing).
- Role-based access support.
- Geospatial query support via 2dsphere index.

Improvement areas:

- Some routes are not yet protected by `requireAuth`/RBAC.
- Naming inconsistencies across models/controllers (`foodBank_id` vs `foodbank_id`, `user_id` vs `userId`).
- Notification service currently writes a field name that may not match schema.
- `server.js` creates HTTP server for Socket.IO but starts `app.listen` instead of `server.listen`.

---

## 3. Framework Selection Justification and Progress Completion

### 3.1 Why Node.js + Express (Application Frameworks Justification)

- Event-driven, non-blocking I/O is suitable for high-concurrency API workloads.
- Fast development cycle for academic and startup-style projects.
- Large middleware ecosystem for security and API development.
- Native JSON handling aligns with REST API and JavaScript clients.
- Easy integration with real-time transport (Socket.IO).

### 3.2 Why MongoDB + Mongoose

- Document model fits evolving domain fields (donation metadata, verification fields, OTP fields).
- Rapid schema evolution during iterative project phases.
- First-class geospatial querying for nearby user discovery.
- Mongoose adds schema validation, hooks, indexes, and population.

### 3.3 Progress Completion (Backend Snapshot)

Estimated completion based on current repository state:

- Authentication and session management: 90%
- Implemented: register/login/refresh/logout/logout-all, hashed refresh tokens, lockout logic.
- Pending: final hardening in production configs and broader endpoint-level auth coverage.

- User management and RBAC: 85%
- Implemented: profile update, admin list/update/deactivate.
- Pending: stricter consistency checks and additional admin governance workflows.

- Donation management: 85%
- Implemented: CRUD with quantity/time validations.
- Pending: stronger ownership/authorization checks per donation update/delete.

- Request and approval workflows: 80%
- Implemented: request creation, approve/reject, quantity restoration rules.
- Pending: full transactional consistency across all related state transitions.

- Pickup verification: 85%
- Implemented: OTP generate/verify/resend + brute-force lock + cleanup job.
- Pending: production-safe OTP delivery channel and tighter route authorization.

- Notifications and realtime: 70%
- Implemented: socket infrastructure + persistence + test route.
- Pending: schema alignment and event integration in all workflow transitions.

- Geospatial matching: 75%
- Implemented: nearby lookup service with role and verification filters.
- Pending: integration into production user journey and endpoint security.

Overall backend completion estimate: 82% (feature-complete core, with hardening/integration tasks remaining).

---

## 4. Comprehensive System Architecture with Clear Component Definitions

### 4.1 Layered Component Map

- Client Layer:
- Web/mobile clients (consume REST APIs, receive JWT access tokens, use refresh cookie).

- API & Security Layer:
- Express routing.
- CORS + cookie parsing + Helmet + request logging + rate limiting.
- JWT auth middleware and role middleware.
- Zod validation middleware.

- Domain Modules:
- Auth domain: identity, credential lifecycle, session rotation.
- User domain: profile/admin identity governance.
- Donation domain: supply-side food listing lifecycle.
- Food request domains: demand-side requests and acceptance coordination.
- Pickup domain: physical handover verification via OTP.
- Notification domain: user communication and event messaging.

- Data Persistence Layer:
- MongoDB collections via Mongoose models.
- Indexing strategy (email unique, 2dsphere location, TTL refresh tokens, etc.).

- Background & Integration Layer:
- Cron-based OTP cleanup.
- SMTP email service.
- Notify.lk SMS service.
- Socket.IO event bus for real-time notifications.

### 4.2 Core Use-Case Sequence (Donation Request to Pickup)

1. Restaurant creates donation with quantity/time constraints.
2. Food bank submits request for a quantity.
3. System reserves quantity immediately.
4. Restaurant approves or rejects.
5. If rejected, reserved quantity is restored.
6. For accepted cases, pickup OTP is generated.
7. At handover, OTP is verified.
8. Status updates and notification events complete the workflow.

---

## 5. Database Schema Design

### 5.1 Database Choice

- Database: MongoDB
- ODM: Mongoose
- Design style: normalized references between collections with selective denormalization in API responses.

### 5.2 Collections and Key Fields

`users`

- Core identity: `name`, `email` (unique), `password` (hashed).
- Profile: `address`, `contactNumber`, `role`.
- Geo: `location` (GeoJSON Point, `2dsphere` indexed).
- Trust/security: `verificationStatus`, `emailVerified`, lockout fields.
- Governance: `isActive`, audit fields.

`refreshtokens`

- `user` ref.
- `tokenHash` (sha256 hash, unique).
- `expiresAt` with TTL index (automatic cleanup).
- `createdByIp`, `userAgent`, `revokedAt` metadata.

`donations`

- `restaurant_id` ref to `users`.
- Food metadata: `foodName`, `description`, `foodType`, `imageUrl`.
- Quantities: `totalQuantity`, `remainingQuantity`.
- Time constraints: `expiryTime`, `pickupWindowStart`, `pickupWindowEnd`.
- Lifecycle: `status` (`available`, `closed`, `expired`).

`requests` (foodbank requests against donation)

- `food_id` ref to `donations`.
- `restaurant_id`, `foodBank_id` refs to `users`.
- `requestedQuantity`, `status`, `requestedAt`.
- Timeline: `approvedAt`, `rejectedAt`, `collectedAt`.

`foodrequests` (food bank need postings)

- `foodbank_id` ref to `users`.
- `foodName`, `foodType`, `requestedQuantity`, `remainingQuantity`.
- `status` (`open`, `fulfilled`, `closed`).

`acceptances`

- `request_id` ref to `foodrequests`.
- `restaurant_id` ref to `users`.
- `acceptedQuantity`.
- Unique compound index: (`request_id`, `restaurant_id`).

`pickups`

- `request_id`, `restaurant_id`, `foodbank_id` refs.
- OTP state: `otpHash`, `otpExpiresAt`, `otpAttempts`, `otpLockedUntil`.
- Verification state: `verified`, `verifiedAt`, `status`.

`notifications`

- `user_id` ref.
- `type`, `message`, `isRead`.

### 5.3 Relationships

- One user (restaurant) to many donations.
- One donation to many requests.
- One user (food bank) to many requests.
- One food request to many acceptances (from multiple restaurants).
- One request can produce one pickup verification record.
- One user to many refresh token sessions and notifications.

### 5.4 Indexing Strategy

- `users.email`: unique index.
- `users.location`: `2dsphere` index.
- `refreshtokens.expiresAt`: TTL index.
- `acceptances(request_id, restaurant_id)`: unique compound index.
- `donations.expiryTime`, `donations.status`: query-performance indexes.

---

## 6. API Design

### 6.1 API Style

- Pattern: RESTful JSON API.
- Base path: `/api`.
- Auth model: short-lived access token in `Authorization: Bearer <token>` + refresh token in HTTP-only cookie.

### 6.2 Endpoint Groups (Current)

Authentication (`/api/auth`)

- `POST /register`
- `POST /login`
- `POST /refresh`
- `POST /logout`
- `POST /logout-all` (auth required)
- `POST /send-verification` (auth required)
- `GET /verify-email`
- `POST /resend-verification`
- `POST /forgot-password`
- `POST /reset-password`
- `GET /validate-reset-token`
- `POST /change-password` (auth required)

Users (`/api/user`)

- `GET /me` (auth)
- `PATCH /me` (auth)
- `GET /` (auth + admin)
- `PATCH /:id` (auth + admin)
- `DELETE /:id` (auth + admin, soft delete)

Donations (`/api/foodsdonate`)

- `POST /`
- `GET /`
- `GET /:id`
- `PUT /:id`
- `DELETE /:id`

Donation requests (`/api/request`)

- `POST /add/:food_id`
- `PUT /approve/:request_id`
- `PUT /reject/:request_id`

Food bank needs (`/api/foodbank-request`)

- `POST /`

Restaurant acceptance of needs (`/api/accepts/foodbank-request`)

- `POST /:donateId`

Pickup verification (`/api/pickup`)

- `POST /generate`
- `POST /verify`
- `POST /resend`
- `GET /:id`

Notifications (`/api/notifications`)

- `POST /test`

Nearby search (`/api/nearby`)

- `POST /nearby`

### 6.3 Request/Response and Error Conventions

- JSON body for command operations.
- Standard status codes (`200`, `201`, `400`, `401`, `403`, `404`, `500`).
- Validation handled centrally using Zod on selected routes.
- Error middleware supports centralized error formatting.

### 6.4 API Security Design

- Access tokens with short expiration.
- Refresh token rotation and hashed storage.
- Session invalidation for logout and logout-all.
- Role middleware for authorization.
- Rate limiting on auth endpoints.
- Helmet for secure headers.

### 6.5 Recommended API Hardening (Next Sprint)

- Apply `requireAuth` + RBAC to donation/request/pickup/nearby routes.
- Standardize naming and response contracts across modules.
- Add idempotency and transaction controls to critical state transitions.
- Introduce OpenAPI/Swagger spec generation.

---

## 7. Technology Stack Justification

### 7.1 Core Stack

- Node.js: scalable runtime for I/O-heavy API workloads.
- Express.js: minimal and flexible server framework for modular routing.
- MongoDB + Mongoose: schema-flexible persistence with strong ODM features.

### 7.2 Security and Reliability Libraries

- `jsonwebtoken`: industry-standard JWT handling.
- `bcryptjs`: secure password hashing.
- `helmet`: baseline HTTP hardening.
- `express-rate-limit`: abuse mitigation.
- `cookie-parser`: secure cookie handling.
- `zod`: strict, maintainable runtime validation.

### 7.3 Communication and Background Processing

- `socket.io`: real-time push notifications.
- `nodemailer`: email verification/reset flows.
- `node-cron`: scheduled OTP cleanup maintenance.
- Notify.lk integration (via `fetch`): SMS notification channel.

### 7.4 Engineering Justification Summary

This stack was selected because it balances:

- Rapid development for academic timelines.
- Production-relevant security architecture.
- Extensibility for future mobile/web clients.
- Operational simplicity with one backend codebase and modular domains.

---

## 8. Suggested Slide Deck Structure

1. Title + Team + Module.
2. Problem and motivation.
3. Objectives and scope.
4. Project planning timeline.
5. High-level architecture.
6. Detailed component architecture.
7. Database schema and relationships.
8. API design and security model.
9. Framework/technology justification.
10. Implementation progress and demo scope.
11. Risks, limitations, and next steps.
12. Impact and conclusion.

---

## 9. Final Delivery Note

This content is based on the current backend repository snapshot in `SharePlate_App/backend`. If your team has additional frontend/mobile modules outside this repository, add them to the architecture and progress sections before final submission.
