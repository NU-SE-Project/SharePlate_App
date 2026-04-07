import React, { memo, useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Clock3,
  HandHeart,
  HeartHandshake,
  MapPin,
  PackageCheck,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  Users,
  UtensilsCrossed,
  AlertCircle,
  Inbox,
} from "lucide-react";
import ScrollReveal from "./ScrollReveal";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";

const sectionShell =
  "relative overflow-hidden rounded-3xl border border-emerald-100 bg-white/90 shadow-sm backdrop-blur-sm";
const badgeCls =
  "inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700";
const headingCls =
  "text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl";
const subTextCls = "max-w-2xl text-sm leading-7 text-slate-600 sm:text-base";

const HOW_IT_WORKS_STEPS = [
  {
    id: 1,
    title: "List surplus food fast",
    description:
      "Donors add food details, quantity, pickup window, and location in minutes without unnecessary friction.",
    icon: UtensilsCrossed,
  },
  {
    id: 2,
    title: "Verified requests get matched",
    description:
      "Nearby charities, shelters, and community volunteers see relevant donations and request them quickly.",
    icon: HeartHandshake,
  },
  {
    id: 3,
    title: "Pickup and delivery are coordinated",
    description:
      "Clear status updates help everyone know who accepted, who is picking up, and when the food moves.",
    icon: Truck,
  },
  {
    id: 4,
    title: "Impact is tracked transparently",
    description:
      "Meals saved, waste reduced, and community reach are surfaced in a way users can actually understand.",
    icon: PackageCheck,
  },
];

const WHY_SHAREPLATE_ITEMS = [
  {
    title: "Reduce edible food waste",
    description:
      "Restaurants, homes, events, and stores can redirect usable food before it gets thrown away.",
    icon: Sparkles,
  },
  {
    title: "Serve people faster",
    description:
      "Urgent needs are matched with nearby available food instead of relying on slow, manual coordination.",
    icon: Users,
  },
  {
    title: "Trust through visibility",
    description:
      "Status tracking, verified organizations, and clear pickup details reduce confusion and misuse.",
    icon: ShieldCheck,
  },
  {
    title: "Designed for local impact",
    description:
      "Location-aware listings make the platform practical for neighborhoods, towns, and city-level communities.",
    icon: MapPin,
  },
];

const DEFAULT_ACTIVITY = {
  loading: false,
  error: false,
  empty: false,
  items: [
    {
      id: 1,
      title: "Fresh meal packs accepted",
      meta: "12 meal packs • Collected within 18 minutes",
      location: "Jaffna Town",
      status: "Matched",
      icon: CheckCircle2,
    },
    {
      id: 2,
      title: "Bakery surplus awaiting pickup",
      meta: "28 bread items • Pickup closes in 40 minutes",
      location: "Kilinochchi",
      status: "Urgent",
      icon: Clock3,
    },
    {
      id: 3,
      title: "Community shelter request fulfilled",
      meta: "Rice packets and vegetables delivered",
      location: "Vavuniya",
      status: "Completed",
      icon: HandHeart,
    },
  ],
};

const cn = (...classes) => classes.filter(Boolean).join(" ");

const SectionHeader = memo(function SectionHeader({
  badge,
  title,
  description,
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <span className={badgeCls}>{badge}</span>
      <h2 className={cn(headingCls, "mt-4")}>{title}</h2>
      <p className={cn(subTextCls, "mx-auto mt-4")}>{description}</p>
    </div>
  );
});

const StepCard = memo(function StepCard({ step }) {
  const Icon = step.icon;

  return (
    <Card
      as="article"
      className="group relative rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
      aria-label={step.title}
    >
      <div className="absolute inset-x-6 top-0 h-1 rounded-b-full bg-gradient-to-r from-emerald-500 to-blue-500 opacity-80" />
      <div className="flex items-start gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition duration-300 group-hover:scale-105 group-hover:bg-emerald-100">
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-bold text-slate-700">
              {step.id}
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              {step.title}
            </h3>
          </div>
          <p className="mt-4 text-sm leading-7 text-slate-600">
            {step.description}
          </p>
        </div>
      </div>
    </Card>
  );
});

