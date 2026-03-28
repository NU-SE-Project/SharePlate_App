import React from 'react';
import ProfileForm from '../../../common/profile/components/ProfileForm';
import { ChevronLeft, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const FoodBankProfilePage = () => {
  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <Link 
          to="/foodbank/donated-food" 
          className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 shadow-sm"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Food Bank Profile</h1>
          <p className="text-slate-500 font-medium mt-1">Manage your organization's identity and support settings.</p>
        </div>
      </div>

      {/* Main Content */}
      <ProfileForm />

      {/* Impact / Community Card */}
      <div className="mt-12 p-8 rounded-[3rem] bg-emerald-900 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-emerald-900/10 overflow-hidden relative">
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-xl font-bold mb-3">Community Hub</h3>
          <p className="text-emerald-100/90 text-sm max-w-sm leading-relaxed">
            Your profile details help restaurants know who is receiving their donations. Thank you for your continued support to the community!
          </p>
        </div>
        <div className="mt-6 md:mt-0 relative z-10">
           <Heart size={80} className="text-emerald-400/30 -rotate-12 fill-emerald-400/20" />
        </div>
        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-emerald-700/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
};

export default FoodBankProfilePage;
