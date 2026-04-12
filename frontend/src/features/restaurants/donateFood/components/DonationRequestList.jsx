import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  MapPin,
  Loader2,
  ChevronRight,
  CheckCircle2,
  Smartphone,
  Package,
  HandHeart,
  ShieldCheck,
  Clock3,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "../../../../context/AuthContext";
import Button from "../../../../components/common/Button";
import {
  getDonationRequests,
  approveDonationRequest,
  verifyPickupOTP,
  resendPickupOTP,
} from "../services/restaurantService";
import toast from "react-hot-toast";
import AcceptRequestModal from "./AcceptRequestModal";
import { useSocket } from "../../../../context/SocketContext";
import LoadingState from "../../../../components/common/LoadingState";

const statusConfig = {
  pending: {
    label: "Pending Review",
    chip: "bg-amber-50 text-amber-700 border-amber-200",
    icon: Clock3,
  },
  approved: {
    label: "Approved",
    chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: ShieldCheck,
  },
  delivered: {
    label: "Delivered",
    chip: "bg-slate-100 text-slate-700 border-slate-200",
    icon: CheckCircle2,
  },
  collected: {
    label: "Delivered",
    chip: "bg-slate-100 text-slate-700 border-slate-200",
    icon: CheckCircle2,
  },
  fulfilled: {
    label: "Delivered",
    chip: "bg-slate-100 text-slate-700 border-slate-200",
    icon: CheckCircle2,
  },
};

