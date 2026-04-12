import React, { useState, useEffect, useMemo, memo, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import {
  ChevronLeft,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
  Bell,
  HandHeart,
  ArrowRight,
  Sparkles,
  PackageOpen,
  Smartphone,
  ShieldCheck,
  Clock3,
  CircleSlash,
} from "lucide-react";
import {
  getSingleDonation,
  getRequestsForDonation,
  approveDonationRequest,
  rejectDonationRequest,
  verifyPickupOTP,
  resendPickupOTP,
} from "../services/restaurantService";
import toast from "react-hot-toast";
import Modal from "../../../../components/common/Modal";
import Button from "../../../../components/common/Button";
import LoadingState from "../../../../components/common/LoadingState";

// ─────────────────────────────────────────────────────────────────────────────
// Small UI Helpers
// ─────────────────────────────────────────────────────────────────────────────
const StatusBadge = memo(({ status }) => {
  const styles = {
    pending: "bg-amber-100 text-amber-700 border border-amber-200",
    approved: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    rejected: "bg-red-100 text-red-700 border border-red-200",
    collected: "bg-green-100 text-green-800 border border-green-200",
    available: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    unavailable: "bg-slate-100 text-slate-600 border border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${styles[status] || "bg-slate-100 text-slate-700 border border-slate-200"}`}
    >
      {status}
    </span>
  );
});

const StatCard = memo(({ label, value, icon: Icon, tone }) => {
  const toneStyles = {
    neutral: {
      wrap: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-600",
      value: "text-slate-900",
    },
    pending: {
      wrap: "border-amber-200 bg-amber-50/70",
      icon: "bg-amber-100 text-amber-700",
      value: "text-amber-700",
    },
    approved: {
      wrap: "border-emerald-200 bg-emerald-50/80",
      icon: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-700",
    },
    rejected: {
      wrap: "border-red-200 bg-red-50/80",
      icon: "bg-red-100 text-red-700",
      value: "text-red-700",
    },
  };

  return (
    <div
      className={`group rounded-3xl border p-4 sm:p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${toneStyles[tone].wrap}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            {label}
          </p>
          <p
            className={`mt-2 text-3xl  sm:text-4xl ${toneStyles[tone].value}`}
          >
            {value}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${toneStyles[tone].icon}`}
        >
          {React.createElement(Icon, { size: 20 })}
        </div>
      </div>
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// Request Row
// ─────────────────────────────────────────────────────────────────────────────
const RequestRow = memo(({ request, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);

  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const isPending = request.status === "pending";
  const isApproved = request.status === "approved";
  const isRejected = request.status === "rejected";
  const isDelivered = request.status === "collected";

  const rowStyle = useMemo(() => {
    if (isApproved) return "border-emerald-200 bg-emerald-50/80";
    if (isRejected) return "border-red-200 bg-red-50/80";
    if (isDelivered) return "border-green-200 bg-green-50/80";
    return "border-slate-200 bg-white hover:border-emerald-200 hover:shadow-md";
  }, [isApproved, isRejected, isDelivered]);

  const pickupId = request.pickup_id?._id || request.pickup_id;

  const handleStatusUpdate = useCallback(
    async (status) => {
      setIsUpdating(true);
      try {
        if (status === "approved") {
          await approveDonationRequest(request._id, request.requestedQuantity);
          toast.success("Request accepted successfully");
        } else if (status === "rejected") {
          await rejectDonationRequest(request._id);
          toast.success("Request rejected successfully");
        }

        onUpdateStatus(request._id, status);
      } catch (error) {
        toast.error(
          error.response?.data?.message || `Failed to ${status} request`,
        );
      } finally {
        setIsUpdating(false);
      }
    },
    [request._id, request.requestedQuantity, onUpdateStatus],
  );

  const handleResendOTP = useCallback(async () => {
    if (!pickupId) return;

    setIsResending(true);
    try {
      await resendPickupOTP(pickupId);
      toast.success("New OTP generated! Please contact the food bank.");
      setOtpValue("");
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [pickupId]);

  const handleVerifyOTP = useCallback(async () => {
    if (!otpValue || otpValue.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!pickupId) {
      toast.error("Pickup information not found");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyPickupOTP(pickupId, otpValue);
      toast.success("Delivery verified successfully!");
      setIsVerifyingModalOpen(false);
      setOtpValue("");
      onUpdateStatus(request._id, "collected");
    } catch (error) {
      const msg =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  }, [otpValue, pickupId, request._id, onUpdateStatus]);

  return (
    <>
      <div
        className={`group rounded-[1.75rem] border p-4 sm:p-5 transition-all duration-300 hover:-translate-y-0.5 ${rowStyle}`}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="min-w-0">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Food Bank
              </span>
              <p className="truncate text-sm font-semibold text-slate-800 sm:text-base">
                {request.foodBank_id?.name || "Unknown Food Bank"}
              </p>
            </div>

            <div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Requested Qty
              </span>
              <p className="text-lg  text-slate-900">
                {request.requestedQuantity}
              </p>
            </div>

            <div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Current Status
              </span>
              <StatusBadge status={request.status} />
            </div>

            <div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Action State
              </span>
              <p className="text-sm font-semibold text-slate-600">
                {isPending && "Awaiting decision"}
                {isApproved && "Ready for OTP verification"}
                {isRejected && "Request closed"}
                {isDelivered && "Pickup completed"}
              </p>
            </div>
          </div>

          {isPending && (
            <div className="flex flex-col gap-3 sm:flex-row lg:ml-6">
              <button
                type="button"
                onClick={() => {
                  setActionType("approved");
                  setIsConfirmModalOpen(true);
                }}
                disabled={isUpdating}
                className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCircle size={16} />
                )}
                Accept
              </button>

              <button
                type="button"
                onClick={() => {
                  setActionType("rejected");
                  setIsConfirmModalOpen(true);
                }}
                disabled={isUpdating}
                className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition-all duration-300 hover:-translate-y-0.5 hover:border-red-200 hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <XCircle size={16} />
                )}
                Reject
              </button>
            </div>
          )}

          {isApproved && (
            <div className="lg:ml-6">
              <button
                type="button"
                onClick={() => setIsVerifyingModalOpen(true)}
                className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-green-800 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-green-100 transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.01] hover:bg-green-900 focus:outline-none focus:ring-4 focus:ring-green-200"
              >
                <ShieldCheck size={16} />
                Mark as Delivered
              </button>
            </div>
          )}
        </div>
      </div>

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={`Confirm ${actionType === "approved" ? "Acceptance" : "Rejection"}`}
      >
        <div className="flex flex-col gap-6">
          <p className="text-base leading-7 text-slate-600 sm:text-lg">
            Are you sure you want to{" "}
            <span className="font-semibold text-slate-900">
              {actionType === "approved" ? "accept" : "reject"}
            </span>{" "}
            the request from{" "}
            <span className="font-semibold text-slate-900">
              {request.foodBank_id?.name || "Unknown Food Bank"}
            </span>{" "}
            for{" "}
            <span className="font-semibold text-slate-900">
              {request.requestedQuantity}
            </span>{" "}
            portions?
          </p>

          <div
            className={`flex items-start gap-3 rounded-2xl border p-4 ${
              actionType === "approved"
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-red-200 bg-red-50 text-red-700"
            }`}
          >
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <p className="text-sm font-semibold leading-6">
              {actionType === "approved"
                ? "By accepting, you confirm that this donation can be prepared for pickup. The requester will be notified immediately."
                : "This request will be closed and the requester will be notified. Make sure this decision is correct before continuing."}
            </p>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isUpdating}
              className="inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-2xl bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-60"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => {
                setIsConfirmModalOpen(false);
                handleStatusUpdate(actionType);
              }}
              disabled={isUpdating}
              className={`inline-flex min-h-[48px] cursor-pointer items-center justify-center rounded-2xl px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-4 disabled:opacity-60 ${
                actionType === "approved"
                  ? "bg-emerald-600 shadow-emerald-100 hover:bg-emerald-700 focus:ring-emerald-200"
                  : "bg-red-600 shadow-red-100 hover:bg-red-700 focus:ring-red-200"
              }`}
            >
              Yes, {actionType === "approved" ? "Accept" : "Reject"}
            </button>
          </div>
        </div>
      </Modal>

      {isVerifyingModalOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-md animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pickup-otp-title"
        >
          <div className="w-full max-w-md rounded-[2rem] border border-white/20 bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-300 sm:p-8">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-100">
                <Smartphone size={38} />
              </div>

              <h3
                id="pickup-otp-title"
                className="mt-5 text-2xl  tracking-tight text-slate-900"
              >
                Verify Pickup OTP
              </h3>

              <p className="mt-2 text-sm font-medium leading-6 text-slate-500 sm:text-base">
                Enter the 6-digit code provided by{" "}
                <span className="font-semibold text-slate-700">
                  {request.foodBank_id?.name || "the food bank"}
                </span>
              </p>

              <div className="mt-6 w-full space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  value={otpValue}
                  onChange={(e) =>
                    setOtpValue(e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="Enter OTP"
                  aria-label="Enter pickup OTP"
                  className="w-full rounded-3xl border-2 border-slate-200 bg-slate-50 px-5 py-4 text-center text-2xl  tracking-[0.5em] text-slate-900 outline-none transition-all duration-300 placeholder:text-base placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-300 focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100 sm:text-3xl"
                />

                {request.status === "approved" && (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isResending}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-100 focus:outline-none focus:ring-4 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isResending ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    Resend OTP
                  </button>
                )}

                <div className="flex flex-col-reverse gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => {
                      setIsVerifyingModalOpen(false);
                      setOtpValue("");
                    }}
                    className="inline-flex min-h-[48px] flex-1 cursor-pointer items-center justify-center rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-600 transition-all duration-300 hover:bg-slate-200 focus:outline-none focus:ring-4 focus:ring-slate-200"
                  >
                    Cancel
                  </button>

                  <Button
                    onClick={handleVerifyOTP}
                    isLoading={isVerifying}
                    className="min-h-[48px] flex-[1.2] rounded-2xl bg-green-800 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-green-100 transition-all duration-300 hover:bg-green-900 focus:ring-4 focus:ring-green-200"
                  >
                    Complete Delivery
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
});

RequestRow.displayName = "RequestRow";
StatusBadge.displayName = "StatusBadge";
StatCard.displayName = "StatCard";

// ─────────────────────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────────────────────
const SingleDonationRequestsPage = () => {
  const { donationId } = useParams();
  useAuth();

  const [donation, setDonation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!donationId) return;

    setIsLoading(true);
    try {
      const [donationRes, requestsRes] = await Promise.allSettled([
        getSingleDonation(donationId),
        getRequestsForDonation(donationId),
      ]);

      if (donationRes.status === "fulfilled") {
        setDonation(donationRes.value);
      } else {
        console.error("Donation fetch failed:", donationRes.reason);
      }

      if (requestsRes.status === "fulfilled") {
        const reqs = Array.isArray(requestsRes.value)
          ? requestsRes.value
          : requestsRes.value?.requests || [];
        setRequests(reqs);
      } else {
        console.error("Requests fetch failed:", requestsRes.reason);
        toast.error("Failed to load requests");
      }
    } catch {
      toast.error("Failed to load data");
    } finally {
      setIsLoading(false);
    }
  }, [donationId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleUpdateRequestStatus = useCallback(
    (requestId, newStatus) => {
      setRequests((prev) =>
        prev.map((r) =>
          r._id === requestId ? { ...r, status: newStatus } : r,
        ),
      );

      if (newStatus === "approved") {
        fetchData();
      }
    },
    [fetchData],
  );

  const imageBase = useMemo(
    () =>
      import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "") ||
      "http://localhost:5000",
    [],
  );

  const imageUrl = useMemo(() => {
    if (!donation?.imageUrl) return null;
    return donation.imageUrl.startsWith("/")
      ? imageBase + donation.imageUrl
      : donation.imageUrl;
  }, [donation?.imageUrl, imageBase]);

  const stats = useMemo(() => {
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const rejected = requests.filter((r) => r.status === "rejected").length;

    return {
      total: requests.length,
      pending,
      approved,
      rejected,
    };
  }, [requests]);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading donation requests"
        message="Please wait while we fetch the latest request data for this donation."
        minHeightClassName="min-h-[65vh]"
        panelClassName="border-0 bg-transparent shadow-none"
      />
    );
  }

  if (!donation) {
    return (
      <div className="flex min-h-[65vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
            <AlertCircle size={30} />
          </div>
          <h2 className="mt-5 text-2xl  text-slate-900">
            Donation not found
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            The donation may have been removed or the link is invalid.
          </p>
          <Link
            to="/restaurant/donate"
            className="mt-6 inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-200"
          >
            Back to Donations
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50/40 via-white to-white">
      <div className="mx-auto max-w-6xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="relative mb-8 overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-green-100/60 shadow-[0_10px_40px_rgba(16,185,129,0.08)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-green-200/30 blur-2xl" />
          </div>

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <Link
                  to="/restaurant/donate"
                  className="group inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-emerald-100 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-x-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:h-12 sm:w-12"
                  aria-label="Back to donations"
                >
                  <ChevronLeft
                    size={22}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </Link>

                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 sm:text-sm">
                    <Sparkles size={14} />
                    Donation Requests
                  </div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    Manage Incoming Requests
                  </h1>
                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                    Review food bank requests, approve or reject them, and
                    verify pickups using OTP before marking delivery as
                    completed.
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
                        Request Queue
                      </p>
                      <p className="text-xs text-slate-500">
                        Approvals and OTP tracking
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Process incoming requests with clearer status visibility and
                    delivery verification.
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
                        <p className="text-sm font-semibold">Back to Donate</p>
                        <p className="text-xs text-emerald-100">
                          Review all your donation listings
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-50">
                        Open donation page
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

        {/* Donation Summary */}
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-r from-green-800 via-emerald-700 to-emerald-600 p-6 sm:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                  Donation Overview
                </p>
                <h2 className="mt-2 text-2xl  tracking-tight text-white sm:text-3xl">
                  {donation.foodName}
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white ring-1 ring-white/20">
                    {donation.foodType}
                  </span>
                  <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white ring-1 ring-white/20">
                    {donation.status}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-[1.5rem] bg-white/10 px-4 py-4 backdrop-blur-sm ring-1 ring-white/15">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={donation.foodName}
                    className="h-20 w-20 rounded-2xl object-cover ring-2 ring-white/20"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/15 text-white ring-1 ring-white/20">
                    <PackageOpen size={30} />
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-100">
                    Remaining Quantity
                  </p>
                  <div className="mt-1 flex items-end gap-2">
                    <span className="text-3xl  text-white">
                      {donation.remainingQuantity}
                    </span>
                    <span className="pb-1 text-sm font-semibold text-emerald-100">
                      / {donation.totalQuantity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-4 sm:p-8">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Food Item
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {donation.foodName}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Food Type
              </p>
              <p className="mt-2 text-base font-semibold capitalize text-slate-900">
                {donation.foodType}
              </p>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Availability
              </p>
              <div className="mt-2">
                <StatusBadge status={donation.status} />
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                Requested By
              </p>
              <p className="mt-2 text-base font-semibold text-slate-900">
                {requests.length} food banks
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            label="Total"
            value={stats.total}
            icon={PackageOpen}
            tone="neutral"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={Clock3}
            tone="pending"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={CheckCircle}
            tone="approved"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={CircleSlash}
            tone="rejected"
          />
        </section>

        {/* Requests */}
        <section className="mt-10">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl  tracking-tight text-slate-900">
                All Requests
              </h2>
              <p className="mt-1 text-sm font-medium text-slate-500">
                Approve valid requests and complete delivery only after OTP
                verification.
              </p>
            </div>
          </div>

          {requests.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400">
                <AlertCircle size={28} />
              </div>
              <h3 className="mt-5 text-xl  text-slate-900">
                No requests yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                No food banks have requested this donation yet. Once a request
                is submitted, it will appear here for review.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <RequestRow
                  key={request._id}
                  request={request}
                  onUpdateStatus={handleUpdateRequestStatus}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default SingleDonationRequestsPage;
