import React, { useState } from 'react';
import DirectDonationForm from '../components/DirectDonationForm';
import DonationList from '../components/DonationList';
import Modal from '../../../../components/common/Modal';
import Button from '../../../../components/common/Button';
import { ShoppingBag, ChevronLeft, Plus, Heart, Inbox } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../../context/AuthContext';

const DonateFoodPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  
  const { user } = useAuth();
  const restaurantId = user?.id || user?._id || null;

  const handleAddClick = () => {
    setEditingDonation(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (donation) => {
    setEditingDonation(donation);
    setIsModalOpen(true);
  };

  const handleSuccess = () => {
    setIsModalOpen(false);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div className="flex items-center gap-5">
          <Link 
            to="/restaurant/dashboard" 
            className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 shadow-sm"
          >
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Your Donations</h1>
            <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
              Managing food items shared with the community <Heart size={16} className="text-emerald-500 fill-emerald-500" />
            </p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* <Link 
            to="/restaurant/donation-requests"
            className="rounded-2xl py-4 px-6 flex items-center justify-center gap-2 font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100 shadow-sm"
          >
            <Inbox size={20} />
            <span>View Donation Requests</span>
          </Link> */}
          <Button 
            onClick={handleAddClick}
            className="rounded-2xl py-4 px-8 flex justify-center items-center gap-2 shadow-xl shadow-emerald-200 hover:-translate-y-1 transition-transform"
          >
            <Plus size={20} />
            <span>Add New Donation</span>
          </Button>
        </div>
      </div>

      {/* Main Content: The List */}
      <div className="relative">
        <DonationList 
          restaurantId={restaurantId} 
          refreshTrigger={refreshKey}
          onEdit={handleEditClick}
        />
      </div>

      {/* Stats/Info Banner */}
      <div className="mt-16 p-10 rounded-[3rem] bg-emerald-900 text-white flex flex-col md:flex-row items-center justify-between shadow-2xl shadow-emerald-200 overflow-hidden relative">
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-3">Impact Highlight</h3>
          <p className="text-emerald-100/90 text-lg max-w-xl leading-relaxed">
            Every donation counts! Your surplus food could be someone's next meal. Thank you for making SharePlate possible.
          </p>
        </div>
        <div className="mt-8 md:mt-0 flex gap-4 relative z-10">
           <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <div className="text-3xl font-black">100%</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">Safety Tracked</div>
           </div>
           <div className="px-6 py-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 text-center">
              <div className="text-3xl font-black">2.4k</div>
              <div className="text-[10px] uppercase font-bold tracking-widest text-emerald-300">Meals Saved</div>
           </div>
        </div>
        <div className="absolute -right-12 -bottom-12 opacity-10 rotate-12">
          <ShoppingBag size={240} />
        </div>
      </div>

      {/* <div className="mt-10">
        <h2 className="text-2xl font-bold mb-4">Your Current Donations</h2>
        <DonationList restaurantId={restaurantId} refreshTrigger={refreshKey} onEdit={handleEditClick} />
      </div> */}

      {/* Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title={editingDonation ? "Edit Donation" : "New Food Donation"}
      >
        <DirectDonationForm 
          initialData={editingDonation} 
          onSuccess={handleSuccess}
          restaurantId={restaurantId}
        />
      </Modal>
    </div>
  );
};

export default DonateFoodPage;
