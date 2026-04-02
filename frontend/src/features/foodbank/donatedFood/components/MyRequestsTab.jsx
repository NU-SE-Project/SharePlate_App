import React, { useState, useEffect } from 'react';
import { ShoppingBag, Calendar, Clock, Loader2, AlertCircle, CheckCircle2, XCircle, Timer, Info, Smartphone } from 'lucide-react';
import { getMyFoodRequests } from '../../services/foodbankService';
import toast from 'react-hot-toast';
import { useSocket } from '../../../../context/SocketContext';
import { useAuth } from '../../../../context/AuthContext';
import RouteMapModal from '../../../../components/common/RouteMapModal';
import { Map as MapIcon } from 'lucide-react';

const MyRequestsTab = ({ foodBankId }) => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [routeModalData, setRouteModalData] = useState(null);
  const { user } = useAuth();

  const fetchRequests = async () => {
    if (!foodBankId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const data = await getMyFoodRequests(foodBankId);
      setRequests(data);
    } catch (error) {
      toast.error('Failed to load your requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [foodBankId]);

  // Listen for request status changes for real-time updates
  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const onAccepted = (data) => {
      fetchRequests();
      toast.success('A request was accepted.');
    };
    const onRejected = (data) => {
      fetchRequests();
      toast('A request was updated.');
    };
    socket.on('request_accepted', onAccepted);
    socket.on('request_rejected', onRejected);
    return () => {
      socket.off('request_accepted', onAccepted);
      socket.off('request_rejected', onRejected);
    };
  }, [socket]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="animate-spin text-emerald-600 mb-4" size={48} />
        <p className="text-slate-500 font-medium tracking-tight">Syncing your requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-32 bg-white rounded-[3rem] border border-dashed border-slate-200 shadow-sm transition-all duration-700">
        <div className="w-24 h-24 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-8 text-slate-300">
            <ShoppingBag size={48} />
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">No requests yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto font-medium">Browse the "Available Food" tab to find items for your community.</p>
      </div>
    );
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'approved':
        return { 
          icon: <CheckCircle2 size={16} />, 
          bg: 'bg-emerald-50', 
          text: 'text-emerald-700', 
          border: 'border-emerald-100',
          label: 'Awaiting Pickup'
        };
      case 'collected':
      case 'delivered':
        return { 
          icon: <CheckCircle2 size={16} />, 
          bg: 'bg-blue-50', 
          text: 'text-blue-700', 
          border: 'border-blue-100',
          label: 'Handed Over'
        };
      case 'rejected':
        return { 
          icon: <XCircle size={16} />, 
          bg: 'bg-red-50', 
          text: 'text-red-700', 
          border: 'border-red-100',
          label: 'Request Rejected'
        };
      default:
        return { 
          icon: <Timer size={16} />, 
          bg: 'bg-blue-50', 
          text: 'text-blue-700', 
          border: 'border-blue-100',
          label: 'Pending Approval'
        };
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6">
      {requests.map((request) => {
        const statusInfo = getStatusInfo(request.status);
        return (
          <div key={request._id} className="group bg-white rounded-[2.5rem] border border-emerald-50 shadow-sm hover:shadow-xl hover:shadow-emerald-900/5 transition-all duration-500 p-8 flex flex-col md:flex-row gap-8 items-center border-l-8 border-l-emerald-600">
            
            <div className="w-20 h-20 rounded-[1.5rem] bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0 shadow-lg shadow-emerald-900/5 group-hover:rotate-6 transition-transform">
              <ShoppingBag size={32} />
            </div>

            <div className="flex-1 text-center md:text-left space-y-2">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">{request.food_id?.foodName || 'Meal Request'}</h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm font-bold text-slate-500">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-500" />
                  <span>{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="w-1 h-1 bg-slate-300 rounded-full hidden sm:block" />
                <div className="flex items-center gap-2">
                  <Info size={16} className="text-emerald-500" />
                  <span>Qty: <span className="text-emerald-600">{request.requestedQuantity}</span> servings</span>
                </div>
              </div>
            </div>

            <div className={`p-4 rounded-2xl border ${statusInfo.bg} ${statusInfo.border} ${statusInfo.text} flex flex-col items-center gap-1 min-w-[200px] shadow-sm transform group-hover:scale-105 transition-transform`}>
              <div className="flex items-center gap-2 font-black uppercase text-xs tracking-widest">
                {statusInfo.icon}
                {statusInfo.label}
              </div>
              {request.status === 'approved' && request.pickup_id?.otp && (
                <div className="mt-2 text-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Pickup OTP</span>
                  <div className="bg-white px-4 py-2 rounded-xl border-2 border-emerald-500 text-emerald-600 font-black tracking-widest text-lg shadow-sm">
                    {request.pickup_id.otp}
                  </div>
                </div>
              )}
              <span className="text-[10px] font-bold opacity-60 mt-1">ID: {typeof request._id === 'string' ? request._id.slice(-6) : 'N/A'}</span>
            </div>
            
            <div className="flex flex-col gap-2">
               <button 
                 disabled={!request.restaurant_id?.location?.coordinates}
                 onClick={() => {
                   if (!request.restaurant_id?.location?.coordinates) {
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
                       lat: request.restaurant_id.location.coordinates[1],
                       lng: request.restaurant_id.location.coordinates[0],
                       name: request.restaurant_id.name,
                       address: request.restaurant_id.address
                     },
                     title: `Route to ${request.restaurant_id.name}`
                   });
                 }}
                 className="px-6 py-3 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-[10px] uppercase tracking-widest border border-emerald-100 hover:bg-emerald-100 hover:shadow-md transition-all flex items-center justify-center gap-2 group/map disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <MapIcon size={14} className="group-hover/map:rotate-12 transition-transform" />
                  Map
               </button>
               {request.status === 'pending' && (
                 <button className="px-6 py-3 rounded-xl text-red-600 font-bold text-sm hover:bg-red-50 transition-all">
                    Cancel
                 </button>
               )}
            </div>
          </div>
        );
      })}

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

export default MyRequestsTab;