const ImpactCard = memo(function ImpactCard({ item }) {
  const Icon = item.icon;

  return (
    <Card
      as="article"
      className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 transition duration-300 group-hover:scale-105">
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-lg font-semibold text-slate-900">
        {item.title}
      </h3>
      <p className="mt-3 text-sm leading-7 text-slate-600">
        {item.description}
      </p>
    </Card>
  );
});

const ActivityPill = memo(function ActivityPill({ icon, label, value }) {
  const Icon = icon;

  return (
    <Card className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition duration-300 hover:border-emerald-200 hover:bg-emerald-50/50">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </div>
    </Card>
  );
});

const ActivitySkeleton = memo(function ActivitySkeleton() {
  return (
    <div className="grid gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="animate-pulse rounded-3xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-2xl bg-slate-200" />
            <div className="flex-1 space-y-3">
              <div className="h-4 w-40 rounded bg-slate-200" />
              <div className="h-3 w-64 rounded bg-slate-200" />
              <div className="h-3 w-32 rounded bg-slate-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

const EmptyState = memo(function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm">
        <Inbox className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">
        No live activity yet
      </h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
        Once donors and receivers start using the platform, real-time updates
        will appear here.
      </p>
    </div>
  );
});

const ErrorState = memo(function ErrorState({ onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50 px-6 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-red-600 shadow-sm">
        <AlertCircle className="h-8 w-8" />
      </div>
      <h3 className="mt-5 text-xl font-semibold text-slate-900">
        Failed to load activity
      </h3>
      <p className="mt-3 max-w-md text-sm leading-7 text-slate-600">
        Something broke. Don't hide the failure. Show it clearly and let the
        user recover.
      </p>
      <Button
        type="button"
        onClick={onRetry}
        className="mt-6 cursor-pointer rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:ring-slate-900"
      >
        <RefreshCw className="h-4 w-4" />
        Retry
      </Button>
    </div>
  );
});

const ActivityCard = memo(function ActivityCard({ item }) {
  const Icon = item.icon;

  const statusStyles = {
    Matched: "bg-emerald-50 text-emerald-700 border-emerald-200",
    Urgent: "bg-amber-50 text-amber-700 border-amber-200",
    Completed: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <Card
      as="article"
      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition duration-300 group-hover:scale-105">
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900 sm:text-lg">
              {item.title}
            </h3>
            <p className="mt-1 text-sm leading-6 text-slate-600">{item.meta}</p>

            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {item.location}
              </span>
            </div>
          </div>
        </div>

        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full border px-3 py-1 text-xs font-semibold",
            statusStyles[item.status] ||
              "bg-slate-50 text-slate-700 border-slate-200",
          )}
        >
          {item.status}
        </span>
      </div>
    </Card>
  );
});

