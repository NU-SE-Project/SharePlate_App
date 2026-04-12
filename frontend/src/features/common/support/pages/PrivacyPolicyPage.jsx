import React, { useMemo } from "react";
import {
  ShieldCheck,
  Database,
  UserCheck,
  Mail,
  FileText,
  Accessibility,
  LifeBuoy,
  ArrowRight,
  Lock,
  ClipboardList,
  SearchCheck,
} from "lucide-react";
import SupportPageLayout from "../components/SupportPageLayout";
import SupportReveal from "../components/SupportReveal";
import { supportRoutes } from "../supportLinks";

const PrivacyPolicyPage = () => {
  const highlights = useMemo(
    () => [
      {
        title: "Account information",
        description:
          "Names, email addresses, role details, and profile information are used to manage access and support account verification.",
        icon: UserCheck,
      },
      {
        title: "Operational data",
        description:
          "Donation listings, requests, pickup details, and complaint records are processed to coordinate food rescue workflows.",
        icon: ClipboardList,
      },
      {
        title: "Security and compliance",
        description:
          "Relevant platform activity may be retained to investigate misuse, resolve disputes, and maintain service integrity.",
        icon: ShieldCheck,
      },
    ],
    [],
  );

  const actions = useMemo(
    () => [
      {
        label: "Terms of service",
        to: supportRoutes.termsOfService,
        icon: FileText,
      },
      {
        label: "Accessibility",
        to: supportRoutes.accessibility,
        icon: Accessibility,
      },
      {
        label: "Contact support",
        to: supportRoutes.contact,
        icon: LifeBuoy,
      },
    ],
    [],
  );

  const privacyPoints = useMemo(
    () => [
      {
        title: "What data is collected",
        description:
          "SharePlate processes account details, donation records, request activity, pickup information, and selected communication history required to run the platform safely.",
        icon: Database,
      },
      {
        title: "Why the data is used",
        description:
          "This information supports account access, food donation coordination, dispute handling, fraud prevention, and service reliability across the platform.",
        icon: SearchCheck,
      },
      {
        title: "How data is protected",
        description:
          "Security controls, access restrictions, and review processes are used to reduce misuse, protect operational records, and preserve platform trust.",
        icon: Lock,
      },
    ],
    [],
  );

  return (
    <SupportPageLayout
      eyebrow="Privacy Policy"
      title="How SharePlate handles platform data"
      description="This overview explains the types of information used to operate SharePlate and the reasons that data is processed across the platform."
      highlights={highlights.map(({ title, description }) => ({
        title,
        description,
      }))}
      actions={actions.map(({ label, to }) => ({
        label,
        to,
      }))}
      fullWidthMain
      secondaryPlacement="bottom"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Hero Info Card */}
        <SupportReveal
          as="section"
          variant="hero"
          className="group relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-green-800 via-emerald-700 to-emerald-600 p-6 text-white shadow-xl shadow-emerald-100/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-200/60 sm:p-8 lg:p-10"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_28%)]" />
          <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
                <ShieldCheck size={16} />
                Data Protection
              </div>

              <h2 className="mt-5 text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">
                Privacy built into platform operations
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50 sm:text-base">
                SharePlate uses only the information required to support user
                accounts, donation coordination, operational safety, and dispute
                resolution. Anything beyond that is noise, and noise causes
                risk.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:w-[360px] lg:grid-cols-1">
              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  Purpose
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-white">
                  Keep the platform secure and functional
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  Scope
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-white">
                  Accounts, requests, pickups, complaints
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-sm transition-transform duration-300 hover:scale-[1.02]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100">
                  Priority
                </p>
                <p className="mt-2 text-sm font-medium leading-6 text-white">
                  Security, trust, and operational clarity
                </p>
              </div>
            </div>
          </div>
        </SupportReveal>

        {/* Privacy Overview Grid */}
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {privacyPoints.map((item) => {
            const Icon = item.icon;

            return (
              <SupportReveal
                key={item.title}
                variant="soft"
              >
                <article
                  className="group rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-xl hover:shadow-emerald-100/40"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-100">
                    <Icon size={24} />
                  </div>

                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900">
                    {item.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-600">
                    {item.description}
                  </p>
                </article>
              </SupportReveal>
            );
          })}
        </section>

        {/* Highlights Section */}
        <SupportReveal
          as="section"
          className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
                Core Areas
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Key privacy categories
              </h2>
            </div>
            <div className="h-px w-full bg-gradient-to-r from-emerald-200 via-slate-200 to-transparent sm:max-w-xs" />
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {highlights.map((item) => {
              const Icon = item.icon;

              return (
                <SupportReveal key={item.title} variant="soft">
                  <div className="group rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:bg-white hover:shadow-lg hover:shadow-emerald-100/30">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-green-800 shadow-sm transition-transform duration-300 group-hover:scale-110">
                        <Icon size={20} />
                      </div>

                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </SupportReveal>
              );
            })}
          </div>
        </SupportReveal>

        {/* Questions / Contact Section */}
        <section className="grid grid-cols-1 gap-4 lg:grid-cols-[1.3fr_0.9fr]">
          <SupportReveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Mail size={24} />
              </div>

              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
                  Questions about data use
                </h2>
                <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
                  Contact the support team if you need clarification about your
                  profile information, operational records, or platform
                  communications.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-4">
              <p className="text-sm leading-7 text-slate-700">
                If a user does not understand what data is being used and why,
                the system is not transparent enough. That is the standard you
                should build against.
              </p>
            </div>
          </SupportReveal>

          <SupportReveal className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Related pages
            </p>

            <div className="mt-5 space-y-3">
              {actions.map((action) => {
                const Icon = action.icon;

                return (
                  <a
                    key={action.label}
                    href={action.to}
                    className="group flex cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm font-medium text-slate-700 transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-green-800 focus:outline-none focus:ring-4 focus:ring-emerald-100"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-emerald-600 shadow-sm transition-transform duration-300 group-hover:scale-110">
                        <Icon size={18} />
                      </span>
                      {action.label}
                    </span>

                    <ArrowRight
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </a>
                );
              })}
            </div>
          </SupportReveal>
        </section>
      </div>
    </SupportPageLayout>
  );
};

export default PrivacyPolicyPage;
