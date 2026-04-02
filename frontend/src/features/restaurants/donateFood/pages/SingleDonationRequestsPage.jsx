import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';  // ✅ useParams, not useLocation
import { useAuth } from '../../../../context/AuthContext';
import { ChevronLeft, Loader2, AlertCircle, CheckCircle, XCircle, Heart, PackageOpen } from 'lucide-react';
import { getSingleDonation, getRequestsForDonation, approveDonationRequest, rejectDonationRequest, verifyPickupOTP, resendPickupOTP } from '../services/restaurantService';
import toast from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';
import { Smartphone } from 'lucide-react';
import Button from '../../../../components/common/Button';

// ── RequestRow ─────────────────────────────────────────────────────────────
const RequestRow = ({ request, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);

  // OTP Verification state
  const [isVerifyingModalOpen, setIsVerifyingModalOpen] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const handleStatusUpdate = async (status) => {
    setIsUpdating(true);
    try {
      if (status === 'approved') {
        await approveDonationRequest(request._id, request.requestedQuantity);
        toast.success('Request accepted successfully');
      } else if (status === 'rejected') {
        await rejectDonationRequest(request._id);
        toast.success('Request rejected successfully');
      }
      onUpdateStatus(request._id, status);
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${status} request`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleResendOTP = async () => {
    if (!request.pickup_id) return;
    setIsResending(true);
    try {
      await resendPickupOTP(request.pickup_id._id || request.pickup_id);
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
      await verifyPickupOTP(request.pickup_id._id || request.pickup_id, otpValue);
      toast.success("Delivery verified successfully!");
      setIsVerifyingModalOpen(false);
      setOtpValue("");
      onUpdateStatus(request._id, 'collected');
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid OTP. Please try again.";
      toast.error(msg);
    } finally {
      setIsVerifying(false);
    }
  };

  const isPending = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const isRejected = request.status === 'rejected';
  const isDelivered = request.status === 'collected';

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl mb-3 border transition-colors ${isApproved ? 'bg-emerald-50 border-emerald-200' :
      isRejected ? 'bg-red-50 border-red-100' :
        isDelivered ? 'bg-blue-50 border-blue-200' :
          'bg-slate-50 hover:bg-white border-slate-100'
      }`}>
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
        <div>
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Food Bank</span>
          <span className="font-semibold text-slate-800">
            {request.foodBank_id?.name || 'Unknown Food Bank'}
          </span>
        </div>
        <div>
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Requested Qty</span>
          <span className="font-bold text-slate-700">{request.requestedQuantity}</span>
        </div>
        <div>
          <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Status</span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isApproved ? 'bg-emerald-100 text-emerald-700' :
            isRejected ? 'bg-red-100 text-red-700' :
              isDelivered ? 'bg-blue-100 text-blue-700' :
                'bg-amber-100 text-amber-700'
            }`}>
            {request.status}
          </span>
        </div>
      </div>

      {isPending && (
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => { setActionType('approved'); setIsConfirmModalOpen(true); }}
            disabled={isUpdating}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
            Accept
          </button>
          <button
            onClick={() => { setActionType('rejected'); setIsConfirmModalOpen(true); }}
            disabled={isUpdating}
            className="px-4 py-2 bg-white border border-slate-200 text-red-600 hover:bg-red-50 font-medium rounded-xl flex items-center gap-2 transition-all disabled:opacity-50"
          >
            {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16} />}
            Reject
          </button>
        </div>
      )}

      {isApproved && (
        <div className="flex gap-2 ml-4">
          <button
            onClick={() => setIsVerifyingModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-100"
          >
            Mark as Delivered
            <CheckCircle size={16} />
          </button>
        </div>
      )}

      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title={`Confirm ${actionType === 'approved' ? 'Acceptance' : 'Rejection'}`}
      >
        <div className="flex flex-col gap-6">
          <p className="text-slate-600 text-lg">
            Are you sure you want to {actionType === 'approved' ? 'accept' : 'reject'} the request from
            <span className="font-bold text-slate-900 ml-1">
              {request.foodBank_id?.name || 'Unknown Food Bank'}
            </span>
            {' '}for {request.requestedQuantity} portions?
          </p>

          <div className={`p-4 rounded-xl border flex items-start gap-3 ${actionType === 'approved'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
            : 'bg-red-50 text-red-700 border-red-100'
            }`}>
            <AlertCircle className="mt-0.5 shrink-0" size={20} />
            <p className="text-sm font-medium">
              {actionType === 'approved'
                ? 'By accepting, you commit to providing this food. The requester will be notified.'
                : 'This action cannot be undone. The requester will be notified of the rejection.'}
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <button
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={isUpdating}
              className="px-6 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { setIsConfirmModalOpen(false); handleStatusUpdate(actionType); }}
              disabled={isUpdating}
              className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1 ${actionType === 'approved'
                ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
                : 'bg-red-600 shadow-red-200 hover:bg-red-700'
                }`}
            >
              Yes, {actionType === 'approved' ? 'Accept' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>

      {/* OTP Verification Modal */}
      {isVerifyingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center gap-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-100">
                <Smartphone size={40} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight">Verify Pickup</h3>
                <p className="text-slate-500 font-medium mt-2">Enter the 6-digit OTP provided by <span className="font-bold text-slate-700">{request.foodBank_id?.name}</span></p>
              </div>

              <div className="w-full space-y-4">
                <div className="flex flex-col gap-2">
                  <input
                    type="text"
                    maxLength="6"
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit OTP"
                    className="w-full text-center text-4xl font-black tracking-[1rem] py-5 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:ring-0 transition-all outline-none placeholder:text-slate-100 placeholder:tracking-normal placeholder:text-lg"
                  />
                  {request.status === 'approved' && (
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
                    onClick={() => { setIsVerifyingModalOpen(false); setOtpValue(""); }}
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

// ── Page ───────────────────────────────────────────────────────────────────
const SingleDonationRequestsPage = () => {
  const { donationId } = useParams();  // ✅ donationId comes from URL /donation-requests/:donationId
  const { user } = useAuth();

  const [donation, setDonation] = useState(null);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch donation and requests independently
      const [donationRes, requestsRes] = await Promise.allSettled([
        getSingleDonation(donationId),
        getRequestsForDonation(donationId),
      ]);

      // Handle donation result
      if (donationRes.status === 'fulfilled') {
        setDonation(donationRes.value);
      } else {
        console.error('Donation fetch failed:', donationRes.reason);
        // Don't block — still try to show requests
      }

      // Handle requests result
      if (requestsRes.status === 'fulfilled') {
        const reqs = Array.isArray(requestsRes.value)
          ? requestsRes.value
          : (requestsRes.value?.requests || []);
        setRequests(reqs);
      } else {
        console.error('Requests fetch failed:', requestsRes.reason);
        toast.error('Failed to load requests');
      }

    } catch (error) {
      toast.error('Failed to load data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (donationId) fetchData();
  }, [donationId]);  // ✅ depends on donationId, not restaurantId

  const handleUpdateRequestStatus = (requestId, newStatus) => {
    setRequests(prev =>
      prev.map(r => r._id === requestId ? { ...r, status: newStatus } : r)
    );
    if (newStatus === 'approved') fetchData();
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  // ── Not found ────────────────────────────────────────────────────────────
  if (!donation) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <AlertCircle className="text-slate-300" size={48} />
      <p className="text-slate-500 text-lg font-medium">Donation not found.</p>
      <Link to="/restaurant/donate" className="text-emerald-600 font-bold hover:underline">
        ← Back to Donations
      </Link>
    </div>
  );

  const imageBase = import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';
  const imageUrl = donation.imageUrl
    ? (donation.imageUrl.startsWith('/') ? imageBase + donation.imageUrl : donation.imageUrl)
    : null;

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const approvedCount = requests.filter(r => r.status === 'approved').length;
  const rejectedCount = requests.filter(r => r.status === 'rejected').length;

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 animate-in fade-in slide-in-from-bottom-5 duration-700 pb-20">

      {/* Header */}
      <div className="flex items-center gap-5 mb-10">
        <Link
          to="/restaurant/donate"
          className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Donation Requests</h1>
          <p className="text-slate-500 font-medium mt-1 flex items-center gap-2">
            Manage requests for this donation
            <Heart size={16} className="text-emerald-500 fill-emerald-500" />
          </p>
        </div>
      </div>

      {/* Donation Summary Card */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 mb-8">
        <div className="flex items-center gap-5">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={donation.foodName}
              className="w-20 h-20 rounded-2xl object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center flex-shrink-0">
              <PackageOpen className="text-slate-400" size={28} />
            </div>
          )}

          <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="sm:col-span-2">
              <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Food Item</span>
              <h2 className="text-lg font-bold text-slate-800 line-clamp-1">{donation.foodName}</h2>
              <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 ${donation.foodType === 'veg'
                ? 'bg-emerald-50 text-emerald-600'
                : 'bg-orange-50 text-orange-600'
                }`}>
                {donation.foodType}
              </span>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Remaining</span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-emerald-600">{donation.remainingQuantity}</span>
                <span className="text-sm font-bold text-slate-400">/ {donation.totalQuantity}</span>
              </div>
            </div>
            <div>
              <span className="text-xs uppercase font-bold text-slate-400 block mb-1">Status</span>
              <span className={`inline-flex text-xs font-black uppercase px-2 py-1 rounded ${donation.status === 'available'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-slate-100 text-slate-500'
                }`}>
                {donation.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: requests.length, color: 'text-slate-700', bg: 'bg-slate-50  border-slate-100' },
          { label: 'Pending', value: pendingCount, color: 'text-amber-600', bg: 'bg-amber-50  border-amber-100' },
          { label: 'Approved', value: approvedCount, color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Rejected', value: rejectedCount, color: 'text-red-500', bg: 'bg-red-50    border-red-100' },
        ].map(({ label, value, color, bg }) => (
          <div key={label} className={`rounded-2xl border p-4 text-center ${bg}`}>
            <span className="text-xs uppercase font-bold text-slate-400 block mb-1">{label}</span>
            <span className={`text-3xl font-black ${color}`}>{value}</span>
          </div>
        ))}
      </div>

      {/* Requests List */}
      <h2 className="font-bold text-slate-700 mb-4">All Requests</h2>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <AlertCircle className="mx-auto text-slate-300 mb-3" size={36} />
          <p className="text-slate-500 font-medium">No food banks have requested this item yet.</p>
        </div>
      ) : (
        requests.map(request => (
          <RequestRow
            key={request._id}
            request={request}
            onUpdateStatus={handleUpdateRequestStatus}
          />
        ))
      )}
    </div>
  );
};

export default SingleDonationRequestsPage;