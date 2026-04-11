// Api_Endpoints.jsx
import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Send,
  Key,
  User,
  Building2,
  UtensilsCrossed,
  ShoppingBag,
  Truck,
  FileText,
  LayoutDashboard,
  Settings,
  MapPin,
  Bell,
  Globe,
  Shield,
  Lock,
  Mail,
  Phone,
  Map,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Home,
  RefreshCw,
  LogOut,
  AlertTriangle,
  Star,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";

const ApiEndpoint = ({
  method,
  path,
  description,
  auth,
  roles,
  requestBody,
  response,
  notes,
  queryParams,
}) => {
  const [showRequest, setShowRequest] = useState(false);
  const [showResponse, setShowResponse] = useState(false);
  const [requestData, setRequestData] = useState({});
  const [responseData, setResponseData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const methodColors = {
    GET: "bg-blue-100 text-blue-700 border-blue-200",
    POST: "bg-green-100 text-green-700 border-green-200",
    PUT: "bg-yellow-100 text-yellow-700 border-yellow-200",
    PATCH: "bg-orange-100 text-orange-700 border-orange-200",
    DELETE: "bg-red-100 text-red-700 border-red-200",
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTryIt = async () => {
    setLoading(true);
    setError(null);
    try {
      let url = `http://localhost:5000${path}`;

      // Handle path parameters by replacing :id with a test value
      if (path.includes(":")) {
        url = url.replace(/:([^/]+)/g, "test-id-123");
      }

      const options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
      };

      if (method !== "GET" && Object.keys(requestData).length > 0) {
        options.body = JSON.stringify(requestData);
      }

      const res = await fetch(url, options);
      const data = await res.json();
      setResponseData({ status: res.status, data });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg mb-4 overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 border-b border-gray-100 bg-gray-50">
        <div className="flex flex-wrap items-center gap-3 mb-2">
          <span
            className={`px-3 py-1 rounded-lg text-sm font-bold border ${methodColors[method]}`}
          >
            {method}
          </span>
          <code className="text-sm font-mono text-gray-800 bg-gray-100 px-2 py-1 rounded break-all">
            {path}
          </code>
          <button
            onClick={() => copyToClipboard(`http://localhost:5000${path}`)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Copy URL"
          >
            <Copy className="h-4 w-4" />
          </button>
          {auth && (
            <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded">
              <Lock className="h-3 w-3" /> Auth Required
            </span>
          )}
          {roles &&
            roles.map((role) => (
              <span
                key={role}
                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded"
              >
                {role}
              </span>
            ))}
        </div>
        <p className="text-gray-600 text-sm">{description}</p>
        {notes && (
          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
            📝 {notes}
          </p>
        )}
        {queryParams && (
          <div className="mt-2 text-xs text-gray-500">
            <span className="font-medium">Query params:</span> {queryParams}
          </div>
        )}
      </div>

      <div className="p-4 space-y-3">
        {requestBody && (
          <div>
            <button
              onClick={() => setShowRequest(!showRequest)}
              className="text-sm font-medium text-gray-700 flex items-center gap-1 hover:text-emerald-600 transition-colors"
            >
              {showRequest ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Request Body
            </button>
            {showRequest && (
              <div className="mt-2">
                <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto max-h-60">
                  {JSON.stringify(requestBody, null, 2)}
                </pre>
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Try it out (edit JSON):
                  </label>
                  <textarea
                    className="w-full h-32 font-mono text-xs border border-gray-300 rounded-lg p-2 focus:ring-emerald-500 focus:border-emerald-500"
                    value={JSON.stringify(requestData, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        setRequestData(parsed);
                      } catch (err) {
                        // Invalid JSON - don't update
                      }
                    }}
                    placeholder="Edit JSON here..."
                  />
                  <button
                    onClick={handleTryIt}
                    disabled={loading}
                    className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Send className="h-3 w-3" />
                    {loading ? "Sending..." : "Try It"}
                  </button>
                  {error && (
                    <div className="mt-2 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" /> {error}
                    </div>
                  )}
                  {responseData && (
                    <div className="mt-2">
                      <div
                        className={`text-xs font-medium mb-1 flex items-center gap-1 ${responseData.status >= 200 && responseData.status < 300 ? "text-green-600" : "text-red-600"}`}
                      >
                        {responseData.status >= 200 &&
                        responseData.status < 300 ? (
                          <CheckCircle className="h-3 w-3" />
                        ) : (
                          <XCircle className="h-3 w-3" />
                        )}
                        Response: {responseData.status}
                      </div>
                      <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto max-h-60">
                        {JSON.stringify(responseData.data, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {response && (
          <div>
            <button
              onClick={() => setShowResponse(!showResponse)}
              className="text-sm font-medium text-gray-700 flex items-center gap-1 hover:text-emerald-600 transition-colors"
            >
              {showResponse ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              Response Example
            </button>
            {showResponse && (
              <pre className="mt-2 bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-x-auto max-h-60">
                {JSON.stringify(response, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Public Routes Section
const PublicRoutesSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Home className="h-5 w-5 text-gray-600" />
        Public Utility Routes
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Public endpoints for API status and redirects
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="GET"
        path="/api"
        description="Check if API is running"
        auth={false}
        response="API running"
      />
      <ApiEndpoint
        method="GET"
        path="/"
        description="Root API endpoint"
        auth={false}
        response={{ message: "SharePlate API running" }}
      />
      <ApiEndpoint
        method="GET"
        path="/verify-email"
        description="Browser redirect for email verification (preserves token)"
        auth={false}
        queryParams="token=abc123"
        notes="Redirects to frontend with token parameter"
      />
      <ApiEndpoint
        method="GET"
        path="/reset-password"
        description="Browser redirect for password reset (preserves token)"
        auth={false}
        queryParams="token=abc123"
        notes="Redirects to frontend with token parameter"
      />
    </div>
  </div>
);

// Auth Section - COMPLETE
const AuthSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-pink-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Key className="h-5 w-5 text-purple-600" />
        Authentication (15 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Complete auth flow: registration, login, Google OAuth, email
        verification, password management
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="POST"
        path="/api/auth/register"
        description="Register a new user account"
        requestBody={{
          name: "Green Kitchen",
          email: "contact@greenkitchen.com",
          password: "Strong@Pass1",
          address: "45 Galle Road, Colombo",
          contactNumber: "+94771234567",
          role: "restaurant",
          location: { type: "Point", coordinates: [79.8612, 6.9271] },
        }}
        response={{
          message: "Registered successfully",
          user: {
            id: "66f1f2b7...",
            name: "Green Kitchen",
            email: "contact@greenkitchen.com",
            role: "restaurant",
            emailVerified: false,
          },
        }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/login"
        description="Login to existing account"
        requestBody={{
          email: "contact@greenkitchen.com",
          password: "Strong@Pass1",
        }}
        response={{
          accessToken: "eyJhbGciOiJIUzI1NiIs...",
          user: {
            id: "66f1f2b7...",
            name: "Green Kitchen",
            role: "restaurant",
          },
        }}
        notes="Sets httpOnly refreshToken cookie"
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/google"
        description="Google OAuth login/signup"
        requestBody={{ credential: "google-id-token-from-client" }}
        response={{
          requiresOnboarding: true,
          onboardingToken: "eyJ...",
          profile: {
            email: "user@gmail.com",
            name: "User Name",
            emailVerified: true,
          },
        }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/google/complete"
        description="Complete Google onboarding for new account"
        requestBody={{
          onboardingToken: "eyJ...",
          name: "New User",
          password: "Strong@Pass1",
          address: "45 Galle Road, Colombo",
          contactNumber: "+94771234567",
          role: "foodbank",
          location: { type: "Point", coordinates: [79.8612, 6.9271] },
        }}
        response={{
          accessToken: "eyJ...",
          user: {
            id: "66f1f2b7...",
            name: "New User",
            email: "user@gmail.com",
            role: "foodbank",
          },
        }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/refresh"
        description="Refresh access token using httpOnly cookie"
        auth={true}
        response={{ accessToken: "new-access-token", user: {} }}
        notes="Rotates refresh token cookie"
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/logout"
        description="Logout from current session"
        auth={true}
        response={{ message: "Logged out" }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/logout-all"
        description="Revoke all active sessions for current user"
        auth={true}
        roles={["any"]}
        response={{ message: "Logged out from all devices" }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/send-verification"
        description="Send email verification link"
        auth={true}
        roles={["any"]}
        response={{ message: "Verification email sent successfully" }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/auth/verify-email"
        description="Verify email with token"
        queryParams="token=email-verification-token"
        response={{
          message: "Email verified successfully! You can now login.",
        }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/resend-verification"
        description="Resend verification email"
        requestBody={{ email: "contact@greenkitchen.com" }}
        response={{
          message: "If that email exists, a verification link has been sent",
        }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/forgot-password"
        description="Request password reset email"
        requestBody={{ email: "contact@greenkitchen.com" }}
        response={{
          message: "If that email exists, a reset link has been sent",
        }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/reset-password"
        description="Reset password with token"
        requestBody={{
          token: "password-reset-token",
          password: "NewStrong@Pass1",
        }}
        response={{
          message:
            "Password reset successful. Please login with your new password.",
        }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/auth/validate-reset-token"
        description="Validate password reset token"
        queryParams="token=password-reset-token"
        response={{ valid: true }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/auth/change-password"
        description="Change password (authenticated)"
        auth={true}
        requestBody={{
          currentPassword: "OldStrong@Pass1",
          newPassword: "NewStrong@Pass2",
        }}
        response={{ message: "Password changed successfully" }}
      />
    </div>
  </div>
);

// User Section - COMPLETE
const UserSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <User className="h-5 w-5 text-blue-600" />
        User Management (7 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Profile management and admin user controls
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="GET"
        path="/api/user/me"
        description="Get current user profile"
        auth={true}
        response={{
          user: {
            name: "Green Kitchen",
            email: "contact@greenkitchen.com",
            role: "restaurant",
            address: "45 Galle Road, Colombo",
            location: { type: "Point", coordinates: [79.8612, 6.9271] },
          },
        }}
      />
      <ApiEndpoint
        method="PATCH"
        path="/api/user/me"
        description="Update current user profile"
        auth={true}
        requestBody={{
          name: "Updated Name",
          address: "New Address",
          contactNumber: "+94771234567",
          location: { type: "Point", coordinates: [79.8615, 6.9275] },
        }}
        response={{
          message: "Profile updated",
          user: { name: "Updated Name" },
        }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/user/stats"
        description="Get platform statistics"
        auth={true}
        roles={["admin"]}
        response={{
          totalUsers: 120,
          totalFoodBanks: 18,
          totalRestaurants: 42,
          totalDonations: 215,
          activeRequests: 33,
        }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/user/"
        description="List all users (paginated)"
        auth={true}
        roles={["admin"]}
        response={{
          users: [{ id: "user1", name: "User 1" }],
          page: 1,
          totalPages: 5,
          totalUsers: 120,
        }}
      />
      <ApiEndpoint
        method="PATCH"
        path="/api/user/:id"
        description="Admin update user by ID"
        auth={true}
        roles={["admin"]}
        requestBody={{
          role: "foodbank",
          isActive: true,
          verificationStatus: "verified",
          verifiedAt: "2026-04-12T08:30:00.000Z",
          name: "Updated Name",
          address: "45 Galle Road, Colombo",
          contactNumber: "+94771234567",
          location: { type: "Point", coordinates: [79.8612, 6.9271] },
        }}
        response={{ message: "User updated", user: {} }}
      />
      <ApiEndpoint
        method="DELETE"
        path="/api/user/:id"
        description="Soft delete user (deactivate account)"
        auth={true}
        roles={["admin"]}
        response={{ message: "User deactivated", userId: "user-id" }}
      />
    </div>
  </div>
);

// Restaurant Donation Listings - COMPLETE
const DonationsSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-amber-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <UtensilsCrossed className="h-5 w-5 text-orange-600" />
        Restaurant Donation Listings (6 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Create and manage food donation listings
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="POST"
        path="/api/foodsdonate/"
        description="Create a new donation listing (multipart/form-data)"
        auth={true}
        roles={["restaurant"]}
        requestBody={{
          restaurant_id: "user-id",
          foodName: "Rice and Curry",
          description: "Fresh lunch surplus",
          foodType: "veg",
          totalQuantity: 20,
          expiryTime: "2026-04-13T10:00:00Z",
          pickupWindowStart: "2026-04-12T12:00:00Z",
          pickupWindowEnd: "2026-04-12T15:00:00Z",
        }}
        response={{
          _id: "donation-id",
          foodName: "Rice and Curry",
          totalQuantity: 20,
          remainingQuantity: 20,
          status: "available",
        }}
        notes="Image upload supported via multipart/form-data"
      />
      <ApiEndpoint
        method="GET"
        path="/api/foodsdonate/"
        description="Get all donations with filters"
        auth={true}
        roles={["restaurant", "foodbank"]}
        queryParams="status, foodType"
        response={[
          {
            _id: "donation-id",
            foodName: "Rice and Curry",
            remainingQuantity: 12,
            restaurant_id: {
              name: "Green Kitchen",
              address: "45 Galle Road, Colombo",
            },
            requests: [],
          },
        ]}
      />
      <ApiEndpoint
        method="GET"
        path="/api/foodsdonate/restaurant/:restaurant_id"
        description="Get donations by restaurant ID"
        auth={true}
        roles={["restaurant", "admin"]}
        response={[
          {
            _id: "donation-id",
            foodName: "Rice and Curry",
            status: "available",
          },
        ]}
      />
      <ApiEndpoint
        method="GET"
        path="/api/foodsdonate/:id"
        description="Get single donation by ID"
        auth={true}
        roles={["restaurant", "foodbank"]}
        response={{
          _id: "donation-id",
          foodName: "Rice and Curry",
          restaurant_id: { name: "Green Kitchen" },
          requests: [],
        }}
      />
      <ApiEndpoint
        method="PUT"
        path="/api/foodsdonate/:id"
        description="Update a donation listing"
        auth={true}
        roles={["restaurant"]}
        requestBody={{ foodName: "Updated Name", totalQuantity: 15 }}
        response={{
          _id: "donation-id",
          foodName: "Updated Name",
          totalQuantity: 15,
        }}
        notes="Image upload supported via multipart/form-data"
      />
      <ApiEndpoint
        method="DELETE"
        path="/api/foodsdonate/:id"
        description="Delete a donation listing"
        auth={true}
        roles={["restaurant"]}
        response={{ message: "Donation deleted successfully" }}
      />
    </div>
  </div>
);

// Donation Requests - COMPLETE
const DonationRequestsSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-cyan-50 to-sky-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <ShoppingBag className="h-5 w-5 text-cyan-600" />
        Donation Requests (6 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Foodbank requests for restaurant donations
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="POST"
        path="/api/request/:food_id"
        description="Request a donation from a restaurant"
        auth={true}
        roles={["foodbank"]}
        requestBody={{
          restaurant_id: "restaurant-id",
          foodBank_id: "foodbank-id",
          requestedQuantity: 5,
        }}
        response={{
          message: "Request created successfully",
          request: {
            food_id: "food-id",
            restaurant_id: "restaurant-id",
            foodBank_id: "foodbank-id",
            requestedQuantity: 5,
            status: "pending",
          },
        }}
      />
      <ApiEndpoint
        method="PUT"
        path="/api/request/approve/:request_id"
        description="Approve a donation request"
        auth={true}
        roles={["restaurant"]}
        response={{
          message: "Request approved",
          request: { status: "approved" },
        }}
      />
      <ApiEndpoint
        method="PUT"
        path="/api/request/reject/:request_id"
        description="Reject a donation request"
        auth={true}
        roles={["restaurant"]}
        response={{
          message: "Request rejected",
          request: { status: "rejected" },
        }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/request/restaurant/:restaurant_id"
        description="Get all requests for a restaurant"
        auth={true}
        roles={["restaurant"]}
        response={{
          requests: [{ _id: "request-id", status: "pending", donation: {} }],
        }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/request/donation/:donationId"
        description="Get all requests for a specific donation"
        auth={true}
        roles={["restaurant", "admin"]}
        response={{
          requests: [{ _id: "request-id", status: "pending", foodBank: {} }],
        }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/request/:foodBank_id"
        description="Get all requests made by a foodbank"
        auth={true}
        roles={["foodbank"]}
        response={{
          requests: [{ _id: "request-id", status: "pending", donation: {} }],
        }}
      />
    </div>
  </div>
);

// Foodbank Requests to Restaurants - COMPLETE
const FoodbankRequestsSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Building2 className="h-5 w-5 text-green-600" />
        Foodbank Requests to Restaurants (5 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Foodbanks requesting specific food items from restaurants
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="POST"
        path="/api/foodbank-request/"
        description="Create a request for food items (sends SMS to nearby restaurants)"
        auth={true}
        roles={["foodbank"]}
        requestBody={{
          foodbank_id: "foodbank-id",
          foodName: "Canned Beans",
          foodType: "veg",
          requestedQuantity: 15,
        }}
        response={{
          message: "Request created successfully",
          request: {
            foodbank_id: "foodbank-id",
            foodName: "Canned Beans",
            requestedQuantity: 15,
            remainingQuantity: 15,
            status: "open",
          },
          notificationSummary: {
            restaurantCount: 3,
            smsSentCount: 3,
            smsFailedCount: 0,
            skipped: false,
          },
        }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/foodbank-request/"
        description="Get all foodbank requests"
        auth={true}
        roles={["restaurant", "foodbank"]}
        response={{ message: "Requests retrieved successfully", requests: [] }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/foodbank-request/foodbank/:foodbankId"
        description="Get requests by foodbank ID"
        auth={true}
        roles={["foodbank", "admin"]}
        response={{ message: "Requests retrieved successfully", requests: [] }}
      />
      <ApiEndpoint
        method="PUT"
        path="/api/foodbank-request/:id"
        description="Update a foodbank request"
        auth={true}
        roles={["foodbank"]}
        requestBody={{
          foodName: "Updated Name",
          foodType: "non-veg",
          requestedQuantity: 20,
          status: "open",
        }}
        response={{ message: "Request updated successfully", request: {} }}
      />
      <ApiEndpoint
        method="DELETE"
        path="/api/foodbank-request/:id"
        description="Delete a foodbank request"
        auth={true}
        roles={["foodbank"]}
        response={{ message: "Request deleted", request: {} }}
      />
    </div>
  </div>
);

// Accept Foodbank Requests - COMPLETE
const AcceptRequestsSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-emerald-600" />
        Accept Foodbank Requests (1 endpoint)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Restaurants accepting foodbank requests
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="POST"
        path="/api/accepts/foodbank-request/:donateId"
        description="Accept a foodbank request and create pickup OTP"
        auth={true}
        roles={["restaurant"]}
        requestBody={{ quantity: 5 }}
        response={{
          message: "Accepted successfully",
          remainingQuantity: 10,
          status: "pending",
        }}
        notes="Automatically creates a pickup OTP record for verification"
      />
    </div>
  </div>
);

// Pickup OTP - COMPLETE
const PickupSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Truck className="h-5 w-5 text-indigo-600" />
        Pickup OTP Verification (4 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        OTP-based pickup verification system
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="POST"
        path="/api/pickup/generate"
        description="Generate OTP for pickup"
        auth={true}
        roles={["restaurant"]}
        requestBody={{
          request_id: "request-id",
          restaurant_id: "restaurant-id",
          foodbank_id: "foodbank-id",
        }}
        response={{
          message: "OTP generated successfully",
          pickupId: "pickup-id",
          otp: "123456",
        }}
      />
      <ApiEndpoint
        method="POST"
        path="/api/pickup/verify"
        description="Verify pickup OTP"
        auth={true}
        roles={["restaurant"]}
        requestBody={{ pickupId: "pickup-id", otp: "123456" }}
        response={{ message: "Pickup verified successfully" }}
        notes="Returns attemptsLeft: 2 if OTP is invalid"
      />
      <ApiEndpoint
        method="POST"
        path="/api/pickup/resend"
        description="Resend OTP"
        auth={true}
        roles={["restaurant"]}
        requestBody={{ pickupId: "pickup-id" }}
        response={{ message: "New OTP generated", otp: "654321" }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/pickup/:id"
        description="Get pickup record by ID"
        auth={true}
        roles={["admin", "restaurant", "foodbank"]}
        response={{
          _id: "pickup-id",
          request_id: "request-id",
          restaurant_id: "restaurant-id",
          foodbank_id: "foodbank-id",
          verified: false,
          status: "generated",
        }}
      />
    </div>
  </div>
);

// Complaints - COMPLETE
const ComplaintsSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-red-50 to-rose-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <FileText className="h-5 w-5 text-red-600" />
        Complaints (5 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        File and manage complaints between users
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="POST"
        path="/api/complaints/"
        description="Submit a complaint against another user"
        auth={true}
        roles={["restaurant", "foodbank"]}
        requestBody={{
          complaineeId: "user-id",
          subject: "Late pickup",
          description: "The pickup was delayed for over 30 minutes.",
        }}
        response={{
          message: "Complaint submitted successfully",
          complaint: {
            complainer: "user-id",
            complainee: "target-id",
            subject: "Late pickup",
            description: "...",
            status: "pending",
          },
        }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/complaints/my"
        description="Get all complaints filed by current user"
        auth={true}
        roles={["restaurant", "foodbank"]}
        response={[
          {
            _id: "complaint-id",
            subject: "Late pickup",
            status: "pending",
            complainee: { name: "Target User" },
          },
        ]}
      />
      <ApiEndpoint
        method="GET"
        path="/api/complaints/targets"
        description="Get list of users the current user can complain about"
        auth={true}
        roles={["restaurant", "foodbank"]}
        response={[
          {
            name: "Target User",
            email: "target@example.com",
            role: "foodbank",
            address: "45 Galle Road, Colombo",
          },
        ]}
      />
      <ApiEndpoint
        method="GET"
        path="/api/complaints/"
        description="Get all complaints (admin view)"
        auth={true}
        roles={["admin"]}
        response={[
          {
            _id: "complaint-id",
            complainer: { name: "User A" },
            complainee: { name: "User B" },
            subject: "Issue",
            status: "pending",
            adminReply: null,
          },
        ]}
      />
      <ApiEndpoint
        method="PATCH"
        path="/api/complaints/:id/reply"
        description="Admin reply to complaint (marks as resolved)"
        auth={true}
        roles={["admin"]}
        requestBody={{
          adminReply: "We have reviewed the case and contacted both parties.",
        }}
        response={{
          message: "Complaint replied and resolved",
          complaint: { status: "resolved" },
        }}
      />
    </div>
  </div>
);

// Dashboard - COMPLETE
const DashboardSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-gray-600" />
        Dashboard (2 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Platform analytics and statistics
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="GET"
        path="/api/dashboard/landing"
        description="Public landing page stats"
        auth={false}
        response={{
          success: true,
          data: {
            stats: { liveListings: 12, activeDonors: 8, openRequests: 5 },
            activity: [],
            generatedAt: "2026-04-12T08:30:00.000Z",
          },
        }}
      />
      <ApiEndpoint
        method="GET"
        path="/api/dashboard/restaurant"
        description="Restaurant dashboard data"
        auth={true}
        roles={["restaurant"]}
        response={{
          success: true,
          data: {
            profile: {},
            stats: {},
            recentActivity: {},
            alerts: [],
            charts: {},
            notifications: [],
          },
        }}
      />
    </div>
  </div>
);

// Settings - COMPLETE
const SettingsSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-slate-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Settings className="h-5 w-5 text-gray-600" />
        Settings (2 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">Platform configuration</p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="GET"
        path="/api/settings/distance"
        description="Get max distance setting for nearby searches"
        auth={true}
        roles={["any"]}
        response={{ key: "max_distance", value: 20 }}
      />
      <ApiEndpoint
        method="PUT"
        path="/api/settings/distance"
        description="Update max distance setting"
        auth={true}
        roles={["admin"]}
        requestBody={{ value: 25 }}
        response={{ key: "max_distance", value: 25 }}
        notes="Value must be between 5 and 100"
      />
    </div>
  </div>
);

// Nearby / Distance Test - COMPLETE
const NearbySection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-teal-50 to-cyan-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <MapPin className="h-5 w-5 text-teal-600" />
        Nearby & Distance Test (2 endpoints)
      </h2>
      <p className="text-sm text-gray-600 mt-1">
        Location-based services and distance calculations
      </p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="POST"
        path="/api/nearby/nearby"
        description="Find nearby users by role within max distance"
        auth={false}
        requestBody={{
          latitude: 6.9271,
          longitude: 79.8612,
          role: "restaurant",
        }}
        response={[
          {
            name: "Nearby Restaurant",
            email: "restaurant@example.com",
            address: "Nearby Address",
            location: {},
            distance: 2.5,
          },
        ]}
      />
      <ApiEndpoint
        method="POST"
        path="/api/nearby/route-details"
        description="Get route distance and duration between two points"
        auth={false}
        requestBody={{
          originLat: 6.9271,
          originLng: 79.8612,
          destLat: 6.934,
          destLng: 79.842,
        }}
        response={{ success: true, distanceKm: "3.14", durationMins: 12 }}
      />
    </div>
  </div>
);

// Notification Test - COMPLETE
const NotificationsSection = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-yellow-50 to-amber-50">
      <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
        <Bell className="h-5 w-5 text-yellow-600" />
        Notification Test (1 endpoint)
      </h2>
      <p className="text-sm text-gray-600 mt-1">Test notification system</p>
    </div>
    <div className="p-4">
      <ApiEndpoint
        method="POST"
        path="/api/notifications/test"
        description="Send a test notification to a user"
        auth={false}
        requestBody={{
          user_id: "66f1f2b7f2f2f2f2f2f2f2f2",
          message: "Test notification",
        }}
        response={{ success: true, message: "Notification sent successfully" }}
      />
    </div>
  </div>
);

// Main Sidebar Component
const Sidebar = ({ activeSection, onSelectSection }) => {
  const sections = [
    {
      id: "public",
      name: "Public Routes",
      icon: Home,
      color: "text-gray-600",
      count: 4,
    },
    {
      id: "auth",
      name: "Authentication",
      icon: Key,
      color: "text-purple-600",
      count: 15,
    },
    {
      id: "user",
      name: "User Management",
      icon: User,
      color: "text-blue-600",
      count: 6,
    },
    {
      id: "donations",
      name: "Donation Listings",
      icon: UtensilsCrossed,
      color: "text-orange-600",
      count: 6,
    },
    {
      id: "donationRequests",
      name: "Donation Requests",
      icon: ShoppingBag,
      color: "text-cyan-600",
      count: 6,
    },
    {
      id: "foodbankRequests",
      name: "Foodbank Requests",
      icon: Building2,
      color: "text-green-600",
      count: 5,
    },
    {
      id: "acceptRequests",
      name: "Accept Requests",
      icon: CheckCircle,
      color: "text-emerald-600",
      count: 1,
    },
    {
      id: "pickup",
      name: "Pickup OTP",
      icon: Truck,
      color: "text-indigo-600",
      count: 4,
    },
    {
      id: "complaints",
      name: "Complaints",
      icon: FileText,
      color: "text-red-600",
      count: 5,
    },
    {
      id: "dashboard",
      name: "Dashboard",
      icon: LayoutDashboard,
      color: "text-gray-600",
      count: 2,
    },
    {
      id: "settings",
      name: "Settings",
      icon: Settings,
      color: "text-gray-600",
      count: 2,
    },
    {
      id: "nearby",
      name: "Nearby",
      icon: MapPin,
      color: "text-teal-600",
      count: 2,
    },
    {
      id: "notifications",
      name: "Notifications",
      icon: Bell,
      color: "text-yellow-600",
      count: 1,
    },
  ];

  const totalEndpoints = sections.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="lg:col-span-1">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 sticky top-4 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
          <h2 className="font-semibold text-gray-700 flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Quick Navigation
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            {totalEndpoints} total endpoints
          </p>
        </div>
        <nav className="p-2 max-h-[calc(100vh-200px)] overflow-y-auto">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => onSelectSection(section.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-all group mb-1 ${
                activeSection === section.id
                  ? "bg-emerald-50 border border-emerald-200 shadow-sm"
                  : "hover:bg-gray-50 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-2">
                <section.icon className={`h-4 w-4 ${section.color}`} />
                <span
                  className={`text-sm ${activeSection === section.id ? "text-emerald-800 font-semibold" : "text-gray-700"}`}
                >
                  {section.name}
                </span>
                <span
                  className={`text-xs px-1.5 py-0.5 rounded-full ${activeSection === section.id ? "text-emerald-700 bg-emerald-100" : "text-gray-400 bg-gray-100"}`}
                >
                  {section.count}
                </span>
              </div>
              {activeSection === section.id ? (
                <ChevronDown className="h-4 w-4 text-emerald-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Shield className="h-3 w-3" />
            <span>Click a module to show only its endpoints</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Content Component
const MainContent = ({ activeSection }) => {
  return (
    <div className="lg:col-span-3 space-y-6">
      {activeSection === "public" && <PublicRoutesSection />}
      {activeSection === "auth" && <AuthSection />}
      {activeSection === "user" && <UserSection />}
      {activeSection === "donations" && <DonationsSection />}
      {activeSection === "donationRequests" && <DonationRequestsSection />}
      {activeSection === "foodbankRequests" && <FoodbankRequestsSection />}
      {activeSection === "acceptRequests" && <AcceptRequestsSection />}
      {activeSection === "pickup" && <PickupSection />}
      {activeSection === "complaints" && <ComplaintsSection />}
      {activeSection === "dashboard" && <DashboardSection />}
      {activeSection === "settings" && <SettingsSection />}
      {activeSection === "nearby" && <NearbySection />}
      {activeSection === "notifications" && <NotificationsSection />}
    </div>
  );
};

// Main App Component
const ApiEndpoints = () => {
  const [activeSection, setActiveSection] = useState("public");

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/30">
      <header className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white shadow-lg sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-lg">
                <UtensilsCrossed className="h-7 w-7" />
              </div>
              <div>
                <h1 className="text-xl font-bold">SharePlate API</h1>
                <p className="text-emerald-100 text-xs">
                  Complete API Documentation — All Endpoints
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="bg-white/20 px-3 py-1.5 rounded-lg text-xs font-mono">
                Base URL:{" "}
                <span className="font-bold">http://localhost:5000</span>
              </div>
              <div className="bg-emerald-800/50 px-3 py-1.5 rounded-lg text-xs">
                📦 59 Endpoints
              </div>
            </div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <Sidebar
            activeSection={activeSection}
            onSelectSection={setActiveSection}
          />
          <MainContent activeSection={activeSection} />
        </div>
      </div>
    </div>
  );
};

export default ApiEndpoints;
