import React, { useCallback, useMemo, useState, useEffect } from "react";
import {
  ShoppingBag,
  Calendar,
  Hash,
  Loader2,
  AlignLeft,
  Clock,
  Image as ImageIcon,
  UtensilsCrossed,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sparkles,
  Info,
  Type,
} from "lucide-react";
import Input from "../../../../components/common/Input";
import Button from "../../../../components/common/Button";
import Select from "../../../../components/common/Select";
import { createDonation, updateDonation } from "../services/restaurantService";
import toast from "react-hot-toast";
import { useAuth } from "../../../../context/AuthContext";

const DirectDonationForm = ({
  initialData,
  onSuccess,
  restaurantId: restaurantIdProp,
}) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [previewUrl, setPreviewUrl] = useState(initialData?.imageUrl || null);

  const initialFormState = useMemo(() => {
    if (initialData) {
      return {
        foodName: initialData.foodName || "",
        foodType: initialData.foodType || "veg",
        totalQuantity: initialData.totalQuantity || "",
        expiryTime: initialData.expiryTime
          ? new Date(initialData.expiryTime).toISOString().slice(0, 16)
          : "",
        description: initialData.description || "",
        imageUrl: initialData.imageUrl || "",
        pickupWindowStart: initialData.pickupWindowStart
          ? new Date(initialData.pickupWindowStart).toISOString().slice(0, 16)
          : "",
        pickupWindowEnd: initialData.pickupWindowEnd
          ? new Date(initialData.pickupWindowEnd).toISOString().slice(0, 16)
          : "",
      };
    }

    return {
      foodName: "",
      foodType: "veg",
      totalQuantity: "",
      expiryTime: "",
      description: "",
      imageUrl: "",
      pickupWindowStart: new Date().toISOString().slice(0, 16),
      pickupWindowEnd: "",
    };
  }, [initialData]);

  const [formData, setFormData] = useState(initialFormState);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageFile, setImageFile] = useState(null);

  const foodTypes = useMemo(
    () => [
      { value: "veg", label: "Vegetarian" },
      { value: "non-veg", label: "Non-Vegetarian" },
    ],
    [],
  );

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      if (!prev[name]) return prev;
      return { ...prev, [name]: null };
    });
  }, []);

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl && !initialData?.imageUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl, initialData]);

  const validateStep = (step) => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.foodName.trim()) newErrors.foodName = "Item name is required";
      if (!formData.totalQuantity || Number(formData.totalQuantity) <= 0) {
        newErrors.totalQuantity = "Valid quantity is required";
      }
    } else if (step === 2) {
      if (!formData.expiryTime) newErrors.expiryTime = "Expiry time is required";
      if (!formData.pickupWindowStart) newErrors.pickupWindowStart = "Pickup start is required";
      if (!formData.pickupWindowEnd) newErrors.pickupWindowEnd = "Pickup end is required";

      if (formData.pickupWindowStart && formData.pickupWindowEnd && new Date(formData.pickupWindowStart) >= new Date(formData.pickupWindowEnd)) {
        newErrors.pickupWindowEnd = "End time must be after start time";
      }
      if (formData.pickupWindowEnd && formData.expiryTime && new Date(formData.pickupWindowEnd) >= new Date(formData.expiryTime)) {
        newErrors.expiryTime = "Expiry must be after pickup end";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateStep(currentStep)) setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => setCurrentStep((prev) => prev - 1);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!validateStep(currentStep)) return;

    const restaurantId = restaurantIdProp || user?.id || user?._id || null;
    if (!restaurantId || restaurantId === "000000000000000000000000") {
      toast.error("Session expired. Please log in again.");
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append("restaurant_id", restaurantId);
      fd.append("foodName", formData.foodName);
      fd.append("description", formData.description || "");
      fd.append("foodType", formData.foodType);
      fd.append("totalQuantity", Number(formData.totalQuantity));
      fd.append("expiryTime", new Date(formData.expiryTime).toISOString());
      fd.append("pickupWindowStart", new Date(formData.pickupWindowStart).toISOString());
      fd.append("pickupWindowEnd", new Date(formData.pickupWindowEnd).toISOString());

      if (imageFile) fd.append("image", imageFile);

      if (initialData?._id) {
        await updateDonation(initialData._id, fd);
        toast.success("Donation updated successfully!");
      } else {
        await createDonation(fd);
        toast.success("Food donated successfully! Thank you for your kindness.");
      }
      onSuccess?.();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to process donation");
    } finally {
      setIsLoading(false);
    }
  }, [formData, imageFile, initialData, onSuccess, restaurantIdProp, user, currentStep]);

  const steps = [
    { title: "Food Info", icon: UtensilsCrossed },
    { title: "Timing", icon: Clock },
    { title: "Finalizing", icon: Sparkles },
  ];

  return (
    <div className="relative flex flex-col min-h-[600px] overflow-hidden rounded-[2.5rem] border border-slate-200/60 bg-white/80 backdrop-blur-xl shadow-2xl animate-fade-in">
      {/* Dynamic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.08),transparent_40%),radial-gradient(circle_at_bottom_left,rgba(6,78,59,0.05),transparent_40%)] pointer-events-none" />

      {/* Modern Header */}
      <header className="relative px-8 pt-8 pb-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.25rem] bg-emerald-600 text-white shadow-xl shadow-emerald-200 transition-transform hover:rotate-3">
              <ShoppingBag size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                {initialData ? "Update Donation" : "Donate Fresh Food"}
              </h2>
              <p className="text-sm font-medium text-slate-500 mt-0.5">
                Step {currentStep} of 3: {steps[currentStep - 1].title}
              </p>
            </div>
          </div>
          
          {/* Stepper Progress */}
          <div className="flex items-center gap-2">
            {steps.map((s, idx) => (
              <div key={idx} className="flex items-center">
                <div 
                  className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-500 ${
                    currentStep > idx + 1 
                      ? "bg-emerald-600 text-white" 
                      : currentStep === idx + 1 
                        ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/20" 
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {currentStep > idx + 1 ? <CheckCircle2 size={18} /> : <s.icon size={18} />}
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-0.5 w-6 mx-1 rounded-full transition-all duration-500 ${currentStep > idx + 1 ? "bg-emerald-600" : "bg-slate-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Content Form */}
      <div className="flex-1 relative px-8 py-4 overflow-y-auto max-h-[calc(90vh-200px)]">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* STEP 1: Basic Food Info */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Input
                    label="What are you donating?"
                    name="foodName"
                    placeholder="e.g. 50 Packs of Chicken Biryani"
                    value={formData.foodName}
                    onChange={handleChange}
                    error={errors.foodName}
                    icon={<Type size={18} />}
                    className="text-lg font-bold"
                  />
                </div>
                <Select
                  label="Dietary Category"
                  name="foodType"
                  options={foodTypes}
                  value={formData.foodType}
                  onChange={handleChange}
                  error={errors.foodType}
                />
                <Input
                  label="Quantity (Servings)"
                  name="totalQuantity"
                  type="number"
                  placeholder="0"
                  value={formData.totalQuantity}
                  onChange={handleChange}
                  error={errors.totalQuantity}
                  icon={<Hash size={18} />}
                />
              </div>
              
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-6">
                <div className="flex items-start gap-4">
                  <div className="p-2.5 bg-white rounded-xl text-emerald-600 shadow-sm">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-emerald-900">Quick Guidance</h4>
                    <p className="text-sm text-emerald-700/80 leading-relaxed mt-1">
                      Use a clear name so food banks can quickly identify the meal. Accurate portion counts help us reach more people!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Timing details */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Pickup Available From"
                    name="pickupWindowStart"
                    type="datetime-local"
                    value={formData.pickupWindowStart}
                    onChange={handleChange}
                    error={errors.pickupWindowStart}
                    icon={<Clock size={18} />}
                  />
                  <Input
                    label="Pickup Available Until"
                    name="pickupWindowEnd"
                    type="datetime-local"
                    value={formData.pickupWindowEnd}
                    onChange={handleChange}
                    error={errors.pickupWindowEnd}
                    icon={<Clock size={18} />}
                  />
                </div>
                <Input
                  label="Safety Expiry Date & Time"
                  name="expiryTime"
                  type="datetime-local"
                  value={formData.expiryTime}
                  onChange={handleChange}
                  error={errors.expiryTime}
                  icon={<Calendar size={18} />}
                />
              </div>
              
              <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-6">
                <div className="flex items-start gap-4 text-amber-900">
                  <div className="p-2.5 bg-white rounded-xl text-amber-600 shadow-sm">
                    <Clock size={20} />
                  </div>
                  <div>
                    <h4 className="text-sm font-black">Safety Standards</h4>
                    <p className="text-sm text-amber-800/80 leading-relaxed mt-1">
                      Ensure the pickup ends before the food expires. We recommend setting the expiry time at least 2 hours after the pickup window ends.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Visuals and Description */}
          {currentStep === 3 && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Image Upload Block */}
                <div className="space-y-4">
                  <label className="block text-sm font-black text-slate-800 ml-1">
                    Add a Photo
                  </label>
                  <label 
                    htmlFor="food-image" 
                    className="group relative flex min-h-[280px] cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50 transition-all hover:border-emerald-400 hover:bg-emerald-50/30 overflow-hidden"
                  >
                    <input id="food-image" type="file" accept="image/*" onChange={handleFileChange} className="sr-only" />
                    
                    {previewUrl ? (
                      <div className="absolute inset-0">
                        <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all flex items-center justify-center">
                          <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-xs font-bold text-white backdrop-blur-md border border-white/20">
                            <ImageIcon size={14} />
                            Change Photo
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-6 text-center">
                        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-white text-emerald-600 shadow-xl shadow-slate-200 group-hover:scale-110 transition-transform">
                          <ImageIcon size={32} />
                        </div>
                        <p className="text-sm font-black text-slate-900">Upload item image</p>
                        <p className="mt-2 text-xs text-slate-500 max-w-[200px]">Higher quality images build more trust with food banks.</p>
                      </div>
                    )}
                  </label>
                </div>

                {/* Description Block */}
                <div className="space-y-4">
                  <label htmlFor="description" className="block text-sm font-black text-slate-800 ml-1">
                    Describe your donation
                  </label>
                  <div className="group relative h-[280px] rounded-[2rem] border border-slate-200 bg-slate-50 p-4 transition-all focus-within:ring-4 focus-within:ring-emerald-500/10 focus-within:border-emerald-600">
                    <AlignLeft className="absolute top-6 left-6 text-slate-400" size={20} />
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Add ingredients, allergens, or special instructions..."
                      className="h-full w-full bg-transparent pl-10 pr-2 pt-2 text-sm text-slate-700 outline-none placeholder:text-slate-400 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Modern Footer Actions */}
      <footer className="relative px-8 py-8 border-t border-slate-100 bg-slate-50/50 backdrop-blur-md">
        <div className="flex items-center justify-between gap-4">
          <p className="hidden text-xs font-bold text-slate-400 uppercase tracking-widest sm:block">
            {currentStep === 3 ? "Ready to save lives?" : "Carefully verify timing"}
          </p>
          
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {currentStep > 1 && (
              <button 
                type="button"
                onClick={prevStep}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm font-black text-slate-600 transition-all hover:bg-slate-50 active:scale-95"
              >
                <ChevronLeft size={20} />
                Back
              </button>
            )}

            {currentStep < 3 ? (
              <button 
                type="button"
                onClick={nextStep}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-8 py-4 text-sm font-black text-white shadow-xl shadow-emerald-200 transition-all hover:-translate-y-1 hover:bg-emerald-700 active:translate-y-0"
              >
                Continue
                <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isLoading}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-10 py-4 text-sm font-black text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 hover:bg-slate-800 active:translate-y-0 disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    {initialData ? "Update Donation" : "Confirm & Donate"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default DirectDonationForm;
