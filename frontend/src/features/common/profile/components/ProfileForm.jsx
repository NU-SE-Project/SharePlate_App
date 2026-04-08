import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import {
  User,
  Mail,
  MapPin,
  Phone,
  Loader2,
  Save,
  Globe,
  Info,
  Search,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

import Input from "../../../../components/common/Input";
import Button from "../../../../components/common/Button";
import LocationPicker from "../../../../components/common/LocationPicker";
import AccountSecurityPanel from "./AccountSecurityPanel";
import { updateMe, getMe } from "../../../auth/services/authService";
import { useAuth } from "../../../../context/AuthContext";

const SectionCard = memo(({ children, className = "" }) => {
  return (
    <div
      className={`rounded-3xl border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
});

const SectionHeader = memo(({ icon, title, description }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-200/60">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm leading-6 text-slate-500 sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
});

const InfoBox = memo(({ icon, title, description, tone = "default" }) => {
  const toneClasses =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-700"
      : "border-slate-200 bg-slate-50 text-slate-600";

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 ${toneClasses}`}
      role={tone === "error" ? "alert" : "status"}
    >
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div>
        <p className="text-sm font-semibold">{title}</p>
        {description ? <p className="mt-1 text-sm">{description}</p> : null}
      </div>
    </div>
  );
});

const ProfileSkeleton = memo(() => {
  return (
    <div className="animate-pulse space-y-8">
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-2xl bg-slate-200" />
        <div className="space-y-2">
          <div className="h-6 w-48 rounded bg-slate-200" />
          <div className="h-4 w-72 rounded bg-slate-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
      </div>

      <div className="h-72 rounded-3xl bg-slate-100" />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="h-24 rounded-2xl bg-slate-100" />
        <div className="h-24 rounded-2xl bg-slate-100" />
      </div>

      <div className="h-12 w-48 rounded-2xl bg-slate-200" />
    </div>
  );
});

const ReadOnlyField = memo(({ label, value, icon }) => {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-sm font-semibold text-slate-700">
        {label}
      </label>
      <div className="flex min-h-[56px] items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500">
        <span className="shrink-0 text-slate-400">{icon}</span>
        <span className="truncate">{value || "-"}</span>
      </div>
    </div>
  );
});

const createFormDataFromUser = (profileUser) => ({
  name: profileUser?.name || "",
  email: profileUser?.email || "",
  address: profileUser?.address || "",
  contactNumber: profileUser?.contactNumber || "",
  latitude: profileUser?.location?.coordinates?.[1]?.toString() || "",
  longitude: profileUser?.location?.coordinates?.[0]?.toString() || "",
});

