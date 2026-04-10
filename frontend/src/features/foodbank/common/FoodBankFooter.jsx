import React from "react";
import {
  HeartHandshake,
  ShieldCheck,
  LifeBuoy,
  Mail,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import sharePlateLogo from "../../../assets/SharePlate_OffcialLogo.png";
import { useAuth } from "../../../context/AuthContext";

const FacebookIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.02 3.66 9.17 8.44 9.93v-7.03H8.1v-2.9h2.34V9.41c0-2.32 1.38-3.6 3.5-3.6.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.42v1.71h2.5l-.4 2.9h-2.1V22c4.78-.76 8.44-4.91 8.44-9.93z"
      fill="currentColor"
    />
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="3"
      width="18"
      height="18"
      rx="5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </svg>
);

const GithubIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.84 1.32 3.53 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.48-1.34-5.48-5.96 0-1.32.47-2.4 1.25-3.25-.13-.3-.54-1.5.12-3.13 0 0 1.02-.33 3.34 1.24a11.5 11.5 0 0 1 6.08 0c2.32-1.57 3.34-1.24 3.34-1.24.66 1.63.25 2.83.12 3.13.78.85 1.25 1.93 1.25 3.25 0 4.63-2.82 5.66-5.5 5.96.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5z"
      fill="currentColor"
    />
  </svg>
);

const LinkedInIcon = ({ size = 18 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M6.94 8.5a1.56 1.56 0 1 0 0-3.12 1.56 1.56 0 0 0 0 3.12ZM5.6 9.75h2.67V18H5.6V9.75Zm4.34 0h2.56v1.13h.04c.36-.68 1.23-1.4 2.53-1.4 2.7 0 3.2 1.78 3.2 4.09V18H15.6v-3.92c0-.94-.02-2.15-1.31-2.15-1.31 0-1.51 1.02-1.51 2.08V18H9.94V9.75Z"
      fill="currentColor"
    />
  </svg>
);

const footerLinks = {
  features: [
    { label: "Browse Donations", to: "/foodbank/donated-food" },
    { label: "Broadcast Need", to: "/foodbank/post-request" },
    { label: "My Broadcasts", to: "/foodbank/my-proactive-requests" },
    { label: "Profile", to: "/foodbank/profile" },
  ],
  support: [
    { label: "Help Center", href: "#" },
    { label: "Safety Guidelines", href: "#" },
    { label: "Privacy Policy", href: "#" },
    { label: "Terms of Service", href: "#" },
  ],
  social: [
    { label: "Facebook", href: "#", icon: FacebookIcon },
    { label: "Instagram", href: "#", icon: InstagramIcon },
    { label: "GitHub", href: "#", icon: GithubIcon },
    { label: "LinkedIn", href: "#", icon: LinkedInIcon },
  ],
};

const FooterSection = ({ title, icon: Icon, links }) => {
  return (
    <div>
      <div className="mb-6 flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-700/30 bg-emerald-600/10 text-emerald-400">
          <Icon size={18} />
        </div>
        <h4 className="text-base font-semibold tracking-wide text-white">
          {title}
        </h4>
      </div>

      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link
                to={link.to}
                className="group inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-emerald-400 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <ArrowRight
                  size={14}
                  className="opacity-0 transition-all duration-300 group-hover:opacity-100"
                />
                <span>{link.label}</span>
              </Link>
            ) : (
              <a
                href={link.href}
                className="group inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-all duration-300 hover:translate-x-1 hover:text-emerald-400 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
              >
                <ArrowRight
                  size={14}
                  className="opacity-0 transition-all duration-300 group-hover:opacity-100"
                />
                <span>{link.label}</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

const SocialLink = ({ href, label, icon: Icon }) => {
  return (
    <a
      href={href}
      aria-label={label}
      className="group flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/80 text-slate-300 shadow-md transition-all duration-300 hover:-translate-y-1 hover:scale-105 hover:border-emerald-500/40 hover:bg-emerald-600 hover:text-white hover:shadow-emerald-900/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
    >
      <Icon
        size={18}
        className="transition-transform duration-300 group-hover:scale-110"
      />
    </a>
  );
};

const FoodBankFooter = () => {
  const auth = useAuth();
  const foodBankName = auth.user?.name || "SharePlate";

  return (
    <footer className="relative overflow-hidden border-t border-emerald-900/30 bg-slate-950 text-slate-300">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-emerald-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-56 w-56 rounded-full bg-green-800/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-12 border-b border-slate-800/80 pb-12 md:grid-cols-2 xl:grid-cols-5 xl:gap-10">
          <div className="xl:col-span-2">
            <Link
              to="/foodbank/donated-food"
              className="group inline-flex cursor-pointer items-center gap-3 focus-visible:rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl border border-emerald-700/30 bg-gradient-to-br from-emerald-600/20 to-green-800/20 shadow-lg shadow-emerald-900/30 transition-all duration-300 group-hover:scale-105 group-hover:rotate-1">
                <img
                  src={sharePlateLogo}
                  alt="SharePlate logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <span className="block text-2xl font-bold tracking-tight text-white">
                  {foodBankName}
                </span>
                <span className="mt-1 block text-xs uppercase tracking-[0.22em] text-emerald-400/80">
                  Food Bank Coordination Hub
                </span>
              </div>
            </Link>

            <p className="mt-6 max-w-md text-sm leading-7 text-slate-400 sm:text-[15px]">
              Helping food banks respond faster, broadcast needs clearly, and
              coordinate incoming donations with the same clean workflow used
              across SharePlate.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-800 bg-white/[0.03] p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/40 hover:bg-emerald-600/[0.06]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Faster coordination
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Broadcast needs and match available food with less back and
                  forth.
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-white/[0.03] p-4 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-700/40 hover:bg-emerald-600/[0.06]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
                  Meaningful impact
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Turn shared meals into reliable community support where it is
                  needed most.
                </p>
              </div>
            </div>
          </div>

          <FooterSection
            title="Features"
            icon={HeartHandshake}
            links={footerLinks.features}
          />

          <FooterSection
            title="Support"
            icon={LifeBuoy}
            links={footerLinks.support}
          />

          <div>
            <div className="mb-6 flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-emerald-700/30 bg-emerald-600/10 text-emerald-400">
                <ShieldCheck size={18} />
              </div>
              <h4 className="text-base font-semibold tracking-wide text-white">
                Connect
              </h4>
            </div>

            <p className="max-w-xs text-sm leading-6 text-slate-400">
              Stay connected for product updates, community impact, and support
              resources.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {footerLinks.social.map((item) => (
                <SocialLink
                  key={item.label}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                />
              ))}
            </div>

            <a
              href="mailto:support@shareplate.com"
              className="group mt-6 inline-flex cursor-pointer items-center gap-2 text-sm text-slate-400 transition-colors duration-300 hover:text-emerald-400 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              <Mail
                size={16}
                className="transition-transform duration-300 group-hover:scale-110"
              />
              support@shareplate.com
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4 pt-6 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
          <p>&copy; 2026 SharePlate. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              href="#"
              className="cursor-pointer transition-colors duration-300 hover:text-emerald-400 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Privacy
            </a>
            <a
              href="#"
              className="cursor-pointer transition-colors duration-300 hover:text-emerald-400 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Terms
            </a>
            <a
              href="#"
              className="cursor-pointer transition-colors duration-300 hover:text-emerald-400 focus-visible:rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Accessibility
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(FoodBankFooter);
