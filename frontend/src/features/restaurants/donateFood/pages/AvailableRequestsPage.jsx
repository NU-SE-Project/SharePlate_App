import React, { useMemo, useState } from "react";
import RequestList from "../components/RequestList";
import DonationRequestList from "../components/DonationRequestList";
import {
  ChevronLeft,
  Bell,
  HandHeart,
  ClipboardList,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";

const TABS = [
  {
    key: "foodbank",
    label: "Requests From Food Banks",
    shortLabel: "Food Bank Requests",
    icon: ClipboardList,
    title: "Support urgent food bank needs",
    description:
      "Browse active requests from food banks and respond with available donations quickly.",
  },
  {
    key: "donation",
    label: "Requests For My Donations",
    shortLabel: "My Donation Requests",
    icon: HandHeart,
    title: "Manage requests for your donations",
    description:
      "Track and review incoming requests from organizations interested in your shared donations.",
  },
];

const AvailableRequestsPage = () => {
  const [activeTab, setActiveTab] = useState("foodbank");

  const activeTabData = useMemo(
    () => TABS.find((tab) => tab.key === activeTab) || TABS[0],
    [activeTab],
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {/* Header */}
        <div className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-green-100/60 shadow-[0_10px_40px_rgba(16,185,129,0.08)]">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-green-200/30 blur-2xl" />
          </div>

          <div className="relative p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-4 sm:gap-5">
                <Link
                  to="/restaurant/dashboard"
                  className="group inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-2xl border border-emerald-100 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-x-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:h-12 sm:w-12"
                  aria-label="Go back to restaurant dashboard"
                >
                  <ChevronLeft
                    size={22}
                    className="transition-transform duration-300 group-hover:-translate-x-0.5"
                  />
                </Link>

                <div className="min-w-0">
                  <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 sm:text-sm">
                    <Sparkles size={14} />
                    Available Requests
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                    Active Food Bank Requests
                  </h1>

                  <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                    Discover what nearby food banks need most right now. Accept
                    requests, review donation demand, and respond faster with a
                    cleaner workflow.
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
                        Live Updates
                      </p>
                      <p className="text-xs text-slate-500">
                        Real-time request visibility
                      </p>
                    </div>
                  </div>
                  <p className="text-sm leading-6 text-slate-600">
                    Stay updated as food banks submit new requests and donation
                    needs change.
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
                        <p className="text-sm font-semibold">New Donation</p>
                        <p className="text-xs text-emerald-100">
                          Start a fresh donation flow
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-emerald-50">
                        Create donation now
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

        {/* Tab Section */}
        <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
          <div className="border-b border-slate-100 px-4 py-4 sm:px-6 sm:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">
                  Request Categories
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Switch between public food bank requests and requests related
                  to your own donations.
                </p>
              </div>

              <div
                className="inline-flex w-full flex-col gap-2 rounded-2xl bg-slate-50 p-2 sm:w-auto sm:flex-row"
                role="tablist"
                aria-label="Available request tabs"
              >
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const Icon = tab.icon;

                  return (
                    <button
                      key={tab.key}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      aria-controls={`${tab.key}-panel`}
                      id={`${tab.key}-tab`}
                      onClick={() => setActiveTab(tab.key)}
                      className={`group inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:min-w-[220px] ${
                        isActive
                          ? "bg-gradient-to-r from-emerald-600 to-green-800 text-white shadow-lg shadow-emerald-100"
                          : "bg-transparent text-slate-600 hover:bg-white hover:text-emerald-700"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={`transition-transform duration-300 ${
                          isActive ? "scale-100" : "group-hover:scale-105"
                        }`}
                      />
                      <span className="hidden sm:inline">{tab.label}</span>
                      <span className="sm:hidden">{tab.shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Active Tab Intro */}
          <div className="border-b border-slate-100 bg-gradient-to-r from-emerald-50/70 via-white to-green-50/70 px-4 py-5 sm:px-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 shadow-sm">
                  <activeTabData.icon size={22} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                    {activeTabData.title}
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
                    {activeTabData.description}
                  </p>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 self-start rounded-full border border-emerald-200 bg-white px-3 py-1.5 text-xs font-semibold text-emerald-700 shadow-sm">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                </span>
                Updated and ready for action
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="px-4 py-5 sm:px-6 sm:py-6">
            <div
              id={`${activeTab}-panel`}
              role="tabpanel"
              aria-labelledby={`${activeTab}-tab`}
              className="animate-in fade-in zoom-in-95 duration-300"
            >
              {activeTab === "foodbank" ? (
                <RequestList />
              ) : (
                <DonationRequestList />
              )}
            </div>
          </div>
        </div>

        {/* Bottom helper section */}
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-900">
              Faster decisions
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Clear request grouping helps restaurants identify what matters
              first without wasting time.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-900">
              Better visibility
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Separate donation-related demand from general food bank needs so
              the flow stays organized.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
            <p className="text-sm font-semibold text-slate-900">
              Cleaner interaction
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Proper focus states, keyboard support, and smoother transitions
              make the page feel more polished.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailableRequestsPage;
