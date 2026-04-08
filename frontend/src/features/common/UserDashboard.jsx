import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Building2,
  HeartHandshake,
  LayoutDashboard,
  ShieldAlert,
  User2,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DashboardSkeleton = memo(function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 animate-pulse rounded-2xl bg-emerald-100" />
            <div className="space-y-3">
              <div className="h-7 w-48 animate-pulse rounded bg-slate-200" />
              <div className="h-4 w-64 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="h-56 animate-pulse rounded-3xl bg-slate-100" />
          </div>
          <div className="space-y-5">
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
            <div className="h-24 animate-pulse rounded-3xl bg-slate-100" />
          </div>
        </div>
      </div>
    </div>
  );
});

const StatusCard = memo(function StatusCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
          <Icon size={20} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="truncate text-base font-semibold text-slate-900">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
});

const DashboardActionCard = memo(function DashboardActionCard({
  icon: Icon,
  title,
  description,
  to,
  actionLabel,
}) {
  return (
    <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg">
      <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
        <Icon size={24} />
      </div>

      <h2 className="text-xl font-bold tracking-tight text-slate-900">
        {title}
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>

      <div className="mt-6">
        <Link
          to={to}
          className="inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
        >
          <span>{actionLabel}</span>
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
});

const EmptyState = memo(function EmptyState() {
  return (
    <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center sm:p-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <LayoutDashboard size={24} />
      </div>
      <h2 className="mt-4 text-xl font-bold text-slate-900">
        Dashboard unavailable
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        We could not determine your dashboard view right now. Refresh the page
        or sign in again if this keeps happening.
      </p>
    </div>
  );
});

const UnderConstructionCard = memo(function UnderConstructionCard() {
  return (
    <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50/70 p-8 sm:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <ShieldAlert size={24} />
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">
            Account dashboard is under construction
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Your account exists, but this dashboard experience is not ready yet.
            The current working behavior stays the same.
          </p>
        </div>
      </div>
    </div>
  );
});

const UserDashboard = () => {
  const { user } = useAuth();

  const isLoading = user === undefined;
  const userName = user?.name || "User";
  const userRole = user?.role || "";

  const dashboardContent = useMemo(() => {
    if (!user) return <EmptyState />;

    if (user.role === "restaurant") {
      return (
        <DashboardActionCard
          icon={Building2}
          title="Restaurant Dashboard"
          description="Manage your restaurant operations, track activity, and access the tools you already use from one clean place."
          to="/restaurant/dashboard"
          actionLabel="Go to Restaurant Dashboard"
        />
      );
    }

    if (user.role === "foodbank") {
      return (
        <DashboardActionCard
          icon={HeartHandshake}
          title="Foodbank Requests"
          description="Foodbank tools are still being built. For now, you can continue browsing available requests without changing the current flow."
          to="/restaurant/requests"
          actionLabel="Browse Requests"
        />
      );
    }

    return <UnderConstructionCard />;
  }, [user]);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
        <div className="bg-gradient-to-r from-emerald-50 via-white to-slate-50 px-6 py-8 sm:px-8 sm:py-10">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                <LayoutDashboard size={14} />
                User Dashboard
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Welcome, {userName}
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                Access your account area and continue with the features
                currently available for your role.
              </p>
            </div>

            <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition-transform duration-300 hover:scale-[1.03]">
              <User2 size={28} />
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-6 sm:p-8 lg:grid-cols-3">
          <div className="lg:col-span-2">{dashboardContent}</div>

          <div className="space-y-5">
            <StatusCard icon={User2} label="Account Name" value={userName} />
            <StatusCard
              icon={ShieldAlert}
              label="Role"
              value={
                userRole
                  ? userRole.charAt(0).toUpperCase() + userRole.slice(1)
                  : "Not assigned"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(UserDashboard);
