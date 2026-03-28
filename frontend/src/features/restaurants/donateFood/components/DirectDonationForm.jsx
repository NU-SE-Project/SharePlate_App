import React, { useState } from 'react';
import { ShoppingBag, Calendar, Hash, Type, Loader2, Image as ImageIcon, AlignLeft, Clock } from 'lucide-react';
import Input from "../../../../components/common/Input";
import Button from "../../../../components/common/Button";
import Select from "../../../../components/common/Select";
import { createDonation, updateDonation } from "../services/restaurantService";
import toast from 'react-hot-toast';

const DirectDonationForm = ({ initialData, onSuccess }) => {
  // Aligning with backend schema: foodName, foodType, totalQuantity, expiryTime, etc.
  const [formData, setFormData] = useState(initialData ? {
    foodName: initialData.foodName || '',
    foodType: initialData.foodType || 'veg',
    totalQuantity: initialData.totalQuantity || '',
    expiryTime: initialData.expiryTime ? new Date(initialData.expiryTime).toISOString().slice(0, 16) : '',
    description: initialData.description || '',
    imageUrl: initialData.imageUrl || '',
    pickupWindowStart: initialData.pickupWindowStart ? new Date(initialData.pickupWindowStart).toISOString().slice(0, 16) : '',
    pickupWindowEnd: initialData.pickupWindowEnd ? new Date(initialData.pickupWindowEnd).toISOString().slice(0, 16) : '',
  } : {
    foodName: '',
    foodType: 'veg',
    totalQuantity: '',
    expiryTime: '',
    description: '',
    imageUrl: '',
    pickupWindowStart: new Date().toISOString().slice(0, 16),
    pickupWindowEnd: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const foodTypes = [
    { value: 'veg', label: 'Vegetarian' },
    { value: 'non-veg', label: 'Non-Vegetarian' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const [imageFile, setImageFile] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setImageFile(file || null);
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.foodName) newErrors.foodName = 'Item name is required';
    if (!formData.totalQuantity || formData.totalQuantity <= 0) newErrors.totalQuantity = 'Valid quantity is required';
    if (!formData.expiryTime) newErrors.expiryTime = 'Expiry time is required';
    if (!formData.pickupWindowStart) newErrors.pickupWindowStart = 'Pickup start is required';
    if (!formData.pickupWindowEnd) newErrors.pickupWindowEnd = 'Pickup end is required';
    
    // Logical validation
    if (new Date(formData.pickupWindowStart) >= new Date(formData.pickupWindowEnd)) {
      newErrors.pickupWindowEnd = 'End time must be after start time';
    }
    if (new Date(formData.pickupWindowEnd) >= new Date(formData.expiryTime)) {
      newErrors.expiryTime = 'Expiry must be after pickup end';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Prefer restaurant id from AuthContext
    let restaurantId = localStorage.getItem('restaurantId');
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        const userId = parsed?.id || parsed?._id;
        if (userId && parsed.role === 'restaurant') restaurantId = userId;
      }
    } catch (e) {}
    if (!restaurantId || restaurantId === '000000000000000000000000') {
      toast.error('Session expired. Please log in again.');
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('restaurant_id', restaurantId);
      fd.append('foodName', formData.foodName);
      fd.append('description', formData.description || '');
      fd.append('foodType', formData.foodType);
      fd.append('totalQuantity', Number(formData.totalQuantity));
      fd.append('expiryTime', new Date(formData.expiryTime).toISOString());
      fd.append('pickupWindowStart', new Date(formData.pickupWindowStart).toISOString());
      fd.append('pickupWindowEnd', new Date(formData.pickupWindowEnd).toISOString());
      if (imageFile) fd.append('image', imageFile);

      if (initialData?._id) {
        await updateDonation(initialData._id, fd);
        toast.success('Donation updated successfully!');
      } else {
        await createDonation(fd);
        toast.success('Food donated successfully! Thank you for your kindness.');
      }
      if (onSuccess) onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process donation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Food Item Name"
          name="foodName"
          placeholder="e.g. Mixed Vegetable Curry"
          value={formData.foodName}
          onChange={handleChange}
          error={errors.foodName}
          icon={<ShoppingBag size={18} />}
        />
        
        <Select
          label="Food Type"
          name="foodType"
          options={foodTypes}
          value={formData.foodType}
          onChange={handleChange}
          error={errors.foodType}
        />

        <Input
          label="Total Quantity (Servings)"
          name="totalQuantity"
          type="number"
          placeholder="Number of servings/units"
          value={formData.totalQuantity}
          onChange={handleChange}
          error={errors.totalQuantity}
          icon={<Hash size={18} />}
        />

        <Input
          label="Expiry Date & Time"
          name="expiryTime"
          type="datetime-local"
          value={formData.expiryTime}
          onChange={handleChange}
          error={errors.expiryTime}
          icon={<Calendar size={18} />}
        />

        <div className="md:col-span-2">
          <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Food Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full py-2 px-3 bg-white border border-slate-200 rounded-2xl outline-none"
          />
          {formData.imageUrl && !imageFile && (
            <p className="text-xs text-slate-400 mt-2">Current: {formData.imageUrl}</p>
          )}
        </div>

        <div className="md:col-span-2">
           <label className="block text-sm font-bold text-slate-700 mb-2 ml-1">Description</label>
           <div className="relative group">
              <div className="absolute top-3 left-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors">
                <AlignLeft size={18} />
              </div>
              <textarea
                name="description"
                rows="3"
                className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all outline-none text-slate-700 placeholder:text-slate-400"
                placeholder="Give details about the food (ingredients, spice level, packaging...)"
                value={formData.description}
                onChange={handleChange}
              ></textarea>
           </div>
        </div>

        <Input
          label="Pickup Starts At"
          name="pickupWindowStart"
          type="datetime-local"
          value={formData.pickupWindowStart}
          onChange={handleChange}
          error={errors.pickupWindowStart}
          icon={<Clock size={18} />}
        />

        <Input
          label="Pickup Ends At"
          name="pickupWindowEnd"
          type="datetime-local"
          value={formData.pickupWindowEnd}
          onChange={handleChange}
          error={errors.pickupWindowEnd}
          icon={<Clock size={18} />}
        />
      </div>

      <Button
        type="submit"
        className="w-full py-4 text-lg font-bold mt-4"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Processing...
          </>
        ) : (
          initialData ? 'Update Donation' : 'Submit Donation'
        )}
      </Button>
    </form>
  );
};

export default DirectDonationForm;
