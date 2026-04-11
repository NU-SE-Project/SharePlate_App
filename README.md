# SharePlate

## Project Overview

SharePlate is a full-stack web application designed to reduce food waste by connecting restaurants with food banks through a structured donation management system. Its main purpose is to make surplus food redistribution faster, more organized, and easier to track.

The system addresses a common real-world problem: many restaurants have usable excess food, while food banks struggle to meet community demand. Without a coordinated platform, donations can be delayed, unmanaged, or lost. SharePlate helps bridge this gap by providing a central space where food donations, requests, pickups, and user management can be handled efficiently.

The main users are restaurants that donate food, food banks that request and receive it, and administrators who oversee the platform.

The frontend is built with React, Vite, Tailwind CSS, and Axios, while the backend uses Node.js, Express, Socket.IO, and MongoDB with Mongoose. The project is prepared for deployment with Vercel on the frontend and a separate hosted backend service. At a high level, users interact through the React interface, requests are processed by the Express API, data is stored in MongoDB, and real-time updates support operational workflows.

## Key Features

- User registration, login, and secure authentication
- Restaurant-side food donation posting and management
- Food bank donation requests and request tracking
- Pickup coordination with OTP-based verification
- Profile management for platform users
- Notifications and real-time updates for operational actions
- Admin dashboard for user and platform oversight

## Tech Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Node.js, Express, Socket.IO
- Database: MongoDB with Mongoose
- External services: Cloudinary for image storage, Google OAuth for sign-in, SMTP for email delivery, Notify.lk for SMS, and OpenStreetMap/OSRM for maps and routing
- Deployment: Vercel for the frontend and a separate cloud host for the backend API

## Project Structure

```text
SharePlate_App/
|-- backend/
|-- frontend/
`-- README.md
```

## Setup Instructions

### Prerequisites

Before running the project locally, make sure the following are installed:

- Node.js 20+ and npm
- MongoDB locally, or a MongoDB Atlas connection string
- A Cloudinary account for image uploads
- Optional: SMTP credentials for email verification and password reset
- Optional: Google OAuth client ID for Google sign-in

### Backend Setup

1. Open a terminal and move into the backend folder:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

   On Windows PowerShell, you can use:

   ```powershell
   Copy-Item .env.example .env
   ```

4. Update `backend/.env` with your local configuration.

5. Start the backend server:

   ```bash
   npm run dev
   ```

   Production-style start:

   ```bash
   npm start
   ```

6. Confirm the backend is running at:

   ```text
   http://localhost:5000
   ```

### Backend Environment Variables

The backend currently references the following variables:

| Variable                           | Required    | Description                                                             |
| ---------------------------------- | ----------- | ----------------------------------------------------------------------- |
| `PORT`                             | Yes         | Port used by the Express server.                                        |
| `NODE_ENV`                         | Yes         | Runtime environment such as `development` or `production`.              |
| `MONGO_URI`                        | Yes         | MongoDB connection string.                                              |
| `JWT_ACCESS_SECRET`                | Yes         | Secret used to sign access tokens.                                      |
| `JWT_ACCESS_EXPIRES_IN`            | Yes         | Access token lifetime.                                                  |
| `JWT_REFRESH_SECRET`               | Yes         | Secret used to sign refresh tokens.                                     |
| `JWT_REFRESH_EXPIRES_IN`           | Yes         | Refresh token lifetime.                                                 |
| `JWT_GOOGLE_ONBOARDING_SECRET`     | No          | Secret for temporary Google onboarding tokens.                          |
| `JWT_GOOGLE_ONBOARDING_EXPIRES_IN` | No          | Expiry for Google onboarding tokens.                                    |
| `BCRYPT_SALT_ROUNDS`               | Yes         | Number of bcrypt salt rounds used for password hashing.                 |
| `COOKIE_SECURE`                    | Yes         | Controls whether auth cookies require HTTPS.                            |
| `COOKIE_DOMAIN`                    | No          | Domain applied to auth cookies in production.                           |
| `GOOGLE_CLIENT_ID`                 | No          | Google OAuth client ID used for Google sign-in validation.              |
| `FRONTEND_URL`                     | Recommended | Public frontend URL used for links in emails and CORS-related behavior. |
| `CLIENT_URL`                       | No          | Alternative public client URL used when generating public links.        |
| `FRONTEND_ORIGIN`                  | No          | Allowed browser origin for Socket.IO.                                   |
| `SOCKET_ORIGIN`                    | No          | Explicit Socket.IO allowed origin override.                             |
| `SMTP_HOST`                        | No          | SMTP server hostname for email sending.                                 |
| `SMTP_PORT`                        | No          | SMTP server port.                                                       |
| `SMTP_USER`                        | No          | SMTP username or sender email account.                                  |
| `SMTP_PASSWORD`                    | No          | SMTP password or app password.                                          |
| `SMTP_FROM`                        | No          | Display sender address for outbound emails.                             |
| `DISTANCE_KM`                      | No          | Default donation/request matching radius in kilometers.                 |
| `MAP_URL`                          | No          | Routing service base URL used by the backend.                           |
| `CLOUDINARY_CLOUD_NAME`            | Recommended | Cloudinary cloud name for media uploads.                                |
| `CLOUDINARY_API_KEY`               | Recommended | Cloudinary API key.                                                     |
| `CLOUDINARY_API_SECRET`            | Recommended | Cloudinary API secret.                                                  |
| `ADMIN_SEED_NAME`                  | No          | Default admin name for the seed script.                                 |
| `ADMIN_SEED_EMAIL`                 | No          | Default admin email for the seed script.                                |
| `ADMIN_SEED_PASSWORD`              | No          | Default admin password for the seed script.                             |
| `ADMIN_SEED_ADDRESS`               | No          | Default admin address for the seed script.                              |
| `ADMIN_SEED_CONTACT_NUMBER`        | No          | Default admin contact number for the seed script.                       |
| `ADMIN_SEED_LONGITUDE`             | No          | Default admin longitude for the seed script.                            |
| `ADMIN_SEED_LATITUDE`              | No          | Default admin latitude for the seed script.                             |
| `NOTIFYLK_USER_ID`                 | No          | Notify.lk user identifier for SMS notifications.                        |
| `NOTIFYLK_API_KEY`                 | No          | Notify.lk API key.                                                      |
| `NOTIFYLK_SENDER_ID`               | No          | Notify.lk sender ID shown in SMS messages.                              |
| `NOTIFYLK_BASE_URL`                | No          | Notify.lk API endpoint.                                                 |

### Optional Backend Seeder

To create the default admin account from the configured seed variables:

```bash
npm run seed:admin
```

### Frontend Setup

1. Open a second terminal and move into the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `frontend/.env` file and add the required frontend variables.

4. Start the frontend development server:

   ```bash
   npm run dev
   ```

5. Open the local application in the browser:

   ```text
   http://localhost:5173
   ```

### Frontend Environment Variables

The frontend currently references the following variables:

| Variable                  | Required | Description                                                             |
| ------------------------- | -------- | ----------------------------------------------------------------------- |
| `VITE_API_URL`            | Yes      | Base backend URL used by Axios; can be provided with or without `/api`. |
| `VITE_GOOGLE_CLIENT_ID`   | No       | Google OAuth client ID used by the frontend sign-in button.             |
| `VITE_SOCKET_URL`         | No       | Socket.IO server URL; defaults to `http://localhost:5000`.              |
| `VITE_NOMINATIM_BASE_URL` | No       | Geocoding service base URL for address search.                          |
| `VITE_MAP_TILE_URL`       | No       | Map tile provider URL used by Leaflet map views.                        |
| `VITE_OSRM_BASE_URL`      | No       | Routing service base URL used for route calculation.                    |

