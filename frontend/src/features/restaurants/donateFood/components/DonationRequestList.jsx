import React, { useState, useEffect } from 'react';
import { MapPin, Loader2, ChevronRight, CheckCircle, Smartphone } from 'lucide-react';
import { useAuth } from '../../../../context/AuthContext';
import Button from "../../../../components/common/Button";
import { getDonationRequests, approveDonationRequest, verifyPickupOTP, resendPickupOTP } from "../services/restaurantService";
import toast from 'react-hot-toast';
import AcceptRequestModal from './AcceptRequestModal';
import { useSocket } from '../../../../context/SocketContext';

const DonationRequestList = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const { user } = useAuth();

  // OTP Verification state
  const [verifyingRequest, setVerifyingRequest] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

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

  const handleResendOTP = async () => {
    if (!verifyingRequest?.pickup_id) return;
    setIsResending(true);
    try {
      await resendPickupOTP(verifyingRequest.pickup_id._id || verifyingRequest.pickup_id);
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
      await verifyPickupOTP(verifyingRequest.pickup_id._id || verifyingRequest.pickup_id, otpValue);
      toast.success("Delivery verified successfully!");
      setVerifyingRequest(null);
      setOtpValue("");
      fetchRequests();
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

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

              <div className="flex items-center gap-6 text-sm mb-6">
                <div className="flex flex-col">
                  <span className="text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Requested</span>
                  <span className="text-lg font-black text-slate-900">{request.requestedQuantity} servings</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-slate-400 mb-1 font-bold uppercase text-[10px] tracking-widest">Still Needed</span>
                  <span className="text-lg font-black text-emerald-600">{request.remainingQuantity ?? request.requestedQuantity} servings</span>
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
              ) : request.status === 'approved' ? (
                <Button
                  onClick={() => setVerifyingRequest(request)}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100"
                >
                  Mark as Delivered <CheckCircle className="ml-2" size={18} />
                </Button>
              ) : (
                <div className="w-full py-4 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 font-semibold">
                  {request.status === 'collected' || request.status === 'delivered' || request.status === 'fulfilled' ? 'Delivered' : request.status}
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

      {/* OTP Verification Modal */}
      {verifyingRequest && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Smartphone size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verify Pickup</h3>
                <p className="text-slate-500 font-medium mt-2">Enter the 6-digit OTP provided by <span className="font-bold text-slate-700">{verifyingRequest.foodBank_id?.name || verifyingRequest.foodbankName}</span></p>
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
                  {verifyingRequest.status === 'approved' && (
                    <button
                      onClick={handleResendOTP}
                      disabled={isResending}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 disabled:text-slate-400 flex items-center justify-center gap-1 transition-colors py-2"
                    >
                      {isResending ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle size={12} />}
                      Resend OTP
                    </button>
                  )}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => { setVerifyingRequest(null); setOtpValue(""); }}
                    className="flex-1 py-4 font-bold text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <Button
                    onClick={handleVerifyOTP}
                    isLoading={isVerifying}
                    className="flex-[2] py-4 rounded-2xl shadow-xl shadow-blue-100 bg-blue-600 hover:bg-blue-700"
                  >
                    Complete Delivery
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

export default DonationRequestList;
