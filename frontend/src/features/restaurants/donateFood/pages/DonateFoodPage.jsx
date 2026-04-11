import React, { useCallback, useMemo, useState } from "react";
import DirectDonationForm from "../components/DirectDonationForm";
import DonationList from "../components/DonationList";
import Modal from "../../../../components/common/Modal";
import Button from "../../../../components/common/Button";
import {
  ChevronLeft,
  Plus,
  Bell,
  HandHeart,
  ArrowRight,
  Heart,
  Sparkles,
  ShieldCheck,
  ShoppingBag,
  UtensilsCrossed,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";

const DonateFoodPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { user } = useAuth();

  const restaurantId = useMemo(() => {
    return user?.id || user?._id || null;
  }, [user]);

  const handleAddClick = useCallback(() => {
    setEditingDonation(null);
    setIsModalOpen(true);
  }, []);

  const handleEditClick = useCallback((donation) => {
    setEditingDonation(donation);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingDonation(null);
  }, []);

  const handleSuccess = useCallback(() => {
    setIsModalOpen(false);
    setEditingDonation(null);
    setRefreshKey((prev) => prev + 1);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="relative mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-20 pt-6 sm:px-6 lg:px-8 lg:pt-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-green-100/60 shadow-[0_10px_40px_rgba(16,185,129,0.08)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-green-200/30 blur-2xl" />
          </div>

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
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
                    Food Donation Management
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    Your Donations
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                    Manage available food donations, keep your listings updated,
                    and make surplus meals reach the community faster.
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
                        Live Overview
                      </p>
                      <p className="text-xs text-slate-500">
                        Current donation visibility
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Stay on top of active listings, edit them quickly, and keep
                    your shared inventory accurate.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddClick}
                  className="group cursor-pointer rounded-2xl border border-emerald-700 bg-gradient-to-r from-emerald-600 to-green-800 p-4 text-left text-white shadow-[0_12px_30px_rgba(22,163,74,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(22,163,74,0.34)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                  <div className="flex h-full flex-col justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                         <Plus size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-wider">ADD Donation</p>
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
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <div className="group rounded-[1.75rem] border border-emerald-100 bg-white/85 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Donation Flow
                </p>
                <h3 className="mt-2 text-2xl  text-slate-900">Active</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Keep your food listings clear, timely, and easy to manage.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 transition-transform duration-300 group-hover:scale-110">
                <UtensilsCrossed size={22} />
              </div>
            </div>
          </div>

          <div className="group rounded-[1.75rem] border border-emerald-100 bg-white/85 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Safety Tracking
                </p>
                <h3 className="mt-2 text-2xl  text-slate-900">100%</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Better visibility for donation handling and food-sharing
                  trust.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 transition-transform duration-300 group-hover:scale-110">
                <ShieldCheck size={22} />
              </div>
            </div>
          </div>

          <div className="group rounded-[1.75rem] border border-emerald-100 bg-white/85 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl sm:col-span-2 xl:col-span-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Meals Saved
                </p>
                <h3 className="mt-2 text-2xl  text-slate-900">2.4k</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Every donation reduces waste and creates direct community
                  impact.
                </p>
              </div>
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700 transition-transform duration-300 group-hover:scale-110">
                <Heart
                  size={22}
                  className="fill-emerald-600 text-emerald-600"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Donation List Section */}
        <section className="rounded-[2rem] border border-emerald-100/80 bg-white/85 p-4 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.18)] backdrop-blur-md sm:p-6 lg:p-8">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl  text-slate-900 sm:text-2xl">
                Current Donations
              </h2>
              <p className="mt-1 text-sm text-slate-500 sm:text-base">
                Review, edit, and manage all your listed food donations.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={handleAddClick}
                className="rounded-2xl border border-emerald-600 bg-emerald-600 px-4 py-2 font-bold uppercase tracking-wider text-white shadow-md hover:bg-emerald-700"
              >
                <Plus size={18} className="mr-2" />
                ADD Donation
              </Button>
              <div className="inline-flex items-center gap-2 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800">
                <ShoppingBag size={16} />
                Donation Inventory
              </div>
            </div>
          </div>

          <div className="relative">
            <DonationList
              restaurantId={restaurantId}
              refreshTrigger={refreshKey}
              onEdit={handleEditClick}
            />
          </div>
        </section>

        {/* Impact Banner */}
        <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-green-900 via-emerald-800 to-emerald-600 p-6 text-white shadow-[0_24px_60px_-20px_rgba(6,95,70,0.55)] sm:p-8 lg:rounded-[2.5rem] lg:p-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.10),transparent_30%)]"
          />
          <div
            aria-hidden="true"
            className="absolute -right-10 -bottom-10 opacity-10 transition-transform duration-700 hover:scale-110"
          >
            <ShoppingBag size={220} />
          </div>

          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                <Sparkles size={14} />
                Impact Highlight
              </div>

              <h3 className="text-2xl  sm:text-3xl">
                Surplus food should not become waste
              </h3>

              <p className="mt-3 text-sm leading-7 text-emerald-50/90 sm:text-base">
                Your donations help turn excess food into real support for
                people who need it. That is the whole point. Less waste, more
                value.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:gap-5">
              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <div className="text-3xl  sm:text-4xl">100%</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
                  Safety Tracked
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5 text-center backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:bg-white/15">
                <div className="text-3xl  sm:text-4xl">2.4k</div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.25em] text-emerald-200 sm:text-xs">
                  Meals Saved
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          title={editingDonation ? "Edit Donation" : "ADD Donation"}
        >
          <DirectDonationForm
            initialData={editingDonation}
            onSuccess={handleSuccess}
            restaurantId={restaurantId}
          />
        </Modal>
      </div>
    </div>
  );
};

export default DonateFoodPage;
