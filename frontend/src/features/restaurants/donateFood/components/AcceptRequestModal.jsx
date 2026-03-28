import React, { useState } from 'react';
import { X, Heart, Loader2, AlertCircle, ShoppingBag } from 'lucide-react';
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import { acceptFoodRequest } from "../services/restaurantService";
import toast from 'react-hot-toast';

const AcceptRequestModal = ({ request, onClose, onSuccess, onAccept, showQuantity = true }) => {
  const [quantity, setQuantity] = useState(showQuantity ? request.remainingQuantity : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (showQuantity) {
      if (quantity <= 0) {
        setError('Please enter a valid quantity');
        return;
      }
      if (quantity > request.remainingQuantity) {
        setError(`Maximum you can provide is ${request.remainingQuantity} servings`);
        return;
      }
    }

    setIsLoading(true);
    try {
      if (onAccept && typeof onAccept === 'function') {
        // if showQuantity is false, call without quantity
        await onAccept(request._id, showQuantity ? Number(quantity) : undefined);
      } else {
        await acceptFoodRequest(request._id, showQuantity ? Number(quantity) : undefined);
      }
      toast.success('Thank you! Your donation placeholder has been accepted.');
      onSuccess();
    } catch (err) {
      toast.error('Failed to accept request');
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in slide-in-from-bottom-8 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                <Heart size={24} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900 leading-tight">Accept & Donate</h3>
                <p className="text-slate-500 font-medium">{request.foodName}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
            >
              <X size={24} />
            </button>
          </div>

          {showQuantity ? (
            <div className="bg-emerald-50/50 p-4 rounded-2xl mb-8 border border-emerald-100 flex items-start gap-3">
               <AlertCircle className="text-emerald-600 mt-0.5 shrink-0" size={20} />
               <div className="text-sm text-emerald-800 leading-relaxed">
                 By accepting, you commit to providing food for <span className="font-bold">{request.foodbank_id?.name}</span>. 
                 You can choose a partial quantity if you cannot fulfill the full request.
               </div>
            </div>
          ) : (
            <div className="bg-emerald-50/50 p-4 rounded-2xl mb-8 border border-emerald-100 flex items-start gap-3">
               <AlertCircle className="text-emerald-600 mt-0.5 shrink-0" size={20} />
               <div className="text-sm text-emerald-800 leading-relaxed">
                 By accepting, you commit to providing food for <span className="font-bold">{request.foodbank_id?.name}</span>.
               </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {showQuantity && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-bold text-slate-700 ml-1">Quantity to provide</label>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-full uppercase tracking-widest">Needed: {request.remainingQuantity}</span>
                </div>
                <Input
                  name="quantity"
                  type="number"
                  placeholder="Servings you can provide"
                  value={quantity}
                  onChange={(e) => {
                    setQuantity(e.target.value);
                     if (error) setError('');
                  }}
                  error={error}
                  className="text-lg font-bold text-slate-900 py-4"
                />
                <p className="text-xs text-slate-400 mt-2 px-1">
                  Note: You can accept a portion (e.g., 30 of {request.remainingQuantity} requested).
                </p>
              </div>
            )}

            <div className="flex gap-4 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose} 
                className="flex-1 py-4 text-lg"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-[2] py-4 shadow-lg shadow-emerald-200 text-lg font-bold" 
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Accept Request'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AcceptRequestModal;
