import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext";
import { AuthProvider } from "./context/AuthContext";

// Auth Features
import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";

// Restaurant Features
import RestaurantLayout from "./features/restaurants/common/RestaurantLayout";
import FoodBankLayout from "./features/foodbank/common/FoodBankLayout";
import RequireAuth from "./components/common/RequireAuth";
import UserDashboard from "./features/common/UserDashboard";
import DonateFoodPage from "./features/restaurants/donateFood/pages/DonateFoodPage";
import ManageDonationsPage from "./features/restaurants/donateFood/pages/ManageDonationsPage";
import AvailableRequestsPage from "./features/restaurants/donateFood/pages/AvailableRequestsPage";
import RestaurantProfilePage from "./features/restaurants/profile/pages/RestaurantProfilePage";

// Foodbank Features
import DonatedFoodPage from "./features/foodbank/donatedFood/pages/DonatedFoodPage";
import PostRequestPage from "./features/foodbank/proactiveRequests/pages/PostRequestPage";
import MyProactiveRequestsPage from "./features/foodbank/proactiveRequests/pages/MyProactiveRequestsPage";
import FoodBankProfilePage from "./features/foodbank/profile/pages/FoodBankProfilePage";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
        {/* Toast notifications */}
        <Toaster position="top-right" reverseOrder={false} />
        
        <Routes>
          {/* Default redirect to Login */}
          <Route path="/" element={<Navigate to="/auth/login" />} />

          {/* Auth Routes */}
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/signup" element={<SignupPage />} />
          <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

          {/* Restaurant Routes - Protected and Nested */}
          <Route path="/restaurant" element={<RequireAuth roles={["restaurant"]}><RestaurantLayout /></RequireAuth>}>
             <Route index element={<Navigate to="/restaurant/dashboard" />} />
             <Route 
                path="dashboard" 
                element={
                  <div className="flex flex-col gap-8">
                     <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Link to="/restaurant/donate" className="p-8 bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                           <h3 className="text-xl font-bold mb-2">Donate Food</h3>
                           <p className="text-slate-500 text-sm">Create a new food donation listing.</p>
                        </Link>
                        <Link to="/restaurant/manage" className="p-8 bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                           <h3 className="text-xl font-bold mb-2">Manage Donations</h3>
                           <p className="text-slate-500 text-sm">View and update your donation listings.</p>
                        </Link>
                        <Link to="/restaurant/requests" className="p-8 bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all">
                           <h3 className="text-xl font-bold mb-2">Browse Requests</h3>
                           <p className="text-slate-500 text-sm">See what food banks are asking for.</p>
                        </Link>
                     </div>
                  </div>
                } 
             />
             <Route path="donate" element={<DonateFoodPage />} />
             <Route path="manage" element={<ManageDonationsPage />} />
             <Route path="requests" element={<AvailableRequestsPage />} />
             <Route path="profile" element={<RestaurantProfilePage />} />
          </Route>

          {/* Foodbank Routes - Protected and Nested */}
          <Route path="/foodbank" element={<RequireAuth roles={["foodbank"]}><FoodBankLayout /></RequireAuth>}>
             <Route index element={<Navigate to="/foodbank/donated-food" />} />
             <Route path="donated-food" element={<DonatedFoodPage />} />
             <Route path="post-request" element={<PostRequestPage />} />
             <Route path="my-proactive-requests" element={<MyProactiveRequestsPage />} />
             <Route path="profile" element={<FoodBankProfilePage />} />
             <Route path="leaderboard" element={<div className="p-10 font-bold text-2xl bg-white rounded-3xl shadow-sm">Community Leaderboard (Coming Soon)</div>} />
          </Route>

          <Route path="/dashboard" element={<RequireAuth><UserDashboard /></RequireAuth>} />

          {/* ── 404 catch-all ── */}
          <Route
            path="*"
            element={
              <div className="flex flex-col items-center justify-center h-screen gap-4">
                <h1 className="text-6xl font-bold text-emerald-600">404</h1>
                <p className="text-slate-500">Page not found.</p>
                <Link to="/auth/login" className="text-emerald-600 underline hover:text-emerald-800 font-medium font-sans">
                  Go back to Login
                </Link>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
