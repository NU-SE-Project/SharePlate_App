import React, { memo } from "react";
import {
  Accessibility,
  Keyboard,
  Eye,
  ArrowRight,
  LifeBuoy,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MonitorSmartphone,
} from "lucide-react";
import SupportPageLayout from "../components/SupportPageLayout";
import SupportReveal from "../components/SupportReveal";
import { supportRoutes } from "../supportLinks";

const highlights = [
  {
    title: "Readable interfaces",
    description:
      "Clear headings, strong contrast, structured content, and status-focused layouts help users understand important actions faster.",
    icon: Eye,
  },
  {
    title: "Keyboard support",
    description:
      "Core navigation and interactive controls are designed to remain usable through keyboard access, visible focus states, and clear tap targets.",
    icon: Keyboard,
  },
  {
    title: "Ongoing improvement",
    description:
      "Accessibility issues should be reported early so they can be reproduced, prioritized, and fixed with product and support updates.",
    icon: CheckCircle2,
  },
];

const actions = [
  {
    label: "Contact support",
    to: supportRoutes.contact,
    icon: LifeBuoy,
  },
  {
    label: "Help center",
    to: supportRoutes.helpCenter,
    icon: BookOpen,
  },
  {
    label: "Privacy policy",
    to: supportRoutes.privacyPolicy,
    icon: ShieldCheck,
  },
];

const supportTips = [
  "Mention the exact page where the issue happened.",
  "Describe what you tried to do and what blocked you.",
  "Include your device, browser, and input method.",
  "Add screenshots or screen recordings when possible.",
];

const HighlightCard = memo(({ item }) => {
  const Icon = item.icon;

  return (
    <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/0 via-emerald-50/0 to-green-50/0 transition-opacity duration-300 group-hover:from-emerald-50/80 group-hover:via-transparent group-hover:to-green-50/60" />

      <div className="relative">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-green-800 to-emerald-600 text-white shadow-lg shadow-emerald-100 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-1">
          <Icon size={24} />
        </div>

        <h3 className="text-lg font-bold tracking-tight text-slate-900">
          {item.title}
        </h3>

        <p className="mt-3 text-sm leading-7 text-slate-600">
          {item.description}
        </p>
      </div>
    </div>
  );
});

HighlightCard.displayName = "HighlightCard";

const ActionCard = memo(({ action }) => {
  const Icon = action.icon;

  return (
    <a
      href={action.to}
      className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-emerald-50/60 hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-emerald-100"
    >
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700 transition-all duration-300 group-hover:bg-emerald-100 group-hover:text-emerald-700">
          <Icon size={18} />
        </div>
        <span className="text-sm font-semibold text-slate-800">
          {action.label}
        </span>
      </div>

      <ArrowRight
        size={18}
        className="text-slate-400 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-700"
      />
    </a>
  );
});

ActionCard.displayName = "ActionCard";

const TipItem = memo(({ text }) => {
  return (
    <li className="flex items-start gap-3">
      <div className="mt-1 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
        <CheckCircle2 size={12} />
      </div>
      <span className="text-sm leading-7 text-slate-600">{text}</span>
    </li>
  );
});

TipItem.displayName = "TipItem";

const AccessibilityPage = () => {
  return (
    <SupportPageLayout
      eyebrow="Accessibility"
      title="Accessibility support for SharePlate users"
      description="SharePlate is designed to keep core workflows understandable, responsive, and usable across devices, input methods, and support needs."
      highlights={[]}
      actions={[]}
      fullWidthMain
      secondaryPlacement="bottom"
    >
      <div className="space-y-8 sm:space-y-10">
        <SupportReveal
          as="section"
          variant="hero"
          className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-green-800 via-emerald-700 to-emerald-600 p-6 text-white shadow-xl shadow-emerald-100 sm:p-8 lg:p-10"
        >
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

          <div className="relative grid gap-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
                <Accessibility size={14} />
                Inclusive experience
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Better usability starts with clearer design and better support
              </h2>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-emerald-50 sm:text-base">
                Accessibility is not decoration. It affects whether users can
                complete important actions without confusion, delay, or
                unnecessary support requests.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  Focus
                </p>
                <p className="mt-2 text-lg font-bold">Readable, usable UI</p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  Access
                </p>
                <p className="mt-2 text-lg font-bold">
                  Keyboard-friendly flows
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:-translate-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  Progress
                </p>
                <p className="mt-2 text-lg font-bold">Continuous improvement</p>
              </div>
            </div>
          </div>
        </SupportReveal>

        <SupportReveal as="section">
          <div className="mb-5 sm:mb-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Accessibility priorities
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              These areas matter because they directly affect whether people can
              navigate, understand, and complete tasks without friction.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {highlights.map((item) => (
              <SupportReveal key={item.title} variant="soft">
                <HighlightCard item={item} />
              </SupportReveal>
            ))}
          </div>
        </SupportReveal>

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <SupportReveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-800 to-emerald-600 text-white shadow-lg shadow-emerald-100">
                <AlertCircle size={24} />
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                  Report an accessibility issue
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Don't send vague complaints. Give enough detail so the team
                  can reproduce the problem and fix it properly.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
              <div className="flex items-center gap-3">
                <MonitorSmartphone className="text-emerald-700" size={20} />
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-emerald-800">
                  What to include
                </h3>
              </div>

              <ul className="mt-4 space-y-3">
                {supportTips.map((tip) => (
                  <SupportReveal key={tip} variant="soft">
                    <TipItem text={tip} />
                  </SupportReveal>
                ))}
              </ul>
            </div>
          </SupportReveal>

          <SupportReveal className="rounded-[2rem] border border-slate-200 bg-gradient-to-b from-white to-slate-50 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Quick support actions
            </h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">
              Use the right path instead of wandering around the site and
              wasting time.
            </p>

            <div className="mt-6 space-y-4">
              {actions.map((action) => (
                <SupportReveal key={action.label} variant="soft">
                  <ActionCard action={action} />
                </SupportReveal>
              ))}
            </div>
          </SupportReveal>
        </section>
      </div>
    </SupportPageLayout>
  );
};

export default AccessibilityPage;
