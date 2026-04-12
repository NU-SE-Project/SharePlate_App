import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { SocketProvider } from "./context/SocketContext";
import { AuthProvider } from "./context/AuthContext";
import { motion } from "framer-motion";
import ScrollToTop from "./components/common/ScrollToTop";

import LoginPage from "./features/auth/pages/LoginPage";
import SignupPage from "./features/auth/pages/SignupPage";
import ForgotPasswordPage from "./features/auth/pages/ForgotPasswordPage";
import ResendVerificationPage from "./features/auth/pages/ResendVerificationPage";
import ResetPasswordPage from "./features/auth/pages/ResetPasswordPage";
import VerifyEmailPage from "./features/auth/pages/VerifyEmailPage";
import ChangePasswordPage from "./features/auth/pages/ChangePasswordPage";
import HomePage from "./features/home/pages/HomePage";
import ApiEndpoints from "./components/common/ApiEndpoints";
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
import RestaurantComplaintsPage from "./features/restaurants/complaints/pages/ComplaintsPage";

import DonatedFoodPage from "./features/foodbank/donatedFood/pages/DonatedFoodPage";
import PostRequestPage from "./features/foodbank/proactiveRequests/pages/PostRequestPage";
import MyProactiveRequestsPage from "./features/foodbank/proactiveRequests/pages/MyProactiveRequestsPage";
import FoodBankProfilePage from "./features/foodbank/profile/pages/FoodBankProfilePage";
import FoodBankComplaintsPage from "./features/foodbank/complaints/pages/ComplaintsPage";
import AdminLayout from "./features/admin/common/AdminLayout";
import AdminUsersPage from "./features/admin/users/pages/AdminUsersPage";
import Dashboard from "./features/admin/dashboard/pages/Dashboard";
import FoodBanksTable from "./features/admin/users/pages/FoodBanksTable";
import RestaurantsTable from "./features/admin/users/pages/RestaurantsTable";
import FoodBankRequestsPage from "./features/admin/users/pages/FoodBankRequestsPage";
import RestaurantDonationsPage from "./features/admin/users/pages/RestaurantDonationsPage";
import Settings from "./features/admin/settings/pages/Settings";
import AdminComplaintsPage from "./features/admin/complaints/pages/AdminComplaintsPage";
import HelpCenterPage from "./features/common/support/pages/HelpCenterPage";
import ContactPage from "./features/common/support/pages/ContactPage";
import PrivacyPolicyPage from "./features/common/support/pages/PrivacyPolicyPage";
import TermsOfServicePage from "./features/common/support/pages/TermsOfServicePage";
import SafetyGuidelinesPage from "./features/common/support/pages/SafetyGuidelinesPage";
import AccessibilityPage from "./features/common/support/pages/AccessibilityPage";

function App() {
  const [showScrollUp, setShowScrollUp] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop =
        window.scrollY || document.documentElement.scrollTop || 0;
      const windowHeight = window.innerHeight || 0;
      const docHeight = document.documentElement.scrollHeight || 0;

      const threshold = 40;

      const atTop = scrollTop <= threshold;
      const atBottom = windowHeight + scrollTop >= docHeight - threshold;

      setShowScrollDown(!atBottom);
      setShowScrollUp(!atTop);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Toaster position="top-right" reverseOrder={false} />

          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/help-center" element={<HelpCenterPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms-of-service" element={<TermsOfServicePage />} />
            <Route
              path="/safety-guidelines"
              element={<SafetyGuidelinesPage />}
            />
            <Route path="/accessibility" element={<AccessibilityPage />} />

            <Route path="/endpoints" element={<ApiEndpoints />} />

            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/signup" element={<SignupPage />} />
            <Route
              path="/auth/forgot-password"
              element={<ForgotPasswordPage />}
            />
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
              <Route path="complaints" element={<RestaurantComplaintsPage />} />
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
              <Route path="complaints" element={<FoodBankComplaintsPage />} />
              <Route
                path="leaderboard"
                element={
                  <div className="rounded-3xl bg-white p-10 text-2xl font-bold shadow-sm">
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
              <Route
                path="foodbank/:id/requests"
                element={<FoodBankRequestsPage />}
              />
              <Route path="restaurants" element={<RestaurantsTable />} />
              <Route
                path="restaurant/:id/donations"
                element={<RestaurantDonationsPage />}
              />
              <Route path="settings" element={<Settings />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="complaints" element={<AdminComplaintsPage />} />
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

          {showScrollUp && (
            <motion.button
              type="button"
              aria-label="Scroll to top"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed right-5 bottom-28 z-50 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-green-800 text-white shadow-lg transition-all duration-200 hover:bg-emerald-600 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
            </motion.button>
          )}

          {showScrollDown && (
            <motion.button
              type="button"
              aria-label="Scroll to bottom"
              onClick={() =>
                window.scrollTo({
                  top: document.documentElement.scrollHeight,
                  behavior: "smooth",
                })
              }
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 40, scale: 0.9 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="fixed right-5 bottom-6 z-50 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-green-800 text-white shadow-lg transition-all duration-200 hover:bg-emerald-600 hover:shadow-2xl active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-300"
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </motion.button>
          )}
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
