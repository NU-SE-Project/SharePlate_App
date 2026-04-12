import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Utensils,
  AlertCircle,
  Bell,
  ChevronRight,
  Check,
  X,
  TrendingUp,
  Activity,
  PlusCircle,
  List,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Inbox,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import api from "../../../../utils/api";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import LoadingState from "../../../../components/common/LoadingState";

const CHART_COLORS = ["#059669", "#10b981", "#34d399", "#f59e0b"];

const RestaurantDashboard = () => {
  const auth = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      const response = await api.get("/dashboard/restaurant");
      if (response?.data?.success) {
        setData(response.data.data);
      } else {
        setData(null);
      }
    } catch (error) {
      toast.error("Failed to load dashboard data");
      console.error("Error loading dashboard data:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (auth.isInitializing || !auth.accessToken || hasFetchedRef.current)
      return;

    hasFetchedRef.current = true;
    fetchDashboardData();
  }, [auth.accessToken, auth.isInitializing, fetchDashboardData]);

  const profile = data?.profile || {};
  const stats = data?.stats || {};
  const recentActivity = data?.recentActivity || {};
  const alerts = data?.alerts || [];
  const charts = data?.charts || {};
  const notifications = data?.notifications || [];

  const requestStatusData = useMemo(() => {
    return (charts.requestStatusDistribution || []).filter(
      (item) => item.value > 0,
    );
  }, [charts.requestStatusDistribution]);

  const foodTypeData = useMemo(() => {
    return charts.foodTypeDistribution || [];
  }, [charts.foodTypeDistribution]);

  if (loading) {
    return <DashboardLoadingState />;
  }

  if (!data) {
    return <DashboardEmptyState />;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute right-0 top-20 h-72 w-72 rounded-full bg-green-800/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl space-y-6 sm:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <DashboardHeader profile={profile} />

        {alerts.length > 0 && <AlertsSection alerts={alerts} />}

        <StatsSection stats={stats} />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
          <div className="space-y-6">
            <ChartsSection
              requestStatusData={requestStatusData}
              foodTypeData={foodTypeData}
            />
            <DonationsTable donations={recentActivity.donations || []} />
            <AcceptedRequestsTable requests={recentActivity.requests || []} />
          </div>

          <aside className="space-y-6">
            <NotificationsPanel notifications={notifications} />
          </aside>
        </div>
      </div>
    </div>
  );
};

const DashboardHeader = memo(({ profile }) => {
  return (
    <section className="group relative overflow-hidden rounded-[28px] border border-emerald-100/70 bg-white/90 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:shadow-emerald-900/5 dark:border-gray-700/60 dark:bg-gray-800/85 sm:p-6 lg:p-8">
      <div className="absolute inset-0 bg-gradient-to-r from-emerald-50/90 via-white to-green-50/70 dark:from-emerald-950/20 dark:via-gray-800 dark:to-green-950/10" />
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-emerald-500/10 blur-2xl" />
      <div className="absolute -bottom-10 left-1/3 h-28 w-28 rounded-full bg-green-700/10 blur-2xl" />

      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-800 to-emerald-600 text-white shadow-lg shadow-emerald-600/20 ring-1 ring-white/60 transition-transform duration-300 group-hover:scale-105 sm:h-20 sm:w-20">
            <Utensils className="h-8 w-8 sm:h-9 sm:w-9" />
          </div>

          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl  tracking-tight text-gray-900 dark:text-white sm:text-3xl">
                {profile?.name || "Restaurant Overview"}
              </h1>

              {profile?.verificationStatus === "verified" && (
                <span
                  className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-900/20 dark:text-emerald-400"
                  title="Verified Restaurant"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Verified
                </span>
              )}
            </div>

            <p className="max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-300 sm:text-base">
              Track donations, monitor request activity, and stay on top of
              urgent actions from one place.
            </p>

            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-gray-500 dark:text-gray-400 sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <Sparkles className="h-3.5 w-3.5" />
                Smart overview
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300">
                <Activity className="h-3.5 w-3.5" />
                Real-time feel
              </span>
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <Link
            to="/restaurant/donate-food"
            className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-green-800 to-emerald-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-emerald-700/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-700/25 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:translate-y-0 dark:focus:ring-offset-gray-900"
          >
            <PlusCircle className="h-5 w-5" />
            Donate Food
          </Link>

          <Link
            to="/restaurant/donation-requests-management"
            className="inline-flex min-h-[48px] cursor-pointer items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 active:translate-y-0 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:border-emerald-700/40 dark:hover:bg-gray-700/70 dark:hover:text-emerald-400 dark:focus:ring-offset-gray-900"
          >
            <List className="h-5 w-5" />
            All Requests
          </Link>
        </div>
      </div>
    </section>
  );
});

