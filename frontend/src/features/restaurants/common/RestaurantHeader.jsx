import React, { useCallback, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Heart,
  PlusCircle,
  LayoutDashboard,
  UserCircle,
  Bell,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import sharePlateLogo from "../../../assets/SharePlate_OffcialLogo.png";
const RestaurantHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const restaurantName = auth?.user?.name || "SharePlate Restaurant";

  const navLinks = useMemo(
    () => [
      {
        name: "Dashboard",
        path: "/restaurant/dashboard",
        icon: LayoutDashboard,
      },
      {
        name: "Donate Food",
        path: "/restaurant/donate",
        icon: PlusCircle,
      },
      {
        name: "Requests",
        path: "/restaurant/requests",
        icon: Bell,
      },
      {
        name: "Profile",
        path: "/restaurant/profile",
        icon: UserCircle,
      },
    ],
    [],
  );

  const isActivePath = useCallback(
    (path) => location.pathname === path,
    [location.pathname],
  );

  const handleLogout = useCallback(async () => {
    try {
      await auth.logout();
      toast.success("Logged out successfully.");
      navigate("/auth/login");
    } catch (error) {
      console.error("Logout failed:", error);
      toast.error(
        error?.response?.data?.message || "Failed to log out. Please try again.",
      );
    }
  }, [auth, navigate]);

  const handleMobileMenuToggle = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const handleMobileMenuClose = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-emerald-100/80 bg-white/90 backdrop-blur-xl supports-[backdrop-filter]:bg-white/75">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            to="/restaurant/dashboard"
            className="group flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl outline-none transition-all duration-300 focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            aria-label="Go to restaurant dashboard"
          >
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-emerald-600/10 shadow-lg shadow-emerald-600/20">
              <img
                src={sharePlateLogo}
                alt="SharePlate logo"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-700">
                Restaurant Panel
              </p>
              <h1 className="truncate text-base font-bold text-slate-900 sm:text-lg lg:text-xl">
                {restaurantName}
              </h1>
            </div>
          </Link>

          <nav
            className="hidden items-center gap-2 md:flex"
            aria-label="Desktop navigation"
          >
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isActivePath(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`group relative inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100"
                      : "text-slate-600 hover:bg-emerald-50/70 hover:text-emerald-700"
                  }`}
                >
                  <Icon
                    size={18}
                    className={`transition-transform duration-300 ${
                      isActive ? "scale-110" : "group-hover:scale-110"
                    }`}
                  />
                  <span>{link.name}</span>

                  {isActive && (
                    <span className="absolute inset-x-3 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-green-800 to-emerald-600" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut
                size={18}
                className="transition-transform duration-300 group-hover:translate-x-0.5"
              />
              Logout
            </button>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <Link
              to="/restaurant/profile"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              aria-label="Profile"
            >
              <UserCircle size={21} />
            </Link>

            <button
              type="button"
              onClick={handleMobileMenuToggle}
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        <div
          id="mobile-navigation"
          className={`overflow-hidden border-t border-emerald-100/80 bg-white/95 transition-all duration-300 md:hidden ${
            isMobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 sm:px-6">
            <div className="mb-2 rounded-2xl bg-gradient-to-r from-emerald-50 via-white to-emerald-50 p-4 ring-1 ring-emerald-100">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">
                Logged in as
              </p>
              <p className="mt-1 truncate text-base font-bold text-slate-900">
                {restaurantName}
              </p>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = isActivePath(link.path);

              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={handleMobileMenuClose}
                  className={`group flex cursor-pointer items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${
                    isActive
                      ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                      : "text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-700"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-white text-emerald-700 shadow-sm"
                          : "bg-slate-100 text-slate-600 group-hover:bg-white group-hover:text-emerald-700"
                      }`}
                    >
                      <Icon size={19} />
                    </span>
                    {link.name}
                  </span>

                  <ChevronRight
                    size={18}
                    className={`transition-transform duration-300 ${
                      isActive ? "translate-x-1" : "group-hover:translate-x-1"
                    }`}
                  />
                </Link>
              );
            })}

            <button
              type="button"
              onClick={handleLogout}
              className="mt-2 flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors duration-300">
                  <LogOut size={19} />
                </span>
                Logout
              </span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default React.memo(RestaurantHeader);
