import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Clock, Loader2, AlertCircle, Heart, CheckCircle2, XCircle, Info, Trash2, ArrowRight, User, Phone, MapPin, Map as MapIcon } from 'lucide-react';
import { getMyProactiveRequests, deleteProactiveRequest } from '../../services/foodbankService';
import { useAuth } from '../../../../context/AuthContext';
import { useSocket } from '../../../../context/SocketContext';
import Button from '../../../../components/common/Button';
import RouteMapModal from '../../../../components/common/RouteMapModal';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

const MyProactiveRequestsPage = () => {
  const { user } = useAuth();
  const currentFoodBankId = user?.id || user?._id || null;
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [routeModalData, setRouteModalData] = useState(null);
   const { socket } = useSocket();

  const selectedRequest = requests.find(r => r._id === selectedRequestId);

  const fetchRequests = async () => {
    if (!currentFoodBankId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMyProactiveRequests(currentFoodBankId);
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load your proactive requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [currentFoodBankId]);

   useEffect(() => {
      if (!socket || !currentFoodBankId) return;

      const handleRequestCreated = (data) => {
         if (data?.foodbankId && data.foodbankId !== currentFoodBankId) return;
         fetchRequests();
         toast.success('Your broadcast is now live for nearby restaurants.');
      };

      const handleRequestAccepted = () => {
         fetchRequests();
      };

      const handleRequestRejected = () => {
         fetchRequests();
      };

      const handleDonationUpdated = () => {
         fetchRequests();
      };

      socket.on('foodbank_request_created', handleRequestCreated);
      socket.on('request_accepted', handleRequestAccepted);
      socket.on('request_rejected', handleRequestRejected);
      socket.on('donation_updated', handleDonationUpdated);

      return () => {
         socket.off('foodbank_request_created', handleRequestCreated);
         socket.off('request_accepted', handleRequestAccepted);
         socket.off('request_rejected', handleRequestRejected);
         socket.off('donation_updated', handleDonationUpdated);
      };
   }, [socket, currentFoodBankId]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this broadcast?')) return;
    try {
      await deleteProactiveRequest(id);
      toast.success('Request cancelled');
      setRequests((prev) => prev.filter((r) => r._id !== id));
      if (selectedRequestId === id) setSelectedRequestId(null);
    } catch (error) {
      toast.error('Failed to delete request');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 animate-pulse">
        <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-6" />
        <p className="text-slate-500 font-bold tracking-tight">Syncing your broadcasts...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[4rem] border border-dashed border-slate-200">
        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-300">
           <Heart size={48} />
        </div>
        <h3 className="text-2xl font-black text-slate-800 mb-3 tracking-tight">No broadcasts active</h3>
        <p className="text-slate-500 max-w-sm mx-auto font-medium mb-10 leading-relaxed">
           You haven't broadcasted any food needs to the community yet. Start now to get support from nearby restaurants.
        </p>
        <Link to="/foodbank/post-request">
           <Button className="rounded-2xl px-10 py-5 font-black shadow-xl shadow-emerald-200 hover:-translate-y-1 transition-transform">
              Broadcast My First Need
           </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-7xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-5 duration-700">
      
      {/* Left Column: Request List */}
      <div className="lg:col-span-7 space-y-8">
        <div className="flex items-center justify-between mb-4">
           <h2 className="text-3xl font-black text-slate-900 tracking-tight">Active Broadcasts</h2>
           <span className="px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-black text-[10px] tracking-widest uppercase border border-emerald-100">
              {requests.length} Requests
           </span>
        </div>

        <div className="space-y-6">
          {requests.map((request) => {
            const progress = ((request.requestedQuantity - request.remainingQuantity) / request.requestedQuantity) * 100;
            const isSelected = selectedRequest?._id === request._id;
            
            return (
              <div 
                key={request._id} 
                onClick={() => {
                  setSelectedRequestId(request._id);
                  if (window.innerWidth < 1024) {
                    setTimeout(() => {
                      document.getElementById('request-details')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
                className={`group cursor-pointer bg-white rounded-[2.5rem] border transition-all duration-500 p-8 flex flex-col gap-6 hover:shadow-2xl hover:shadow-emerald-900/5 ${isSelected ? 'border-emerald-500 shadow-xl shadow-emerald-500/5 ring-4 ring-emerald-500/5' : 'border-slate-100 hover:border-emerald-100 shadow-sm'}`}
              >
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${request.foodType === 'veg' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'} ${isSelected ? 'scale-110 shadow-lg' : ''}`}>
                         <ShoppingBag size={24} />
                      </div>
                      <div>
                         <h3 className="text-xl font-black text-slate-800 tracking-tight line-clamp-1 group-hover:text-emerald-600 transition-colors uppercase italic">{request.foodName}</h3>
                         <span className="text-[10px] font-black tracking-widest text-slate-400 uppercase">{request.foodType} &bull; {new Date(request.createdAt).toLocaleDateString()}</span>
                      </div>
                   </div>
                   <button 
                     onClick={(e) => { e.stopPropagation(); handleDelete(request._id); }}
                     className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                   >
                      <Trash2 size={18} />
                   </button>
                </div>

                {/* Progress Bar */}
                <div className="space-y-3">
                   <div className="flex justify-between items-end">
                      <span className="text-sm font-black text-slate-600">Fulfillment Status</span>
                      <span className="text-sm font-black text-emerald-600 tracking-tight uppercase">
                         {request.requestedQuantity - request.remainingQuantity} / {request.requestedQuantity} SECURED
                      </span>
                   </div>
                   <div className="h-4 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <div 
                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000 ease-out relative"
                        style={{ width: `${progress}%` }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white/20 animate-shimmer" />
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-2">
                       <CheckCircle2 size={16} className={progress === 100 ? 'text-emerald-500' : 'text-slate-300'} />
                       <span className="text-xs font-bold text-slate-400 uppercase italic">
                          {progress === 100 ? 'Fully Secured!' : 'Accepting Support'}
                       </span>
                    </div>
                    <ArrowRight size={20} className={`text-emerald-500 transition-transform ${isSelected ? 'translate-x-1' : 'opacity-0'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Detail / Updates View */}
      <div id="request-details" className="lg:col-span-5 relative">
        <div className="sticky top-40 space-y-8">
           {selectedRequest ? (
             <div className="animate-in slide-in-from-right-10 duration-500">
               <div className="bg-emerald-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-emerald-950/20 overflow-hidden relative">
                  {/* Background decoration */}
                  <div className="absolute -right-20 -top-20 w-64 h-64 bg-emerald-700/50 rounded-full blur-3xl" />
                  
                  <h3 className="text-2xl font-black mb-8 relative z-10 flex items-center gap-3">
                     <Clock size={24} className="text-emerald-400" />
                     Updates for Request
                  </h3>
                  
                  <div className="space-y-6 relative z-10">
                     {selectedRequest.acceptances && selectedRequest.acceptances.length > 0 ? (
                       selectedRequest.acceptances.map((acc, idx) => (
                         <div key={idx} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/10 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                               <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                     <User size={18} />
                                  </div>
                                  <div>
                                     <div className="font-black text-sm">{acc.restaurant_id?.name || 'Local Restaurant'}</div>
                                     <div className="text-[10px] text-emerald-300 font-bold uppercase tracking-widest">Accepted {acc.acceptedQuantity} servings</div>
                                  </div>
                               </div>
                               <span className="text-[10px] font-black bg-emerald-500 px-3 py-1 rounded-full uppercase italic">New</span>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2">
                               <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-200">
                                  <Phone size={12} />
                                  <span>{acc.restaurant_id?.phone || 'Hidden Contact'}</span>
                               </div>
                                  <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-200">
                                     <MapPin size={12} />
                                     <span className="truncate">{acc.restaurant_id?.address || 'Local Pickup'}</span>
                                  </div>
                               </div>

                               <button 
                                 disabled={!acc.restaurant_id?.location?.coordinates}
                                 onClick={() => {
                                   if (!acc.restaurant_id?.location?.coordinates) {
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
                                       lat: acc.restaurant_id.location.coordinates[1],
                                       lng: acc.restaurant_id.location.coordinates[0],
                                       name: acc.restaurant_id.name,
                                       address: acc.restaurant_id.address
                                     },
                                     title: `Route to ${acc.restaurant_id.name}`
                                   });
                                 }}
                                 className="mt-2 w-full py-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-300 transition-all flex items-center justify-center gap-2"
                               >
                                  <MapIcon size={12} />
                                  {acc.restaurant_id?.location?.coordinates ? 'View Map Route' : 'Location Not Available'}
                               </button>

                            {acc.pickup_id && (
                               <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                  {acc.status !== 'delivered' && acc.pickup_id.otp ? (
                                    <div className="flex items-center gap-2">
                                       <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">OTP:</span>
                                       <span className="text-sm font-black tracking-widest bg-white/20 px-2 py-0.5 rounded italic">{acc.pickup_id.otp}</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 text-emerald-400">
                                       <CheckCircle2 size={12} />
                                       <span className="text-[10px] font-black uppercase tracking-widest">Verification Complete</span>
                                    </div>
                                  )}
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${acc.status === 'delivered' ? 'bg-emerald-500 text-white' : acc.status === 'expired' ? 'bg-red-500 text-white' : 'bg-orange-500 text-white'}`}>
                                     {acc.status}
                                  </span>
                               </div>
                            )}
                         </div>
                       ))
                     ) : (
                       <div className="text-center py-12 px-6 rounded-3xl border border-white/10 bg-white/5 flex flex-col items-center gap-4">
                          <AlertCircle size={40} className="text-emerald-400 opacity-50" />
                          <p className="font-bold text-emerald-100/70">No restaurants have accepted this request yet. We've notified all nearby chefs!</p>
                       </div>
                     )}
                  </div>
                  
                  <div className="mt-12 pt-8 border-t border-white/10 flex items-center gap-4 text-emerald-300 relative z-10">
                     <Info size={18} />
                     <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                        Tip: Reach out to restaurants to coordinate precise pickup details.
                     </p>
                  </div>
               </div>
               
               <div className="mt-8 p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-900/5 group-hover:rotate-12 transition-transform">
                     <CheckCircle2 size={24} />
                  </div>
                  <div>
                     <h4 className="font-black text-slate-800 tracking-tight">Need help?</h4>
                     <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Visit our center</p>
                  </div>
               </div>
             </div>
           ) : (
             <div className="hidden lg:flex flex-col items-center justify-center p-20 bg-slate-50 border-4 border-white rounded-[4rem] text-center min-h-[500px]">
                <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-slate-200 mb-8 shadow-inner shadow-slate-100">
                   <ShoppingBag size={64} />
                </div>
                <h3 className="text-2xl font-black text-slate-300 tracking-tight uppercase italic mb-4">Request Intel</h3>
                <p className="text-slate-400 font-bold text-sm max-w-xs leading-relaxed uppercase tracking-widest opacity-50">
                   Select a broadcast from the list to view real-time restaurant acceptances and fulfillment updates.
                </p>
             </div>
           )}
        </div>
      </div>
      
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

export default MyProactiveRequestsPage;
