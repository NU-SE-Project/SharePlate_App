import React, { useMemo, useState, useCallback } from "react";
import {
  X,
  HeartHandshake,
  Loader2,
  AlertCircle,
  ShieldCheck,
  PackageCheck,
} from "lucide-react";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import { acceptFoodRequest } from "../services/restaurantService";
import toast from "react-hot-toast";

const AcceptRequestModal = ({
  request,
  onClose,
  onSuccess,
  onAccept,
  showQuantity = true,
}) => {
  const maxQuantity = request?.remainingQuantity || 0;
  const foodName = request?.foodName || "Food Request";
  const foodbankName = request?.foodbank_id?.name || "the food bank";

  const [quantity, setQuantity] = useState(showQuantity ? maxQuantity : 0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const quantityValue = useMemo(() => Number(quantity), [quantity]);

  const handleQuantityChange = useCallback(
    (e) => {
      setQuantity(e.target.value);
      if (error) setError("");
    },
    [error],
  );

  const validateForm = useCallback(() => {
    if (!showQuantity) return true;

    if (!quantity || Number.isNaN(quantityValue) || quantityValue <= 0) {
      setError("Please enter a valid quantity.");
      return false;
    }

    if (quantityValue > maxQuantity) {
      setError(`Maximum you can provide is ${maxQuantity} servings.`);
      return false;
    }

    return true;
  }, [showQuantity, quantity, quantityValue, maxQuantity]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const acceptedQuantity = showQuantity ? quantityValue : undefined;

      if (onAccept && typeof onAccept === "function") {
        await onAccept(request._id, acceptedQuantity);
      } else {
        await acceptFoodRequest(request._id, acceptedQuantity);
      }

      toast.success("Request accepted successfully.");
      onSuccess?.();
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to accept request.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="accept-request-modal-title"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-slate-950/60 backdrop-blur-[6px] transition-opacity duration-300 animate-in fade-in"
      />

      {/* Modal */}
      <div className="relative z-10 w-full sm:max-w-2xl animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-300">
        <div className="overflow-hidden rounded-t-[2rem] border border-emerald-100/80 bg-white shadow-[0_24px_80px_rgba(15,23,42,0.18)] sm:rounded-[2rem]">
          {/* Top Accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-green-800 via-emerald-600 to-green-700" />

          <div className="relative p-5 sm:p-7 lg:p-8">
            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close modal"
              disabled={isLoading}
              className="absolute right-4 top-4 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 shadow-sm transition-all duration-200 hover:scale-105 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X size={20} />
            </button>

            {/* Header */}
            <div className="pr-12">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-green-800 to-emerald-600 text-white shadow-lg shadow-emerald-200 transition-transform duration-300 hover:scale-105">
                    <HeartHandshake size={24} />
                  </div>

                  <div className="min-w-0">
                    <p className="mb-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em] text-emerald-700">
                      Donation Confirmation
                    </p>

                    <h2
                      id="accept-request-modal-title"
                      className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl"
                    >
                      Accept & Donate
                    </h2>

                    <p className="mt-2 text-sm font-medium text-slate-500 sm:text-base">
                      Confirm your contribution for{" "}
                      <span className="font-semibold text-slate-700">
                        {foodName}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Info Cards */}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="group rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-emerald-50/70 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 transition-transform duration-300 group-hover:scale-105">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">
                      Beneficiary
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      You are committing to provide food for{" "}
                      <span className="font-bold text-slate-900">
                        {foodbankName}
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              <div className="group rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-green-800 shadow-sm transition-transform duration-300 group-hover:scale-105">
                    <PackageCheck size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-600">
                      Request Status
                    </p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-700">
                      {showQuantity
                        ? `You may provide all ${maxQuantity} servings or only a partial amount.`
                        : "This request can be accepted directly without selecting quantity."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-7 space-y-6">
              {showQuantity && (
                <div className="rounded-3xl border border-emerald-100 bg-white p-4 shadow-sm sm:p-5">
                  <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <label
                        htmlFor="quantity"
                        className="text-sm font-bold text-slate-800"
                      >
                        Quantity to provide
                      </label>
                      <p className="mt-1 text-xs text-slate-500">
                        Enter how many servings you can fulfill right now.
                      </p>
                    </div>

                    <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">
                      Needed: {maxQuantity}
                    </div>
                  </div>

                  <Input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={maxQuantity}
                    placeholder="Enter servings"
                    value={quantity}
                    onChange={handleQuantityChange}
                    error={error}
                    disabled={isLoading}
                    className="w-full rounded-2xl border-slate-200 bg-white py-4 text-base font-semibold text-slate-900 transition-all duration-200 placeholder:font-medium placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 sm:text-lg"
                  />

                  <div className="mt-3 flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2.5">
                    <AlertCircle
                      size={16}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />
                    <p className="text-xs leading-relaxed text-slate-500">
                      Example: if {maxQuantity} servings are requested, you can
                      still accept only a portion such as 20 or 30.
                    </p>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-in fade-in duration-200">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <p className="font-medium">{error}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-2xl border-slate-300 py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 sm:w-auto sm:min-w-[140px]"
                >
                  Cancel
                </Button>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full cursor-pointer rounded-2xl bg-gradient-to-r from-green-800 to-emerald-600 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto sm:min-w-[220px]"
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    {isLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <HeartHandshake size={18} />
                        Accept Request
                      </>
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptRequestModal;
