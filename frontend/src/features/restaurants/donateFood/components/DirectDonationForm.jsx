import React, { useCallback, useMemo, useState } from "react";
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
  }, []);

  const validate = useCallback(() => {
    const newErrors = {};

    if (!formData.foodName.trim()) newErrors.foodName = "Item name is required";
    if (!formData.totalQuantity || Number(formData.totalQuantity) <= 0) {
      newErrors.totalQuantity = "Valid quantity is required";
    }
    if (!formData.expiryTime) newErrors.expiryTime = "Expiry time is required";
    if (!formData.pickupWindowStart)
      newErrors.pickupWindowStart = "Pickup start is required";
    if (!formData.pickupWindowEnd)
      newErrors.pickupWindowEnd = "Pickup end is required";

    if (
      formData.pickupWindowStart &&
      formData.pickupWindowEnd &&
      new Date(formData.pickupWindowStart) >= new Date(formData.pickupWindowEnd)
    ) {
      newErrors.pickupWindowEnd = "End time must be after start time";
    }

    if (
      formData.pickupWindowEnd &&
      formData.expiryTime &&
      new Date(formData.pickupWindowEnd) >= new Date(formData.expiryTime)
    ) {
      newErrors.expiryTime = "Expiry must be after pickup end";
    }

    return newErrors;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const validationErrors = validate();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        return;
      }

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
        fd.append(
          "pickupWindowStart",
          new Date(formData.pickupWindowStart).toISOString(),
        );
        fd.append(
          "pickupWindowEnd",
          new Date(formData.pickupWindowEnd).toISOString(),
        );

        if (imageFile) {
          fd.append("image", imageFile);
        }

        if (initialData?._id) {
          await updateDonation(initialData._id, fd);
          toast.success("Donation updated successfully!");
        } else {
          await createDonation(fd);
          toast.success(
            "Food donated successfully! Thank you for your kindness.",
          );
        }

        onSuccess?.();
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Failed to process donation",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      formData,
      imageFile,
      initialData,
      onSuccess,
      restaurantIdProp,
      user,
      validate,
    ],
  );

  const selectedImageName = imageFile?.name || "";

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-white shadow-[0_12px_50px_rgba(16,185,129,0.10)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(5,150,105,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(22,163,74,0.10),transparent_28%)] pointer-events-none" />

      <div className="relative border-b border-emerald-100/80 bg-gradient-to-r from-green-800 via-emerald-700 to-emerald-600 px-5 py-6 sm:px-7 md:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-md ring-1 ring-white/20 transition-transform duration-300 hover:scale-105">
              <UtensilsCrossed className="text-white" size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                {initialData ? "Update Donation" : "Create Direct Donation"}
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
                Add fresh donation details clearly so food banks can understand
                availability, timing, and pickup information without confusion.
              </p>
            </div>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/90 ring-1 ring-white/20 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-200 animate-pulse" />
            Donation Form
          </div>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="relative px-5 py-6 sm:px-7 md:px-8 md:py-8"
      >
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="xl:col-span-8">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <Input
                  label="Food Item Name"
                  name="foodName"
                  placeholder="e.g. Mixed Vegetable Curry"
                  value={formData.foodName}
                  onChange={handleChange}
                  error={errors.foodName}
                  icon={<ShoppingBag size={18} />}
                />
              </div>

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
                placeholder="Number of servings / units"
                value={formData.totalQuantity}
                onChange={handleChange}
                error={errors.totalQuantity}
                icon={<Hash size={18} />}
              />

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

              <div className="md:col-span-2">
                <Input
                  label="Expiry Date & Time"
                  name="expiryTime"
                  type="datetime-local"
                  value={formData.expiryTime}
                  onChange={handleChange}
                  error={errors.expiryTime}
                  icon={<Calendar size={18} />}
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-bold text-slate-700"
                >
                  Description
                </label>

                <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-300 hover:border-emerald-300 hover:shadow-[0_10px_30px_rgba(16,185,129,0.10)] focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10">
                  <div className="pointer-events-none absolute left-4 top-4 text-slate-400 transition-all duration-300 group-focus-within:text-emerald-600 group-hover:text-emerald-500">
                    <AlignLeft size={18} />
                  </div>

                  <textarea
                    id="description"
                    name="description"
                    rows="5"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Give details about ingredients, spice level, packaging, special notes, or handling instructions..."
                    className="min-h-[140px] w-full resize-y bg-transparent py-4 pl-12 pr-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:text-base"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="xl:col-span-4">
            <div className="sticky top-6 space-y-5">
              <div className="overflow-hidden rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_35px_rgba(16,185,129,0.12)]">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/20">
                    <ImageIcon size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Food Image
                    </h3>
                    <p className="text-sm text-slate-500">
                      Upload a clear photo for better trust.
                    </p>
                  </div>
                </div>

                <label
                  htmlFor="food-image"
                  className="group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-emerald-200 bg-white px-5 py-8 text-center transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50/50 hover:shadow-[0_12px_25px_rgba(16,185,129,0.10)] focus-within:border-emerald-600 focus-within:ring-4 focus-within:ring-emerald-500/10"
                >
                  <input
                    id="food-image"
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="sr-only"
                  />

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition-all duration-300 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white">
                    <ImageIcon size={28} />
                  </div>

                  <p className="text-sm font-bold text-slate-800">
                    {selectedImageName
                      ? selectedImageName
                      : "Click to upload food image"}
                  </p>

                  <p className="mt-2 text-xs leading-5 text-slate-500">
                    PNG, JPG, WEBP and other image formats supported
                  </p>
                </label>

                {formData.imageUrl && !imageFile && (
                  <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
                    <span className="font-semibold text-slate-800">
                      Current image:
                    </span>{" "}
                    <span className="break-all">{formData.imageUrl}</span>
                  </div>
                )}
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.08)]">
                <h3 className="text-base font-extrabold text-slate-900">
                  Quick Guidance
                </h3>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="flex items-start gap-3">
                    <ChevronRight
                      className="mt-0.5 shrink-0 text-emerald-600"
                      size={16}
                    />
                    <p>
                      Use a clear item name so requests can be processed faster.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <ChevronRight
                      className="mt-0.5 shrink-0 text-emerald-600"
                      size={16}
                    />
                    <p>Make sure pickup ends before the expiry time.</p>
                  </div>

                  <div className="flex items-start gap-3">
                    <ChevronRight
                      className="mt-0.5 shrink-0 text-emerald-600"
                      size={16}
                    />
                    <p>
                      Add handling notes if the food has packaging or storage
                      requirements.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Review the details before submitting. Bad input creates bad records.
          </p>

          <Button
            type="submit"
            disabled={isLoading}
            className="group inline-flex w-full cursor-pointer items-center justify-center rounded-2xl bg-gradient-to-r from-green-800 via-emerald-700 to-emerald-600 px-6 py-4 text-base font-extrabold text-white shadow-[0_14px_30px_rgba(5,150,105,0.28)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_40px_rgba(5,150,105,0.35)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 animate-spin" size={20} />
                Processing...
              </>
            ) : (
              <>
                {initialData ? "Update Donation" : "Submit Donation"}
                <ChevronRight
                  size={18}
                  className="ml-2 transition-transform duration-300 group-hover:translate-x-1"
                />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DirectDonationForm;
