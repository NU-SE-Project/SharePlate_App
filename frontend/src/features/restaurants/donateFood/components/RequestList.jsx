import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingBag, Loader2, MapPin, Calendar, CheckSquare, ChevronRight, CheckCircle, Smartphone, Filter } from 'lucide-react';
import Button from "../../../../components/common/Button";
import { getAllOpenRequests, verifyPickupOTP, resendPickupOTP } from "../services/restaurantService";
import toast from 'react-hot-toast';
import AcceptRequestModal from './AcceptRequestModal';
import { useSocket } from '../../../../context/SocketContext';
import { useAuth } from '../../../../context/AuthContext';
import { calculateDistance } from '../../../../utils/distance';

const RequestList = () => {
  const { user } = useAuth();
  const currentRestaurantId = user?.id || user?._id || null;
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [distanceFilter, setDistanceFilter] = useState('all');

  // OTP Verification state
  const [verifyingAcceptance, setVerifyingAcceptance] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

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

  const handleResendOTP = async () => {
    setIsResending(true);
    try {
      await resendPickupOTP(verifyingAcceptance.pickup_id._id || verifyingAcceptance.pickup_id);
      toast.success("New OTP generated! Please contact the food bank.");
      setOtpValue("");
    } catch (error) {
      toast.error("Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpValue || otpValue.length < 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    setIsVerifying(true);
    try {
      await verifyPickupOTP(verifyingAcceptance.pickup_id._id || verifyingAcceptance.pickup_id, otpValue);
      toast.success("Delivery verified successfully!");
      setVerifyingAcceptance(null);
      setOtpValue("");
      fetchRequests();
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const processedRequests = useMemo(() => {
    console.log('User Coordinates:', user?.location?.coordinates);
    return requests.map(req => {
      const distance = calculateDistance(
        user?.location?.coordinates,
        req.foodbank_id?.location?.coordinates
      );
      if (req.foodbank_id?.location?.coordinates) {
        console.log(`Distance to ${req.foodbank_id.name}:`, distance);
      }
      return { ...req, distance };
    });
  }, [requests, user]);

  const filteredRequests = useMemo(() => {
    let result = [...processedRequests];

    // Filter by distance
    if (distanceFilter !== 'all') {
      const maxDist = parseFloat(distanceFilter);
      result = result.filter(req => req.distance !== null && req.distance <= maxDist);
    }

    // Sort by distance (closest first), then by date
    result.sort((a, b) => {
      if (a.distance !== null && b.distance !== null) {
        return a.distance - b.distance;
      }
      if (a.distance !== null) return -1;
      if (b.distance !== null) return 1;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });

    return result;
  }, [requests, distanceFilter]);

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
      {/* Distance Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center justify-between flex-wrap gap-4 mb-2">
        <div className="flex items-center gap-2 text-slate-600">
          <Filter size={18} className="text-emerald-500" />
          <span className="font-bold text-sm">Filter by Distance:</span>
        </div>
        <div className="flex bg-slate-50 p-1 rounded-xl">
          {[
            { label: 'All', value: 'all' },
            { label: '2 km', value: '2' },
            { label: '5 km', value: '5' },
            { label: '10 km', value: '10' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setDistanceFilter(opt.value)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${
                distanceFilter === opt.value
                  ? 'bg-white text-emerald-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-2">No requests found</h3>
          <p className="text-slate-500 max-w-sm mx-auto">
            {distanceFilter === 'all' 
              ? "There are currently no food requests from food banks." 
              : `There are no requests within ${distanceFilter} km of your location.`}
          </p>
          {distanceFilter !== 'all' && (
            <button 
              onClick={() => setDistanceFilter('all')}
              className="mt-4 text-emerald-600 font-bold hover:underline"
            >
              Show all requests
            </button>
          )}
        </div>
      ) : (
        filteredRequests.map((request) => {
        const myAcceptance = request.acceptances?.find(
          (a) => (a.restaurant_id?._id || a.restaurant_id) === currentRestaurantId,
        );

        return (
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
                  {myAcceptance && (
                    <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-full ${myAcceptance.status === 'delivered' ? 'bg-emerald-500 text-white' : 'bg-blue-500 text-white'}`}>
                      {myAcceptance.status === 'delivered' ? 'Your Donation Delivered' : 'You Accepted This'}
                    </span>
                  )}
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 mb-2">{request.foodName}</h3>

                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <MapPin size={18} className="text-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-900">{request.foodbank_id?.name || (typeof request.foodbank_id === 'string' ? `Food Bank ${request.foodbank_id.slice(-4)}` : 'Local Food Bank')}</span>
                  <span className="text-slate-400 font-normal">| {request.foodbank_id?.address}</span>
                  {request.distance !== null && (
                    <span className={`ml-2 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                      request.distance <= 2 ? 'bg-emerald-100 text-emerald-700' : 
                      request.distance <= 5 ? 'bg-blue-100 text-blue-700' : 
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {request.distance} km away
                    </span>
                  )}
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
                        <li key={a._id} className="text-sm text-slate-700 flex items-center justify-between">
                          <span>
                            <span className="font-semibold">{a.restaurant_id?.name || 'Restaurant'}</span>: {a.acceptedQuantity} servings
                          </span>
                          {a.status === 'delivered' && <CheckCircle size={14} className="text-emerald-500" />}
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

                {myAcceptance && myAcceptance.status === 'pending' ? (
                  <Button
                    onClick={() => setVerifyingAcceptance(myAcceptance)}
                    className="w-full py-4 shadow-blue-100 bg-blue-600 hover:bg-blue-700"
                  >
                    Mark as Delivered <CheckCircle className="ml-2" size={18} />
                  </Button>
                ) : request.status === 'open' && request.remainingQuantity > 0 ? (
                  <Button
                    onClick={() => setSelectedRequest(request)}
                    className="w-full py-4 shadow-emerald-100"
                  >
                    Accept & Donate <ChevronRight className="ml-2" size={18} />
                  </Button>
                ) : (
                  <div className="w-full py-3 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 font-semibold">
                    {request.status === 'fulfilled' || request.status === 'delivered' || request.remainingQuantity === 0 ? 'Delivered' : request.status}
                  </div>
                )}
                <p className="text-xs text-center text-slate-400 italic">
                  Support your community food bank
                </p>
              </div>
            </div>
          </div>
        );
      })
    )}

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

      {/* OTP Verification Modal */}
      {verifyingAcceptance && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Smartphone size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verify Delivery</h3>
                <p className="text-slate-500 font-medium mt-2">Enter the 6-digit OTP provided by the food bank to complete this donation.</p>
              </div>

              <div className="w-full space-y-4">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    maxLength="6"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center text-3xl font-black tracking-[0.5rem] py-5 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 transition-all outline-none placeholder:text-slate-200 placeholder:tracking-normal placeholder:text-lg"
                  />
                  {verifyingAcceptance.status === 'pending' && (
                    <button
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 flex items-center justify-center gap-1 transition-colors py-2"
                    >
                      {isResending ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <CheckCircle size={12} />
                      )}
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => { setVerifyingAcceptance(null); setOtpValue(""); }}
                    className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleVerifyOTP}
                    isLoading={isVerifying}
                    className="flex-[2] py-4 rounded-2xl shadow-xl shadow-blue-100 bg-blue-600 hover:bg-blue-700"
                  >
                    Verify & Complete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default RequestList;