const AlertsSection = memo(({ alerts }) => {
  return (
    <section className="space-y-3">
      {alerts.map((alert, idx) => (
        <div
          key={idx}
          className="group flex items-start gap-4 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-amber-700/30 dark:from-amber-950/10 dark:via-orange-950/10 dark:to-amber-950/10 sm:p-5"
          style={{ animationDelay: `${idx * 120}ms` }}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 shadow-sm transition-transform duration-300 group-hover:scale-105 dark:bg-amber-800/40 dark:text-amber-400">
            <AlertCircle className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm  text-amber-900 dark:text-amber-200 sm:text-base">
                Donation Expiring Soon
              </h3>
              <span className="rounded-full bg-amber-200/70 px-2.5 py-1 text-[10px]  uppercase tracking-[0.15em] text-amber-800 dark:bg-amber-900/50 dark:text-amber-300">
                Action Required
              </span>
            </div>

            <p className="mt-1.5 text-sm leading-6 text-amber-800/90 dark:text-amber-300/90">
              <span className="font-medium">"{alert.foodName}"</span> is
              expiring on{" "}
              <span className="font-medium">
                {new Date(alert.expiryTime).toLocaleDateString()}
              </span>
              . Handle it before it turns into avoidable waste.
            </p>
          </div>
        </div>
      ))}
    </section>
  );
});

const StatsSection = memo(({ stats }) => {
  const cards = [
    {
      title: "Total Posted",
      value: stats?.totalDonations ?? 0,
      icon: (
        <Package className="h-6 w-6 text-emerald-700 dark:text-emerald-400" />
      ),
      iconWrap: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-900/30",
      glow: "group-hover:shadow-emerald-900/10",
    },
    {
      title: "Active Requests",
      value: stats?.activeRequests ?? 0,
      icon: <Clock className="h-6 w-6 text-green-800 dark:text-green-400" />,
      iconWrap: "bg-green-50 dark:bg-green-900/20",
      border: "border-green-100 dark:border-green-900/30",
      glow: "group-hover:shadow-green-900/10",
    },
    {
      title: "Approved",
      value: stats?.approvedRequests ?? 0,
      icon: (
        <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
      ),
      iconWrap: "bg-emerald-50 dark:bg-emerald-900/20",
      border: "border-emerald-100 dark:border-emerald-900/30",
      glow: "group-hover:shadow-emerald-900/10",
    },
    {
      title: "Rejected",
      value: stats?.rejectedRequests ?? 0,
      icon: <XCircle className="h-6 w-6 text-rose-600 dark:text-rose-400" />,
      iconWrap: "bg-rose-50 dark:bg-rose-900/20",
      border: "border-rose-100 dark:border-rose-900/30",
      glow: "group-hover:shadow-rose-900/10",
    },
  ];

  return (
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </section>
  );
});

