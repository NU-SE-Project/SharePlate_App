import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Clock, MapPin, Search, Filter, Loader2, AlertCircle, PlusCircle } from 'lucide-react';
import { getAvailableDonatedFood } from '../../services/foodbankService';
import Button from '../../../../components/common/Button';
import toast from 'react-hot-toast';
import { useSocket } from '../../../../context/SocketContext';
import { useAuth } from '../../../../context/AuthContext';
import RouteMapModal from '../../../../components/common/RouteMapModal';
import { Map as MapIcon } from 'lucide-react';

const AvailableFoodTab = ({ onRequest }) => {
  const [donations, setDonations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [routeModalData, setRouteModalData] = useState(null);
  const { user } = useAuth();

  const fetchDonations = async () => {
    setIsLoading(true);
    try {
      const data = await getAvailableDonatedFood();
      setDonations(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to load available food');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  // Listen for donation updates via socket and refresh list
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      fetchDonations();
    };
    socket.on('donation_updated', handler);
    socket.on('donation_created', handler);
    return () => {
      socket.off('donation_updated', handler);
      socket.off('donation_created', handler);
    };
  }, [socket]);

  const filteredDonations = donations.filter(d => {
    const matchesSearch = d.foodName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || d.foodType === filterType;
    return matchesSearch && matchesFilter && d.remainingQuantity > 0 && d.status === 'available';
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium">Fetching available meals...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-6 p-8 bg-white rounded-[2.5rem] shadow-xl shadow-emerald-900/5 border border-emerald-50">
        <div className="flex-1 relative group">
          <div className="absolute inset-y-0 left-5 flex items-center text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <Search size={22} />
          </div>
          <input 
            type="text"
            placeholder="Search by food name..."
            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border border-slate-100 focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium text-slate-700 placeholder:text-slate-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          {['all', 'veg', 'non-veg'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-6 py-4 rounded-2xl font-bold transition-all text-sm capitalize ${filterType === type ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-200' : 'bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100'}`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {filteredDonations.length === 0 ? (
        <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm animate-in fade-in duration-700">
          <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <AlertCircle size={48} className="text-slate-300" />
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">No meals available right now</h3>
          <p className="text-slate-500 max-w-sm mx-auto font-medium">Check back soon! Restaurants are constantly updating their surplus food lists.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredDonations.map((donation) => (
            <div key={donation._id} className="group flex flex-col bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-2xl hover:shadow-emerald-900/5 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
              <div className="h-56 relative overflow-hidden">
                {donation.imageUrl ? (
                  <img src={(donation.imageUrl && donation.imageUrl.startsWith('/')) ? (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, '') : 'http://localhost:5000') + donation.imageUrl : donation.imageUrl} alt={donation.foodName} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center ${donation.foodType === 'veg' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    <ShoppingBag size={48} className="opacity-20" />
                  </div>
                )}
                <div className="absolute top-5 left-5">
                  <span className={`text-[10px] font-black uppercase tracking-[0.1em] px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-lg ${donation.foodType === 'veg' ? 'bg-emerald-500/80 text-white' : 'bg-orange-500/80 text-white'}`}>
                    {donation.foodType}
                  </span>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1">
                <h3 className="text-2xl font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors tracking-tight">
                  {donation.foodName}
                </h3>
                {donation.description && (
                  <p className="text-slate-500 text-sm mb-6 line-clamp-2 leading-relaxed italic">
                    "{donation.description}"
                  </p>
                )}

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 shadow-inner shadow-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Left</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-emerald-600">{donation.remainingQuantity}</span>
                      <span className="text-xs text-slate-400">/ {donation.totalQuantity}</span>
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col gap-1 shadow-inner shadow-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Expires</span>
                    <div className="flex items-center gap-1.5 text-slate-700 justify-center">
                      <Calendar size={16} className="text-emerald-500" />
                      <span className="text-sm font-bold">{new Date(donation.expiryTime).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto pt-6 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
                    <div className="flex items-center gap-2">
                       <Clock size={14} className="text-emerald-500" />
                       <span>Until {new Date(donation.pickupWindowEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <span>By: {donation.restaurant_id?.name || (typeof donation.restaurant_id === 'string' ? `Restaurant ${donation.restaurant_id.slice(-4)}` : 'Local Restaurant')}</span>
                  </div>

                  <button 
                    disabled={!donation.restaurant_id?.location?.coordinates}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!donation.restaurant_id?.location?.coordinates) {
                        toast.error("Restaurant location not available");
                        return;
                      }
                      if (!user?.location?.coordinates) {
                        toast.error("Your location not available. Please update profile.");
                        return;
                      }
                      setRouteModalData({
                        start: {
                          lat: user.location.coordinates[1],
                          lng: user.location.coordinates[0],
                          name: user.name,
                          address: user.address
                        },
                        end: {
                          lat: donation.restaurant_id.location.coordinates[1],
                          lng: donation.restaurant_id.location.coordinates[0],
                          name: donation.restaurant_id.name,
                          address: donation.restaurant_id.address
                        },
                        title: `Route to ${donation.restaurant_id.name}`
                      });
                    }}
                    className="w-full py-3 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed border border-emerald-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-600 transition-all flex items-center justify-center gap-2 group/map"
                  >
                    <MapIcon size={14} className="group-hover/map:rotate-12 transition-transform" />
                    {donation.restaurant_id?.location?.coordinates ? 'View Route on Map' : 'Location Hidden'}
                  </button>

                  <Button 
                    className="w-full rounded-2xl py-4 flex items-center justify-center gap-3 shadow-xl shadow-emerald-200 hover:shadow-emerald-900/10 active:scale-95 transition-all text-base tracking-tight"
                    onClick={() => onRequest(donation)}
                  >
                    <PlusCircle size={20} />
                    Submit Request
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {routeModalData && (
        <RouteMapModal 
          isOpen={!!routeModalData}
          onClose={() => setRouteModalData(null)}
          startLocation={routeModalData.start}
          endLocation={routeModalData.end}
          title={routeModalData.title}
        />
      )}
    </div>
  );
};

export default AvailableFoodTab;
