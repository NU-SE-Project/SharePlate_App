import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  PackageSearch,
  RefreshCcw,
  MapPin,
  Clock,
  TrendingUp,
} from "lucide-react";

const tabs = [
  { id: "available", label: "Available pickups" },
  { id: "empty", label: "Quiet zones" },
  { id: "error", label: "Route alerts" },
];

const previewContent = {
  available: {
    state: "ready",
    eyebrow: "Live availability",
    title: "6 matched donations near Colombo 03",
    description:
      "Fresh meals, bakery boxes, and produce bundles are ready for coordinated pickup in the next 90 minutes.",
    metrics: [
      { label: "Claim response", value: "< 3 min", icon: Clock },
      { label: "Pickup reliability", value: "98%", icon: TrendingUp },
      { label: "Estimated meals", value: "142", icon: MapPin },
    ],
  },
  empty: {
    state: "empty",
    eyebrow: "Coverage update",
    title: "No new pickups in this zone yet",
    description:
      "SharePlate will surface the next verified donation automatically and notify nearby food banks the moment it is posted.",
  },
  error: {
    state: "error",
    eyebrow: "Dispatch warning",
    title: "A routing sync issue needs attention",
    description:
      "The logistics service is retrying now. Teams can continue browsing previous matches while route optimization reconnects.",
  },
};

const skeletonRows = Array.from({ length: 3 }, (_, index) => index);

const tabClassName = (active) =>
  `cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
    active
      ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:bg-slate-800"
      : "bg-white text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:shadow-sm"
  }`;

const LoadingState = () => (
  <div className="space-y-4" aria-live="polite" aria-busy="true">
    <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
      <LoaderCircle className="h-4 w-4 animate-spin text-emerald-600" />
      <span>Syncing the latest opportunity feed</span>
    </div>
    <div className="space-y-3">
      {skeletonRows.map((row) => (
        <div
          key={row}
          className="animate-pulse rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-5"
        >
          <div className="h-4 w-28 rounded-full bg-slate-200" />
          <div className="mt-4 h-6 w-3/4 rounded-full bg-slate-200" />
          <div className="mt-3 h-4 w-full rounded-full bg-slate-100" />
          <div className="mt-2 h-4 w-5/6 rounded-full bg-slate-100" />
        </div>
      ))}
    </div>
  </div>
);

const EmptyState = ({ title, description }) => (
  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-gradient-to-br from-slate-50 to-white p-8 text-center transition-all duration-300 hover:border-slate-400">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-white text-slate-500 shadow-sm transition-transform duration-300 hover:scale-105">
      <PackageSearch className="h-7 w-7" />
    </div>
    <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">
      {title}
    </h3>
    <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-slate-600">
      {description}
    </p>
    <button
      type="button"
      className="group mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
    >
      Expand coverage
      <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
    </button>
  </div>
);

const ErrorState = ({ title, description }) => (
  <div
    className="rounded-[2rem] border border-red-200 bg-gradient-to-br from-red-50/80 to-white p-8 transition-all duration-300"
    role="alert"
    aria-live="assertive"
  >
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-red-500 shadow-sm transition-transform duration-200 hover:scale-105">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-2xl font-semibold tracking-tight text-slate-900">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
        <button
          type="button"
          className="group mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full border border-red-200 bg-white px-5 py-3 text-sm font-semibold text-red-600 transition-all duration-200 hover:-translate-y-0.5 hover:bg-red-50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2"
        >
          <RefreshCcw className="h-4 w-4 transition-transform duration-200 group-hover:rotate-180" />
          Retry sync
        </button>
      </div>
    </div>
  </div>
);

const ReadyState = ({ title, description, metrics }) => (
  <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/30 p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] transition-all duration-300 hover:shadow-[0_32px_80px_-32px_rgba(15,23,42,0.45)] md:p-8">
    <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
      <div className="max-w-xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          System healthy
        </div>
        <h3 className="mt-4 text-2xl font-semibold tracking-tight text-slate-950 md:mt-5 md:text-3xl">
          {title}
        </h3>
        <p className="mt-3 text-sm leading-7 text-slate-600 md:mt-4">
          {description}
        </p>
      </div>
      <div className="grid w-full gap-4 sm:grid-cols-3 lg:max-w-md">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className="group rounded-2xl border border-slate-200 bg-white p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-md md:rounded-3xl md:p-5"
            >
              <div className="flex items-center gap-2 md:block">
                <Icon className="mb-0 h-4 w-4 text-emerald-600 md:mb-2 md:h-5 md:w-5" />
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                  {metric.label}
                </p>
              </div>
              <p className="mt-2 text-xl font-semibold tracking-tight text-slate-950 md:mt-3 md:text-2xl">
                {metric.value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  </div>
);

const StatePreviewPanel = () => {
  const [activeTab, setActiveTab] = useState("available");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 700);

    return () => clearTimeout(timeoutId);
  }, [activeTab]);

  const handleTabChange = useCallback(
    (tabId) => {
      if (tabId === activeTab) return;
      setIsLoading(true);
      setActiveTab(tabId);
    },
    [activeTab],
  );

  const content = useMemo(() => previewContent[activeTab], [activeTab]);

  return (
    <section className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 py-8 px-4 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="animate-fade-up rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-[0_32px_120px_-48px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-all duration-300 hover:shadow-[0_40px_140px_-48px_rgba(15,23,42,0.55)] sm:p-6 md:p-8 lg:p-10">
          {/* Header Section */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-700">
                Built-in states
              </p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl md:text-4xl">
                A homepage that behaves like a real product surface
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600 md:mt-4 md:text-base md:leading-8">
                The preview below intentionally includes loading, empty, and
                error treatments so the UI stays polished even when the data
                does not.
              </p>
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={tabClassName(activeTab === tab.id)}
                  aria-pressed={activeTab === tab.id}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="mt-6 md:mt-8">
            {isLoading && <LoadingState />}
            {!isLoading && content.state === "ready" && (
              <ReadyState
                title={content.title}
                description={content.description}
                metrics={content.metrics}
              />
            )}
            {!isLoading && content.state === "empty" && (
              <EmptyState
                title={content.title}
                description={content.description}
              />
            )}
            {!isLoading && content.state === "error" && (
              <ErrorState
                title={content.title}
                description={content.description}
              />
            )}
          </div>

          {/* Footer Status */}
          <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm text-slate-500 transition-all duration-200 hover:bg-slate-50 sm:flex-row sm:items-center sm:justify-between md:rounded-3xl">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
              {content.eyebrow}
            </span>
            <span className="text-xs font-medium text-slate-700 sm:text-sm">
              Updated 12 seconds ago
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StatePreviewPanel;