### Recommended Local Startup Order

1. Start the backend first with `npm run dev` inside `backend/`.
2. Start the frontend with `npm run dev` inside `frontend/`.
3. Open `http://localhost:5173`.
4. If admin access is needed, run `npm run seed:admin` in the backend after configuring the seed variables.

## Deployment

### Live Application URLs

Use this section to record the final deployed endpoints for submission:

| Service           | URL                                                   |
| ----------------- | ----------------------------------------------------- |
| Backend live URL  | `https://shareplatebackend-production.up.railway.app` |
| Frontend live URL | `https://shareplate-eight.vercel.app`                 |

### Deployment Notes

- The frontend repository already contains `frontend/vercel.json`, which is configured for SPA route rewrites on Vercel.
- The frontend production build command is:

  ```bash
  npm run build
  ```

- The backend production start command is:

  ```bash
  npm start
  ```

- In production, update all URL-based variables so the frontend points to the deployed backend and the backend trusts the deployed frontend origin.

### Environment Variables for Deployment

Only variable names and purposes should be documented in submissions. Do not include secret values.

#### Backend deployment variables

- `PORT`: Backend listener port assigned by the host.
- `NODE_ENV`: Set to `production` in the deployed environment.
- `MONGO_URI`: Production MongoDB connection string.
- `JWT_ACCESS_SECRET`: Secret for access tokens.
- `JWT_ACCESS_EXPIRES_IN`: Access token expiry duration.
- `JWT_REFRESH_SECRET`: Secret for refresh tokens.
- `JWT_REFRESH_EXPIRES_IN`: Refresh token expiry duration.
- `BCRYPT_SALT_ROUNDS`: Password hashing cost factor.
- `COOKIE_SECURE`: Should be `true` when HTTPS is enabled.
- `COOKIE_DOMAIN`: Production cookie domain if needed.
- `FRONTEND_URL`: Public frontend URL for email links.
- `CLIENT_URL`: Alternate public frontend URL if used.
- `FRONTEND_ORIGIN`: Allowed frontend origin for Socket.IO/CORS.
- `SOCKET_ORIGIN`: Explicit socket origin override.
- `GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `SMTP_HOST`: SMTP server host.
- `SMTP_PORT`: SMTP server port.
- `SMTP_USER`: SMTP username.
- `SMTP_PASSWORD`: SMTP password or app password.
- `SMTP_FROM`: Sender label/email for outgoing emails.
- `DISTANCE_KM`: Default matching radius.
- `MAP_URL`: Routing API endpoint.
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name.
- `CLOUDINARY_API_KEY`: Cloudinary API key.
- `CLOUDINARY_API_SECRET`: Cloudinary API secret.
- `NOTIFYLK_USER_ID`: Notify.lk user ID.
- `NOTIFYLK_API_KEY`: Notify.lk API key.
- `NOTIFYLK_SENDER_ID`: Notify.lk sender ID.
- `NOTIFYLK_BASE_URL`: Notify.lk API endpoint.

#### Frontend deployment variables

- `VITE_API_URL`: Public backend base URL.
- `VITE_GOOGLE_CLIENT_ID`: Google OAuth client ID.
- `VITE_SOCKET_URL`: Socket.IO server URL.
- `VITE_NOMINATIM_BASE_URL`: Geocoding API endpoint.
- `VITE_MAP_TILE_URL`: Tile provider URL.
- `VITE_OSRM_BASE_URL`: Routing API endpoint.

### Screenshots of the Deployed Application

Inside docs/screenshots folder

````

## Testing Instructions

The project currently includes automated frontend service tests and separate scripts for API performance testing.

### Unit Testing

Unit tests are located in:

```text
frontend/src/testing/unitTesting/
````

