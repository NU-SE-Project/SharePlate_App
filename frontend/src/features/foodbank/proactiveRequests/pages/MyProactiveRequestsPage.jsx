import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Clock,
  AlertCircle,
  CheckCircle2,
  Info,
  Trash2,
  User,
  Phone,
  MapPin,
  Map as MapIcon,
  Bell,
  HandHeart,
  Sparkles,
  ClipboardList,
} from "lucide-react";
import {
  getMyProactiveRequests,
  deleteProactiveRequest,
} from "../../services/foodbankService";
import { useAuth } from "../../../../context/AuthContext";
import { useSocket } from "../../../../context/SocketContext";
import Button from "../../../../components/common/Button";
import RouteMapModal from "../../../../components/common/RouteMapModal";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const MyProactiveRequestsPage = () => {
  const { user } = useAuth();
  const currentFoodBankId = user?.id || user?._id || null;
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [routeModalData, setRouteModalData] = useState(null);
  const { socket } = useSocket();

  const selectedRequest = useMemo(
    () => requests.find((r) => r._id === selectedRequestId) || requests[0] || null,
    [requests, selectedRequestId],
  );

  const fetchRequests = async () => {
    if (!currentFoodBankId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMyProactiveRequests(currentFoodBankId);
      setRequests(data);
      if (!selectedRequestId && data.length > 0) {
        setSelectedRequestId(data[0]._id);
      }
    } catch (error) {
      toast.error("Failed to load your proactive requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentFoodBankId]);

  useEffect(() => {
    if (!socket || !currentFoodBankId) return;

    const handleRequestCreated = (data) => {
      if (data?.foodbankId && data.foodbankId !== currentFoodBankId) return;
      fetchRequests();
      toast.success("Your broadcast is now live for nearby restaurants.");
    };

    const handleRequestAccepted = () => {
      fetchRequests();
    };

    const handleRequestRejected = () => {
      fetchRequests();
    };

    const handleDonationUpdated = () => {
      fetchRequests();
    };

    socket.on("foodbank_request_created", handleRequestCreated);
    socket.on("request_accepted", handleRequestAccepted);
    socket.on("request_rejected", handleRequestRejected);
    socket.on("donation_updated", handleDonationUpdated);

    return () => {
      socket.off("foodbank_request_created", handleRequestCreated);
      socket.off("request_accepted", handleRequestAccepted);
      socket.off("request_rejected", handleRequestRejected);
      socket.off("donation_updated", handleDonationUpdated);
    };
  }, [socket, currentFoodBankId]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this broadcast?")) {
      return;
    }
    try {
      await deleteProactiveRequest(id);
      toast.success("Request cancelled");
      setRequests((prev) => prev.filter((r) => r._id !== id));
      if (selectedRequestId === id) setSelectedRequestId(null);
    } catch (error) {
      toast.error("Failed to delete request");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-800 to-emerald-600 text-white shadow-lg">
            <Clock className="h-8 w-8 animate-spin" />
          </div>
          <div>
            <p className="text-base font-medium text-slate-800">
              Syncing broadcasts
            </p>
            <p className="text-sm text-slate-500">
              Pulling the latest request fulfillment activity.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
            <HandHeart size={30} />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
            No broadcasts active
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            You have not broadcasted any food needs yet. Start now to request
            support from nearby restaurants.
          </p>
          <Link to="/foodbank/post-request" className="mt-6 inline-flex">
            <Button className="rounded-2xl px-6 py-4 text-sm font-bold shadow-xl shadow-emerald-200">
              Broadcast My First Need
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-700">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-green-100/60 shadow-[0_10px_40px_rgba(16,185,129,0.08)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-green-200/30 blur-2xl" />
        </div>

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm sm:h-14 sm:w-14">
                <ClipboardList size={24} />
              </div>

              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 sm:text-sm">
                  <Sparkles size={14} />
                  Request Tracker
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  My Broadcasts
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  Review your active broadcasts, track fulfillment progress, and
                  see which restaurants have responded.
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
                      Live updates
                    </p>
                    <p className="text-xs text-slate-500">
                      Fulfillment progress and responses
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Stay on top of restaurant acceptances and request completion
                  without leaving the page.
                </p>
              </div>

              <Link
                to="/foodbank/post-request"
                className="group rounded-2xl border border-emerald-700 bg-gradient-to-r from-emerald-600 to-green-800 p-4 text-white shadow-[0_12px_30px_rgba(22,163,74,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(22,163,74,0.34)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                      <HandHeart size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">New Broadcast</p>
                      <p className="text-xs text-emerald-100">
                        Post another request
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-50">
                      Create request now
                    </span>
                    <ShoppingBag
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.3fr)_380px]">
        <section className="space-y-5">
          {requests.map((request) => {
            const secured = request.requestedQuantity - request.remainingQuantity;
            const progress = request.requestedQuantity
              ? Math.min(
                  100,
                  Math.max(0, (secured / request.requestedQuantity) * 100),
                )
              : 0;
            const isSelected = selectedRequest?._id === request._id;

            return (
              <article
                key={request._id}
                onClick={() => setSelectedRequestId(request._id)}
                className={`group cursor-pointer rounded-[1.75rem] border bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md ${
                  isSelected
                    ? "border-emerald-300 ring-2 ring-emerald-100"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col gap-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                          request.foodType === "veg"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-orange-100 text-orange-700"
                        }`}
                      >
                        <ShoppingBag size={22} />
                      </div>

                      <div>
                        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                          {request.foodName}
                        </h2>
                        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                          {request.foodType} •{" "}
                          {new Date(request.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(request._id);
                      }}
                      className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-all duration-300 hover:border-red-200 hover:bg-red-50 hover:text-red-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-red-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Requested
                      </p>
                      <p className="mt-2 text-2xl text-slate-900">
                        {request.requestedQuantity}
                      </p>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Secured
                      </p>
                      <p className="mt-2 text-2xl text-slate-900">{secured}</p>
                    </div>

                    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-green-50 p-4">
                      <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
                        Remaining
                      </p>
                      <p className="mt-2 text-2xl text-emerald-700">
                        {request.remainingQuantity}
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-slate-700">
                        Fulfillment Progress
                      </span>
                      <span className="text-sm font-bold text-emerald-700">
                        {Math.round(progress)}%
                      </span>
                    </div>
                    <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-green-800 via-emerald-600 to-emerald-400 transition-all duration-700"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </section>

        <aside>
          <div className="sticky top-24">
            {selectedRequest ? (
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-gradient-to-r from-green-800 via-emerald-700 to-emerald-600 p-6 text-white">
                  <h3 className="text-xl font-semibold tracking-tight">
                    Updates for {selectedRequest.foodName}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-emerald-50/90">
                    Restaurant responses, pickup details, and current request
                    progress.
                  </p>
                </div>

                <div className="space-y-4 p-5">
                  {selectedRequest.acceptances &&
                  selectedRequest.acceptances.length > 0 ? (
                    selectedRequest.acceptances.map((acc) => (
                      <div
                        key={acc._id}
                        className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                              <User size={18} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">
                                {acc.restaurant_id?.name || "Local Restaurant"}
                              </p>
                              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Accepted {acc.acceptedQuantity} servings
                              </p>
                            </div>
                          </div>

                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.16em] ${
                              acc.status === "delivered"
                                ? "bg-emerald-100 text-emerald-700"
                                : acc.status === "expired"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-amber-100 text-amber-700"
                            }`}
                          >
                            {acc.status}
                          </span>
                        </div>

                        <div className="mt-4 grid gap-2 text-sm text-slate-600">
                          <div className="flex items-center gap-2">
                            <Phone size={14} className="text-emerald-600" />
                            <span>{acc.restaurant_id?.phone || "Hidden Contact"}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin size={14} className="text-emerald-600" />
                            <span className="truncate">
                              {acc.restaurant_id?.address || "Local Pickup"}
                            </span>
                          </div>
                        </div>

                        <div className="mt-4 space-y-3">
                          {acc.pickup_id && (
                            <div className="rounded-2xl border border-slate-200 bg-white p-3">
                              {acc.status !== "delivered" && acc.pickup_id.otp ? (
                                <>
                                  <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                                    Pickup OTP
                                  </span>
                                  <div className="mt-2 text-sm font-black tracking-[0.3em] text-emerald-600">
                                    {acc.pickup_id.otp}
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                                  <CheckCircle2 size={16} />
                                  Verification complete
                                </div>
                              )}
                            </div>
                          )}

                          <button
                            type="button"
                            disabled={!acc.restaurant_id?.location?.coordinates}
                            onClick={() => {
                              if (!acc.restaurant_id?.location?.coordinates) {
                                toast.error("Restaurant location not available");
                                return;
                              }
                              if (!user?.location?.coordinates) {
                                toast.error(
                                  "Your location not available. Please update profile.",
                                );
                                return;
                              }
                              setRouteModalData({
                                start: {
                                  lat: user.location.coordinates[1],
                                  lng: user.location.coordinates[0],
                                  name: user.name,
                                  address: user.address,
                                },
                                end: {
                                  lat: acc.restaurant_id.location.coordinates[1],
                                  lng: acc.restaurant_id.location.coordinates[0],
                                  name: acc.restaurant_id.name,
                                  address: acc.restaurant_id.address,
                                },
                                title: `Route to ${acc.restaurant_id.name}`,
                              });
                            }}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <MapIcon size={14} />
                            {acc.restaurant_id?.location?.coordinates
                              ? "View Map Route"
                              : "Location Hidden"}
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
                      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                        <AlertCircle size={24} />
                      </div>
                      <p className="font-semibold text-slate-800">
                        No restaurant responses yet
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        Nearby restaurants have been notified. Accepted
                        contributions will appear here.
                      </p>
                    </div>
                  )}

                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                    <div className="flex items-start gap-3">
                      <Info size={18} className="mt-0.5 text-emerald-600" />
                      <p className="text-sm leading-6 text-slate-600">
                        Reach out to restaurants to coordinate precise pickup
                        timing once they accept the request.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </aside>
      </div>

      {routeModalData && (
        <RouteMapModal
          isOpen={!!routeModalData}
          onClose={() => setRouteModalData(null)}
          startLocation={routeModalData.start}
          endLocation={routeModalData.end}
          title={routeModalData.title}
        />
      )}
    </div>
  );
};

export default MyProactiveRequestsPage;
