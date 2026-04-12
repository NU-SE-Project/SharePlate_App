import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import HomeHeader from "../../../home/components/Header";
import Footer from "../../../home/components/Footer";
import SupportReveal from "./SupportReveal";

const ContactItem = memo(({ icon, children }) => (
  <div className="group flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/10">
    <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300 transition-transform duration-300 group-hover:scale-105">
      {React.createElement(icon, { className: "h-4 w-4" })}
    </div>
    <div className="min-w-0 text-sm leading-6 text-slate-300">{children}</div>
  </div>
));

ContactItem.displayName = "ContactItem";

const HighlightCard = memo(({ title, description }) => (
  <article className="group rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-100/40 sm:p-6">
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700 transition-transform duration-300 group-hover:scale-105">
        <Sparkles className="h-5 w-5" />
      </div>
      <div>
        <h2 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
      </div>
    </div>
  </article>
));

HighlightCard.displayName = "HighlightCard";

const QuickActionLink = memo(({ to, label }) => (
  <Link
    to={to}
    className="group flex cursor-pointer items-center justify-between rounded-2xl border border-emerald-100 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/60 hover:text-emerald-700 hover:shadow-md hover:shadow-emerald-100/40 focus:outline-none focus:ring-4 focus:ring-emerald-100"
  >
    <span className="pr-3">{label}</span>
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-emerald-100">
      <ArrowRight className="h-4 w-4" />
    </span>
  </Link>
));

QuickActionLink.displayName = "QuickActionLink";

const SupportPageLayout = ({
  eyebrow,
  title,
  description,
  highlights = [],
  actions = [],
  children,
  fullWidthMain = false,
  secondaryPlacement = "side",
}) => {
  const hasHighlights = highlights.length > 0;
  const hasActions = actions.length > 0;
  const showSecondaryBelow = secondaryPlacement === "bottom";

  const renderedHighlights = useMemo(
    () =>
      highlights.map((item) => (
        <HighlightCard
          key={item.title}
          title={item.title}
          description={item.description}
        />
      )),
    [highlights],
  );

  const renderedActions = useMemo(
    () =>
      actions.map((action) => (
        <QuickActionLink
          key={action.label}
          to={action.to}
          label={action.label}
        />
      )),
    [actions],
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(6,95,70,0.10),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_46%,_#ecfdf5_100%)] text-slate-900">
      <HomeHeader />

      <main className="mx-auto max-w-7xl px-4 pb-16 pt-10 sm:px-6 sm:pt-12 lg:px-8 lg:pb-24 lg:pt-14">
        <div
          className={
            fullWidthMain || showSecondaryBelow
              ? "space-y-8"
              : "grid gap-8 xl:grid-cols-[1.2fr_0.8fr] xl:gap-10"
          }
        >
          {/* Main Content */}
          <SupportReveal
            as="section"
            variant="hero"
            className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-[0_30px_90px_-50px_rgba(15,23,42,0.32)] backdrop-blur-md transition-all duration-300 sm:p-8 lg:p-10"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-r from-emerald-500/8 via-transparent to-green-800/8" />

            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-700 shadow-sm">
                <ShieldCheck className="h-4 w-4" />
                <span>{eyebrow}</span>
              </div>

              <div className="mt-6 max-w-4xl">
                <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8 lg:text-lg">
                  {description}
                </p>
              </div>

              {hasHighlights && (
                <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:mt-10">
                  {renderedHighlights}
                </div>
              )}

              <div className="mt-8 space-y-4 lg:mt-10">{children}</div>
            </div>
          </SupportReveal>

          <aside
            className={
              showSecondaryBelow ? "grid gap-6 lg:grid-cols-2" : "space-y-6"
            }
          >
            <SupportReveal
              variant="soft"
              className="overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-slate-100 shadow-[0_30px_90px_-54px_rgba(15,23,42,0.75)] sm:p-8"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-300">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-300">
                    Contact
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Support channels for all platform users
                  </p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <ContactItem icon={Mail}>support@shareplate.com</ContactItem>
                <ContactItem icon={Phone}>+94 76 123 4567</ContactItem>
                <ContactItem icon={MapPin}>
                  Support available for food banks, restaurants, and platform
                  administrators.
                </ContactItem>
              </div>
            </SupportReveal>

            <SupportReveal
              variant="soft"
              className="rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:shadow-emerald-100/40 sm:p-8"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                  <ArrowRight className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-emerald-700">
                    Quick Actions
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Navigate to common support pages faster
                  </p>
                </div>
              </div>

              {hasActions ? (
                <div className="mt-5 space-y-3">{renderedActions}</div>
              ) : (
                <div className="mt-5 rounded-2xl border border-dashed border-emerald-200 bg-white/70 px-4 py-5 text-sm font-medium text-slate-500">
                  No quick actions available right now.
                </div>
              )}
            </SupportReveal>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default memo(SupportPageLayout);