const RequestCard = React.memo(
  ({ request, onSelectRequest, onVerifyRequest }) => {
    const statusKey = request.status || "pending";
    const currentStatus = statusConfig[statusKey] || {
      label: statusKey,
      chip: "bg-slate-100 text-slate-700 border-slate-200",
      icon: Clock3,
    };

    const StatusIcon = currentStatus.icon;
    const foodName =
      request.food_id?.foodName || request.foodName || "Donation Item";
    const foodBankName =
      request.foodBank_id?.name || request.foodbankName || "Food Bank";
    const address = request.foodBank_id?.address || "Address not available";
    const requestedQuantity = request.requestedQuantity ?? 0;
    const remainingQuantity = request.remainingQuantity ?? requestedQuantity;

    return (
      <article
        className="
        group relative overflow-hidden rounded-[2rem] border border-emerald-100/80 bg-white/95
        p-5 shadow-sm transition-all duration-300 ease-out
        hover:-translate-y-1 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-100/40
        sm:p-6 lg:p-7
      "
      >
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-emerald-50/60 via-white to-green-50/40 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-emerald-100/30 blur-3xl transition-all duration-500 group-hover:scale-125" />

        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-emerald-800">
                  <Package size={14} />
                  Donation Request
                </div>

                <h3 className="text-xl  tracking-tight text-slate-900 sm:text-2xl">
                  {foodName}
                </h3>

                <div className="mt-3 flex flex-wrap items-start gap-2 text-sm text-slate-600">
                  <div className="flex min-w-0 items-center gap-2">
                    <MapPin
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <span className="font-semibold text-slate-900">
                      {foodBankName}
                    </span>
                  </div>
                  <span className="hidden text-slate-300 sm:inline">|</span>
                  <span className="break-words text-slate-500">{address}</span>
                </div>
              </div>

              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-bold ${currentStatus.chip}`}
              >
                <StatusIcon size={14} />
                {currentStatus.label}
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:max-w-xl">
              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4 transition-all duration-300 group-hover:border-emerald-100 group-hover:bg-emerald-50/50">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
                  Requested
                </p>
                <p className="mt-2 text-2xl  text-slate-900">
                  {requestedQuantity}
                  <span className="ml-1 text-sm font-semibold text-slate-500">
                    servings
                  </span>
                </p>
              </div>

              <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4 transition-all duration-300 group-hover:shadow-md group-hover:shadow-emerald-100/40">
                <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-emerald-700/70">
                  Still Needed
                </p>
                <p className="mt-2 text-2xl  text-emerald-700">
                  {remainingQuantity}
                  <span className="ml-1 text-sm font-semibold text-emerald-700/70">
                    servings
                  </span>
                </p>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-[260px] xl:shrink-0">
            <div className="rounded-[1.75rem] border border-slate-100 bg-slate-50/80 p-4 backdrop-blur-sm transition-all duration-300 group-hover:border-emerald-100 group-hover:bg-white">
              <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-600">
                <HandHeart size={16} className="text-emerald-600" />
                Action Panel
              </div>

              {request.status === "pending" ? (
                <Button
                  onClick={() => onSelectRequest(request)}
                  className="
                  group/button w-full cursor-pointer rounded-2xl bg-emerald-600 py-4 text-white shadow-lg shadow-emerald-200/60
                  transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl hover:shadow-emerald-200/80
                  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200
                "
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    Accept & Donate
                    <ChevronRight
                      size={18}
                      className="transition-transform duration-300 group-hover/button:translate-x-1"
                    />
                  </span>
                </Button>
              ) : request.status === "approved" ? (
                <Button
                  onClick={() => onVerifyRequest(request)}
                  className="
                  group/button w-full cursor-pointer rounded-2xl bg-green-800 py-4 text-white shadow-lg shadow-emerald-200/60
                  transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:shadow-xl hover:shadow-emerald-200/80
                  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200
                "
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    Mark as Delivered
                    <CheckCircle2
                      size={18}
                      className="transition-transform duration-300 group-hover/button:scale-110"
                    />
                  </span>
                </Button>
              ) : (
                <div className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-sm font-bold text-slate-600">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  Delivered
                </div>
              )}

              <p className="mt-3 text-center text-xs italic text-slate-400">
                Support your community food bank
              </p>
            </div>
          </div>
        </div>
      </article>
    );
  },
);

RequestCard.displayName = "RequestCard";

const RequestLoadingState = () => {
  return (
    <LoadingState
      title="Loading donation requests"
      message="Please wait while we fetch the latest request activity for your donations."
    />
  );
};

const EmptyState = () => {
  return (
    <div className="overflow-hidden rounded-[2rem] border border-dashed border-emerald-200 bg-gradient-to-br from-white via-emerald-50/50 to-green-50/60 px-6 py-16 text-center shadow-sm">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-emerald-100 text-emerald-700 shadow-lg shadow-emerald-100/60">
        <HandHeart size={36} />
      </div>
      <h3 className="mt-6 text-2xl  tracking-tight text-slate-900">
        No requests for your donations
      </h3>
      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-500 sm:text-base">
        No food banks have requested items from your posted donations yet.
      </p>
    </div>
  );
};

const OtpVerificationModal = ({
  verifyingRequest,
  otpValue,
  setOtpValue,
  handleVerifyOTP,
  handleResendOTP,
  closeModal,
  isVerifying,
  isResending,
}) => {
  if (!verifyingRequest) return null;

  const foodBankName =
    verifyingRequest.foodBank_id?.name ||
    verifyingRequest.foodbankName ||
    "Food Bank";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-300"
      role="dialog"
      aria-modal="true"
      aria-labelledby="otp-modal-title"
    >
      <div
        className="
          relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/40 bg-white
          p-6 shadow-2xl shadow-slate-900/20 animate-in zoom-in-95 duration-300
          sm:p-8
        "
      >
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-emerald-600 via-green-800 to-emerald-600" />
        <div className="absolute -right-14 -top-14 h-32 w-32 rounded-full bg-emerald-100/50 blur-3xl" />

        <div className="relative flex flex-col items-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-gradient-to-br from-emerald-50 to-green-100 text-green-800 shadow-lg shadow-emerald-100/70">
            <Smartphone size={38} />
          </div>

          <h3
            id="otp-modal-title"
            className="mt-6 text-2xl  tracking-tight text-slate-900"
          >
            Verify Pickup
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500 sm:text-base">
            Enter the 6-digit OTP provided by{" "}
            <span className="font-bold text-slate-800">{foodBankName}</span>
          </p>

          <div className="mt-6 w-full">
            <label htmlFor="pickup-otp" className="sr-only">
              Pickup OTP
            </label>
            <input
              id="pickup-otp"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter 6-digit OTP"
              className="
                w-full rounded-[1.5rem] border-2 border-slate-200 bg-slate-50 px-4 py-5 text-center
                text-2xl  tracking-[0.45rem] text-slate-900 outline-none transition-all duration-200
                placeholder:text-base placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-300
                focus:border-emerald-600 focus:bg-white focus:ring-4 focus:ring-emerald-100
              "
            />

            {verifyingRequest.status === "approved" && (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isResending}
                className="
                  mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold
                  text-emerald-700 transition-all duration-200 hover:bg-emerald-50 hover:text-green-800
                  focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-100
                  disabled:cursor-not-allowed disabled:text-slate-400
                "
              >
                {isResending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <RefreshCw size={14} />
                )}
                Resend OTP
              </button>
            )}
          </div>

          <div className="mt-6 flex w-full gap-3">
            <button
              type="button"
              onClick={closeModal}
              className="
                flex-1 cursor-pointer rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-bold text-slate-600
                transition-all duration-200 hover:bg-slate-50 hover:text-slate-800
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200
              "
            >
              Cancel
            </button>

            <Button
              onClick={handleVerifyOTP}
              isLoading={isVerifying}
              className="
                flex-[1.6] rounded-2xl bg-emerald-600 py-3.5 text-white shadow-lg shadow-emerald-200/70
                transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-800 hover:shadow-xl
                focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200
              "
            >
              Complete Delivery
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const DonationRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [verifyingRequest, setVerifyingRequest] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const { user } = useAuth();
  const { socket } = useSocket();

  const restaurantId = useMemo(() => user?.id || user?._id || null, [user]);

  const fetchRequests = useCallback(async () => {
    if (!restaurantId) {
      toast.error("Missing restaurant id");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await getDonationRequests(restaurantId);
      setRequests(data.requests || data || []);
    } catch {
      toast.error("Failed to load donation requests");
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  useEffect(() => {
    if (!socket) return;

    const handler = () => {
      fetchRequests();
    };

    socket.on("new_food_request", handler);
    socket.on("donation_updated", handler);
    socket.on("request_accepted", handler);
    socket.on("request_rejected", handler);

    return () => {
      socket.off("new_food_request", handler);
      socket.off("donation_updated", handler);
      socket.off("request_accepted", handler);
      socket.off("request_rejected", handler);
    };
  }, [socket, fetchRequests]);

  const handleOpenAcceptModal = useCallback((request) => {
    setSelectedRequest(request);
  }, []);

  const handleOpenVerifyModal = useCallback((request) => {
    setVerifyingRequest(request);
  }, []);

  const handleCloseVerifyModal = useCallback(() => {
    setVerifyingRequest(null);
    setOtpValue("");
  }, []);

  const handleResendOTP = useCallback(async () => {
    if (!verifyingRequest?.pickup_id) return;

    setIsResending(true);
    try {
      await resendPickupOTP(
        verifyingRequest.pickup_id._id || verifyingRequest.pickup_id,
      );
      toast.success("New OTP generated! Please contact the food bank.");
      setOtpValue("");
    } catch {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  }, [verifyingRequest]);

  const handleVerifyOTP = useCallback(async () => {
    if (!otpValue || otpValue.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!verifyingRequest?.pickup_id) {
      toast.error("Pickup information is missing");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyPickupOTP(
        verifyingRequest.pickup_id._id || verifyingRequest.pickup_id,
        otpValue,
      );
      toast.success("Delivery verified successfully!");
      setVerifyingRequest(null);
      setOtpValue("");
      fetchRequests();
    } catch (error) {
      const msg =
        error.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  }, [otpValue, verifyingRequest, fetchRequests]);

  if (isLoading) {
    return <RequestLoadingState />;
  }

  if (requests.length === 0) {
    return <EmptyState />;
  }

  return (
    <>
      <section
        className="space-y-5 sm:space-y-6"
        aria-label="Donation requests"
      >
        {requests.map((request) => (
          <RequestCard
            key={request._id || request.requestId}
            request={request}
            onSelectRequest={handleOpenAcceptModal}
            onVerifyRequest={handleOpenVerifyModal}
          />
        ))}
      </section>

      {selectedRequest && (
        <AcceptRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={() => {
            setSelectedRequest(null);
            fetchRequests();
          }}
          onAccept={async (id, qty) => approveDonationRequest(id, qty)}
          showQuantity={false}
        />
      )}

      <OtpVerificationModal
        verifyingRequest={verifyingRequest}
        otpValue={otpValue}
        setOtpValue={setOtpValue}
        handleVerifyOTP={handleVerifyOTP}
        handleResendOTP={handleResendOTP}
        closeModal={handleCloseVerifyModal}
        isVerifying={isVerifying}
        isResending={isResending}
      />
    </>
  );
};

export default DonationRequestList;
