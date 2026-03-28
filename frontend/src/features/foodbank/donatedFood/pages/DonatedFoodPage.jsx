import React, { useState, useEffect } from 'react';
import { ShoppingBag, ChevronLeft, Heart, Search, Filter, Loader2, Info, ArrowUpRight } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import AvailableFoodTab from '../components/AvailableFoodTab';
import MyRequestsTab from '../components/MyRequestsTab';
import Modal from '../../../../components/common/Modal';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import { requestFoodDonation } from '../../services/foodbankService';
import toast from 'react-hot-toast';
import { useAuth } from '../../../../context/AuthContext';

const DonatedFoodPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'available';
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDonation, setSelectedDonation] = useState(null);
  const [requestQuantity, setRequestQuantity] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  
  // Get FoodBank ID from AuthContext or localStorage
  const auth = useAuth();
  const userFromCtx = auth?.user;
  const userLocal = JSON.parse(localStorage.getItem('user') || 'null');
  const foodBankId = userFromCtx?._id || userFromCtx?.id || userLocal?._id || userLocal?.id || null;

  useEffect(() => {
    if (!foodBankId) {
      toast.error('Please login as a food bank to request donations');
    }
  }, [foodBankId]);

  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  const handleOpenRequest = (donation) => {
    setSelectedDonation(donation);
    setRequestQuantity(donation.remainingQuantity.toString()); // Default to max available
    setIsModalOpen(true);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!requestQuantity || requestQuantity <= 0) {
      toast.error('Please enter a valid quantity');
      return;
    }
    if (Number(requestQuantity) > selectedDonation.remainingQuantity) {
      toast.error(`Only ${selectedDonation.remainingQuantity} servings available`);
      return;
    }

    setIsRequesting(true);
    try {
      if (!foodBankId) throw new Error('Missing food bank identity');
      if (!selectedDonation?.restaurant_id) throw new Error('Missing restaurant id on donation');
      const payload = {
        restaurant_id: selectedDonation.restaurant_id,
        foodBank_id: foodBankId,
        requestedQuantity: Number(requestQuantity),
      };
      console.debug('Submitting food request', { food_id: selectedDonation._id, payload });
      await requestFoodDonation(selectedDonation._id, payload);
      toast.success('Your request has been submitted to the restaurant!');
      setIsModalOpen(false);
      handleTabChange('requested'); // Switch to requested tab
    } catch (error) {
      console.error('Request submission failed', error.response?.data || error.message || error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsRequesting(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Hero Section */}
      <div className="relative rounded-[3.5rem] bg-emerald-900 overflow-hidden mb-12 shadow-2xl shadow-emerald-900/10">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-800 to-transparent opacity-50" />
        <div className="absolute -right-20 -top-20 w-96 h-96 bg-emerald-700/30 rounded-full blur-[80px]" />
        
        <div className="relative z-10 p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 text-center lg:text-left">
           <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-800/50 border border-emerald-700/50 text-emerald-300 text-xs font-black uppercase tracking-widest mb-6">
                 <Heart size={14} className="fill-emerald-400 text-emerald-400" />
                 Community Support Hub
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-white leading-tight mb-6 tracking-tight">
                 Empowering Your <br /><span className="text-emerald-400">Mission</span> to Feed.
              </h1>
              <p className="text-emerald-100/80 text-lg font-medium max-w-lg mb-10 leading-relaxed">
                 Browse real-time food donations from local restaurants and secure meals for your community members in just a few clicks.
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                 <Button 
                   onClick={() => handleTabChange('available')}
                   className={`px-8 py-4 rounded-2xl font-bold transition-all border-none ${activeTab === 'available' ? 'bg-white text-emerald-900 shadow-xl' : 'bg-emerald-800 text-white hover:bg-emerald-700'}`}
                 >
                    Browse Collections
                 </Button>
                 <Button 
                   onClick={() => handleTabChange('requested')}
                   className={`px-8 py-4 rounded-2xl font-bold transition-all border-none ${activeTab === 'requested' ? 'bg-white text-emerald-900 shadow-xl' : 'bg-emerald-800 text-white hover:bg-emerald-700'}`}
                 >
                    Manage Requests
                 </Button>
              </div>
           </div>
           
           <div className="flex-shrink-0 animate-bounce-slow">
              <div className="w-64 h-64 bg-white/10 rounded-[4rem] backdrop-blur-3xl border border-white/10 p-10 shadow-2xl shadow-emerald-950/20 relative rotate-6">
                 <ShoppingBag size={176} className="text-emerald-400 opacity-80" />
                 <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-xl rotate-12">
                    <Heart size={48} className="text-emerald-600 fill-emerald-600" />
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* Stats Quickbar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
         {[
           { label: 'Meals Available', value: '450+', color: 'text-emerald-600' },
           { label: 'Active Restaurants', value: '24', color: 'text-emerald-600' },
           { label: 'Your Active Requests', value: '08', color: 'text-blue-600' },
           { label: 'Community Partners', value: '12', color: 'text-emerald-600' }
         ].map((stat, i) => (
           <div key={i} className="bg-white p-6 rounded-[2rem] border border-emerald-50 shadow-sm flex flex-col items-center">
              <span className="text-10px font-extrabold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</span>
              <span className={`text-3xl font-black ${stat.color}`}>{stat.value}</span>
           </div>
         ))}
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'available' ? (
          <AvailableFoodTab onRequest={handleOpenRequest} />
        ) : (
          <MyRequestsTab foodBankId={foodBankId} />
        )}
      </div>

      {/* Request Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Secure Food Donation"
      >
        {selectedDonation && (
          <form onSubmit={handleSubmitRequest} className="space-y-8">
            <div className="bg-emerald-50/50 p-6 rounded-3xl border border-emerald-100 flex items-center gap-6">
              <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-emerald-600 shadow-md">
                 <ShoppingBag size={32} />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">{selectedDonation.foodName}</h4>
                <p className="text-slate-500 font-medium">Available: <span className="text-emerald-600">{selectedDonation.remainingQuantity}</span> servings</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input 
                label="How many servings do you need?"
                type="number"
                placeholder="Enter quantity"
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(e.target.value)}
                min="1"
                max={selectedDonation.remainingQuantity}
                icon={<Info size={18} />}
              />
              <p className="text-xs text-slate-400 px-2 font-medium flex items-center gap-2">
                <ArrowUpRight size={14} className="text-emerald-500" />
                Wait for restaurant approval to finalize the pickup.
              </p>
            </div>

            <div className="flex gap-4 pt-4">
              <Button 
                variant="outline" 
                className="flex-1 py-4 font-bold border-slate-200" 
                onClick={() => setIsModalOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button 
                className="flex-2 py-4 font-bold shadow-xl shadow-emerald-200" 
                disabled={isRequesting}
                type="submit"
              >
                {isRequesting ? <Loader2 className="animate-spin" /> : 'Confirm Request'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};

export default DonatedFoodPage;
