import React, { useMemo } from "react";
import {
  ShieldCheck,
  Tag,
  ClipboardCheck,
  TriangleAlert,
  CheckCircle2,
  PhoneCall,
  FileText,
  ArrowRight,
  HandHeart,
} from "lucide-react";
import SupportPageLayout from "../components/SupportPageLayout";
import SupportReveal from "../components/SupportReveal";
import { supportRoutes } from "../supportLinks";

const guidelineCards = [
  {
    title: "Label clearly",
    description:
      "Include food type, quantity, preparation timing, allergen-related notes, and any handling instructions the receiving organization must know before pickup.",
    icon: Tag,
    tone: "emerald",
  },
  {
    title: "Confirm pickup details",
    description:
      "Verify collection time, contact number, pickup person, and handoff responsibility before marking a donation as ready for dispatch.",
    icon: ClipboardCheck,
    tone: "green",
  },
  {
    title: "Escalate issues quickly",
    description:
      "If food condition changes, timing shifts, or pickup becomes unsafe, update the platform immediately and inform the receiving party without delay.",
    icon: TriangleAlert,
    tone: "amber",
  },
];

const actionCards = [
  {
    label: "Help center",
    to: supportRoutes.helpCenter,
    icon: FileText,
  },
  {
    label: "Contact support",
    to: supportRoutes.contact,
    icon: PhoneCall,
  },
  {
    label: "Terms of service",
    to: supportRoutes.termsOfService,
    icon: ArrowRight,
  },
];

const responsibilityPoints = [
  "Prepare and store donated food using appropriate hygiene and temperature practices.",
  "Communicate clearly with the receiving organization about timing, condition, and handoff expectations.",
  "Stop the donation process immediately if the item no longer appears safe or suitable for distribution.",
  "Follow local food safety regulations, internal policies, and any required compliance standards.",
];

const toneClasses = {
  emerald: {
    iconWrap: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    card: "border-emerald-100 bg-gradient-to-br from-white via-emerald-50/40 to-white hover:border-emerald-200",
  },
  green: {
    iconWrap: "bg-green-50 text-green-800 ring-1 ring-green-100",
    card: "border-green-100 bg-gradient-to-br from-white via-green-50/40 to-white hover:border-green-200",
  },
  amber: {
    iconWrap: "bg-amber-50 text-amber-600 ring-1 ring-amber-100",
    card: "border-amber-100 bg-gradient-to-br from-white via-amber-50/40 to-white hover:border-amber-200",
  },
};

const GuidelineCard = React.memo(({ title, description, icon, tone }) => {
  const styles = toneClasses[tone] || toneClasses.emerald;

  return (
    <article
      className={`group rounded-3xl border p-5 sm:p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl ${styles.card}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 ${styles.iconWrap}`}
      >
        {React.createElement(icon, { size: 22 })}
      </div>

      <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
});

GuidelineCard.displayName = "GuidelineCard";

const QuickActionCard = React.memo(({ label, to, icon }) => {
  return (
    <a
      href={to}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50/60 hover:shadow-md focus:outline-none focus:ring-4 focus:ring-emerald-100"
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors duration-300 group-hover:bg-emerald-100 group-hover:text-emerald-700">
          {React.createElement(icon, { size: 18 })}
        </div>
        <span className="truncate text-sm font-semibold text-slate-800">
          {label}
        </span>
      </div>

      <ArrowRight
        size={16}
        className="shrink-0 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-700"
      />
    </a>
  );
});

QuickActionCard.displayName = "QuickActionCard";

const SafetyGuidelinesPage = () => {
  const highlights = useMemo(
    () => [
      {
        title: "Label clearly",
        description:
          "Include food type, quantity, preparation timing, and any handling notes that the receiving organization needs to know.",
      },
      {
        title: "Confirm pickup details",
        description:
          "Verify pickup windows, contact numbers, and collection responsibilities before marking a donation as ready.",
      },
      {
        title: "Escalate issues quickly",
        description:
          "If food condition changes or a pickup cannot proceed safely, update the platform immediately and notify the other party.",
      },
    ],
    [],
  );

  const actions = useMemo(
    () => [
      { label: "Help center", to: supportRoutes.helpCenter },
      { label: "Contact support", to: supportRoutes.contact },
      { label: "Terms of service", to: supportRoutes.termsOfService },
    ],
    [],
  );

  return (
    <SupportPageLayout
      eyebrow="Safety Guidelines"
      title="Food safety and coordination guidance"
      description="Use these baseline guidelines to reduce risk during donation preparation, handoff coordination, pickup, and recipient distribution."
      highlights={highlights}
      actions={actions}
      fullWidthMain
      secondaryPlacement="bottom"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Hero / Intro */}
        <SupportReveal
          as="section"
          variant="hero"
          className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-green-800 via-emerald-700 to-emerald-600 p-6 text-white shadow-xl sm:p-8 lg:p-10"
        >
          <div className="absolute -right-10 -top-10 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-12 -left-8 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-emerald-50 ring-1 ring-white/15 backdrop-blur-sm">
                <ShieldCheck size={14} />
                Safe donation coordination
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Reduce avoidable risk before food leaves your hands
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                Good coordination is not optional. Clear labeling, proper
                timing, and fast communication prevent confusion, delays, and
                unsafe handoffs.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:min-w-[320px]">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                  Focus
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  Safe preparation
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                  Priority
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  Reliable handoff
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                  Need
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  Fast updates
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm ring-1 ring-white/15 transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                  Goal
                </p>
                <p className="mt-2 text-sm font-semibold text-white">
                  Lower risk
                </p>
              </div>
            </div>
          </div>
        </SupportReveal>

        {/* Main guideline cards */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {guidelineCards.map((item) => (
            <SupportReveal key={item.title} variant="soft">
              <GuidelineCard
                title={item.title}
                description={item.description}
                icon={item.icon}
                tone={item.tone}
              />
            </SupportReveal>
          ))}
        </section>

        {/* Shared responsibility + quick actions */}
        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
          <SupportReveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100">
                <HandHeart size={22} />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Shared responsibility
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  SharePlate coordinates donations, but participating
                  organizations still carry responsibility for safe food
                  handling, timely communication, and compliance with local
                  requirements. Do not treat the platform as a substitute for
                  proper operational judgment.
                </p>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4">
              {responsibilityPoints.map((point) => (
                <SupportReveal key={point} variant="soft">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-100 hover:bg-emerald-50/50">
                    <CheckCircle2
                      size={18}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <p className="text-sm leading-7 text-slate-700">{point}</p>
                  </div>
                </SupportReveal>
              ))}
            </div>
          </SupportReveal>

          <SupportReveal
            as="aside"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-green-50 text-green-800 ring-1 ring-green-100">
                <FileText size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Quick actions
                </h3>
                <p className="text-sm text-slate-500">
                  Get help or review policy pages
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {actionCards.map((item) => (
                <SupportReveal key={item.label} variant="soft">
                  <QuickActionCard
                    label={item.label}
                    to={item.to}
                    icon={item.icon}
                  />
                </SupportReveal>
              ))}
            </div>
          </SupportReveal>
        </section>
      </div>
    </SupportPageLayout>
  );
};

export default SafetyGuidelinesPage;
