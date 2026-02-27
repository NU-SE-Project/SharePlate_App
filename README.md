�️ Setup Instructions

Follow these steps to get the SharePlate project running on your local machine.

Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download](https://nodejs.org/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **npm** or **yarn** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/downloads)

Step 1: Clone the Repository

```bash
git clone <repository-url>
cd SharePlate_App
```

Step 2: Backend Setup

Navigate to Backend Directory

```bash
cd backend
```

Install Dependencies

```bash
npm install
```

Configure Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/shareplate

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_REFRESH_SECRET=your_refresh_token_secret_key_here
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Email Configuration (for OTP and notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_email_app_password

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:3000
```

> **Note:** Replace the placeholder values with your actual credentials. For Gmail, use an [App Password](https://support.google.com/accounts/answer/185833).

Step 3: Database Setup

Start MongoDB

Make sure MongoDB is running on your system:

```bash
# Windows (if installed as service)
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

Or run MongoDB manually:

```bash
mongod --dbpath /path/to/your/data/directory
```

Verify Connection

The application will automatically create the database and collections when you first run it.

Step 4: Start the Server

Development Mode

```bash
npm run dev
```

Production Mode

```bash
npm start
```

Or using Node directly:

```bash
node server.js
```

Step 5: Verify Installation

Once the server starts successfully, you should see:

```
✅ Server running on port 5000
✅ MongoDB connected successfully
```

Test the API by visiting:

```
http://localhost:5000/api/health
```

Or use the base URL:

```
http://localhost:5000
```

Step 6: Testing WebSocket (Optional)

To test real-time notifications:

```bash
node src/socketTestClient.js
```

Common Issues & Troubleshooting

**MongoDB Connection Failed**

- Ensure MongoDB is running: `mongod --version`
- Check if the MongoDB URI in `.env` is correct
- Verify the database port (default: 27017)

**Port Already in Use**

- Change the `PORT` value in `.env`
- Or kill the process using the port:

  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F

  # macOS/Linux
  lsof -ti:5000 | xargs kill
  ```

**Email Service Errors**

- Verify email credentials in `.env`
- For Gmail, enable "Less secure app access" or use App Passwords
- Check EMAIL_HOST and EMAIL_PORT settings

**JWT Token Errors**

- Ensure JWT_SECRET and JWT_REFRESH_SECRET are set
- Clear browser cookies and try logging in again

Default Admin Account

After first setup, you may need to manually create an admin user in MongoDB or use the registration endpoint with role modification.

API Endpoints

Once running, you can access:

- **Auth:** `POST /api/auth/register`, `POST /api/auth/login`
- **Donations:** `GET /api/donations`, `POST /api/donations`
- **Requests:** `GET /api/requests`, `POST /api/requests`
- **Users:** `GET /api/users` (admin only)
- **Notifications:** `GET /api/notifications`

For complete API documentation, refer to the respective route files in `src/modules/`.

�📚 Academic Context
Developed for:
SE3040 – Application Frameworks
BSc (Hons) in Information Technology – Software Engineering