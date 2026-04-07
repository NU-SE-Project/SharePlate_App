import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Loader2,
  ChevronRight,
  Search,
} from "lucide-react";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import { register } from "../services/authService";
import LocationPicker from "../../../components/common/LocationPicker";
import GoogleAuthButton from "./GoogleAuthButton";
import axios from "axios";
import toast from "react-hot-toast";
import { useAuth } from "../../../context/AuthContext";
import {
  clearStoredGoogleOnboarding,
  getStoredGoogleOnboarding,
  setStoredGoogleOnboarding,
} from "../utils/googleOnboardingStorage";

const SignupForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const googleOnboarding =
    location.state?.googleOnboarding || getStoredGoogleOnboarding() || null;
  const isGoogleOnboarding = Boolean(googleOnboarding?.onboardingToken);
  const [step, setStep] = useState(isGoogleOnboarding ? 1 : 1);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    contactNumber: "",
    role: "restaurant",
    location: { type: "Point", coordinates: [79.8612, 6.9271] }, // Default to Colombo
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

  const roles = useMemo(
    () => [
      { value: "restaurant", label: "Restaurant / Hotel" },
      { value: "foodbank", label: "Food Bank / NGO" },
      { value: "admin", label: "Administrator" },
    ],
    [],
  );

  useEffect(() => {
    if (!isGoogleOnboarding) return;

    setStoredGoogleOnboarding(googleOnboarding);

    setFormData((prev) => ({
      ...prev,
      name: googleOnboarding.profile?.name || prev.name,
      email: googleOnboarding.profile?.email || prev.email,
    }));
  }, [googleOnboarding, isGoogleOnboarding]);

  const navigateByRole = (nextUser) => {
    const role = nextUser?.role || "";
    if (role === "restaurant") navigate("/restaurant/dashboard");
    else if (role === "foodbank") navigate("/foodbank/donated-food");
    else navigate("/dashboard");
  };

  const handleLocationChange = (coords) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        coordinates: [Number(coords.longitude), Number(coords.latitude)],
      },
      ...(coords.address && { address: coords.address }),
    }));
  };

  const handleGeocode = async () => {
    if (!formData.address) {
      toast.error("Please enter an address first");
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.address,
        )}&limit=1`,
      );

      if (response.data && response.data.length > 0) {
        const { lat, lon } = response.data[0];
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location,
            coordinates: [Number(lon), Number(lat)],
          },
        }));
        toast.success("Location found on map!");
      } else {
        toast.error("Could not find location for this address.");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Error searching for location");
    } finally {
      setIsGeocoding(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Full name is required";
    if (!isGoogleOnboarding) {
      if (!formData.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(formData.email))
        newErrors.email = "Invalid email address";
    }
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.address) newErrors.address = "Detailed address is required";
    if (!formData.contactNumber)
      newErrors.contactNumber = "Contact number is required";
    else if (!/^\+947[0-9]{8}$/.test(formData.contactNumber))
      newErrors.contactNumber = "Use format +947XXXXXXXX";
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleNext = () => {
    const step1Errors = validateStep1();
    if (Object.keys(step1Errors).length > 0) {
      setErrors(step1Errors);
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const step2Errors = validateStep2();
    if (Object.keys(step2Errors).length > 0) {
      setErrors(step2Errors);
      return;
    }

    setIsLoading(true);
    try {
      const { confirmPassword, email, ...submitData } = formData;
      if (isGoogleOnboarding) {
        const result = await auth.completeGoogleSignup({
          onboardingToken: googleOnboarding.onboardingToken,
          ...submitData,
        });
        clearStoredGoogleOnboarding();
        navigateByRole(result?.user);
      } else {
        await register(submitData);
        navigate("/auth/login", {
          state: { message: "Account created! Please log in." },
        });
      }
    } catch (error) {
      setErrors({
        server: error.response?.data?.message || "Registration failed",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleCredential = async (credential) => {
    setErrors((prev) => ({ ...prev, server: null }));
    const result = await auth.loginWithGoogle(credential);

    if (result?.requiresOnboarding) {
      setStoredGoogleOnboarding({
        onboardingToken: result.onboardingToken,
        profile: result.profile,
      });
      navigate("/auth/signup", {
        replace: true,
        state: {
          googleOnboarding: {
            onboardingToken: result.onboardingToken,
            profile: result.profile,
          },
        },
      });
      return;
    }

    clearStoredGoogleOnboarding();
    navigateByRole(result?.user);
  };

  return (
    <div className="space-y-6">
      {isGoogleOnboarding ? (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-800">
          Google verified{" "}
          <span className="font-bold">{googleOnboarding.profile?.email}</span>.
          Complete the remaining account details to finish signup.
        </div>
      ) : null}

      {/* Steps Indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? "bg-emerald-500" : "bg-slate-200"}`}
        />
        <div
          className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? "bg-emerald-500" : "bg-slate-200"}`}
        />
      </div>

      <form
        onSubmit={
          step === 1
            ? (e) => {
                e.preventDefault();
                handleNext();
              }
            : handleSubmit
        }
        className="space-y-5"
      >
        {step === 1 ? (
          <>
            <Input
              label="Full Name"
              name="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              icon={<User size={18} />}
            />
            <Input
              label="Email Address"
              name="email"
              type="email"
              placeholder="john@example.com"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              icon={<Mail size={18} />}
              disabled={isGoogleOnboarding}
            />
            <Select
              label="Account Type"
              name="role"
              options={roles}
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
              className="cursor-pointer"
            />
            {errors.server && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {errors.server}
              </div>
            )}
            <Button
              type="button"
              onClick={handleNext}
              className="w-full cursor-pointer py-4 text-lg font-bold"
            >
              Next Step <ChevronRight className="ml-2" size={20} />
            </Button>

            {!isGoogleOnboarding ? (
              <>
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    <span className="bg-slate-50 px-3">or</span>
                  </div>
                </div>

                <div className="flex justify-center">
                  <GoogleAuthButton
                    text=""
                    disabled={isLoading}
                    onCredential={handleGoogleCredential}
                    onError={(message) =>
                      setErrors((prev) => ({ ...prev, server: message }))
                    }
                  />
                </div>
              </>
            ) : null}
          </>
        ) : (
          <>
            <Input
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              icon={<Lock size={18} />}
            />
            <Input
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              icon={<Lock size={18} />}
            />
            <div className="relative">
              <Input
                label="Detailed Address"
                name="address"
                placeholder="123 Street Name, City"
                value={formData.address}
                onChange={handleChange}
                error={errors.address}
                icon={<MapPin size={18} />}
              />
              <button
                type="button"
                onClick={handleGeocode}
                disabled={isGeocoding}
                className="absolute right-2 bottom-2 cursor-pointer rounded-xl bg-emerald-600 p-2 text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                title="Find on Map"
              >
                {isGeocoding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <LocationPicker
                lat={formData.location.coordinates[1]}
                lng={formData.location.coordinates[0]}
                onChange={handleLocationChange}
              />
            </div>
            <Input
              label="Contact Number"
              name="contactNumber"
              placeholder="+947XXXXXXXX"
              value={formData.contactNumber}
              onChange={handleChange}
              error={errors.contactNumber}
              icon={<Phone size={18} />}
            />

            {errors.server && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {errors.server}
              </div>
            )}

            <div className="flex gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="w-1/3 cursor-pointer"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="w-2/3 cursor-pointer py-4 text-lg font-bold"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  "Complete Registration"
                )}
              </Button>
            </div>
          </>
        )}
      </form>

      <p className="text-center text-slate-600 text-sm">
        Already part of SharePlate?{" "}
        <Link
          to="/auth/login"
          className="cursor-pointer font-bold text-emerald-600 hover:text-emerald-700"
        >
          Sign in to continue
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