const StatCard = memo(({ title, value, icon, iconWrap, border, glow }) => {
  return (
    <div
      className={`group rounded-[24px] border bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${border} ${glow} dark:bg-gray-800/80`}
    >
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${iconWrap} shadow-inner transition-transform duration-300 group-hover:scale-105`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-xs  uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
            {title}
          </p>
          <h3 className="mt-1 text-3xl  tracking-tight text-gray-900 transition-colors duration-300 group-hover:text-emerald-700 dark:text-white dark:group-hover:text-emerald-400">
            {value}
          </h3>
        </div>
      </div>
    </div>
  );
});

const ChartsSection = memo(({ requestStatusData, foodTypeData }) => {
  return (
    <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <ChartCard
        title="Request Overview"
        icon={<Activity className="h-4 w-4" />}
        description="Current request status distribution at a glance."
      >
        <div className="h-72">
          {requestStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={requestStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {requestStatusData.map((entry, index) => (
                    <Cell
                      key={`pie-cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>

                <Tooltip
                  contentStyle={{
                    borderRadius: "18px",
                    border: "1px solid rgba(16, 185, 129, 0.12)",
                    backgroundColor: "rgba(255,255,255,0.96)",
                    boxShadow: "0 16px 32px rgba(0,0,0,0.10)",
                    color: "#111827",
                    fontWeight: 600,
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    fontSize: "13px",
                    fontWeight: 600,
                    paddingTop: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <InlineEmptyState
              icon={<Activity className="h-10 w-10" />}
              title="No request data yet"
              text="Once requests start moving, the chart will stop looking empty."
            />
          )}
        </div>
      </ChartCard>

      <ChartCard
        title="Categories Donated"
        icon={<TrendingUp className="h-4 w-4" />}
        description="See which food types you are donating most."
      >
        <div className="h-72">
          {foodTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={foodTypeData}
                margin={{ top: 12, right: 8, left: -22, bottom: 0 }}
              >
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#6b7280", fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(16, 185, 129, 0.08)" }}
                  contentStyle={{
                    borderRadius: "18px",
                    border: "1px solid rgba(16, 185, 129, 0.12)",
                    backgroundColor: "rgba(255,255,255,0.96)",
                    boxShadow: "0 16px 32px rgba(0,0,0,0.10)",
                    color: "#111827",
                    fontWeight: 600,
                  }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={42}>
                  {foodTypeData.map((entry, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={index % 2 === 0 ? "#065f46" : "#10b981"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <InlineEmptyState
              icon={<TrendingUp className="h-10 w-10" />}
              title="No category data yet"
              text="You need real donation data before this chart becomes useful."
            />
          )}
        </div>
      </ChartCard>
    </section>
  );
});

const ChartCard = memo(({ title, icon, description, children }) => {
  return (
    <div className="group rounded-[28px] border border-emerald-100/70 bg-white/90 p-5 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-900/5 dark:border-gray-700/60 dark:bg-gray-800/80 sm:p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg tracking-tight text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-transform duration-300 group-hover:scale-105 dark:bg-emerald-900/20 dark:text-emerald-400">
          {icon}
        </div>
      </div>

      {children}
    </div>
  );
});

const DonationsTable = memo(({ donations }) => {
  return (
    <DataTableCard
      title="My Donations"
      icon={<Package className="h-5 w-5 text-emerald-600" />}
      actionText="View All"
      actionTo="/restaurant/donate-food"
    >
      {donations.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/60">
                <th className="px-6 py-4 text-xs  uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Food Item
                </th>
                <th className="px-6 py-4 text-xs  uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Type
                </th>
                <th className="px-6 py-4 text-xs  uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Qty (Rem/Tot)
                </th>
                <th className="px-6 py-4 text-xs  uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {donations.map((item, idx) => {
                const percentage =
                  item.totalQuantity > 0
                    ? Math.min(
                        (item.remainingQuantity / item.totalQuantity) * 100,
                        100,
                      )
                    : 0;

                return (
                  <tr
                    key={idx}
                    className="group border-b border-gray-50 transition-colors duration-200 hover:bg-emerald-50/40 dark:border-gray-700/40 dark:hover:bg-gray-700/30"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-gray-200">
                      {item.foodName}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-xl px-3 py-1 text-xs  uppercase tracking-wide ${
                          item.foodType === "veg"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                        }`}
                      >
                        {item.foodType}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2.5 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-green-800 to-emerald-500 transition-all duration-500"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          {item.remainingQuantity}/{item.totalQuantity}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <StatusBadge status={item.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <TableEmptyState
          icon={<Package className="h-10 w-10" />}
          title="No recent donations posted"
          text="No activity means nothing to manage. Post donations first."
        />
      )}
    </DataTableCard>
  );
});

const AcceptedRequestsTable = memo(({ requests }) => {
  return (
    <DataTableCard
      title="Accepted Requests"
      icon={<CheckCircle className="h-5 w-5 text-emerald-600" />}
      actionText="Manage Requests"
      actionTo="/restaurant/donation-requests-management"
    >
      {requests.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700/60">
                <th className="px-6 py-4 text-xs  uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Food Bank
                </th>
                <th className="px-6 py-4 text-xs  uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Item
                </th>
                <th className="px-6 py-4 text-xs  uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  Qty
                </th>
                <th className="px-6 py-4 text-xs  uppercase tracking-[0.15em] text-gray-500 dark:text-gray-400">
                  My Status
                </th>
              </tr>
            </thead>
            <tbody>
              {requests.map((acc, idx) => (
                <tr
                  key={idx}
                  className="group border-b border-gray-50 transition-colors duration-200 hover:bg-emerald-50/40 dark:border-gray-700/40 dark:hover:bg-gray-700/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                        {acc.request_id?.foodbank_id?.name || "N/A"}
                      </span>
                      <span className="max-w-[240px] truncate text-xs text-gray-500 dark:text-gray-400">
                        {acc.request_id?.foodbank_id?.address || "No address"}
                      </span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-sm font-medium text-gray-700 dark:text-gray-300">
                    {acc.request_id?.foodName || "N/A"}
                  </td>

                  <td className="px-6 py-4 text-sm  text-emerald-700 dark:text-emerald-400">
                    {acc.acceptedQuantity}
                  </td>

                  <td className="px-6 py-4">
                    <StatusBadge status={acc.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <TableEmptyState
          icon={<CheckCircle className="h-10 w-10" />}
          title="No accepted requests yet"
          text="Nothing approved yet. That panel should earn its place."
        />
      )}
    </DataTableCard>
  );
});

const DataTableCard = memo(
  ({ title, icon, actionText, actionTo, children }) => {
    return (
      <section className="overflow-hidden rounded-[28px] border border-emerald-100/70 bg-white/90 shadow-sm backdrop-blur-sm transition-all duration-300 hover:shadow-lg dark:border-gray-700/60 dark:bg-gray-800/80">
        <div className="flex flex-col gap-3 border-b border-gray-100 bg-gradient-to-r from-emerald-50/50 to-white px-6 py-5 dark:border-gray-700/60 dark:from-emerald-950/10 dark:to-gray-800 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="flex items-center gap-2 text-lg  tracking-tight text-gray-900 dark:text-white">
            {icon}
            <span>{title}</span>
          </h3>

          <Link
            to={actionTo}
            className="group inline-flex cursor-pointer items-center gap-1 text-sm font-medium text-emerald-700 transition-all duration-200 hover:text-green-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:text-emerald-400 dark:hover:text-emerald-300 dark:focus:ring-offset-gray-900"
          >
            {actionText}
            <ArrowUpRight className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>

        {children}
      </section>
    );
  },
);

const NotificationsPanel = memo(({ notifications }) => {
  return (
    <section className="overflow-hidden rounded-[28px] border border-emerald-100/70 bg-white/90 shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/80">
      <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5 dark:border-gray-700/60">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg  tracking-tight text-gray-900 dark:text-white">
              Recent Activity
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Latest updates and request signals
            </p>
          </div>
        </div>

        {notifications.length > 0 && (
          <span className="rounded-full bg-emerald-600 px-3 py-1 text-xs  text-white shadow-sm">
            {notifications.length} New
          </span>
        )}
      </div>

      <div className="max-h-[760px] space-y-2 overflow-y-auto p-4">
        {notifications.length > 0 ? (
          notifications.map((notif, idx) => (
            <button
              key={idx}
              type="button"
              className="group flex w-full cursor-pointer items-start gap-4 rounded-2xl p-4 text-left transition-all duration-200 hover:bg-emerald-50/60 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:hover:bg-gray-700/30 dark:focus:ring-offset-gray-900"
            >
              <div className="mt-0.5 shrink-0">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium leading-6 text-gray-800 transition-colors duration-200 group-hover:text-emerald-700 dark:text-gray-200 dark:group-hover:text-emerald-400">
                  {notif.message}
                </p>
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                  <Clock className="h-3.5 w-3.5" />
                  {new Date(notif.createdAt).toLocaleDateString()}
                </p>
              </div>
            </button>
          ))
        ) : (
          <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-300 dark:bg-emerald-900/10 dark:text-emerald-700">
              <Bell className="h-7 w-7" />
            </div>
            <p className="text-base  text-gray-700 dark:text-gray-200">
              You're all caught up
            </p>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
              No recent notifications right now.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 pt-0">
        <button
          type="button"
          className="group inline-flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm  text-emerald-700 transition-all duration-200 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 dark:focus:ring-offset-gray-900"
        >
          View full history
          <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
});

const DashboardLoadingState = () => {
  return (
    <LoadingState
      title="Loading dashboard"
      message="Please wait while we fetch the latest restaurant activity."
      minHeightClassName="min-h-[75vh]"
      panelClassName="border-0 bg-transparent shadow-none"
    />
  );
};

const DashboardEmptyState = () => {
  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4">
      <div className="w-full max-w-md rounded-[28px] border border-emerald-100 bg-white/90 p-8 text-center shadow-sm backdrop-blur-sm dark:border-gray-700/60 dark:bg-gray-800/80">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-400 dark:bg-emerald-900/20 dark:text-emerald-500">
          <Inbox className="h-8 w-8" />
        </div>
        <h2 className="text-xl  tracking-tight text-gray-900 dark:text-white">
          No dashboard data available
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
          Either the API returned nothing or your dashboard feed is not ready
          yet.
        </p>
      </div>
    </div>
  );
};

const InlineEmptyState = memo(({ icon, title, text }) => {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-600">
        {icon}
      </div>
      <p className="text-base  text-gray-800 dark:text-gray-200">
        {title}
      </p>
      <p className="mt-1 max-w-xs text-sm leading-6 text-gray-500 dark:text-gray-400">
        {text}
      </p>
    </div>
  );
});

const TableEmptyState = memo(({ icon, title, text }) => {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-300 dark:bg-emerald-900/20 dark:text-emerald-600">
        {icon}
      </div>
      <p className="text-base  text-gray-800 dark:text-gray-200">
        {title}
      </p>
      <p className="mt-1 max-w-sm text-sm leading-6 text-gray-500 dark:text-gray-400">
        {text}
      </p>
    </div>
  );
});

const StatusBadge = memo(({ status }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs  capitalize ${getStatusColor(
        status,
      )}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status || "Unknown"}
    </span>
  );
});

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "open":
    case "available":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    case "fulfilled":
    case "collected":
    case "closed":
    case "approved":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    case "expired":
    case "rejected":
      return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-700/60 dark:text-gray-300";
  }
};

const getNotificationIcon = (type) => {
  switch (type) {
    case "request":
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-green-100 bg-green-50 text-green-800 shadow-sm dark:border-green-900/30 dark:bg-green-900/20 dark:text-green-400">
          <Clock className="h-4 w-4" />
        </div>
      );
    case "approval":
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-600 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400">
          <Check className="h-4 w-4" />
        </div>
      );
    case "rejection":
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-rose-600 shadow-sm dark:border-rose-900/30 dark:bg-rose-900/20 dark:text-rose-400">
          <X className="h-4 w-4" />
        </div>
      );
    default:
      return (
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50 text-emerald-700 shadow-sm dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400">
          <Bell className="h-4 w-4" />
        </div>
      );
  }
};

export default RestaurantDashboard;
