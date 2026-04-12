import React, { memo } from "react";
import {
  ShieldCheck,
  FileText,
  BadgeCheck,
  Scale,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import SupportPageLayout from "../components/SupportPageLayout";
import SupportReveal from "../components/SupportReveal";
import { supportRoutes } from "../supportLinks";

const termsSections = [
  {
    icon: FileText,
    title: "Use accurate information",
    description:
      "All account details, donation listings, pickup requests, and contact information should be truthful, current, and complete so coordination happens without confusion or avoidable delays.",
  },
  {
    icon: BadgeCheck,
    title: "Act responsibly on the platform",
    description:
      "Fraud, abuse, harassment, impersonation, spam, or repeated misuse of workflows is not allowed. Users must interact respectfully and use SharePlate only for legitimate platform purposes.",
  },
  {
    icon: Scale,
    title: "Meet operational obligations",
    description:
      "Restaurants, food banks, and other participants remain responsible for their own compliance, food handling practices, timing commitments, and safe coordination during handoff and pickup.",
  },
];

const enforcementPoints = [
  "Reported issues may be reviewed to protect platform trust and user safety.",
  "SharePlate may request additional information when investigating suspicious or harmful activity.",
  "Access may be limited, suspended, or removed if misuse, fraud, or repeated disruption is identified.",
];

const TermsCard = memo(({ icon, title, description }) => {
  return (
    <article
      className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/40 sm:p-6"
      tabIndex={0}
    >
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-800 to-emerald-600 text-white shadow-lg shadow-emerald-200 transition-transform duration-300 group-hover:scale-105">
          {React.createElement(icon, { size: 20 })}
        </div>

        <div className="min-w-0">
          <h3 className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        </div>
      </div>
    </article>
  );
});

TermsCard.displayName = "TermsCard";

const TermsOfServicePage = () => {
  return (
    <SupportPageLayout
      eyebrow="Terms of Service"
      title="Platform rules for using SharePlate"
      description="These terms explain the standards for using SharePlate properly, including honest listings, respectful coordination, and responsible participation across the platform."
      highlights={[
        {
          title: "Accurate information",
          description:
            "Users must keep account details, listings, and requests up to date so pickups and coordination can happen without avoidable errors.",
        },
        {
          title: "Responsible platform use",
          description:
            "Fraud, harassment, abuse, spam, or repeated disruption of platform activity can result in account review, restriction, or removal.",
        },
        {
          title: "Operational accountability",
          description:
            "Restaurants and food banks remain responsible for food handling, coordination, timing, and any obligations required by applicable practice or law.",
        },
      ]}
      actions={[
        { label: "Privacy policy", to: supportRoutes.privacyPolicy },
        { label: "Safety guidelines", to: supportRoutes.safetyGuidelines },
        { label: "Contact support", to: supportRoutes.contact },
      ]}
      fullWidthMain
      secondaryPlacement="bottom"
    >
      <div className="space-y-6 sm:space-y-8">
        <SupportReveal
          as="section"
          variant="hero"
          className="overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-green-800 via-green-800 to-emerald-600 p-6 text-white shadow-xl shadow-emerald-200/40 sm:p-8"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-50">
                <ShieldCheck size={14} />
                Platform Standards
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
                Clear rules keep the platform usable
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                This page sets expectations for honest participation, safe
                coordination, and reliable communication so the platform remains
                useful for everyone involved.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:min-w-[260px]">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  Listings
                </p>
                <p className="mt-2 text-lg font-bold">Honest & clear</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  Conduct
                </p>
                <p className="mt-2 text-lg font-bold">Respectful use</p>
              </div>
            </div>
          </div>
        </SupportReveal>

        <SupportReveal as="section">
          <div className="mb-4 sm:mb-5">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Core expectations
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              These are the minimum rules users are expected to follow when
              participating on SharePlate.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {termsSections.map((item) => (
              <SupportReveal key={item.title} variant="soft">
                <TermsCard
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                />
              </SupportReveal>
            ))}
          </div>
        </SupportReveal>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.9fr]">
          <SupportReveal
            as="article"
            className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-7"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-600">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900">
                  Enforcement and review
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Violations are not ignored. Platform trust depends on action.
                </p>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {enforcementPoints.map((point) => (
                <SupportReveal key={point} variant="soft">
                  <div className="flex items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 transition-all duration-300 hover:border-emerald-100 hover:bg-emerald-50/40">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <CheckCircle size={14} />
                    </div>
                    <p className="text-sm leading-7 text-slate-600">{point}</p>
                  </div>
                </SupportReveal>
              ))}
            </div>
          </SupportReveal>
        </section>
      </div>
    </SupportPageLayout>
  );
};

export default TermsOfServicePage;
