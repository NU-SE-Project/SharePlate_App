import React from "react";
import DonationList from "../components/DonationList";
import {
  ShoppingBag,
  ChevronLeft,
  Bell,
  HandHeart,
  ArrowRight,
  Sparkles,
  Plus,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

const ManageDonationsPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.id || user?._id || null;

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-[-80px] top-[-80px] h-64 w-64 rounded-full bg-emerald-100/40 blur-3xl" />
        <div className="absolute right-[-100px] top-20 h-72 w-72 rounded-full bg-green-200/30 blur-3xl" />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-green-100/60 shadow-[0_10px_40px_rgba(16,185,129,0.08)]">
          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-green-200/30 blur-2xl" />
            </div>

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <Link
                  to="/restaurant/dashboard"
                  aria-label="Go back to restaurant dashboard"
                  className="group inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-emerald-100 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-x-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:h-12 sm:w-12"
                >
                  <ChevronLeft
                    size={22}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </Link>

                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 sm:text-sm">
                    <Sparkles size={14} />
                    Donation Management
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    Manage Donations
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                    Review, edit, and update the status of your listed
                    donations from one organized place.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[320px]">
                <div className="group rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition-transform duration-300 group-hover:scale-105">
                      <Bell size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        Listing Control
                      </p>
                      <p className="text-xs text-slate-500">
                        Centralized donation updates
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Track all listed items, keep statuses current, and avoid
                    outdated donation records.
                  </p>
                </div>

                <Link
                  to="/restaurant/donate"
                  className="group cursor-pointer rounded-2xl border border-emerald-700 bg-gradient-to-r from-emerald-600 to-green-800 p-4 text-white shadow-[0_12px_30px_rgba(22,163,74,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(22,163,74,0.34)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                        <HandHeart size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">New Donation</p>
                        <p className="text-xs text-emerald-100">
                          Start a fresh donation flow
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-50">
                        Create donation now
                      </span>
                      <ArrowRight
                        size={18}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700">
                <ShoppingBag size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Overview
                </p>
                <h2 className="text-base font-semibold text-slate-900">
                  Your Donations
                </h2>
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Track all listed donation items, update availability, and keep
              your records accurate.
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Quick Action
            </p>
            <h3 className="mt-2 text-base font-semibold text-slate-900">
              Add new food donation
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Create a new donation entry and make it available for pickup
              faster.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:col-span-2 xl:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Status Control
            </p>
            <h3 className="mt-2 text-base font-semibold text-slate-900">
              Keep listings updated
            </h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Edit outdated records and ensure recipients only see valid,
              current donation items.
            </p>
          </div>
        </div>

        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 lg:p-6">
          <div className="mb-5 flex flex-col gap-3 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Donation Listings
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage all donation records for your restaurant.
              </p>
            </div>

            <Link
              to="/restaurant/donate"
              className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-100 hover:text-green-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              <Plus size={16} />
              Add Donation
            </Link>
          </div>

          <DonationList restaurantId={restaurantId} />
        </section>
      </div>
    </div>
  );
};

export default ManageDonationsPage;
