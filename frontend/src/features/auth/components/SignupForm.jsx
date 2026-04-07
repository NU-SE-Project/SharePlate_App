import React, { useEffect, useMemo, useRef, useState } from "react";
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

const SRI_LANKA_PLACE_FALLBACKS = [
  { label: "Colombo, Sri Lanka", lat: 6.9271, lon: 79.8612 },
  { label: "Sri Jayawardenepura Kotte, Sri Lanka", lat: 6.8941, lon: 79.9025 },
  { label: "Dehiwala-Mount Lavinia, Sri Lanka", lat: 6.8402, lon: 79.8712 },
  { label: "Moratuwa, Sri Lanka", lat: 6.773, lon: 79.8816 },
  { label: "Negombo, Sri Lanka", lat: 7.2083, lon: 79.8358 },
  { label: "Gampaha, Sri Lanka", lat: 7.0917, lon: 79.9999 },
  { label: "Kalutara, Sri Lanka", lat: 6.5854, lon: 79.9607 },
  { label: "Panadura, Sri Lanka", lat: 6.7132, lon: 79.9026 },
  { label: "Kandy, Sri Lanka", lat: 7.2906, lon: 80.6337 },
  { label: "Matale, Sri Lanka", lat: 7.4675, lon: 80.6234 },
  { label: "Nuwara Eliya, Sri Lanka", lat: 6.9497, lon: 80.7891 },
  { label: "Galle, Sri Lanka", lat: 6.0535, lon: 80.221 },
  { label: "Matara, Sri Lanka", lat: 5.9549, lon: 80.555 },
  { label: "Hambantota, Sri Lanka", lat: 6.1241, lon: 81.1185 },
  { label: "Jaffna, Sri Lanka", lat: 9.6615, lon: 80.0255 },
  { label: "Kilinochchi, Sri Lanka", lat: 9.3961, lon: 80.3982 },
  { label: "Mannar, Sri Lanka", lat: 8.977, lon: 79.9042 },
  { label: "Vavuniya, Sri Lanka", lat: 8.7514, lon: 80.4971 },
  { label: "Mullaitivu, Sri Lanka", lat: 9.2671, lon: 80.8142 },
  { label: "Trincomalee, Sri Lanka", lat: 8.5874, lon: 81.2152 },
  { label: "Batticaloa, Sri Lanka", lat: 7.7102, lon: 81.6924 },
  { label: "Ampara, Sri Lanka", lat: 7.2975, lon: 81.682 },
  { label: "Kurunegala, Sri Lanka", lat: 7.4863, lon: 80.3647 },
  { label: "Puttalam, Sri Lanka", lat: 8.0362, lon: 79.8283 },
  { label: "Anuradhapura, Sri Lanka", lat: 8.3114, lon: 80.4037 },
  { label: "Polonnaruwa, Sri Lanka", lat: 7.94, lon: 81.0188 },
  { label: "Badulla, Sri Lanka", lat: 6.9934, lon: 81.055 },
  { label: "Monaragala, Sri Lanka", lat: 6.872, lon: 81.3507 },
  { label: "Ratnapura, Sri Lanka", lat: 6.6828, lon: 80.3992 },
  { label: "Kegalle, Sri Lanka", lat: 7.2527, lon: 80.3464 },
];

