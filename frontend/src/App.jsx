import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext";
import { AuthProvider } from "./context/AuthContext";

import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResendVerificationPage from "./features/auth/pages/ResendVerificationPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";
import ChangePasswordPage from "./features/auth/pages/ChangePasswordPage";
import HomePage from "./features/home/pages/HomePage";

import RestaurantLayout from "./features/restaurants/common/RestaurantLayout";
import FoodBankLayout from "./features/foodbank/common/FoodBankLayout";
import RequireAuth from "./components/common/RequireAuth";
import UserDashboard from "./features/common/UserDashboard";
import DonateFoodPage from "./features/restaurants/donateFood/pages/DonateFoodPage";
import ManageDonationsPage from "./features/restaurants/donateFood/pages/ManageDonationsPage";
import AvailableRequestsPage from "./features/restaurants/donateFood/pages/AvailableRequestsPage";
import RestaurantProfilePage from "./features/restaurants/profile/pages/RestaurantProfilePage";
import RestaurantDashboard from "./features/restaurants/common/pages/Restaurantdashboard";
import SingleDonationRequestsPage from "./features/restaurants/donateFood/pages/SingleDonationRequestsPage";

import DonatedFoodPage from "./features/foodbank/donatedFood/pages/DonatedFoodPage";
import PostRequestPage from "./features/foodbank/proactiveRequests/pages/PostRequestPage";
import MyProactiveRequestsPage from "./features/foodbank/proactiveRequests/pages/MyProactiveRequestsPage";
import FoodBankProfilePage from "./features/foodbank/profile/pages/FoodBankProfilePage";
import AdminLayout from "./features/admin/common/AdminLayout";
import AdminUsersPage from "./features/admin/users/pages/AdminUsersPage";
import Dashboard from "./features/admin/dashboard/pages/Dashboard";
import FoodBanksTable from "./features/admin/users/pages/FoodBanksTable";
import RestaurantsTable from "./features/admin/users/pages/RestaurantsTable";
import FoodBankRequestsPage from "./features/admin/users/pages/FoodBankRequestsPage";
import RestaurantDonationsPage from "./features/admin/users/pages/RestaurantDonationsPage";
import Settings from "./features/admin/settings/pages/Settings";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Toaster position="top-right" reverseOrder={false} />

          <Routes>
            <Route path="/" element={<HomePage />} />

            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/auth/resend-verification"
              element={<ResendVerificationPage />}
            />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route
              path="/auth/change-password"
              element={
                <RequireAuth>
                  <ChangePasswordPage />
                </RequireAuth>
              }
            />

            <Route
              path="/restaurant"
              element={
                <RequireAuth roles={["restaurant"]}>
                  <RestaurantLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<RestaurantDashboard />} />
              <Route path="donate" element={<DonateFoodPage />} />
              <Route path="manage" element={<ManageDonationsPage />} />
              <Route path="requests" element={<AvailableRequestsPage />} />
              <Route
                path="donation-requests/:donationId"
                element={<SingleDonationRequestsPage />}
              />
              <Route path="profile" element={<RestaurantProfilePage />} />
            </Route>

            <Route
              path="/foodbank"
              element={
                <RequireAuth roles={["foodbank"]}>
                  <FoodBankLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/foodbank/donated-food" />} />
              <Route path="donated-food" element={<DonatedFoodPage />} />
              <Route path="post-request" element={<PostRequestPage />} />
              <Route
                path="my-proactive-requests"
                element={<MyProactiveRequestsPage />}
              />
              <Route path="profile" element={<FoodBankProfilePage />} />
              <Route
                path="leaderboard"
                element={
                  <div className="p-10 font-bold text-2xl bg-white rounded-3xl shadow-sm">
                    Community Leaderboard (Coming Soon)
                  </div>
                }
              />
            </Route>

            <Route
              path="/admin"
              element={
                <RequireAuth roles={["admin"]}>
                  <AdminLayout />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="foodbanks" element={<FoodBanksTable />} />
              <Route path="foodbank/:id/requests" element={<FoodBankRequestsPage />} />
              <Route path="restaurants" element={<RestaurantsTable />} />
              <Route path="restaurant/:id/donations" element={<RestaurantDonationsPage />} />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={<AdminUsersPage />} />
            </Route>

            <Route
              path="/dashboard"
              element={
                <RequireAuth>
                  <UserDashboard />
                </RequireAuth>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
