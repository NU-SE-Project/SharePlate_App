import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, ChevronRight } from 'lucide-react';
import Button from "../../../../components/common/Button";
import { getDonationRequests, approveDonationRequest } from "../services/restaurantService";
import toast from 'react-hot-toast';
import AcceptRequestModal from './AcceptRequestModal';
import { useSocket } from '../../../../context/SocketContext';

const DonationRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      // derive restaurant id from localStorage user if available
      const user = JSON.parse(localStorage.getItem('user') || 'null');
      const restaurantId = user?.id || user?._id;
      if (!restaurantId) {
        toast.error('Missing restaurant id');
        setIsLoading(false);
        return;
      }
      const data = await getDonationRequests(restaurantId);
      setRequests(data.requests || data || []);
    } catch (error) {
      toast.error('Failed to load donation requests');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const { socket } = useSocket();
  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      fetchRequests();
      console.debug('DonationRequestList received socket event', data);
    };

    socket.on('new_food_request', handler);
    socket.on('donation_updated', handler);
    socket.on('request_accepted', handler);
    socket.on('request_rejected', handler);

    return () => {
      socket.off('new_food_request', handler);
      socket.off('donation_updated', handler);
      socket.off('request_accepted', handler);
      socket.off('request_rejected', handler);
    };
  }, [socket]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-emerald-600" size={40} />
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
         <h3 className="text-xl font-bold text-slate-800 mb-2">No requests for your donations</h3>
         <p className="text-slate-500 max-w-sm mx-auto">No food banks have requested items from your posted donations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <div 
          key={request._id || request.requestId}
          className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex-grow min-w-[280px]">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-lg font-extrabold text-slate-900">{request.food_id?.foodName || request.foodName}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600 mb-6">
                <MapPin size={18} className="text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-900">{request.foodBank_id?.name || request.foodbankName}</span>
                <span className="text-slate-400 font-normal">| {request.foodBank_id?.address || ''}</span>
              </div>

              <div className="flex items-center gap-6 text-sm">
                 <div className="flex flex-col">
                  <span className="text-slate-400 mb-1">Requested</span>
                  <span className="text-lg font-bold text-slate-900">{request.requestedQuantity} servings</span>
                </div>
                 <div className="flex flex-col">
                  <span className="text-slate-400 mb-1">Still Needed</span>
                  <span className="text-lg font-bold text-emerald-600">{request.remainingQuantity ?? request.requestedQuantity} servings</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 min-w-[200px]">
              {request.status === 'pending' ? (
                <Button 
                  onClick={() => setSelectedRequest(request)}
                  className="w-full py-4 shadow-emerald-100"
                >
                  Accept & Donate <ChevronRight className="ml-2" size={18} />
                </Button>
              ) : (
                <div className="w-full py-4 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 font-semibold">
                  {request.status === 'approved' || request.status === 'fulfilled' ? 'Accepted' : request.status}
                </div>
              )}
               <p className="text-xs text-center text-slate-400 italic">
                Support your community food bank
              </p>
            </div>
          </div>
        </div>
      ))}

      {selectedRequest && (
        <AcceptRequestModal 
           request={selectedRequest} 
           onClose={() => setSelectedRequest(null)}
           onSuccess={() => {
             setSelectedRequest(null);
             fetchRequests();
           }}
           onAccept={async (id, qty) => {
             // use approveDonationRequest for donation-targeted requests
             return approveDonationRequest(id, qty);
           }}
           showQuantity={false}
        />
      )}
    </div>
  );
};

export default DonationRequestList;
