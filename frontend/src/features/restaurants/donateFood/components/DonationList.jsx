import React, { useState, useEffect, useCallback, memo } from "react";
import {
  Edit2,
  Trash2,
  Calendar,
  Eye,
  Loader2,
  AlertCircle,
  Clock,
  Leaf,
  Flame,
  Package2,
  Sparkles,
} from "lucide-react";
import Button from "../../../../components/common/Button";
import { getMyDonations, deleteDonation } from "../services/restaurantService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const STATUS_STYLES = {
  available:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200/80",
  closed: "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200/80",
  expired: "bg-red-50 text-red-700 ring-1 ring-inset ring-red-200/80",
  default: "bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200",
};

const FOOD_TYPE_STYLES = {
  veg: {
    badge:
      "bg-emerald-600/95 text-white shadow-lg shadow-emerald-900/20 ring-1 ring-white/20",
    softBadge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    strip: "from-emerald-700 via-emerald-600 to-green-500",
    icon: Leaf,
  },
  nonveg: {
    badge:
      "bg-orange-500/95 text-white shadow-lg shadow-orange-900/20 ring-1 ring-white/20",
    softBadge: "bg-orange-50 text-orange-700 ring-1 ring-orange-200",
    strip: "from-orange-600 via-orange-500 to-amber-400",
    icon: Flame,
  },
};

const formatDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const formatShortDate = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleDateString([], {
    month: "short",
    day: "numeric",
  });
};

