import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, Menu, X, Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import sharePlateLogo from "../../../assets/SharePlate_OffcialLogo.png";
import { LANDING_NAV_ITEMS } from "./landingNavItems";

function getDashboardPath(user) {
  if (user?.role === "restaurant") return "/restaurant/dashboard";
  if (user?.role === "foodbank") return "/foodbank/donated-food";
  if (user) return "/dashboard";
  return "/auth/signup";
}

const linkClassName =
  "rounded-full px-3 py-2 text-sm font-medium text-slate-700 transition-all duration-200 hover:bg-white/80 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 cursor-pointer";

const buttonClassName =
  "cursor-pointer rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0";

const HomeHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAuthenticated, isLoading, error } = useAuth();
  const primaryHref = getDashboardPath(user);

  // Loading state
  if (isLoading) {
    return (
      <header className="sticky top-0 z-40 border-b border-white/60 bg-slate-50/85 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="group inline-flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 transition duration-300 group-hover:-translate-y-0.5 group-hover:bg-emerald-700">
              <Heart className="h-5 w-5" fill="currentColor" />
            </div>
            <div>
              <p className="text-base font-semibold tracking-tight text-slate-900">
                <span className="bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent tracking-wide">
                  SharePlate
                </span>
              </p>
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                Rescue Food Faster
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="h-10 w-20 animate-pulse rounded-full bg-slate-200" />
            <div className="h-11 w-32 animate-pulse rounded-full bg-slate-200" />
          </div>
          <div className="h-11 w-11 animate-pulse rounded-2xl bg-slate-200 lg:hidden" />
        </div>
      </header>
    );
  }

  // Error state
  if (error) {
    return (
      <header className="sticky top-0 z-40 border-b border-red-200 bg-red-50/95 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-medium text-red-800">
                Connection issue
              </p>
              <p className="text-xs text-red-600">
                Unable to load user session
              </p>
            </div>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="rounded-full bg-red-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            Retry
          </button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-slate-50/85 backdrop-blur-xl transition-shadow duration-200">
      <div className="animate-fade-in mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo / Brand */}
        <Link
          to="/"
          className="group inline-flex items-center gap-3 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        >
          <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-emerald-600/10 shadow-lg shadow-emerald-600/20">
            <img
              src={sharePlateLogo}
              alt="SharePlate logo"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="text-base font-semibold tracking-tight text-slate-900">
              <span className="bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent tracking-wide">
                SharePlate
              </span>
            </p>
            <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
              Rescue Food Faster
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-2 lg:flex">
          {LANDING_NAV_ITEMS.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={linkClassName}
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(item.href)?.scrollIntoView({
                  behavior: "smooth",
                });
              }}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Desktop Actions */}
        <div className="hidden items-center gap-3 lg:flex">
          {!isAuthenticated ? (
            <Link to="/auth/login" className={linkClassName}>
              Sign in
            </Link>
          ) : null}
          <Link to={primaryHref} className={buttonClassName}>
            {isAuthenticated ? "Open workspace" : "Get started"}
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          type="button"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition-all duration-200 hover:border-emerald-200 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 lg:hidden"
          aria-expanded={isMenuOpen}
          aria-label={
            isMenuOpen ? "Close navigation menu" : "Open navigation menu"
          }
        >
          {isMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile Menu Panel */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${
          isMenuOpen
            ? "max-h-96 translate-y-0 opacity-100"
            : "max-h-0 -translate-y-2 opacity-0"
        }`}
      >
        <div className="border-t border-slate-200 bg-white/95 px-4 py-4 shadow-lg">
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {LANDING_NAV_ITEMS.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className={linkClassName}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  document.querySelector(item.href)?.scrollIntoView({
                    behavior: "smooth",
                  });
                }}
              >
                {item.label}
              </a>
            ))}
            {!isAuthenticated && (
              <Link
                to="/auth/login"
                className={linkClassName}
                onClick={() => setIsMenuOpen(false)}
              >
                Sign in
              </Link>
            )}
            <Link
              to={primaryHref}
              className="mt-2 inline-flex cursor-pointer items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              onClick={() => setIsMenuOpen(false)}
            >
              {isAuthenticated ? "Open workspace" : "Get started"}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeHeader;
