import React from 'react';
import ProfileForm from '../../../common/profile/components/ProfileForm';
import { ChevronLeft, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

const RestaurantProfilePage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <Link 
          to="/restaurant/dashboard" 
          className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-2xl border border-slate-100 bg-white text-slate-400 shadow-sm transition-all duration-300 hover:bg-emerald-50 hover:text-emerald-600"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Restaurant Profile</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your business profile and contact information.</p>
        </div>
      </div>

      {/* Main Content */}
      <ProfileForm />

      {/* Info Card */}
      <div className="mt-12 p-8 rounded-[3rem] bg-emerald-900 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-emerald-900/10 overflow-hidden relative">
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-xl font-bold mb-3">Community Transparency</h3>
          <p className="text-emerald-100/90 text-sm max-w-sm leading-relaxed">
            Your profile details are shown to authorized food banks when you donate. Keep them accurate to ensure smooth collection processes.
          </p>
        </div>
        <div className="mt-6 md:mt-0 relative z-10">
           <ShoppingBag size={80} className="text-emerald-400/30 rotate-12" />
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-700/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default RestaurantProfilePage;