const ProfileForm = () => {
  const { user, setUser } = useAuth();
  const setUserRef = useRef(setUser);

  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isFetchingProfile, setIsFetchingProfile] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [hasHydratedForm, setHasHydratedForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
    contactNumber: "",
    latitude: "",
    longitude: "",
  });

  const hydrateForm = useCallback((profileUser) => {
    setFormData(createFormDataFromUser(profileUser));
    setIsDirty(false);
    setHasHydratedForm(true);
  }, []);

  useEffect(() => {
    setUserRef.current = setUser;
  }, [setUser]);

  useEffect(() => {
    if (user && !hasHydratedForm) {
      hydrateForm(user);
    }
  }, [user, hasHydratedForm, hydrateForm]);

  const loadProfile = useCallback(async () => {
    setIsFetchingProfile(true);
    setFetchError("");

    try {
      const data = await getMe();

      if (data?.user) {
        setUserRef.current(data.user);
        hydrateForm(data.user);
      } else {
        setFetchError("Profile data could not be loaded.");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      setFetchError(
        "Failed to load profile details. Please refresh and try again.",
      );
    } finally {
      setIsFetchingProfile(false);
    }
  }, [hydrateForm]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleLocationChange = useCallback((coords) => {
    setIsDirty(true);
    setFormData((prev) => ({
      ...prev,
      latitude: coords.latitude || "",
      longitude: coords.longitude || "",
      ...(coords.address && { address: coords.address }),
    }));
  }, []);

  const handleGeocode = useCallback(async () => {
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
          latitude: lat,
          longitude: lon,
        }));
        setIsDirty(true);

        toast.success("Location found on map!");
      } else {
        toast.error(
          "Could not find location for this address. Please try a more specific address or select manually on map.",
        );
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      toast.error("Error searching for location");
    } finally {
      setIsGeocoding(false);
    }
  }, [formData.address]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setIsLoading(true);

      try {
        const payload = {
          name: formData.name,
          address: formData.address,
          contactNumber: formData.contactNumber,
          location: {
            type: "Point",
            coordinates: [
              Number(formData.longitude) || 0,
              Number(formData.latitude) || 0,
            ],
          },
        };

        const result = await updateMe(payload);
        const updatedProfile = result?.user;

        if (!updatedProfile) {
          throw new Error("Profile update response was empty.");
        }

        const updatedUser = { ...user, ...updatedProfile };

        setUser(updatedUser);
        hydrateForm(updatedUser);
        toast.success("Profile updated successfully!");
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Failed to update profile",
        );
      } finally {
        setIsLoading(false);
      }
    },
    [formData, hydrateForm, setUser, user],
  );

  return (
    <div className="mx-auto w-full max-w-6xl">
      <SectionCard className="overflow-hidden rounded-[2rem] border-slate-200 bg-white/95 backdrop-blur-sm">
        <div className="p-5 sm:p-8 lg:p-10">
          {isFetchingProfile ? (
            <ProfileSkeleton />
          ) : (
            <div className="space-y-8">
              <SectionHeader
                icon={<User size={28} />}
                title="Account Information"
                description="Manage your profile details and location without affecting your current account behavior."
              />

              {fetchError ? (
                <InfoBox
                  tone="error"
                  icon={<AlertCircle size={18} />}
                  title="Profile loading issue"
                  description={fetchError}
                />
              ) : null}

              {!user && !fetchError ? (
                <InfoBox
                  icon={<Info size={18} />}
                  title="No profile data available"
                  description="We could not find profile details to display right now."
                />
              ) : null}

              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Input
                    label="Full Name / Organization Name"
                    name="name"
                    placeholder="e.g. Green Earth Restaurant"
                    value={formData.name}
                    onChange={handleChange}
                    icon={<User size={18} />}
                    required
                  />

                  <ReadOnlyField
                    label="Email Address (Read-only)"
                    value={formData.email}
                    icon={<Mail size={18} />}
                  />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <Input
                    label="Contact Number"
                    name="contactNumber"
                    placeholder="e.g. +1 234 567 890"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    icon={<Phone size={18} />}
                    required
                  />

                  <div className="relative">
                    <Input
                      label="Pickup Address"
                      name="address"
                      placeholder="123 Harmony St, Community City"
                      value={formData.address}
                      onChange={handleChange}
                      icon={<MapPin size={18} />}
                      required
                    />

                    <button
                      type="button"
                      onClick={handleGeocode}
                      disabled={isGeocoding}
                      title="Find on Map"
                      className="absolute bottom-2 right-2 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md transition duration-200 hover:scale-[1.03] hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      {isGeocoding ? (
                        <Loader2 size={18} className="animate-spin" />
                      ) : (
                        <Search size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <SectionCard className="rounded-[1.75rem] border-slate-200 bg-slate-50/70">
                  <div className="space-y-4 p-4 sm:p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                        <MapPin size={18} />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                          Map Location
                        </h3>
                        <p className="text-sm text-slate-500">
                          Pick your exact location or search it from the
                          address.
                        </p>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white">
                      <LocationPicker
                        lat={formData.latitude}
                        lng={formData.longitude}
                        onChange={handleLocationChange}
                      />
                    </div>
                  </div>
                </SectionCard>

                <div className="space-y-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                      <Globe size={18} />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 sm:text-lg">
                        Geographical Location
                      </h3>
                      <p className="text-sm text-slate-500">
                        These coordinates are optional but useful for accurate
                        location matching.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                    <Input
                      label="Latitude"
                      name="latitude"
                      type="number"
                      step="any"
                      placeholder="e.g. 12.9716"
                      value={formData.latitude}
                      onChange={handleChange}
                      icon={<Info size={18} />}
                    />

                    <Input
                      label="Longitude"
                      name="longitude"
                      type="number"
                      step="any"
                      placeholder="e.g. 77.5946"
                      value={formData.longitude}
                      onChange={handleChange}
                      icon={<Info size={18} />}
                    />
                  </div>

                  <p className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs leading-6 text-slate-500 sm:text-sm">
                    Precise coordinates help nearby restaurants and food banks
                    identify your location more accurately.
                  </p>
                </div>

                <div className="flex flex-col gap-4 border-t border-slate-200 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-slate-500">
                    {isDirty
                      ? "You have unsaved changes."
                      : "Review your changes before saving."}
                  </div>

                  <Button
                    className="inline-flex w-full items-center justify-center gap-3 rounded-2xl px-6 py-3 font-semibold shadow-lg shadow-emerald-200/60 transition duration-200 hover:-translate-y-0.5 sm:w-auto"
                    disabled={isLoading}
                    type="submit"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="animate-spin" size={18} />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save size={18} />
                        <span>Update Profile</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>

              <div className="pt-2">
                <AccountSecurityPanel />
              </div>
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  );
};

export default ProfileForm;
