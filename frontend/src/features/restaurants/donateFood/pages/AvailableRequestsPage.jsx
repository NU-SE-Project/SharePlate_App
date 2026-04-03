import React, { useState } from 'react';
import RequestList from '../components/RequestList';
import DonationRequestList from '../components/DonationRequestList';
import { ShoppingBag, ChevronLeft, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';

const AvailableRequestsPage = () => {
  const [activeTab, setActiveTab] = useState('foodbank');
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
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Active Food Bank Requests</h1>
          <p className="text-slate-500 font-medium mt-1">Discover what nearby food banks need most right now. Help by accepting and donating food.</p>
        </div>
      </div>

      {/* <div className="mb-12 bg-white p-8 rounded-[2rem] border border-emerald-50 shadow-sm flex flex-col md:flex-row items-center gap-8 justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-emerald-100 rounded-3xl flex items-center justify-center text-emerald-600 border border-emerald-200">
            <Bell size={32} className="animate-bounce" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 leading-tight underline underline-offset-4 decoration-emerald-200 decoration-4">Real-time Updates</h3>
            <p className="text-sm text-slate-500 font-medium mt-1">This page updates automatically as new requests appear from food banks in your area.</p>
          </div>
        </div>
        <div className="flex gap-4">
          <Link to="/restaurant/donate">
             <button className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-700 transition-all duration-300 shadow-xl shadow-emerald-200">
              New Donation
            </button>
          </Link>
        </div>
      </div> */}

      <div className="bg-white p-6 rounded-2xl border border-slate-100 mb-8">
        <div className="flex items-center gap-4">
          <button
            className={`px-4 py-2 rounded-xl font-semibold ${false ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}
            onClick={() => setActiveTab('foodbank')}
          >
            Food Bank Requests
          </button>
          <button
            className={`px-4 py-2 rounded-xl font-semibold ${false ? 'bg-emerald-600 text-white' : 'text-slate-700'}`}
            onClick={() => setActiveTab('donation')}
          >
            Requests For My Donations
          </button>
        </div>
      </div>

      {activeTab === 'foodbank' ? <RequestList /> : <DonationRequestList />}
    </div>
  );
};

export default AvailableRequestsPage;