const formatTime = (value) => {
  if (!value) return "N/A";
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getImageUrl = (url) => {
  if (!url) return null;

  if (url.startsWith("/")) {
    const base = import.meta.env.VITE_API_URL
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : "http://localhost:5000";
    return `${base}${url}`;
  }

  return url;
};

const getStatusStyle = (status) =>
  STATUS_STYLES[status] || STATUS_STYLES.default;

const ActionIconButton = memo(
  ({ onClick, title, children, variant = "default" }) => {
    const styles =
      variant === "danger"
        ? "text-slate-500 hover:text-red-600 hover:bg-red-50 focus-visible:ring-red-500/30"
        : "text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 focus-visible:ring-emerald-500/30";

    return (
      <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        className={`inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl bg-white/90 backdrop-blur-md shadow-sm ring-1 ring-slate-200/70 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-4 ${styles}`}
      >
        {children}
      </button>
    );
  },
);

ActionIconButton.displayName = "ActionIconButton";

const DonationCard = memo(({ donation, onEdit, onDelete, onView }) => {
  const imageUrl = getImageUrl(donation.imageUrl);
  const normalizedType =
    donation.foodType === "veg"
      ? "veg"
      : donation.foodType === "non-veg"
        ? "nonveg"
        : "nonveg";
  const foodConfig =
    FOOD_TYPE_STYLES[normalizedType] || FOOD_TYPE_STYLES.nonveg;
  const FoodIcon = foodConfig.icon;

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200/70 bg-white shadow-sm transition-all duration-500 ease-out hover:-translate-y-1.5 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-950/10"
      tabIndex={0}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-emerald-50/70 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      {imageUrl ? (
        <div className="relative h-52 overflow-hidden sm:h-56">
          <img
            src={imageUrl}
            alt={donation.foodName}
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-900/10 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/10 via-transparent to-transparent" />

          <div className="absolute left-3 top-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] backdrop-blur-md ${foodConfig.badge}`}
            >
              <FoodIcon size={11} />
              {donation.foodType || "Food"}
            </span>
          </div>

          <div className="absolute right-3 top-3">
            <span
              className={`inline-flex rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] backdrop-blur-md ${getStatusStyle(donation.status)}`}
            >
              {donation.status || "unknown"}
            </span>
          </div>

          <div className="absolute bottom-3 right-3 flex translate-y-2 gap-2 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100">
            <ActionIconButton
              onClick={() => onEdit(donation)}
              title="Edit donation"
            >
              <Edit2 size={15} />
            </ActionIconButton>

            <ActionIconButton
              onClick={() => onDelete(donation._id)}
              title="Delete donation"
              variant="danger"
            >
              <Trash2 size={15} />
            </ActionIconButton>
          </div>
        </div>
      ) : (
        <div className={`h-2 w-full bg-gradient-to-r ${foodConfig.strip}`} />
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {!imageUrl && (
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${foodConfig.softBadge}`}
                >
                  <FoodIcon size={11} />
                  {donation.foodType || "Food"}
                </span>

                <span
                  className={`inline-flex rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${getStatusStyle(donation.status)}`}
                >
                  {donation.status || "unknown"}
                </span>
              </div>
            )}

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
          </div>

          {!imageUrl && (
            <div className="flex shrink-0 items-center gap-2">
              <ActionIconButton
                onClick={() => onEdit(donation)}
                title="Edit donation"
              >
                <Edit2 size={15} />
              </ActionIconButton>

              <ActionIconButton
                onClick={() => onDelete(donation._id)}
                title="Delete donation"
                variant="danger"
              >
                <Trash2 size={15} />
              </ActionIconButton>
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-3.5 transition-all duration-300 group-hover:border-emerald-200 group-hover:shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Package2 size={14} className="text-emerald-700" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Remaining
              </span>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-2xl  leading-none text-emerald-700">
                {donation.remainingQuantity ?? 0}
              </span>
              <span className="pb-0.5 text-xs font-medium text-slate-400">
                / {donation.totalQuantity ?? 0}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-3.5 transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <Calendar size={14} className="text-emerald-700" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Expiry
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-700">
              {formatShortDate(donation.expiryTime)}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              {formatDate(donation.expiryTime)}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3.5">
          <div className="flex items-center gap-2 text-slate-500">
            <Clock size={14} className="text-emerald-700" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Pickup Window
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-600">
            Ends at{" "}
            <span className="font-bold text-slate-900">
              {formatTime(donation.pickupWindowEnd)}
            </span>
          </p>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => onView(donation._id)}
            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-800 via-emerald-700 to-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-900/20 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-900/25 focus:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 active:translate-y-0"
          >
            <Eye size={16} />
            View Requests
          </button>
        </div>
      </div>
    </article>
  );
});

DonationCard.displayName = "DonationCard";

const DonationListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="h-52 animate-pulse bg-slate-200" />
          <div className="space-y-4 p-5">
            <div className="space-y-2">
              <div className="h-4 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-6 w-3/4 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
              <div className="h-24 animate-pulse rounded-2xl bg-slate-100" />
            </div>

            <div className="h-16 animate-pulse rounded-2xl bg-slate-100" />
            <div className="h-12 animate-pulse rounded-2xl bg-slate-200" />
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyState = memo(() => {
  return (
    <div className="relative overflow-hidden rounded-[28px] border border-dashed border-emerald-200 bg-gradient-to-br from-white via-emerald-50/50 to-slate-50 px-6 py-16 text-center shadow-sm sm:px-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(5,150,105,0.08),_transparent_45%)]" />

      <div className="relative mx-auto max-w-md">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-green-800 to-emerald-600 shadow-xl shadow-emerald-900/15">
          <Sparkles size={34} className="text-white" />
        </div>

        <h3 className="text-2xl  tracking-tight text-slate-900">
          No donations yet
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-500 sm:text-base">
          You have not listed any food donations yet. Start adding donations and
          make them easy for food banks to discover and request.
        </p>
      </div>
    </div>
  );
});

EmptyState.displayName = "EmptyState";

const DonationList = ({ restaurantId, refreshTrigger, onEdit }) => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDonations = useCallback(async () => {
    if (!restaurantId || restaurantId === "000000000000000000000000") {
      setDonations([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const data = await getMyDonations(restaurantId);
      setDonations(Array.isArray(data) ? data : data?.donations || []);
    } catch (error) {
      toast.error("Failed to load donations");
    } finally {
      setIsLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    fetchDonations();
  }, [fetchDonations, refreshTrigger]);

  const handleDelete = useCallback(async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this donation?",
    );
    if (!confirmed) return;

    try {
      await deleteDonation(id);
      toast.success("Donation deleted");
      setDonations((prev) => prev.filter((donation) => donation._id !== id));
    } catch (error) {
      toast.error("Failed to delete donation");
    }
  }, []);

  const handleViewRequests = useCallback(
    (id) => {
      navigate(`/restaurant/donation-requests/${id}`);
    },
    [navigate],
  );

  const handleEdit = useCallback(
    (donation) => {
      if (onEdit) onEdit(donation);
    },
    [onEdit],
  );

  if (isLoading) {
    return <DonationListSkeleton />;
  }

  if (donations.length === 0) {
    return <EmptyState />;
  }

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {donations.map((donation) => (
          <DonationCard
            key={donation._id}
            donation={donation}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onView={handleViewRequests}
          />
        ))}
      </div>
    </section>
  );
};

export default DonationList;
