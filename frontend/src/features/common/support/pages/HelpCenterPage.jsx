import React, { memo, useMemo } from "react";
import {
  ShieldCheck,
  HeartHandshake,
  ClipboardList,
  CircleAlert,
  LifeBuoy,
  FileText,
  Lock,
  CheckCircle2,
} from "lucide-react";
import SupportPageLayout from "../components/SupportPageLayout";
import SupportReveal from "../components/SupportReveal";
import { supportRoutes } from "../supportLinks";

const highlightIconMap = {
  "Account and access": ShieldCheck,
  "Donation workflow": HeartHandshake,
  "Request management": ClipboardList,
  "Reporting concerns": CircleAlert,
};

const highlights = [
  {
    title: "Account and access",
    description:
      "Get help with sign-in issues, password resets, role-specific onboarding, and verification steps.",
  },
  {
    title: "Donation workflow",
    description:
      "Review guidance for posting food, responding to requests, confirming pickups, and tracking status updates.",
  },
  {
    title: "Request management",
    description:
      "Learn how food banks can broadcast needs, update priorities, and coordinate with restaurant partners.",
  },
  {
    title: "Reporting concerns",
    description:
      "Use the complaints and support channels when you need platform assistance or need to flag unsafe behavior.",
  },
];

const quickActions = [
  {
    label: "Contact support",
    to: supportRoutes.contact,
    icon: LifeBuoy,
    description:
      "Reach the platform team for help with urgent or unresolved issues.",
  },
  {
    label: "Safety guidelines",
    to: supportRoutes.safetyGuidelines,
    icon: FileText,
    description:
      "Review expected platform behavior, food safety, and responsible coordination.",
  },
  {
    label: "Privacy policy",
    to: supportRoutes.privacyPolicy,
    icon: Lock,
    description:
      "Understand how SharePlate handles account, request, and donation data.",
  },
];

const HighlightCard = memo(({ title, description, icon }) => {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl focus-within:-translate-y-1 focus-within:border-emerald-200 focus-within:shadow-xl sm:p-6">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-green-800 via-emerald-600 to-emerald-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-within:opacity-100" />

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
          {React.createElement(icon, { size: 22 })}
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

HighlightCard.displayName = "HighlightCard";

const StepCard = memo(({ step, title, description }) => {
  return (
    <div className="group relative rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-lg sm:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-800 text-sm font-extrabold text-white shadow-md shadow-emerald-100 transition-transform duration-300 group-hover:scale-110">
          {step}
        </div>

        <div>
          <h3 className="text-base font-bold tracking-tight text-slate-900">
            {title}
          </h3>
          <p className="mt-2 text-sm leading-7 text-slate-600">{description}</p>
        </div>
      </div>
    </div>
  );
});

StepCard.displayName = "StepCard";

const HelpCenterPage = () => {
  const enhancedHighlights = useMemo(
    () =>
      highlights.map((item) => ({
        ...item,
        Icon: highlightIconMap[item.title] || ShieldCheck,
      })),
    [],
  );

  return (
    <SupportPageLayout
      eyebrow="Help Center"
      title="Support resources for every SharePlate user"
      description="Find the core guidance needed to use SharePlate confidently, from account setup through donation coordination and issue reporting."
      highlights={[]}
      actions={quickActions.map(({ label, to }) => ({ label, to }))}
      fullWidthMain
      secondaryPlacement="bottom"
    >
      <div className="space-y-8 sm:space-y-10">
        {/* Hero intro */}
        <SupportReveal
          as="section"
          variant="hero"
          className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-green-800 via-emerald-700 to-emerald-600 p-6 text-white shadow-xl shadow-emerald-100 sm:p-8 lg:p-10"
        >
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-20 left-0 h-48 w-48 rounded-full bg-white/10 blur-3xl" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-50 backdrop-blur-sm">
              <CheckCircle2 size={14} />
              Support made simple
            </div>

            <h2 className="mt-5 text-2xl font-black tracking-tight sm:text-3xl lg:text-4xl">
              Get the right help without wasting time
            </h2>

            <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">
              Use these support resources to solve account issues, manage
              donations properly, coordinate requests clearly, and report
              anything unsafe or inappropriate on the platform.
            </p>
          </div>
        </SupportReveal>

        {/* Highlights */}
        <SupportReveal as="section" className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
              Core support areas
            </p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              What this help center covers
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Start with the right section instead of clicking around blindly.
              Each area focuses on a common support need inside SharePlate.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {enhancedHighlights.map((item) => (
              <SupportReveal key={item.title} variant="soft">
                <HighlightCard
                  title={item.title}
                  description={item.description}
                  icon={item.Icon}
                />
              </SupportReveal>
            ))}
          </div>
        </SupportReveal>

        {/* What to do first */}
        <SupportReveal
          as="section"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
              Start here
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              What to do first
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
              Confirm your account details, check the status of active donations
              or requests, and use the built-in complaint flow if you need
              formal follow-up from the platform team. Do the obvious checks
              first before assuming the system is broken.
            </p>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <SupportReveal variant="soft">
              <StepCard
                step="01"
                title="Check account details"
                description="Make sure your profile, access permissions, and verification details are correct before doing anything else."
              />
            </SupportReveal>
            <SupportReveal variant="soft">
              <StepCard
                step="02"
                title="Review active activity"
                description="Inspect current donations, requests, and recent status changes so you know exactly where the issue starts."
              />
            </SupportReveal>
            <SupportReveal variant="soft">
              <StepCard
                step="03"
                title="Escalate properly"
                description="If the issue still exists, use the proper complaint or support path instead of guessing or repeating failed actions."
              />
            </SupportReveal>
          </div>
        </SupportReveal>
      </div>
    </SupportPageLayout>
  );
};

export default HelpCenterPage;
