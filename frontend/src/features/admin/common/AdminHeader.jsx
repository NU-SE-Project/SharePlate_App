import React, { memo, useMemo, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Users,
  Menu,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import sharePlateLogo from "../../../assets/SharePlate_OffcialLogo.png";

const navLinks = [
  {
    name: "User Management",
    path: "/admin/users",
    icon: Users,
  },
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
];

const NavItem = memo(({ to, label, Icon, isActive }) => {
  return (
    <Link
      to={to}
      className={`group inline-flex cursor-pointer items-center gap-2.5 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isActive
          ? "bg-emerald-50 text-emerald-700 shadow-sm ring-1 ring-emerald-100"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <Icon
        size={18}
        className={`transition-transform duration-300 ${
          isActive ? "scale-105" : "group-hover:-translate-y-0.5"
        }`}
      />
      <span>{label}</span>
    </Link>
  );
});

NavItem.displayName = "NavItem";

const MobileNavItem = memo(({ to, label, Icon, isActive }) => {
  return (
    <Link
      to={to}
      className={`group flex cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
        isActive
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
          : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
      }`}
      aria-current={isActive ? "page" : undefined}
    >
      <div
        className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300 ${
          isActive
            ? "bg-emerald-100 text-emerald-700"
            : "bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700"
        }`}
      >
        <Icon size={18} />
      </div>
      <span>{label}</span>
    </Link>
  );
});

MobileNavItem.displayName = "MobileNavItem";

const AdminHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const userName = auth.user?.name || "Administrator";

  const activeLinks = useMemo(() => {
    return navLinks.map((link) => ({
      ...link,
      isActive:
        location.pathname === link.path ||
        location.pathname.startsWith(`${link.path}/`),
    }));
  }, [location.pathname]);

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

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/90 shadow-sm backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[76px] items-center justify-between gap-3 py-3">
            {/* Brand */}
            <Link
              to="/admin/users"
              className="group inline-flex min-w-0 cursor-pointer items-center gap-3 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <div className="relative flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-100 shadow-lg shadow-emerald-600/15 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:shadow-xl group-hover:shadow-emerald-600/20">
                <img
                  src={sharePlateLogo}
                  alt="SharePlate logo"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>

              <div className="min-w-0">
                <p className="truncate text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                  SharePlate Admin
                </p>
                <p className="truncate text-[11px] font-bold uppercase tracking-[0.22em] text-emerald-700">
                  Operations Console
                </p>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav
              className="hidden items-center gap-2 lg:flex"
              aria-label="Primary navigation"
            >
              {activeLinks.map((link) => (
                <NavItem
                  key={link.path}
                  to={link.path}
                  label={link.name}
                  Icon={link.icon}
                  isActive={link.isActive}
                />
              ))}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="hidden items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 shadow-sm md:inline-flex">
                <ShieldCheck size={16} className="shrink-0" />
                <span className="max-w-[180px] truncate">{userName}</span>
              </div>

              {/* Mobile quick nav */}
              <div className="flex items-center gap-2 lg:hidden">
                <Link
                  to="/admin/users"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  aria-label="Open user management"
                >
                  <Users size={18} />
                </Link>

                <Link
                  to="/dashboard"
                  className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                  aria-label="Open dashboard"
                >
                  <Menu size={18} />
                </Link>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 hover:text-red-600 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2"
                title="Logout"
                aria-label="Logout"
              >
                <LogOut
                  size={18}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Tablet / Mobile Navigation */}
      <div className="border-b border-slate-200/70 bg-white/90 px-4 py-3 shadow-sm backdrop-blur-xl lg:hidden sm:px-6">
        <div className="mx-auto max-w-7xl">
          <nav
            className="grid grid-cols-1 gap-2 sm:grid-cols-2"
            aria-label="Mobile primary navigation"
          >
            {activeLinks.map((link) => (
              <MobileNavItem
                key={link.path}
                to={link.path}
                label={link.name}
                Icon={link.icon}
                isActive={link.isActive}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
};

export default memo(AdminHeader);
