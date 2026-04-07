import React from 'react';
import DonationList from '../components/DonationList';
import { ShoppingBag, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';

const ManageDonationsPage = () => {
  const { user } = useAuth();
  const restaurantId = user?.id || user?._id || null;

  return (
    <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
       <div className="flex items-center gap-4 mb-10">
        <Link 
          to="/restaurant/dashboard" 
          className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 shadow-sm"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Manage Donations</h1>
          <p className="text-slate-500 font-medium mt-1">Review, edit, and update the status of your listed donations.</p>
        </div>
      </div>

      <div className="space-y-12">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-800">Your Donations</h2>
          <Link to="/restaurant/donate">
            <button className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-all duration-300 shadow-lg shadow-emerald-200">
              New Donation
            </button>
          </Link>
        </div>

        <DonationList restaurantId={restaurantId} />
      </div>
    </div>
  );
};

export default ManageDonationsPage;
