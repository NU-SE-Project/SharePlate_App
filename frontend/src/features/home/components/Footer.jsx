import React, { memo } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, HeartHandshake, Mail, MapPin, Phone } from "lucide-react";
import Button from "../../../components/common/Button"; // adjust path
import sharePlateLogo from "../../../assets/SharePlate_OffcialLogo.png";

const footerNavGroups = [
  {
    title: "Explore",
    links: [
      { label: "How it works", href: "#how-it-works", type: "anchor" },
      { label: "Why SharePlate", href: "#impact", type: "anchor" },
      { label: "Activity", href: "#live-states", type: "anchor" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Donate food", href: "/donations", type: "route" },
      { label: "Request support", href: "/requests", type: "route" },
      { label: "Community updates", href: "/activity", type: "route" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Contact us", href: "/contact", type: "route" },
      { label: "Privacy policy", href: "/privacy-policy", type: "route" },
      { label: "Terms of service", href: "/terms-of-service", type: "route" },
    ],
  },
];

const FooterLinkGroup = memo(({ title, links }) => (
  <div>
    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
      {title}
    </h3>

    <ul className="mt-4 space-y-3">
      {links.map((link) => (
        <li key={link.label}>
          {link.type === "anchor" ? (
            <a
              href={link.href}
              className="cursor-pointer rounded text-sm text-slate-600 transition hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {link.label}
            </a>
          ) : (
            <Link
              to={link.href}
              className="cursor-pointer rounded text-sm text-slate-600 transition hover:text-emerald-700 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          )}
        </li>
      ))}
    </ul>
  </div>
));

const SharePlateFooter = ({
  isAuthenticated = false,
  primaryHref = "/auth/register",
}) => {
  return (
    <footer className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8 lg:pb-12">
        <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 lg:p-10">
          {/* background accents */}
          <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-emerald-100 blur-3xl" />
          <div className="absolute -right-20 top-0 h-56 w-56 rounded-full bg-blue-100 blur-3xl" />

          <div className="relative">
            {/* TOP GRID */}
            <div className="grid gap-10 lg:grid-cols-[1.3fr_0.8fr_0.8fr_0.8fr]">
              {/* BRAND */}
              <div className="max-w-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-2xl bg-emerald-600/10 shadow-lg shadow-emerald-600/20">
                    <img
                      src={sharePlateLogo}
                      alt="SharePlate logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-base font-semibold tracking-tight text-slate-900">
                      <span className="bg-gradient-to-r from-green-800 to-green-500 bg-clip-text text-transparent tracking-wide">
                        SharePlate
                      </span>
                    </p>
                    <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500">
                      Rescue Food Faster
                    </p>
                  </div>
                </div>

                <p className="mt-5 text-sm text-slate-600 leading-7">
                  Move surplus food where it’s actually needed. Less waste. More
                  impact. No unnecessary complexity.
                </p>

                {/* CONTACT */}
                <div className="mt-6 space-y-3 text-sm text-slate-600">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4 text-emerald-600" />
                    <span>Local, real-time food redistribution</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-emerald-600" />
                    <span>support@shareplate.com</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-emerald-600" />
                    <span>+94 00 000 0000</span>
                  </div>
                </div>
              </div>

              {/* LINKS */}
              {footerNavGroups.map((group) => (
                <FooterLinkGroup
                  key={group.title}
                  title={group.title}
                  links={group.links}
                />
              ))}
            </div>

            {/* CTA SECTION */}
            <div className="mt-10 rounded-3xl border border-emerald-100 bg-gradient-to-r from-emerald-50 to-blue-50 p-5 sm:p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-2xl">
                  <h3 className="text-lg font-semibold text-slate-950">
                    Stop letting usable food go to waste.
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Start redistributing it properly with SharePlate.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {/* BUTTON COMPONENT USAGE */}
                  <Button
                    as={Link}
                    to="/auth/login"
                    variant="ghost"
                    className="rounded-full px-5 py-3 text-sm text-slate-700 hover:text-emerald-700 hover:bg-white focus-visible:ring-emerald-500"
                  >
                    Sign in
                  </Button>

                  <Button
                    as={Link}
                    to={primaryHref}
                    className="rounded-full px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-emerald-700 focus-visible:ring-emerald-500 flex items-center gap-2"
                  >
                    {isAuthenticated ? "Continue" : "Get started"}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* BOTTOM */}
            <div className="mt-8 border-t border-slate-200 pt-6 text-sm text-slate-500 flex flex-col sm:flex-row sm:justify-between">
              <p>© {new Date().getFullYear()} SharePlate</p>
              <p>connect surplus food with real need</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default memo(SharePlateFooter);
