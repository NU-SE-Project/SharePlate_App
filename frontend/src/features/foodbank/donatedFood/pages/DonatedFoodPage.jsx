import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Heart,
  Loader2,
  Info,
  ArrowUpRight,
  Bell,
  HandHeart,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import AvailableFoodTab from "../components/AvailableFoodTab";
import MyRequestsTab from "../components/MyRequestsTab";
import Modal from "../../../../components/common/Modal";
import Input from "../../../../components/common/Input";
import Button from "../../../../components/common/Button";
import { requestFoodDonation } from "../../services/foodbankService";
import toast from "react-hot-toast";
import { useAuth } from "../../../../context/AuthContext";
import { displayImage } from "../../../../utils/displayImage";

const TABS = [
  {
    key: "available",
    label: "Available Donations",
    shortLabel: "Available",
    title: "Browse food shared by restaurants",
    description:
      "Review available donations, filter quickly, and request what your community can use right now.",
    icon: ShoppingBag,
  },
  {
    key: "requested",
    label: "My Requests",
    shortLabel: "Requests",
    title: "Track requests you have already submitted",
    description:
      "Monitor pending approvals, accepted pickups, and recent request activity in one place.",
    icon: ClipboardList,
  },
];

const DonatedFoodPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "available";
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState("");
  const [isRequesting, setIsRequesting] = useState(false);

  const auth = useAuth();
  const userFromCtx = auth?.user;
  const foodBankId = userFromCtx?.id || userFromCtx?._id || null;

  useEffect(() => {
    if (!foodBankId) {
      toast.error("Please login as a food bank to request donations");
    }
  }, [foodBankId]);

  const activeTabData = useMemo(
    () => TABS.find((tab) => tab.key === activeTab) || TABS[0],
    [activeTab],
  );

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleOpenRequest = (donation) => {
    setSelectedDonation(donation);
    setRequestQuantity(donation.remainingQuantity.toString());
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestQuantity || requestQuantity <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }
    if (Number(requestQuantity) > selectedDonation.remainingQuantity) {
      toast.error(
        `Only ${selectedDonation.remainingQuantity} servings available`,
      );
      return;
    }

    setIsRequesting(true);
    try {
      if (!foodBankId) throw new Error("Missing food bank identity");
      if (!selectedDonation?.restaurant_id) {
        throw new Error("Missing restaurant id on donation");
      }
      const payload = {
        restaurant_id:
          selectedDonation.restaurant_id?._id || selectedDonation.restaurant_id,
        foodBank_id: foodBankId,
        requestedQuantity: Number(requestQuantity),
      };
      await requestFoodDonation(selectedDonation._id, payload);
      toast.success("Your request has been submitted to the restaurant!");
      setIsModalOpen(false);
      handleTabChange("requested");
    } catch (error) {
      console.error(
        "Request submission failed",
        error.response?.data || error.message || error,
      );
      toast.error(error.response?.data?.message || "Failed to submit request");
    } finally {
      setIsRequesting(false);
    }
  };

  const ActiveIcon = activeTabData.icon;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-green-100/60 shadow-[0_10px_40px_rgba(16,185,129,0.08)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-green-200/30 blur-2xl" />
        </div>

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm sm:h-14 sm:w-14">
                <Heart size={24} className="fill-emerald-600 text-emerald-600" />
              </div>

              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 sm:text-sm">
                  <Sparkles size={14} />
                  Community Support Hub
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Food Donations
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  Browse real-time donations from nearby restaurants and manage
                  your food requests with the same workflow and visual language
                  used across the platform.
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
                      Live Donation Feed
                    </p>
                    <p className="text-xs text-slate-500">
                      Updated restaurant listings
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Keep track of available meals, accepted requests, and pickup
                  progress without switching contexts.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  handleTabChange(
                    activeTab === "available" ? "requested" : "available",
                  )
                }
                className="group rounded-2xl border border-emerald-700 bg-gradient-to-r from-emerald-600 to-green-800 p-4 text-left text-white shadow-[0_12px_30px_rgba(22,163,74,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(22,163,74,0.34)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                      <HandHeart size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">
                        {activeTab === "available"
                          ? "View My Requests"
                          : "Browse Donations"}
                      </p>
                      <p className="text-xs text-emerald-100">
                        Switch the current workspace
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-50">
                      {activeTab === "available"
                        ? "Open request tracker"
                        : "Open donation feed"}
                    </span>
                    <ShoppingBag
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

      <section className="mt-8 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                Donation Workspace
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Switch between live restaurant donations and the requests you
                have already submitted.
              </p>
            </div>

            <div
              className="inline-flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-2 sm:w-auto sm:flex-row"
              role="tablist"
              aria-label="Food donation tabs"
            >
              {TABS.map((tab) => {
                const isActive = activeTab === tab.key;
                const Icon = tab.icon;

                return (
                  <button
                    key={tab.key}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`${tab.key}-panel`}
                    id={`${tab.key}-tab`}
                    onClick={() => handleTabChange(tab.key)}
                    className={`group inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:min-w-[200px] ${
                      isActive
                        ? "bg-gradient-to-r from-emerald-600 to-green-800 text-white shadow-lg shadow-emerald-100"
                        : "bg-transparent text-slate-600 hover:bg-white hover:text-emerald-700"
                    }`}
                  >
                    <Icon
                      size={18}
                      className={`transition-transform duration-300 ${
                        isActive ? "scale-100" : "group-hover:scale-105"
                      }`}
                    />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.shortLabel}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-green-50/70 px-4 py-5 sm:px-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                <ActiveIcon size={22} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                  {activeTabData.title}
                </h3>
                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                  {activeTabData.description}
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </span>
              Updated and ready for action
            </div>
          </div>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <div
            id={`${activeTab}-panel`}
            role="tabpanel"
            aria-labelledby={`${activeTab}-tab`}
            className="animate-in fade-in zoom-in-95 duration-300"
          >
            {activeTab === "available" ? (
              <AvailableFoodTab onRequest={handleOpenRequest} />
            ) : (
              <MyRequestsTab foodBankId={foodBankId} />
            )}
          </div>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Secure Food Donation"
      >
        {selectedDonation && (
          <form onSubmit={handleSubmitRequest} className="space-y-8">
            <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white p-6 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="h-20 w-20 overflow-hidden rounded-2xl bg-white shadow-md">
                  <img
                    src={displayImage(selectedDonation)}
                    alt={selectedDonation.foodName}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <h4 className="text-xl font-bold text-slate-900">
                    {selectedDonation.foodName}
                  </h4>
                  <p className="font-medium text-slate-500">
                    Available:{" "}
                    <span className="text-emerald-600">
                      {selectedDonation.remainingQuantity}
                    </span>{" "}
                    servings
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="How many servings do you need?"
                type="number"
                placeholder="Enter quantity"
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(e.target.value)}
                min="1"
                max={selectedDonation.remainingQuantity}
                icon={<Info size={18} />}
              />
              <p className="flex items-center gap-2 px-2 text-xs font-medium text-slate-400">
                <ArrowUpRight size={14} className="text-emerald-500" />
                Wait for restaurant approval to finalize pickup.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                variant="outline"
                className="flex-1 border-slate-200 py-4 font-bold"
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="flex-[1.4] py-4 font-bold shadow-xl shadow-emerald-200"
                disabled={isRequesting}
                type="submit"
              >
                {isRequesting ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  "Confirm Request"
                )}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DonatedFoodPage;
