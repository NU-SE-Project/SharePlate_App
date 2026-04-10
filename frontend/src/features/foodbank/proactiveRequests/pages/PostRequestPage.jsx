import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ChevronLeft,
  Send,
  Info,
  Heart,
  CheckCircle2,
  Sparkles,
  Bell,
  Megaphone,
  ClipboardList,
} from "lucide-react";
import Button from "../../../../components/common/Button";
import Input from "../../../../components/common/Input";
import toast from "react-hot-toast";
import { createProactiveRequest } from "../../services/foodbankService";
import { useAuth } from "../../../../context/AuthContext";

const PostRequestPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const foodBankId = user?.id || user?._id || null;
  const [formData, setFormData] = useState({
    foodName: "",
    foodType: "veg",
    requestedQuantity: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.foodName || !formData.requestedQuantity) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (!foodBankId) {
      toast.error("Unable to identify your account. Please sign in again.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await createProactiveRequest({
        ...formData,
        foodbank_id: foodBankId,
        requestedQuantity: Number(formData.requestedQuantity),
      });
      const restaurantCount =
        response?.notificationSummary?.restaurantCount ?? 0;
      if (restaurantCount > 0) {
        toast.success(
          `Your request has been broadcasted to ${restaurantCount} nearby restaurant${restaurantCount === 1 ? "" : "s"}!`,
        );
      } else {
        toast.success(
          "Your request was saved. No nearby restaurants were found to notify.",
        );
      }
      navigate("/foodbank/my-proactive-requests");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to post request");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl animate-in fade-in slide-in-from-bottom-5 duration-700">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-green-100/60 shadow-[0_10px_40px_rgba(16,185,129,0.08)]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-200/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-green-200/30 blur-2xl" />
        </div>

        <div className="relative p-5 sm:p-7 lg:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start gap-4 sm:gap-5">
              <Link
                to="/foodbank/donated-food"
                className="group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-2xl border border-emerald-100 bg-white text-slate-500 shadow-sm transition-all duration-300 hover:-translate-x-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 sm:h-12 sm:w-12"
                aria-label="Go back to donated food"
              >
                <ChevronLeft
                  size={22}
                  className="transition-transform duration-300 group-hover:-translate-x-0.5"
                />
              </Link>

              <div className="min-w-0">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-800 sm:text-sm">
                  <Sparkles size={14} />
                  Broadcast Request
                </div>

                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
                  Broadcast a Need
                </h1>

                <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base">
                  Tell nearby restaurants exactly what your community needs.
                  Keep it clear, specific, and easy to fulfill.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:min-w-[320px]">
              <div className="group rounded-2xl border border-emerald-100 bg-white/80 p-4 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 transition-transform duration-300 group-hover:scale-105">
                    <Bell size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Nearby reach
                    </p>
                    <p className="text-xs text-slate-500">
                      Restaurants get notified
                    </p>
                  </div>
                </div>
                <p className="text-sm leading-6 text-slate-600">
                  Nearby restaurants can review and respond to your request
                  faster when the need is specific.
                </p>
              </div>

              <Link
                to="/foodbank/my-proactive-requests"
                className="group rounded-2xl border border-emerald-700 bg-gradient-to-r from-emerald-600 to-green-800 p-4 text-white shadow-[0_12px_30px_rgba(22,163,74,0.28)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(22,163,74,0.34)] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <div className="flex h-full flex-col justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                      <ClipboardList size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">My Broadcasts</p>
                      <p className="text-xs text-emerald-100">
                        Review active requests
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-emerald-50">
                      Open request tracker
                    </span>
                    <Send
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 rounded-[2rem] border border-emerald-100/80 bg-white/90 p-5 shadow-[0_18px_40px_-20px_rgba(15,23,42,0.18)] backdrop-blur-md sm:p-6 lg:p-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[1.5fr_0.95fr]">
            <div className="space-y-6">
              <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-white p-5 shadow-sm">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <Megaphone size={22} />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-900">
                      Meal Details
                    </h2>
                    <p className="text-sm text-slate-500">
                      Describe what you need with enough precision to be useful.
                    </p>
                  </div>
                </div>

                <div className="space-y-6">
                  <Input
                    label="What food do you need?"
                    placeholder="e.g. 50 packs of veg rice or fresh bread"
                    value={formData.foodName}
                    onChange={(e) =>
                      setFormData({ ...formData, foodName: e.target.value })
                    }
                    icon={<Info size={18} />}
                    required
                  />

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">
                        Food Type
                      </label>
                      <div className="inline-flex w-full rounded-2xl bg-slate-50 p-2 ring-1 ring-slate-100">
                        {["veg", "non-veg"].map((type) => {
                          const isActive = formData.foodType === type;
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, foodType: type })
                              }
                              className={`flex-1 rounded-xl px-4 py-3 text-sm font-semibold capitalize transition-all duration-300 ${
                                isActive
                                  ? "bg-gradient-to-r from-emerald-600 to-green-800 text-white shadow-lg shadow-emerald-100"
                                  : "text-slate-600 hover:bg-white hover:text-emerald-700"
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <Input
                      label="Total Servings Required"
                      type="number"
                      placeholder="e.g. 50"
                      value={formData.requestedQuantity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          requestedQuantity: e.target.value,
                        })
                      }
                      min="1"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-gradient-to-r from-green-900 via-emerald-800 to-emerald-600 p-6 text-white shadow-[0_24px_60px_-20px_rgba(6,95,70,0.55)]">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-emerald-100 backdrop-blur-sm">
                    <Heart size={22} className="fill-emerald-200 text-emerald-200" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Impact Reach</h3>
                    <p className="mt-2 text-sm leading-6 text-emerald-50/90">
                      Once posted, nearby restaurants can partially or fully
                      fulfill your request. Clear requests get better responses.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <aside className="space-y-5">
              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-base font-extrabold text-slate-900">
                  Quick Guidance
                </h3>

                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    Ask for the exact item and quantity. Vague requests slow
                    the response.
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    Nearby restaurants will see your broadcast as soon as it is
                    posted.
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                    Track fulfillment progress later from your broadcasts page.
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50 via-white to-green-50 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Verified account
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Your food bank profile helps restaurants trust the request
                      and coordinate fulfillment.
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>

          <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Review the request before posting. Bad input creates bad records.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="rounded-2xl border-slate-300 px-6 py-3.5 text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
                onClick={() => navigate(-1)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                className="group rounded-2xl bg-gradient-to-r from-green-800 to-emerald-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-200 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-emerald-300/40"
                disabled={isLoading}
                type="submit"
              >
                <span className="inline-flex items-center justify-center gap-2">
                  {isLoading ? "Broadcasting..." : "Post Request Now"}
                  {!isLoading && (
                    <Send
                      size={18}
                      className="transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                    />
                  )}
                </span>
              </Button>
            </div>
          </div>
        </form>
      </div>

      <div className="mt-10 flex items-center justify-center gap-3 text-slate-400">
        <CheckCircle2 size={16} className="text-emerald-500" />
        <span className="text-sm font-medium italic">
          Verified Food Bank: SharePlate Community Trust
        </span>
      </div>
    </div>
  );
};

export default PostRequestPage;