To run them:

```bash
cd frontend
npm test
```

To run in watch mode during development:

```bash
npm run test:watch
```

Covered areas include:

- Authentication service logic
- Restaurant donation service logic
- Food bank service logic
- Pickup OTP service logic
- Admin user service logic

### Integration Testing

Integration-style tests are located in:

```text
frontend/src/testing/integrationTesting/
```

These tests validate frontend service modules against the shared Axios API layer using mocked HTTP interactions.

Run them with the same test command:

```bash
cd frontend
npm test
```

For manual end-to-end integration validation between the real frontend and backend:

1. Start the backend with `npm run dev` in `backend/`.
2. Start the frontend with `npm run dev` in `frontend/`.
3. Open the application in the browser and verify core flows such as sign-up, login, donation posting, donation requests, and admin management.
4. Use Postman to test API endpoints directly against `http://localhost:5000/api` or the deployed backend URL.
5. Confirm that frontend actions produce correct backend responses and persisted database changes.

Recommended Postman checks:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/foodsdonate`
- `POST /api/foodsdonate`
- `GET /api/foodbank-request`
- `POST /api/pickup/verify`

### Performance Testing

The repository includes two performance testing approaches:

#### Option 1: Node-based performance script

File:

```text
frontend/src/testing/performanceTest.js
```

Run command:

```bash
cd frontend
npm run test:performance
```

Useful runtime variables for this script:

- `API_BASE_URL`: Base URL of the backend under test
- `NUM_REQUESTS`: Total number of requests to issue
- `CONCURRENCY`: Number of concurrent requests per batch
- `LOADTEST_EMAIL`: Test user email for authenticated flows
- `LOADTEST_PASSWORD`: Test user password for authenticated flows

Example:

```bash
API_BASE_URL=http://localhost:5000 NUM_REQUESTS=100 CONCURRENCY=20 LOADTEST_EMAIL=test@example.com LOADTEST_PASSWORD=StrongPass123! npm run test:performance
```

PowerShell example:

```powershell
$env:API_BASE_URL="http://localhost:5000"
$env:NUM_REQUESTS="100"
$env:CONCURRENCY="20"
$env:LOADTEST_EMAIL="test@example.com"
$env:LOADTEST_PASSWORD="StrongPass123!"
npm run test:performance
```

#### Option 2: Artillery-based load testing

File:

```text
frontend/src/testing/api-performance.artillery.yml
```

Basic command usage:

```bash
cd frontend
npx artillery run src/testing/api-performance.artillery.yml
```

Example with environment variable injection:

```bash
API_BASE_URL=http://localhost:5000 npx artillery run src/testing/api-performance.artillery.yml
```

PowerShell example:

```powershell
$env:API_BASE_URL="http://localhost:5000"
npx artillery run src/testing/api-performance.artillery.yml
```

The included Artillery scenario performs:

- Warm-up traffic
- Steady-state traffic
- Spike traffic
- Mixed read and authentication requests
