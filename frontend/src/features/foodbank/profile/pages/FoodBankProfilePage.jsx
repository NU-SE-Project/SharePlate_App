import React from "react";
import ProfileForm from "../../../common/profile/components/ProfileForm";
import { ChevronLeft, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const FoodBankProfilePage = () => {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-20 animate-in fade-in slide-in-from-bottom-5 duration-700 sm:px-6 lg:px-8">
      <div className="mb-12 flex items-center gap-6">
        <Link
          to="/foodbank/donated-food"
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-600"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Food Bank Profile
          </h1>
          <p className="mt-1 font-medium text-slate-500">
            Manage your organization&apos;s identity and support settings.
          </p>
        </div>
      </div>

      <ProfileForm />

      <div className="relative mt-12 flex flex-col items-center justify-between overflow-hidden rounded-[3rem] bg-emerald-900 p-8 text-white shadow-2xl shadow-emerald-900/10 md:flex-row">
        <div className="relative z-10 text-center md:text-left">
          <h3 className="mb-3 text-xl font-bold">Community Hub</h3>
          <p className="max-w-sm text-sm leading-relaxed text-emerald-100/90">
            Your profile details help restaurants know who is receiving their
            donations. Keep them current so pickup coordination stays smooth.
          </p>
        </div>
        <div className="relative z-10 mt-6 md:mt-0">
          <Heart
            size={80}
            className="-rotate-12 fill-emerald-400/20 text-emerald-400/30"
          />
        </div>
        <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-emerald-700/20 blur-3xl" />
      </div>
    </div>
  );
};

export default FoodBankProfilePage;
