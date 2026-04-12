import React, { useState, useEffect } from "react";
import { 
  User, 
  Globe,
  Save,
  MapPin,
  Loader2,
  Phone,
  Mail
} from "lucide-react";
import toast from "react-hot-toast";
import { getDistanceSetting, updateDistanceSetting } from "../../services/settingsService";
import { getMyProfile, updateMyProfile } from "../../services/adminProfileService";
import ChangePasswordModal from "../components/ChangePasswordModal";
import LoadingState from "../../../../components/common/LoadingState";

const SettingsSection = ({ title, description, children, icon: Icon }) => (
  <div className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm">
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
        {React.createElement(Icon, { size: 24 })}
      </div>
      <div>
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">{description}</p>
      </div>
    </div>
    <div className="space-y-6">
      {children}
    </div>
  </div>
);

const SettingItem = ({ label, description, children }) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <p className="text-sm font-bold text-slate-900">{label}</p>
      <p className="text-xs text-slate-500">{description}</p>
    </div>
    <div className="min-w-[200px]">
      {children}
    </div>
  </div>
);

const Settings = () => {
  const [distance, setDistance] = useState(20);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    location: { type: "Point", coordinates: [0, 0] }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    loadAllSettings();
  }, []);

  const loadAllSettings = async () => {
    try {
      setIsLoading(true);
      const [distData, profileData] = await Promise.all([
        getDistanceSetting(),
        getMyProfile()
      ]);
      
      setDistance(distData.value);
      
      const admin = profileData.user;
      setProfile({
        name: admin.name || "",
        email: admin.email || "",
        contactNumber: admin.contactNumber || "",
        address: admin.address || "",
        location: admin.location || { type: "Point", coordinates: [0, 0] }
      });
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast.error("Failed to load some settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    // Validation
    if (distance < 5 || distance > 100) {
      toast.error("Distance must be between 5km and 100km");
      return;
    }

    if (!profile.name.trim()) return toast.error("Name is required");
    if (!profile.address.includes(",")) return toast.error("Address must contain a comma (e.g. Street, City)");
    if (!/^\+947[0-9]{8}$/.test(profile.contactNumber)) {
      return toast.error("Contact must be +947XXXXXXXX");
    }

    try {
      setIsSaving(true);
      
      // Submit both distance and profile
      await Promise.all([
        updateDistanceSetting(distance),
        updateMyProfile({
          name: profile.name,
          contactNumber: profile.contactNumber,
          address: profile.address,
          location: profile.location // Preserve existing location
        })
      ]);

      toast.success("Settings saved successfully");
    } catch (error) {
      console.error("Save failed:", error);
      toast.error(error.response?.data?.message || "Failed to update settings");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <LoadingState
        title="Loading settings"
        message="Please wait while we fetch your profile and platform preferences."
        minHeightClassName="min-h-[60vh]"
        panelClassName="border-0 bg-transparent shadow-none"
      />
    );
  }
  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <header>
        <h1 className="text-3xl font-black tracking-tight text-slate-900">Admin Settings</h1>
        <p className="mt-1 text-slate-500">Configure your administrative workspace and preferences.</p>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Profile Settings */}
        <SettingsSection 
          title="Profile Information" 
          description="Update your account details and public identity."
          icon={User}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  <User size={14} className="text-indigo-500" />
                  Full Name
                </label>
                <input 
                  type="text" 
                  name="name"
                  value={profile.name}
                  onChange={handleProfileChange}
                  placeholder="Admin Name"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium" 
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  <Mail size={14} className="text-indigo-500" />
                  Email Address
                </label>
                <input 
                  type="email" 
                  value={profile.email}
                  disabled
                  title="Email cannot be changed for security reasons"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-5 py-4 outline-none text-slate-500 cursor-not-allowed font-medium" 
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  <Phone size={14} className="text-indigo-500" />
                  Contact Number
                </label>
                <input 
                  type="text" 
                  name="contactNumber"
                  value={profile.contactNumber}
                  onChange={handleProfileChange}
                  placeholder="+947XXXXXXXX"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium" 
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                  <MapPin size={14} className="text-indigo-500" />
                  Office Address
                </label>
                <input 
                  type="text" 
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  placeholder="123 Admin Lane, City"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500/50 transition-all font-medium" 
                />
              </div>
            </div>
            
          </div>
        </SettingsSection>


        {/* Platform Config */}
        <SettingsSection 
          title="Platform Configuration" 
          description="Global settings for the SharePlate platform."
          icon={Globe}
        >
          <SettingItem 
            label="Maximum Visibility Distance (KM)" 
            description="Control how far restaurants and foodbanks can see each other (5-100km)."
          >
            <div className="flex items-center gap-3">
              <input 
                type="number" 
                value={distance}
                onChange={(e) => setDistance(Number(e.target.value))}
                min="5"
                max="100"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-emerald-500/20" 
              />
              <span className="text-sm font-bold text-slate-400">KM</span>
            </div>
          </SettingItem>

          <div className="pt-4 border-t border-slate-100">
            <SettingItem label="Account Security" description="Update your password to keep your account safe.">
               <button 
                 onClick={() => setIsPasswordModalOpen(true)}
                 className="text-xs font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-4 py-2 rounded-lg transition-all"
               >
                 Change Password
               </button>
            </SettingItem>
          </div>
          {/* <SettingItem label="Maintenance Mode" description="Disable public access for maintenance.">
             <div className="h-6 w-11 rounded-full bg-slate-200 relative cursor-not-allowed">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
             </div>
          </SettingItem> */}
        </SettingsSection>

      </div>

      <div className="flex justify-end pt-6">
        <button 
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 rounded-[1.5rem] bg-slate-900 px-8 py-4 font-bold text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 hover:bg-slate-800 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Save size={20} />
          )}
          {isSaving ? "Saving..." : "Save Changes"}
        </button>
      </div>
      <ChangePasswordModal 
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
      />
    </div>
  );
};

export default Settings;
