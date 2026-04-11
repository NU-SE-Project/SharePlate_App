import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  Calendar,
  Clock,
  Search,
  Loader2,
  AlertCircle,
  PlusCircle,
  Filter,
  Map as MapIcon,
} from "lucide-react";
import { getAvailableDonatedFood } from "../../services/foodbankService";
import Button from "../../../../components/common/Button";
import toast from "react-hot-toast";
import { useSocket } from "../../../../context/SocketContext";
import { useAuth } from "../../../../context/AuthContext";
import RouteMapModal from "../../../../components/common/RouteMapModal";

const AvailableFoodTab = ({ onRequest }) => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [routeModalData, setRouteModalData] = useState(null);
  const { user } = useAuth();
  const ITEMS_PER_PAGE = 5;

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const data = await getAvailableDonatedFood();
      setDonations(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error("Failed to load available food");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const handler = () => {
      fetchDonations();
    };
    socket.on("donation_updated", handler);
    socket.on("donation_created", handler);
    return () => {
      socket.off("donation_updated", handler);
      socket.off("donation_created", handler);
    };
  }, [socket]);

  const filteredDonations = donations.filter((d) => {
    const matchesSearch = d.foodName
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || d.foodType === filterType;
    return (
      matchesSearch &&
      matchesFilter &&
      d.remainingQuantity > 0 &&
      d.status === "available"
    );
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterType, donations.length]);

  const totalPages = Math.max(1, Math.ceil(filteredDonations.length / ITEMS_PER_PAGE));
  const paginatedDonations = filteredDonations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  );

  if (isLoading) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-[2rem] border border-emerald-100 bg-white/80 px-6 py-16 shadow-sm">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 shadow-lg shadow-emerald-100/60">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Loading available donations
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Fetching the latest meals shared by restaurants.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-emerald-50 p-2.5 text-emerald-700">
              <Filter size={18} />
            </div>
            <div>
              <h2 className="text-sm uppercase tracking-wide text-slate-900">
                Search and filter
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Narrow donations by item name and food type.
              </p>
            </div>
          </div>

          <div className="flex w-full flex-col gap-3 lg:w-auto lg:flex-row lg:items-center">
            <div className="group relative min-w-[260px]">
              <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400 group-focus-within:text-emerald-500">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Search by food name..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 text-sm text-slate-700 transition-all duration-300 placeholder:text-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-emerald-500/10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div
              className="flex flex-wrap gap-2"
              role="tablist"
              aria-label="Filter food by type"
            >
              {["all", "veg", "non-veg"].map((type) => {
                const isActive = filterType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilterType(type)}
                    className={`inline-flex cursor-pointer items-center justify-center rounded-2xl border px-4 py-2.5 text-sm font-bold capitalize transition-all duration-300 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 ${
                      isActive
                        ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-200"
                        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {filteredDonations.length === 0 ? (
        <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto max-w-md">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
              <AlertCircle size={30} />
            </div>
            <h3 className="text-2xl font-extrabold tracking-tight text-slate-900">
              No meals available right now
            </h3>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Check back later. Restaurants are constantly updating their
              surplus food availability.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {paginatedDonations.map((donation) => (
            <div key={donation._id} className="group flex flex-col bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="h-56 relative overflow-hidden">
                {donation.imageUrl ? (
                  <img src={(donation.imageUrl && donation.imageUrl.startsWith('/')) ? (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000') + donation.imageUrl : donation.imageUrl} alt={donation.foodName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div
                    className={`flex h-24 items-center justify-center ${
                      donation.foodType === "veg"
                        ? "bg-gradient-to-r from-emerald-700 via-emerald-600 to-green-500 text-white"
                        : "bg-gradient-to-r from-orange-600 via-orange-500 to-amber-400 text-white"
                    }`}
                  >
                    <ShoppingBag size={40} className="opacity-70" />
                  </div>
                )}

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <h3 className="line-clamp-1 text-base font-bold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-emerald-800">
                    {donation.foodName}
                  </h3>
                  {donation.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-500">
                      {donation.description}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-slate-400">
                      No description provided.
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3.5">
                      <div className="mb-2 flex items-center gap-2">
                        <ShoppingBag size={14} className="text-emerald-700" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Remaining
                        </span>
                      </div>
                      <div className="flex items-end gap-1">
                        <span className="text-2xl leading-none text-emerald-700">
                          {donation.remainingQuantity}
                        </span>
                        <span className="pb-0.5 text-xs font-medium text-slate-400">
                          / {donation.totalQuantity}
                        </span>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3.5">
                      <div className="mb-2 flex items-center gap-2">
                        <Calendar size={14} className="text-emerald-700" />
                        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Expires
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(donation.expiryTime).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
                    <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-emerald-700" />
                        <span>
                          Until{" "}
                          {new Date(donation.pickupWindowEnd).toLocaleTimeString(
                            [],
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                      </div>
                      <span className="truncate">
                        {donation.restaurant_id?.name ||
                          (typeof donation.restaurant_id === "string"
                            ? `Restaurant ${donation.restaurant_id.slice(-4)}`
                            : "Local Restaurant")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <button
                      type="button"
                      disabled={!donation.restaurant_id?.location?.coordinates}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!donation.restaurant_id?.location?.coordinates) {
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
                            lat: donation.restaurant_id.location.coordinates[1],
                            lng: donation.restaurant_id.location.coordinates[0],
                            name: donation.restaurant_id.name,
                            address: donation.restaurant_id.address,
                          },
                          title: `Route to ${donation.restaurant_id.name}`,
                        });
                      }}
                    className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition-all duration-300 hover:bg-emerald-100 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-200 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <MapIcon size={14} />
                      {donation.restaurant_id?.location?.coordinates
                        ? "View Route on Map"
                        : "Location Hidden"}
                    </button>

                    <Button
                      className="w-full rounded-2xl py-4 text-sm font-bold shadow-xl shadow-emerald-100 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-800"
                      onClick={() => onRequest(donation)}
                    >
                      <span className="inline-flex items-center justify-center gap-2">
                        <PlusCircle size={18} />
                        Submit Request
                      </span>
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {filteredDonations.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between gap-4 bg-white border border-emerald-50 rounded-2xl p-4">
          <p className="text-sm font-semibold text-slate-500">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              className="px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

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

export default AvailableFoodTab;
