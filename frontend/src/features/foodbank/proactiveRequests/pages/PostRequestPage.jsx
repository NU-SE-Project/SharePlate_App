import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Send, Info, AlertCircle, Heart, CheckCircle2 } from 'lucide-react';
import Button from '../../../../components/common/Button';
import Input from '../../../../components/common/Input';
import toast from 'react-hot-toast';
import { createProactiveRequest } from '../../services/foodbankService';
import { useAuth } from '../../../../context/AuthContext';

const PostRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const foodBankId = user?.id || user?._id || null;
  const [formData, setFormData] = useState({
    foodName: '',
    foodType: 'veg',
    requestedQuantity: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodName || !formData.requestedQuantity) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (!foodBankId) {
      toast.error('Unable to identify your account. Please sign in again.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await createProactiveRequest({
        ...formData,
        foodbank_id: foodBankId,
        requestedQuantity: Number(formData.requestedQuantity),
      });
      const restaurantCount = response?.notificationSummary?.restaurantCount ?? 0;
      if (restaurantCount > 0) {
        toast.success(`Your request has been broadcasted to ${restaurantCount} nearby restaurant${restaurantCount === 1 ? '' : 's'}!`);
      } else {
        toast.success('Your request was saved. No nearby restaurants were found to notify.');
      }
      navigate('/foodbank/my-proactive-requests');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to post request');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-5 duration-700">
      {/* Header */}
      <div className="flex items-center gap-6 mb-12">
        <Link 
          to="/foodbank/donated-food" 
          className="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 shadow-sm"
        >
          <ChevronLeft size={24} />
        </Link>
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Broadcast a Need</h1>
          <p className="text-slate-500 font-medium mt-1">Let restaurants know exactly what your community requires.</p>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/5 overflow-hidden border border-emerald-50 relative">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50" />
        
        <form onSubmit={handleSubmit} className="p-10 md:p-14 relative z-10 space-y-10">
          
          {/* Section 1: Basic Info */}
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
               <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600">
                  <ShoppingBag size={20} />
               </div>
               <h3 className="text-xl font-bold text-slate-800">Meal Details</h3>
            </div>
            
            <Input 
              label="What food do you need?"
              placeholder="e.g. 50 Packs of Veg Rice, Fresh Bread, etc."
              value={formData.foodName}
              onChange={(e) => setFormData({ ...formData, foodName: e.target.value })}
              icon={<Info size={18} />}
              required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="space-y-2">
                  <label className="block text-sm font-bold text-slate-700 ml-1">Food Type</label>
                  <div className="flex p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                     {['veg', 'non-veg'].map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setFormData({ ...formData, foodType: type })}
                          className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all capitalize ${formData.foodType === type ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                           {type}
                        </button>
                     ))}
                  </div>
               </div>
               
               <Input 
                 label="Total Servings Required"
                 type="number"
                 placeholder="e.g. 50"
                 value={formData.requestedQuantity}
                 onChange={(e) => setFormData({ ...formData, requestedQuantity: e.target.value })}
                 min="1"
                 required
               />
            </div>
          </div>

          {/* Section 2: Informational Banner */}
          <div className="p-6 rounded-3xl bg-emerald-900 text-white flex items-start gap-4 shadow-xl shadow-emerald-900/10">
             <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shrink-0">
                <Heart size={24} className="fill-emerald-400 text-emerald-400" />
             </div>
             <div>
                <h4 className="font-bold text-lg mb-1">Impact Reach</h4>
                <p className="text-emerald-100/80 text-sm leading-relaxed">
                   Once you post, restaurants within a 10km radius will be notified. They can partially or fully fulfill your request.
                </p>
             </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
             <Button 
               variant="outline" 
               className="flex-1 py-4 text-base font-bold rounded-2xl border-slate-200"
               onClick={() => navigate(-1)}
               type="button"
             >
                Cancel
             </Button>
             <Button 
               className="flex-2 py-4 text-base font-black rounded-2xl shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 group"
               disabled={isLoading}
               type="submit"
             >
                {isLoading ? (
                  'Broadcasting...'
                ) : (
                  <>
                    <span>Post Request Now</span>
                    <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
             </Button>
          </div>
        </form>
      </div>

      {/* Safety info footer */}
      <div className="mt-12 flex items-center gap-3 justify-center text-slate-400">
         <CheckCircle2 size={16} className="text-emerald-500" />
         <span className="text-sm font-medium italic">Verified Food Bank: SharePlate Community Trust</span>
      </div>
    </div>
  );
};

export default PostRequestPage;
