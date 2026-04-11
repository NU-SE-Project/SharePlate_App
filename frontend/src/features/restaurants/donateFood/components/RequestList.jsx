import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Loader2,
  MapPin,
  CheckCircle,
  Smartphone,
  Filter,
  ChevronRight,
  HandHeart,
  PackageCheck,
  Clock3,
  UtensilsCrossed,
  SearchX,
} from "lucide-react";
import Button from "../../../../components/common/Button";
import {
  getAllOpenRequests,
  verifyPickupOTP,
  resendPickupOTP,
} from "../services/restaurantService";
import toast from "react-hot-toast";
import AcceptRequestModal from "./AcceptRequestModal";
import { useSocket } from "../../../../context/SocketContext";
import { useAuth } from "../../../../context/AuthContext";
import { calculateDistance } from "../../../../utils/distance";

const DISTANCE_OPTIONS = [
  { label: "All", value: "all" },
  { label: "2 km", value: "2" },
  { label: "5 km", value: "5" },
  { label: "10 km", value: "10" },
];

const RequestList = () => {
  const { user } = useAuth();
  const { socket } = useSocket();

  const currentRestaurantId = user?.id || user?._id || null;

  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState("all");

  const [verifyingAcceptance, setVerifyingAcceptance] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAllOpenRequests();
      setRequests(data?.requests || []);
    } catch (error) {
      toast.error("Failed to load food bank requests");
    } finally {
      setIsLoading(false);
    }
  }, []);

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

  const handleResendOTP = async () => {
    if (!verifyingAcceptance) return;

    setIsResending(true);
    try {
      await resendPickupOTP(
        verifyingAcceptance.pickup_id?._id || verifyingAcceptance.pickup_id,
      );
      toast.success("New OTP generated! Please contact the food bank.");
      setOtpValue("");
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (!verifyingAcceptance) return;

    setIsVerifying(true);
    try {
      await verifyPickupOTP(
        verifyingAcceptance.pickup_id?._id || verifyingAcceptance.pickup_id,
        otpValue,
      );
      toast.success("Delivery verified successfully!");
      setVerifyingAcceptance(null);
      setOtpValue("");
      fetchRequests();
    } catch (error) {
      const msg =
        error?.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const processedRequests = useMemo(() => {
    return requests.map((req) => {
      const distance = calculateDistance(
        user?.location?.coordinates,
        req?.foodbank_id?.location?.coordinates,
      );

      return { ...req, distance };
    });
  }, [requests, user?.location?.coordinates]);

  const filteredRequests = useMemo(() => {
    let result = [...processedRequests];

    if (distanceFilter !== "all") {
      const maxDist = parseFloat(distanceFilter);
      result = result.filter(
        (req) => req.distance !== null && req.distance <= maxDist,
      );
    }

    result.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [processedRequests, distanceFilter]);

  const stats = useMemo(() => {
    const totalRequests = processedRequests.length;
    const nearbyCount = processedRequests.filter(
      (req) => req.distance !== null && req.distance <= 5,
    ).length;
    const totalNeeded = processedRequests.reduce(
      (sum, req) => sum + (req.remainingQuantity || 0),
      0,
    );

    return { totalRequests, nearbyCount, totalNeeded };
  }, [processedRequests]);

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-emerald-100 bg-white/80 px-6 py-16 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 shadow-lg shadow-emerald-100/60">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Loading donation requests
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Fetching the latest requests from nearby food banks.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-dashed border-emerald-200 bg-gradient-to-br from-white via-emerald-50/40 to-green-50/60 px-6 py-16 text-center shadow-sm">
        <div className="mx-auto flex max-w-md flex-col items-center">
          <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-emerald-100 text-emerald-700 shadow-lg shadow-emerald-100/70">
            <SearchX size={38} />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
            No active requests nearby
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            There are currently no open food bank requests. Check back later for
            new donation opportunities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <section className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-green-800 via-emerald-700 to-emerald-600 text-white shadow-xl shadow-emerald-200/50">
        <div className="grid gap-6 px-5 py-6 sm:px-6 lg:grid-cols-[1.35fr_0.9fr] lg:px-8 lg:py-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] backdrop-blur-sm">
              <HandHeart size={14} />
              Community donation requests
            </div>

            <div>
              <h1 className="text-2xl  tracking-tight sm:text-3xl">
                Support nearby food banks faster
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
                View real-time food requests, filter by distance, and accept
                donations with a clean pickup verification flow.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2.5">
                  <UtensilsCrossed size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
                    Open requests
                  </p>
                  <p className="text-2xl ">{stats.totalRequests}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2.5">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
                    Within 5 km
                  </p>
                  <p className="text-2xl ">{stats.nearbyCount}</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white/10 p-2.5">
                  <PackageCheck size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-100">
                    Still needed
                  </p>
                  <p className="text-2xl ">{stats.totalNeeded}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filter bar */}
      <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-700">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="text-sm  uppercase tracking-wide text-slate-900">
                Distance filter
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Narrow requests by how far the food bank is from your location.
              </p>
            </div>
          </div>

          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter requests by distance"
          >
            {DISTANCE_OPTIONS.map((opt) => {
              const isActive = distanceFilter === opt.value;

              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setDistanceFilter(opt.value)}
                  className={`group inline-flex cursor-pointer items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-bold transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${
                    isActive
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:-translate-y-0.5"
                      : "border-slate-200 bg-white text-slate-600 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                  aria-pressed={isActive}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {filteredRequests.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
              <MapPin size={30} />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              No requests found
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              {distanceFilter === "all"
                ? "There are currently no food requests from food banks."
                : `There are no requests within ${distanceFilter} km of your location.`}
            </p>

            {distanceFilter !== "all" && (
              <button
                type="button"
                onClick={() => setDistanceFilter("all")}
                className="mt-5 inline-flex cursor-pointer items-center rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200"
              >
                Show all requests
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredRequests.map((request) => {
            const myAcceptance = request.acceptances?.find(
              (a) =>
                (a.restaurant_id?._id || a.restaurant_id) ===
                currentRestaurantId,
            );

            const acceptedQuantity =
              request.acceptedTotal ??
              request.requestedQuantity - request.remainingQuantity;

            const progress = request.requestedQuantity
              ? Math.min(
                  100,
                  Math.max(
                    0,
                    ((request.requestedQuantity - request.remainingQuantity) /
                      request.requestedQuantity) *
                      100,
                  ),
                )
              : 0;

            const isCompleted =
              request.status === "fulfilled" ||
              request.status === "delivered" ||
              request.remainingQuantity === 0;

            return (
              <article
                key={request._id}
                className="group relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-100/60"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-800 via-emerald-600 to-emerald-400" />

                <div className="p-5 sm:p-6 lg:p-7">
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-5 flex flex-wrap items-center gap-2.5">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px]  uppercase tracking-wider ${
                            request.foodType === "veg"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-orange-100 text-orange-700"
                          }`}
                        >
                          {request.foodType}
                        </span>

                        <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-600">
                          <Clock3 size={12} />
                          Posted on{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </span>

                        {myAcceptance && (
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[11px]  uppercase tracking-wider ${
                              myAcceptance.status === "delivered"
                                ? "bg-emerald-600 text-white"
                                : "bg-blue-600 text-white"
                            }`}
                          >
                            {myAcceptance.status === "delivered"
                              ? "Your donation delivered"
                              : "You accepted this"}
                          </span>
                        )}
                      </div>

                      <div className="mb-5">
                        <h3 className="text-2xl  tracking-tight text-slate-900 sm:text-[1.75rem]">
                          {request.foodName}
                        </h3>

                        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                          <div className="inline-flex min-w-0 items-center gap-2">
                            <MapPin
                              size={16}
                              className="shrink-0 text-emerald-600"
                            />
                            <span className="font-bold text-slate-900">
                              {request.foodbank_id?.name ||
                                (typeof request.foodbank_id === "string"
                                  ? `Food Bank ${request.foodbank_id.slice(-4)}`
                                  : "Local Food Bank")}
                            </span>
                          </div>

                          {request.foodbank_id?.address && (
                            <span className="break-words text-slate-500">
                              • {request.foodbank_id.address}
                            </span>
                          )}

                          {request.distance !== null && (
                            <span
                              className={`inline-flex items-center rounded-xl px-2.5 py-1 text-[11px]  ${
                                request.distance <= 2
                                  ? "bg-emerald-100 text-emerald-800"
                                  : request.distance <= 5
                                    ? "bg-green-100 text-green-800"
                                    : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {request.distance} km away
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all duration-300 group-hover:border-emerald-100 group-hover:bg-emerald-50/40">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Requested
                          </p>
                          <p className="mt-2 text-2xl  text-slate-900">
                            {request.requestedQuantity}
                          </p>
                          <p className="text-xs text-slate-500">servings</p>
                        </div>

                        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all duration-300 group-hover:border-emerald-100 group-hover:bg-emerald-50/40">
                          <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                            Accepted
                          </p>
                          <p className="mt-2 text-2xl  text-slate-900">
                            {acceptedQuantity}
                          </p>
                          <p className="text-xs text-slate-500">servings</p>
                        </div>

                        <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4 transition-all duration-300 group-hover:shadow-md group-hover:shadow-emerald-100/60">
                          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                            Still needed
                          </p>
                          <p className="mt-2 text-2xl  text-emerald-700">
                            {request.remainingQuantity}
                          </p>
                          <p className="text-xs text-emerald-700/80">
                            servings
                          </p>
                        </div>
                      </div>

                      {request.acceptances &&
                        request.acceptances.length > 0 && (
                          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                            <h4 className="mb-3 text-sm  uppercase tracking-wide text-slate-700">
                              Accepted by
                            </h4>

                            <ul className="space-y-2">
                              {request.acceptances.map((a) => (
                                <li
                                  key={a._id}
                                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-3 py-2.5 text-sm text-slate-700 ring-1 ring-slate-100"
                                >
                                  <span className="font-medium">
                                    <span className="font-bold text-slate-900">
                                      {a.restaurant_id?.name || "Restaurant"}
                                    </span>{" "}
                                    • {a.acceptedQuantity} servings
                                  </span>

                                  {a.status === "delivered" && (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px]  uppercase tracking-wide text-emerald-700">
                                      <CheckCircle size={12} />
                                      Delivered
                                    </span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </div>

                    <div className="w-full xl:max-w-[290px]">
                      <div className="rounded-[1.75rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/60 p-5 shadow-sm transition-all duration-300 group-hover:shadow-lg group-hover:shadow-emerald-100/50">
                        <div className="mb-4 flex items-center justify-between">
                          <span className="text-sm  text-slate-800">
                            Progress
                          </span>
                          <span className="text-sm font-bold text-emerald-700">
                            {Math.round(progress)}%
                          </span>
                        </div>

                        <div className="mb-5 h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-800 via-emerald-600 to-emerald-400 transition-all duration-1000 ease-out"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {myAcceptance && myAcceptance.status === "pending" ? (
                          <Button
                            onClick={() => setVerifyingAcceptance(myAcceptance)}
                            className="w-full cursor-pointer rounded-2xl bg-blue-600 py-4 text-sm font-bold shadow-xl shadow-blue-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
                          >
                            Mark as Delivered
                            <CheckCircle className="ml-2" size={18} />
                          </Button>
                        ) : request.status === "open" &&
                          request.remainingQuantity > 0 ? (
                          <Button
                            onClick={() => setSelectedRequest(request)}
                            className="w-full cursor-pointer rounded-2xl bg-emerald-600 py-4 text-sm font-bold shadow-xl shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-800 focus-visible:ring-4 focus-visible:ring-emerald-200"
                          >
                            Accept & Donate
                            <ChevronRight className="ml-2" size={18} />
                          </Button>
                        ) : (
                          <div className="flex w-full items-center justify-center rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3.5 text-sm  uppercase tracking-wide text-slate-600">
                            {isCompleted ? "Delivered" : request.status}
                          </div>
                        )}

                        <p className="mt-4 text-center text-xs font-medium italic text-slate-500">
                          Support your community food bank
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {selectedRequest && (
        <AcceptRequestModal
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
          onSuccess={() => {
            setSelectedRequest(null);
            fetchRequests();
          }}
        />
      )}

      {verifyingAcceptance && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-md animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-delivery-title"
        >
          <div className="w-full max-w-md animate-in zoom-in-95 duration-300">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/60 bg-white p-8 shadow-2xl shadow-slate-900/20 sm:p-10">
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-emerald-600 to-green-800" />

              <div className="flex flex-col items-center text-center">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-blue-50 text-blue-600 shadow-lg shadow-blue-100">
                  <Smartphone size={40} />
                </div>

                <h3
                  id="verify-delivery-title"
                  className="text-2xl  tracking-tight text-slate-900"
                >
                  Verify Delivery
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Enter the 6-digit OTP provided by the food bank to complete
                  this donation.
                </p>

                <div className="mt-6 w-full space-y-4">
                  <div className="space-y-2">
                    <label htmlFor="pickup-otp" className="sr-only">
                      Enter 6-digit OTP
                    </label>

                    <input
                      id="pickup-otp"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength="6"
                      value={otpValue}
                      onChange={(e) =>
                        setOtpValue(e.target.value.replace(/\D/g, ""))
                      }
                      placeholder="Enter 6-digit OTP"
                      className="w-full rounded-[1.4rem] border-2 border-slate-200 px-4 py-5 text-center text-2xl  tracking-[0.45rem] text-slate-900 outline-none transition-all duration-300 placeholder:text-base placeholder:font-semibold placeholder:tracking-normal placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    {verifyingAcceptance.status === "pending" && (
                      <button
                        type="button"
                        onClick={handleResendOTP}
                        disabled={isResending}
                        className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs  uppercase tracking-wide text-blue-600 transition-all duration-300 hover:bg-blue-50 hover:text-blue-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-100 disabled:cursor-not-allowed disabled:text-slate-400"
                      >
                        {isResending ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <CheckCircle size={14} />
                        )}
                        Resend OTP
                      </button>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setVerifyingAcceptance(null);
                        setOtpValue("");
                      }}
                      className="flex-1 cursor-pointer rounded-2xl border border-slate-200 px-4 py-4 text-sm font-bold text-slate-600 transition-all duration-300 hover:bg-slate-50 hover:text-slate-800 focus:outline-none focus-visible:ring-4 focus-visible:ring-slate-200"
                    >
                      Cancel
                    </button>

                    <Button
                      onClick={handleVerifyOTP}
                      isLoading={isVerifying}
                      className="flex-[1.6] rounded-2xl bg-blue-600 py-4 text-sm font-bold shadow-xl shadow-blue-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 focus-visible:ring-4 focus-visible:ring-blue-200"
                    >
                      Verify & Complete
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestList;
