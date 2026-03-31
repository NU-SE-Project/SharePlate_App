import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';  // ✅ useParams, not useLocation
import { useAuth } from '../../../../context/AuthContext';
import { ChevronLeft, Loader2, AlertCircle, CheckCircle, XCircle, Heart, PackageOpen } from 'lucide-react';
import { getSingleDonation, getRequestsForDonation, approveDonationRequest, rejectDonationRequest } from '../services/restaurantService';
import toast from 'react-hot-toast';
import Modal from '../../../../components/common/Modal';

// ── RequestRow ─────────────────────────────────────────────────────────────
const RequestRow = ({ request, onUpdateStatus }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [actionType, setActionType] = useState(null);

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

  const isPending  = request.status === 'pending';
  const isApproved = request.status === 'approved';
  const isRejected = request.status === 'rejected';

  return (
    <div className={`flex items-center justify-between p-4 rounded-2xl mb-3 border transition-colors ${
      isApproved ? 'bg-emerald-50 border-emerald-200' :
      isRejected  ? 'bg-red-50 border-red-100' :
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
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
            isApproved ? 'bg-emerald-100 text-emerald-700' :
            isRejected  ? 'bg-red-100 text-red-700' :
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

          <div className={`p-4 rounded-xl border flex items-start gap-3 ${
            actionType === 'approved'
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
              className={`px-6 py-3 rounded-xl font-bold text-white shadow-lg transition-transform hover:-translate-y-1 ${
                actionType === 'approved'
                  ? 'bg-emerald-600 shadow-emerald-200 hover:bg-emerald-700'
                  : 'bg-red-600 shadow-red-200 hover:bg-red-700'
              }`}
            >
              Yes, {actionType === 'approved' ? 'Accept' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>
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
  const imageUrl  = donation.imageUrl
    ? (donation.imageUrl.startsWith('/') ? imageBase + donation.imageUrl : donation.imageUrl)
    : null;

  const pendingCount  = requests.filter(r => r.status === 'pending').length;
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
              <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md mt-1 ${
                donation.foodType === 'veg'
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
              <span className={`inline-flex text-xs font-black uppercase px-2 py-1 rounded ${
                donation.status === 'available'
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
          { label: 'Total',    value: requests.length, color: 'text-slate-700',   bg: 'bg-slate-50  border-slate-100'   },
          { label: 'Pending',  value: pendingCount,    color: 'text-amber-600',   bg: 'bg-amber-50  border-amber-100'   },
          { label: 'Approved', value: approvedCount,   color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
          { label: 'Rejected', value: rejectedCount,   color: 'text-red-500',     bg: 'bg-red-50    border-red-100'     },
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