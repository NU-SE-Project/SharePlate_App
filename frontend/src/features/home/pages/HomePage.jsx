import React, { memo, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Leaf,
  Loader2,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import HomeHeader from "../components/Header";
import Footer from "../components/Footer";
import SharePlateLandingSections from "../components/SharePlateLandingSections";
import ScrollReveal from "../components/ScrollReveal";

const heroStats = [
  { label: "Meals wasted daily worldwide", value: "1B+" },
  { label: "Food lost or wasted globally", value: "30%+" },
  { label: "People facing hunger", value: "700M+" },
];

const valueCards = [
  {
    title: "Instant food listing",
    description:
      "Publish surplus food in seconds with clear quantity, freshness windows, and pickup details — no unnecessary steps",
    icon: Sparkles,
  },
  {
    title: "Reliable handoffs",
    description:
      "Verified participants, live status updates, and structured pickup flows reduce confusion and failed collections",
    icon: ShieldCheck,
  },
  {
    title: "Track real impact",
    description:
      "See how much food is rescued, how fast requests are fulfilled, and how your contributions make a measurable difference",
    icon: TrendingUp,
  },
];

function getPrimaryHref(user) {
  if (user?.role === "restaurant") return "/restaurant/dashboard";
  if (user?.role === "foodbank") return "/foodbank/donated-food";
  if (user?.role === "admin") return "/admin/users";
  if (user) return "/dashboard";
  return "/auth/signup";
}

const SectionBadge = memo(({ children }) => (
  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-700 shadow-sm backdrop-blur-sm">
    <Leaf className="h-4 w-4" />
    {children}
  </div>
));

const HeroStatCard = memo(({ label, value }) => (
  <Card className="group rounded-3xl border border-white/70 bg-white/80 p-5 shadow-[0_20px_70px_-45px_rgba(15,23,42,0.35)] backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_90px_-42px_rgba(16,185,129,0.32)]">
    <p className="text-3xl font-bold tracking-tight text-slate-950">{value}</p>
    <p className="mt-2 text-sm leading-6 text-slate-500">{label}</p>
  </Card>
));

const FeatureCard = memo(({ title, description, icon }) => {
  const IconComponent = icon;

  return (
    <Card
      as="article"
      className="group rounded-3xl border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:bg-white/10"
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/15 text-emerald-300 transition duration-300 group-hover:scale-105">
        <IconComponent className="h-6 w-6" />
      </div>
      <h3 className="mt-5 text-lg font-semibold tracking-tight text-slate-900 group-hover:text-white transition-colors duration-200">
        {title}
      </h3>

      <p className="mt-3 text-sm leading-7 text-slate-600 group-hover:text-slate-500 transition-colors duration-200">
        {description}
      </p>
    </Card>
  );
});

const AuthLoadingScreen = memo(() => (
  <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div className="flex items-center gap-3 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm font-medium">Preparing homepage...</span>
        </div>
        <div className="h-14 w-3/4 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-72 animate-pulse rounded-[2rem] bg-slate-100" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-40 animate-pulse rounded-3xl bg-slate-100"
            />
          ))}
        </div>
      </div>
    </div>
  </div>
));

const HomePage = () => {
  const { user, isAuthenticated, isInitializing } = useAuth();
  const primaryHref = useMemo(() => getPrimaryHref(user), [user]);

  if (isInitializing) return <AuthLoadingScreen />;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_30%),radial-gradient(circle_at_top_right,_rgba(250,204,21,0.12),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_42%,_#ecfdf5_100%)] text-slate-900">
      <HomeHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 -z-10 h-80 bg-[linear-gradient(135deg,rgba(15,23,42,0.06),rgba(16,185,129,0.05),rgba(255,255,255,0))]" />
          <div className="mx-auto grid max-w-7xl gap-16 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-8 lg:pb-28 lg:pt-20">
            <div className="max-w-3xl">
              <ScrollReveal>
                <SectionBadge>Food rescue, simplified</SectionBadge>
              </ScrollReveal>

              <ScrollReveal delay={100}>
                <h1 className="mt-8 max-w-4xl text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-7xl lg:leading-[1.02]">
                  A modern home page for faster, clearer, and more trustworthy
                  food donation.
                </h1>
              </ScrollReveal>

              <ScrollReveal delay={200}>
                <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                  SharePlate connects restaurants, food banks, and community
                  organizations through a clean, responsive platform built to
                  reduce waste and improve coordination.
                </p>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button
                    as={Link}
                    to={primaryHref}
                    className="group cursor-pointer rounded-full px-6 py-4 text-sm font-semibold text-white shadow-xl shadow-slate-900/10 transition duration-300 hover:-translate-y-1 hover:bg-emerald-700 focus-visible:ring-emerald-500"
                  >
                    {isAuthenticated
                      ? "Open workspace"
                      : "Start with SharePlate"}
                    <ArrowRight className="h-4 w-4 transition duration-300 group-hover:translate-x-1" />
                  </Button>

                  <Button
                    as="a"
                    href="#how-it-works"
                    variant="secondary"
                    className="cursor-pointer rounded-full border border-slate-200 bg-white/80 px-6 py-4 text-sm font-semibold text-slate-700 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:text-emerald-700 focus-visible:ring-emerald-500"
                  >
                    Explore workflow
                  </Button>
                </div>
              </ScrollReveal>

              <div className="mt-12 grid gap-4 sm:grid-cols-3">
                {heroStats.map((stat, index) => (
                  <ScrollReveal
                    key={stat.label}
                    delay={Math.min(400 + index * 100, 600)}
                  >
                    <HeroStatCard {...stat} />
                  </ScrollReveal>
                ))}
              </div>
            </div>

            <ScrollReveal className="relative" delay={300}>
              <div className="animate-float-gentle absolute -left-4 top-12 hidden h-24 w-24 rounded-full bg-amber-200/40 blur-3xl sm:block" />
              <div className="rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-[0_40px_140px_-52px_rgba(15,23,42,0.9)] transition duration-300 hover:shadow-[0_48px_150px_-50px_rgba(15,23,42,0.85)] sm:p-8">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-300">
                      Platform value
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
                      Designed for operational clarity
                    </h2>
                  </div>
                  <div className="animate-pulse-soft rounded-2xl bg-white/10 p-3 transition duration-300 hover:scale-105">
                    <TrendingUp className="h-6 w-6 text-emerald-300" />
                  </div>
                </div>

                <div className="mt-8 grid gap-4 sm:grid-cols-2">
                  {valueCards.map((card, index) => (
                    <ScrollReveal
                      key={card.title}
                      delay={Math.min((index + 1) * 100, 300)}
                    >
                      <FeatureCard {...card} />
                    </ScrollReveal>
                  ))}
                </div>

                <div className="mt-6 rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-5">
                  <p className="text-sm leading-7 text-emerald-100">
                    Clear actions, readable status cues, and focused interface
                    patterns make urgent pickup coordination easier under
                    pressure.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </section>

        <SharePlateLandingSections />

        <ScrollReveal className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-emerald-100 bg-gradient-to-r from-emerald-600 to-emerald-500 p-8 text-white shadow-[0_30px_100px_-45px_rgba(16,185,129,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_36px_110px_-40px_rgba(16,185,129,0.55)] sm:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-100">
                  Ready to start
                </p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                  Build a faster food rescue workflow with SharePlate
                </h2>
                <p className="mt-4 text-sm leading-7 text-emerald-50 sm:text-base">
                  Bring restaurants and food banks into one clean system with
                  clearer actions, better visibility, and smoother coordination.
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
