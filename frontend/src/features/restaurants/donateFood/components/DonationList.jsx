import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Calendar, Eye, Loader2, AlertCircle, Clock, Leaf, Flame } from 'lucide-react';
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

  const getImageUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('/')) {
      const base = import.meta.env.VITE_API_URL
        ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '')
        : 'http://localhost:5000';
      return base + url;
    }
    return url;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'available': return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
      case 'closed':    return 'bg-amber-100 text-amber-700 border border-amber-200';
      case 'expired':   return 'bg-red-100 text-red-700 border border-red-200';
      default:          return 'bg-slate-100 text-slate-500 border border-slate-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={36} />
      </div>
    );
  }

  if (donations.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertCircle size={32} className="text-slate-300" />
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">No donations yet</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto">
          You haven't listed any food for donation. Your kindness can make a difference!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      {donations.map((donation) => {
        const imageUrl = getImageUrl(donation.imageUrl);
        const isVeg = donation.foodType === 'veg';

        return (
          <div
            key={donation._id}
            className="group bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all duration-300 overflow-hidden flex flex-col"
          >
            {/* Image / Color Strip */}
            {imageUrl ? (
              <div className="relative h-50 w-full overflow-hidden flex-shrink-0">
                <img
                  src={imageUrl}
                  alt={donation.foodName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {/* Gradient overlay at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Veg/Non-veg badge */}
                <div className="absolute top-2.5 left-2.5">
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm shadow-sm ${isVeg ? 'bg-emerald-500/90 text-white' : 'bg-orange-500/90 text-white'}`}>
                    {isVeg ? <Leaf size={9} /> : <Flame size={9} />}
                    {donation.foodType}
                  </span>
                </div>

                {/* Status badge on image */}
                <div className="absolute top-2.5 right-2.5">
                  <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full backdrop-blur-sm ${getStatusStyle(donation.status)}`}>
                    {donation.status}
                  </span>
                </div>

                {/* Action buttons overlaid on image */}
                <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => onEdit && onEdit(donation)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-500 hover:text-emerald-600 shadow-sm transition-colors"
                    title="Edit"
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(donation._id)}
                    className="p-1.5 bg-white/90 backdrop-blur-sm rounded-lg text-slate-500 hover:text-red-500 shadow-sm transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ) : (
              <div className={`relative h-2 w-full flex-shrink-0 ${isVeg ? 'bg-emerald-500' : 'bg-orange-500'}`} />
            )}

            {/* Content */}
            <div className="p-4 flex-1 flex flex-col gap-3">

              {/* Header row — no image variant shows badge here */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  {!imageUrl && (
                    <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mb-1 ${isVeg ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                      {isVeg ? <Leaf size={8} /> : <Flame size={8} />}
                      {donation.foodType}
                    </span>
                  )}
                  <h3 className="text-sm font-bold text-slate-800 leading-tight line-clamp-1 group-hover:text-emerald-600 transition-colors">
                    {donation.foodName}
                  </h3>
                </div>

                {/* Action buttons (no image case — always visible) */}
                {!imageUrl && (
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => onEdit && onEdit(donation)}
                      className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Edit"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => handleDelete(donation._id)}
                      className="p-1.5 bg-slate-50 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                )}

                {/* Status badge (no image case) */}
                {!imageUrl && (
                  <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full flex-shrink-0 ${getStatusStyle(donation.status)}`}>
                    {donation.status}
                  </span>
                )}
              </div>

              {/* Description */}
              {donation.description && (
                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed italic">
                  "{donation.description}"
                </p>
              )}

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Remaining</span>
                  <div className="flex items-baseline gap-0.5">
                    <span className="text-base font-black text-emerald-600">{donation.remainingQuantity}</span>
                    <span className="text-[10px] text-slate-400">/{donation.totalQuantity}</span>
                  </div>
                </div>
                <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col gap-0.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Expiry</span>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar size={11} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-[11px] font-bold truncate">
                      {new Date(donation.expiryTime).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pickup time */}
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px]">
                <Clock size={11} className="flex-shrink-0" />
                <span>
                  Pickup ends{' '}
                  <span className="font-semibold text-slate-500">
                    {new Date(donation.pickupWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </span>
              </div>

              {/* CTA */}
              <button
                onClick={() => navigate(`/restaurant/donation-requests/${donation._id}`)}
                className="mt-auto w-full py-2.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-600 hover:text-white transition-all duration-200 flex items-center justify-center gap-1.5 border border-emerald-100 hover:border-emerald-600"
              >
                <Eye size={14} />
                View Requests
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DonationList;