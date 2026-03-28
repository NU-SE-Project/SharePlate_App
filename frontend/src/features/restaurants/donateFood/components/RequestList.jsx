import React, { useState, useEffect } from 'react';
import { ShoppingBag, Loader2, MapPin, Calendar, CheckSquare, ChevronRight } from 'lucide-react';
import Button from "../../../../components/common/Button";
import { getAllOpenRequests } from "../services/restaurantService";
import toast from 'react-hot-toast';
import AcceptRequestModal from './AcceptRequestModal';
import { useSocket } from '../../../../context/SocketContext';

const RequestList = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getAllOpenRequests();
      setRequests(data.requests || []);
    } catch (error) {
      toast.error('Failed to load food bank requests');
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
      console.debug('RequestList received socket event', data);
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
         <h3 className="text-xl font-bold text-slate-800 mb-2">No active requests nearby</h3>
         <p className="text-slate-500 max-w-sm mx-auto">There are currently no food requests from food banks. Check back later!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {requests.map((request) => (
        <div 
          key={request._id} 
          className="bg-white p-8 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex-grow min-w-[280px]">
              <div className="flex items-center gap-3 mb-4">
                <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full ${request.foodType === 'veg' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
                    {request.foodType}
                </span>
                <span className="text-xs font-medium text-slate-500">Posted on {new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
              
              <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{request.foodName}</h3>
              
              <div className="flex items-center gap-2 text-slate-600 mb-6">
                <MapPin size={18} className="text-emerald-500 shrink-0" />
                <span className="font-semibold text-slate-900">{request.foodbank_id?.name}</span>
                <span className="text-slate-400 font-normal">| {request.foodbank_id?.address}</span>
              </div>

              <div className="flex items-center gap-6 text-sm mb-4">
                 <div className="flex flex-col">
                  <span className="text-slate-400 mb-1">Requested</span>
                  <span className="text-lg font-bold text-slate-900">{request.requestedQuantity} servings</span>
                </div>
                 <div className="flex flex-col">
                  <span className="text-slate-400 mb-1">Accepted</span>
                  <span className="text-lg font-bold text-slate-900">{request.acceptedTotal ?? (request.requestedQuantity - request.remainingQuantity)} servings</span>
                </div>
                 <div className="flex flex-col">
                  <span className="text-slate-400 mb-1">Still Needed</span>
                  <span className="text-lg font-bold text-emerald-600">{request.remainingQuantity} servings</span>
                </div>
              </div>

              {request.acceptances && request.acceptances.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm text-slate-500 mb-2">Accepted by</h4>
                  <ul className="space-y-2">
                    {request.acceptances.map((a) => (
                      <li key={a._id} className="text-sm text-slate-700">
                        <span className="font-semibold">{a.restaurant_id?.name || 'Restaurant'}</span>: {a.acceptedQuantity} servings
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

              <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-4">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${((request.requestedQuantity - request.remainingQuantity) / request.requestedQuantity) * 100}%` }}
                />
              </div>
              {request.status === 'open' && request.remainingQuantity > 0 ? (
                <Button 
                  onClick={() => setSelectedRequest(request)}
                  className="w-full py-4 shadow-emerald-100"
                >
                  Accept & Donate <ChevronRight className="ml-2" size={18} />
                </Button>
              ) : (
                <div className="w-full py-3 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 font-semibold">
                  {request.status === 'fulfilled' || request.remainingQuantity === 0 ? 'Fully Accepted' : request.status}
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
        />
      )}
    </div>
  );
};

export default RequestList;
