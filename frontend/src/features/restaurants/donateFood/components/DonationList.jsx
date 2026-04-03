import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Calendar, ShoppingBag, Eye, Loader2, AlertCircle, Clock } from 'lucide-react';
import Button from "../../../../components/common/Button";
import { getMyDonations, deleteDonation } from "../services/restaurantService";
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const DonationList = ({ restaurantId, refreshTrigger, onEdit }) => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchDonations = async () => {
    if (!restaurantId || restaurantId === '000000000000000000000000') {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMyDonations(restaurantId);
      setDonations(Array.isArray(data) ? data : (data.donations || []));
    } catch (error) {
      toast.error('Failed to load donations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [restaurantId, refreshTrigger]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donation?')) return;
    
    try {
      await deleteDonation(id);
      toast.success('Donation deleted');
      setDonations((prev) => prev.filter((d) => d._id !== id));
    } catch (error) {
      toast.error('Failed to delete donation');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
        <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 mb-2">No donations found</h3>
        <p className="text-slate-500 max-w-sm mx-auto">You haven't listed any food items for donation yet. Your kindness can make a difference!</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {donations.map((donation) => (
        <div key={donation._id} className="group bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500 overflow-hidden flex flex-col">
          {donation.imageUrl ? (
            <div className="h-48 w-full overflow-hidden relative">
              <img 
                src={(donation.imageUrl && donation.imageUrl.startsWith('/')) ? (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000') + donation.imageUrl : donation.imageUrl}
                alt={donation.foodName} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute top-4 left-4">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full backdrop-blur-md ${donation.foodType === 'veg' ? 'bg-emerald-500/80 text-white' : 'bg-orange-500/80 text-white'}`}>
                  {donation.foodType}
                </span>
              </div>
            </div>
          ) : (
            <div className={`h-4 w-full ${donation.foodType === 'veg' ? 'bg-emerald-500' : 'bg-orange-500'}`} />
          )}

          <div className="p-8 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                {!donation.imageUrl && (
                  <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md mb-2 ${donation.foodType === 'veg' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {donation.foodType}
                  </span>
                )}
                <h3 className="text-xl font-bold text-slate-900 line-clamp-1 group-hover:text-emerald-600 transition-colors">{donation.foodName}</h3>
              </div>
              <div className="flex gap-1 ml-4 shadow-sm bg-slate-50 rounded-xl p-1">
                <button 
                  onClick={() => onEdit && onEdit(donation)}
                  className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all duration-300"
                  title="Edit"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => handleDelete(donation._id)}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all duration-300" 
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {donation.description && (
              <p className="text-slate-500 text-sm mb-6 line-clamp-2 italic leading-relaxed">
                "{donation.description}"
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-xl font-black text-emerald-600">{donation.remainingQuantity}</span>
                  <span className="text-xs text-slate-400">/{donation.totalQuantity}</span>
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Expiry</span>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Calendar size={14} className="text-emerald-500" />
                  <span className="text-sm font-bold">{new Date(donation.expiryTime).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between mb-4">
               <div className="flex items-center gap-2 text-slate-400 text-xs">
                  <Clock size={14} />
                  <span>Pickup Ends: {new Date(donation.pickupWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
               </div>
               <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${donation.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                 {donation.status}
               </span>
            </div> */}


            <div className="mt-auto pt-6 border-t border-slate-100 flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-slate-400 text-xs">
                <Clock size={14} />
                <span>
                  Pickup Ends:{" "}
                  {new Date(donation.pickupWindowEnd).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <span
                className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                  donation.status === "available"
                    ? "bg-emerald-100 text-emerald-700"
                    : donation.status === "closed"
                    ? "bg-yellow-100 text-yellow-700"
                    : donation.status === "expired"
                    ? "bg-red-100 text-red-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {donation.status}
              </span>
            </div>

            <button 
             onClick={() => navigate(`/restaurant/donation-requests/${donation._id}`)}
              className="w-full mt-auto py-3 rounded-xl bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
            >
              <Eye size={18} /> View Request Details
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DonationList;
