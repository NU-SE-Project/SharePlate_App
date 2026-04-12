import React from "react";
import {
  Mail,
  LifeBuoy,
  AlertTriangle,
  ShieldCheck,
  Clock3,
  ArrowRight,
} from "lucide-react";
import SupportPageLayout from "../components/SupportPageLayout";
import SupportReveal from "../components/SupportReveal";
import { supportRoutes } from "../supportLinks";

const contactPaths = [
  {
    title: "General support",
    description:
      "Email support@shareplate.com for account access, platform guidance, technical issues, or general escalation.",
    icon: LifeBuoy,
    tone: "emerald",
  },
  {
    title: "Operational concerns",
    description:
      "Report failed pickups, inaccurate listings, delivery coordination issues, or urgent donation-related problems.",
    icon: AlertTriangle,
    tone: "green",
  },
  {
    title: "Privacy and policy",
    description:
      "Raise concerns related to privacy, terms, or account safety when you need policy-level clarification.",
    icon: ShieldCheck,
    tone: "slate",
  },
];

const responseTips = [
  "Your account role (restaurant, food bank, or user)",
  "Relevant donation, request, or listing details",
  "Clear timestamps and issue summary",
  "Screenshots or supporting information if available",
];

const toneClasses = {
  emerald: {
    iconWrap: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100",
    cardHover: "hover:border-emerald-200 hover:shadow-emerald-100/80",
  },
  green: {
    iconWrap: "bg-green-50 text-green-800 ring-1 ring-green-100",
    cardHover: "hover:border-green-200 hover:shadow-green-100/80",
  },
  slate: {
    iconWrap: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    cardHover: "hover:border-slate-300 hover:shadow-slate-200/70",
  },
};

const ContactCard = React.memo(function ContactCard({
  title,
  description,
  icon,
  tone,
}) {
  const styles = toneClasses[tone] || toneClasses.slate;

  return (
    <article
      className={`group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-xl ${styles.cardHover}`}
    >
      <div
        className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-105 ${styles.iconWrap}`}
      >
        {React.createElement(icon, { size: 22, strokeWidth: 2.2 })}
      </div>

      <h3 className="mt-5 text-lg font-bold tracking-tight text-slate-900">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </article>
  );
});

const ContactPage = () => {
  return (
    <SupportPageLayout
      eyebrow="Contact"
      title="Reach the SharePlate support team"
      description="Use the right contact path for account questions, donation coordination issues, policy concerns, or general product support."
      highlights={[
        {
          title: "General support",
          description:
            "Email support@shareplate.com for account access, platform guidance, or issue escalation.",
        },
        {
          title: "Operational concerns",
          description:
            "Report failed pickups, inaccurate listings, or urgent coordination problems so the team can review them quickly.",
        },
      ]}
      actions={[
        { label: "Open help center", to: supportRoutes.helpCenter },
        { label: "Privacy policy", to: supportRoutes.privacyPolicy },
        { label: "Terms of service", to: supportRoutes.termsOfService },
      ]}
      fullWidthMain
      secondaryPlacement="bottom"
    >
      <div className="space-y-6 sm:space-y-8">
        {/* Contact Hero Card */}
        <SupportReveal
          as="section"
          variant="hero"
          className="relative overflow-hidden rounded-[2rem] border border-emerald-100 bg-gradient-to-br from-green-800 via-green-800 to-emerald-600 p-6 shadow-lg shadow-emerald-100/60 sm:p-8 lg:p-10"
        >
          <div className="absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 -translate-x-8 translate-y-8 rounded-full bg-emerald-300/10 blur-2xl" />

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-50 backdrop-blur-sm">
                <Mail size={14} />
                Support Contact
              </div>

              <h2 className="mt-4 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Contact the right team without wasting time
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-50/90 sm:text-base">
                Pick the correct support path, include the right details, and
                reduce pointless back-and-forth. That is how issues get solved
                faster.
              </p>
            </div>

            <div className="flex min-w-[240px] flex-col gap-3 rounded-3xl border border-white/15 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Clock3 size={20} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">
                    Faster responses start with better details
                  </p>
                  <p className="text-xs text-emerald-50/80">
                    Clear issue reports reduce delays.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </SupportReveal>

        {/* Contact Paths */}
        <SupportReveal
          as="section"
          className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:p-8"
        >
          <div className="mb-6 flex flex-col gap-2 sm:mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
              Contact Paths
            </p>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Choose the correct support route
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Do not dump every issue into one vague message. Route it properly
              so the correct team can handle it.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {contactPaths.map((item) => (
              <SupportReveal key={item.title} variant="soft">
                <ContactCard
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  tone={item.tone}
                />
              </SupportReveal>
            ))}
          </div>
        </SupportReveal>

        {/* Response Expectations */}
        <SupportReveal
          as="section"
          className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md sm:p-6 lg:p-8"
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-600">
                Response Expectations
              </p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
                Send useful details, not lazy messages
              </h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">
                Include your account role, the affected donation or request, and
                any relevant timestamps. A vague complaint slows everything
                down. A structured report gets handled faster.
              </p>
            </div>

            <div className="w-full rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5 sm:p-6 lg:max-w-md">
              <ul className="space-y-4">
                {responseTips.map((tip) => (
                  <li
                    key={tip}
                    className="flex items-start gap-3 text-sm text-slate-700"
                  >
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white">
                      <ArrowRight size={14} />
                    </span>
                    <span className="leading-6">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </SupportReveal>
      </div>
    </SupportPageLayout>
  );
};

export default ContactPage;