const HowItWorksSection = memo(function HowItWorksSection() {
  return (
    <ScrollReveal
      id="how-it-works"
      className="scroll-mt-28"
      aria-labelledby="how-it-works-title"
    >
      <div className={cn(sectionShell, "p-6 sm:p-8 lg:p-10")}>
        <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-emerald-100 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-blue-100 blur-3xl" />

        <div className="relative">
          <ScrollReveal delay={100}>
            <SectionHeader
              badge="How it works"
              title="A clear donation flow that doesn't confuse people"
              description="The app should make food sharing faster, safer, and easier. If users need a tutorial to understand the flow, the design already failed."
            />
          </ScrollReveal>

          <div className="mt-10 grid gap-5 lg:grid-cols-2">
            {HOW_IT_WORKS_STEPS.map((step, index) => (
              <ScrollReveal
                key={step.id}
                delay={Math.min((index + 1) * 100, 400)}
              >
                <StepCard step={step} />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
});

const WhySharePlateSection = memo(function WhySharePlateSection() {
  return (
    <ScrollReveal
      id="impact"
      className="scroll-mt-28"
      aria-labelledby="impact-title"
    >
      <div className={cn(sectionShell, "p-6 sm:p-8 lg:p-10")}>
        <div className="relative">
          <ScrollReveal delay={100}>
            <SectionHeader
              badge="Why SharePlate"
              title="Because wasted food and unmet hunger existing together is stupid"
              description="SharePlate exists to bridge that gap with a product that is practical, transparent, and community-driven, not just another feel-good landing page."
            />
          </ScrollReveal>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {WHY_SHAREPLATE_ITEMS.map((item, index) => (
              <ScrollReveal
                key={item.title}
                delay={Math.min((index + 1) * 100, 400)}
              >
                <ImpactCard item={item} />
              </ScrollReveal>
            ))}
          </div>

          <div className="mt-8 grid gap-4 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-blue-50 p-6 lg:grid-cols-3">
            <ScrollReveal delay={100}>
              <Card className="rounded-2xl bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Active food listings
                </p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">248</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Surplus meals and essential food items currently available for
                  request and pickup.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={200}>
              <Card className="rounded-2xl bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Verified donors
                </p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">67</h3>
                <p className="mt-2 text-sm text-slate-600">
                  Restaurants, grocery stores, event organizers, and households
                  contributing usable food.
                </p>
              </Card>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <Card className="rounded-2xl bg-white/80 p-5 shadow-sm">
                <p className="text-sm font-medium text-slate-500">
                  Requests fulfilled
                </p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  1,420+
                </h3>
                <p className="mt-2 text-sm text-slate-600">
                  Completed food redistribution requests successfully matched,
                  collected, and delivered.
                </p>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </div>
    </ScrollReveal>
  );
});

const ActivitySection = memo(function ActivitySection() {
  const [state, setState] = useState(DEFAULT_ACTIVITY);

  const stats = useMemo(
    () => [
      { icon: Activity, label: "Live listings", value: "48" },
      { icon: Store, label: "Active donors", value: "21" },
      { icon: Users, label: "Receivers online", value: "34" },
    ],
    [],
  );

  const visibleContent = useMemo(() => {
    if (state.loading) return <ActivitySkeleton />;
    if (state.error)
      return <ErrorState onRetry={() => setState(DEFAULT_ACTIVITY)} />;
    if (state.empty) return <EmptyState />;

    return (
      <div className="grid gap-4">
        {state.items.map((item) => (
          <ActivityCard key={item.id} item={item} />
        ))}
      </div>
    );
  }, [state]);

  return (
    <ScrollReveal
      id="live-states"
      className="scroll-mt-28"
      aria-labelledby="activity-title"
    >
      <div className={cn(sectionShell, "p-6 sm:p-8 lg:p-10")}>
        <div className="relative">
          <ScrollReveal delay={100}>
            <SectionHeader
              badge="Activity"
              title="Live platform movement, not dead static placeholders"
              description="Users need confidence that food is being listed, claimed, and delivered. Good activity design reduces hesitation and increases trust."
            />
          </ScrollReveal>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {stats.map((item, index) => (
              <ScrollReveal
                key={item.label}
                delay={Math.min((index + 1) * 100, 300)}
              >
                <ActivityPill
                  icon={item.icon}
                  label={item.label}
                  value={item.value}
                />
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal delay={200}>
            <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Recent activity feed
                  </h3>
                  <p className="text-sm text-slate-600">
                    Real-time donation and request updates across the platform.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        loading: true,
                        error: false,
                        empty: false,
                      }))
                    }
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700 focus-visible:ring-emerald-600"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Loading
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setState({
                        loading: false,
                        error: false,
                        empty: true,
                        items: [],
                      })
                    }
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:text-emerald-700 focus-visible:ring-emerald-600"
                  >
                    <Inbox className="h-4 w-4" />
                    Empty
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setState({
                        loading: false,
                        error: true,
                        empty: false,
                        items: [],
                      })
                    }
                    className="cursor-pointer rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-red-300 hover:text-red-700 focus-visible:ring-red-600"
                  >
                    <AlertCircle className="h-4 w-4" />
                    Error
                  </Button>

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setState(DEFAULT_ACTIVITY)}
                    className="cursor-pointer rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-slate-800 focus-visible:ring-slate-900"
                  >
                    Live data
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {visibleContent}
            </div>
          </ScrollReveal>
        </div>
      </div>
    </ScrollReveal>
  );
});

const SharePlateLandingSections = () => {
  return (
    <div className="bg-slate-50">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
        <HowItWorksSection />
        <WhySharePlateSection />
        <ActivitySection />
      </div>
    </div>
  );
};

export default memo(SharePlateLandingSections);
