import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Calendar,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Timer,
  Info,
  Map as MapIcon,
  Clock3,
} from "lucide-react";
import { getMyFoodRequests } from "../../services/foodbankService";
import toast from "react-hot-toast";
import { useSocket } from "../../../../context/SocketContext";
import { useAuth } from "../../../../context/AuthContext";
import RouteMapModal from "../../../../components/common/RouteMapModal";
import LoadingState from "../../../../components/common/LoadingState";

const MyRequestsTab = ({ foodBankId }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeModalData, setRouteModalData] = useState(null);
  const { user } = useAuth();
  const currentFoodBankId = foodBankId || user?.id || user?._id || null;

  const fetchRequests = async () => {
    if (!currentFoodBankId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMyFoodRequests(currentFoodBankId);
      setRequests(data);
    } catch {
      toast.error("Failed to load your requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentFoodBankId]);

  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const onAccepted = () => {
      fetchRequests();
      toast.success("A request was accepted.");
    };
    const onRejected = () => {
      fetchRequests();
      toast("A request was updated.");
    };
    socket.on("request_accepted", onAccepted);
    socket.on("request_rejected", onRejected);
    return () => {
      socket.off("request_accepted", onAccepted);
      socket.off("request_rejected", onRejected);
    };
  }, [socket, currentFoodBankId]);

  if (isLoading) {
    return (
      <LoadingState
        title="Loading your requests"
        message="Please wait while we fetch the latest request status updates."
      />
    );
  }

  if (requests.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto max-w-md">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
            <ShoppingBag size={30} />
          </div>
          <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
            No requests yet
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-500">
            Browse the available donations tab to request food for your
            community.
          </p>
        </div>
      </div>
    );
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return {
          icon: <CheckCircle2 size={16} />,
          chip: "bg-emerald-50 text-emerald-700 border-emerald-200",
          label: "Awaiting Pickup",
        };
      case "collected":
      case "delivered":
        return {
          icon: <CheckCircle2 size={16} />,
          chip: "bg-slate-100 text-slate-700 border-slate-200",
          label: "Handed Over",
        };
      case "rejected":
        return {
          icon: <XCircle size={16} />,
          chip: "bg-red-50 text-red-700 border-red-200",
          label: "Request Rejected",
        };
      default:
        return {
          icon: <Timer size={16} />,
          chip: "bg-amber-50 text-amber-700 border-amber-200",
          label: "Pending Approval",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 gap-5">
      {requests.map((request) => {
        const statusInfo = getStatusInfo(request.status);
        return (
          <article
            key={request._id}
            className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="grid flex-1 grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <div className="min-w-0">
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Requested Item
                  </span>
                  <p className="truncate text-sm font-semibold text-slate-800 sm:text-base">
                    {request.food_id?.foodName || "Meal Request"}
                  </p>
                </div>

                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Requested On
                  </span>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Calendar size={14} className="text-emerald-600" />
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Quantity
                  </span>
                  <p className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <Info size={14} className="text-emerald-600" />
                    {request.requestedQuantity} servings
                  </p>
                </div>

                <div>
                  <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                    Current Status
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${statusInfo.chip}`}
                  >
                    {statusInfo.icon}
                    {statusInfo.label}
                  </span>
                </div>
              </div>

              <div className="w-full lg:max-w-[320px]">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="mb-4 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-700">
                      Pickup State
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                      ID: {typeof request._id === "string" ? request._id.slice(-6) : "N/A"}
                    </span>
                  </div>

                  {request.status === "approved" && request.pickup_id?.otp ? (
                    <div className="mb-4 rounded-2xl border border-emerald-200 bg-white p-4 text-center">
                      <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                        Pickup OTP
                      </span>
                      <div className="mt-2 text-lg font-black tracking-[0.3em] text-emerald-600">
                        {request.pickup_id.otp}
                      </div>
                    </div>
                  ) : (
                    <div className="mb-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-600">
                      <Clock3 size={16} className="text-emerald-600" />
                      {request.status === "delivered" ||
                      request.status === "collected"
                        ? "Verification complete"
                        : "Waiting for restaurant response"}
                    </div>
                  )}

                  <button
                    type="button"
                    disabled={!request.restaurant_id?.location?.coordinates}
                    onClick={() => {
                      if (!request.restaurant_id?.location?.coordinates) {
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
                          lat: request.restaurant_id.location.coordinates[1],
                          lng: request.restaurant_id.location.coordinates[0],
                          name: request.restaurant_id.name,
                          address: request.restaurant_id.address,
                        },
                        title: `Route to ${request.restaurant_id.name}`,
                      });
                    }}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <MapIcon size={14} />
                    {request.restaurant_id?.location?.coordinates
                      ? "View Route on Map"
                      : "Location Hidden"}
                  </button>
                </div>
              </div>
            </div>
          </article>
        );
      })}

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

export default MyRequestsTab;
