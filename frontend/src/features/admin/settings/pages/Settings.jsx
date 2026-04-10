import React from "react";
import { 
  User, 
  Lock, 
  Bell, 
  Shield, 
  Database, 
  Globe,
  Save
} from "lucide-react";

const SettingsSection = ({ title, description, children, icon: Icon }) => (
  <div className="rounded-[2.5rem] border border-slate-200/60 bg-white p-8 shadow-sm">
    <div className="mb-6 flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-600">
        <Icon size={24} />
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
          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Full Name</label>
              <input type="text" defaultValue="Admin User" className="mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-slate-500">Email Address</label>
              <input type="email" defaultValue="admin@shareplate.com" className="mt-0.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>
        </SettingsSection>

        {/* Security Settings */}
        <SettingsSection 
          title="Security & Access" 
          description="Manage your password and dual-factor authentication."
          icon={Lock}
        >
          <SettingItem label="Two-Factor Auth" description="Enable SMS or App based verification.">
            <div className="flex justify-end">
               <button className="rounded-lg bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-600 hover:bg-emerald-100 transition-colors">Enable</button>
            </div>
          </SettingItem>
          <SettingItem label="Password Last Changed" description="Last updated 3 months ago.">
             <button className="text-xs font-bold text-emerald-600 hover:underline">Change Password</button>
          </SettingItem>
        </SettingsSection>

        {/* Platform Config */}
        <SettingsSection 
          title="Platform Configuration" 
          description="Global settings for the SharePlate platform."
          icon={Globe}
        >
          <SettingItem label="Maintenance Mode" description="Disable public access for maintenance.">
             <div className="h-6 w-11 rounded-full bg-slate-200 relative cursor-not-allowed">
                <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-sm" />
             </div>
          </SettingItem>
          <SettingItem label="Default Language" description="Primary language for the interface.">
             <select className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option>English (US)</option>
                <option>Spanish</option>
             </select>
          </SettingItem>
        </SettingsSection>

        {/* Data Management */}
        <SettingsSection 
          title="Data Management" 
          description="Manage logs and database backups."
          icon={Database}
        >
          <div className="flex flex-wrap gap-3 mt-2">
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
               Audit Logs
            </button>
            <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">
               Export Database
            </button>
          </div>
        </SettingsSection>
      </div>

      <div className="flex justify-end pt-6">
        <button className="flex items-center gap-2 rounded-[1.5rem] bg-slate-900 px-8 py-4 font-bold text-white shadow-xl shadow-slate-200 transition-all hover:-translate-y-1 hover:bg-slate-800 active:translate-y-0">
           <Save size={20} />
           Save Changes
        </button>
      </div>
    </div>
  );
};

export default Settings;