const SignupForm = () => {
  const nominatimBaseUrl =
    import.meta.env.VITE_NOMINATIM_BASE_URL ||
    "https://nominatim.openstreetmap.org";
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const addressFieldRef = useRef(null);
  const addressRequestIdRef = useRef(0);
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
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [addressSearchMessage, setAddressSearchMessage] = useState("");

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!addressFieldRef.current?.contains(event.target)) {
        setShowAddressSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const query = formData.address.trim();

    if (query.length === 0) {
      setAddressSuggestions([]);
      setIsAddressLoading(false);
      setAddressSearchMessage("");
      return undefined;
    }

    const controller = new AbortController();
    const requestId = ++addressRequestIdRef.current;
    const debounceId = window.setTimeout(async () => {
      setIsAddressLoading(true);
      setAddressSearchMessage("");

      try {
        const suggestions = await fetchSriLankaAddressSuggestions(
          query,
          controller.signal,
        );
        if (requestId !== addressRequestIdRef.current) return;

        setAddressSuggestions(suggestions);
        setAddressSearchMessage(
          suggestions.length === 0 ? "No matching places found." : "",
        );
      } catch (error) {
        if (
          axios.isCancel?.(error) ||
          error.name === "CanceledError" ||
          error.name === "AbortError"
        ) {
          return;
        }

        if (requestId !== addressRequestIdRef.current) return;
        console.error("Address autocomplete error:", error);
        setAddressSuggestions([]);
        setAddressSearchMessage("Unable to load address suggestions.");
      } finally {
        if (requestId !== addressRequestIdRef.current) return;
        setIsAddressLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(debounceId);
    };
  }, [formData.address, nominatimBaseUrl]);

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

  const buildFallbackSuggestions = (query) => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return SRI_LANKA_PLACE_FALLBACKS.filter(({ label }) =>
      label.toLowerCase().includes(normalizedQuery),
    ).map((place) => ({
      place_id: `fallback-${place.label}`,
      display_name: place.label,
      lat: String(place.lat),
      lon: String(place.lon),
      source: "fallback",
    }));
  };

  const mergeAddressSuggestions = (primarySuggestions, fallbackSuggestions) => {
    const mergedSuggestions = [];
    const seenLabels = new Set();

    [...primarySuggestions, ...fallbackSuggestions].forEach((suggestion) => {
      const label = String(suggestion.display_name || "").toLowerCase();
      if (!label || seenLabels.has(label)) return;
      seenLabels.add(label);
      mergedSuggestions.push(suggestion);
    });

    return mergedSuggestions;
  };

  const fetchSriLankaAddressSuggestions = async (query, signal) => {
    const normalizedQuery = query.trim();
    const searchVariants = [
      `${normalizedQuery}, Sri Lanka`,
      `${normalizedQuery} Sri Lanka`,
      normalizedQuery,
    ];

    for (const searchQuery of searchVariants) {
      const response = await axios.get(`${nominatimBaseUrl}/search`, {
        params: {
          format: "jsonv2",
          q: searchQuery,
          addressdetails: 1,
          countrycodes: "lk",
          dedupe: 1,
          limit: 8,
        },
        signal,
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });

      const suggestions = Array.isArray(response.data) ? response.data : [];
      if (suggestions.length > 0) {
        return mergeAddressSuggestions(
          suggestions,
          buildFallbackSuggestions(normalizedQuery),
        );
      }
    }

    return buildFallbackSuggestions(normalizedQuery);
  };

  const handleGeocode = async () => {
    if (!formData.address) {
      toast.error("Please enter an address first");
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await axios.get(`${nominatimBaseUrl}/search`, {
        params: {
          format: "jsonv2",
          q: `${formData.address}, Sri Lanka`,
          countrycodes: "lk",
          dedupe: 1,
          limit: 1,
        },
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });

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
    if (name === "address") {
      setShowAddressSuggestions(true);
      setAddressSearchMessage("");
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const handleAddressSuggestionSelect = (suggestion) => {
    setFormData((prev) => ({
      ...prev,
      address: suggestion.display_name,
      location: {
        ...prev.location,
        coordinates: [Number(suggestion.lon), Number(suggestion.lat)],
      },
    }));
    setAddressSuggestions([]);
    setAddressSearchMessage("");
    setShowAddressSuggestions(false);
    if (errors.address) {
      setErrors((prev) => ({ ...prev, address: null }));
    }
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
      const { confirmPassword, ...submitData } = formData;
      if (isGoogleOnboarding) {
        const { email, ...googleSignupData } = submitData;
        const result = await auth.completeGoogleSignup({
          onboardingToken: googleOnboarding.onboardingToken,
          ...googleSignupData,
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
            />
            {errors.server && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100">
                {errors.server}
              </div>
            )}
            <Button
              type="button"
              onClick={handleNext}
              className="w-full py-4 text-lg font-bold"
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
                    text="Sign up with Google"
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
            <div className="relative" ref={addressFieldRef}>
              <Input
                label="Detailed Address"
                name="address"
                placeholder="123 Street Name, City"
                value={formData.address}
                onChange={handleChange}
                onFocus={() => {
                  if (formData.address.trim().length >= 1) {
                    setShowAddressSuggestions(true);
                  }
                }}
                autoComplete="off"
                error={errors.address}
                icon={<MapPin size={18} />}
              />
              <button
                type="button"
                onClick={handleGeocode}
                disabled={isGeocoding}
                className="absolute right-2 bottom-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:bg-slate-300"
                title="Find on Map"
              >
                {isGeocoding ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Search size={16} />
                )}
              </button>
              {showAddressSuggestions &&
              (isAddressLoading ||
                addressSuggestions.length > 0 ||
                addressSearchMessage) ? (
                <div className="absolute left-0 right-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70">
                  {isAddressLoading ? (
                    <div className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-500">
                      <Loader2 size={16} className="animate-spin" />
                      Searching places...
                    </div>
                  ) : null}

                  {!isAddressLoading && addressSuggestions.length > 0 ? (
                    <ul className="max-h-64 overflow-y-auto py-2">
                      {addressSuggestions.map((suggestion) => (
                        <li key={suggestion.place_id}>
                          <button
                            type="button"
                            onClick={() =>
                              handleAddressSuggestionSelect(suggestion)
                            }
                            className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-emerald-50"
                          >
                            <MapPin
                              size={16}
                              className="mt-0.5 shrink-0 text-emerald-600"
                            />
                            <span className="text-sm text-slate-700">
                              {suggestion.display_name}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  {!isAddressLoading && addressSearchMessage ? (
                    <div className="px-4 py-3 text-sm font-medium text-slate-500">
                      {addressSearchMessage}
                    </div>
                  ) : null}
                </div>
              ) : null}
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
                className="w-1/3"
                disabled={isLoading}
              >
                Back
              </Button>
              <Button
                type="submit"
                className="w-2/3 py-4 text-lg font-bold"
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
          className="font-bold text-emerald-600 hover:text-emerald-700"
        >
          Sign in to continue
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
