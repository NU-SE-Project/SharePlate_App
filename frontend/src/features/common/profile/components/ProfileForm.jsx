import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Phone, Loader2, Save, Globe, Info } from 'lucide-react';
import Input from '../../../../components/common/Input';
import Button from '../../../../components/common/Button';
import { updateMe } from '../../../auth/services/authService';
import { useAuth } from '../../../../context/AuthContext';
import toast from 'react-hot-toast';

const ProfileForm = () => {
  const { user, setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    contactNumber: '',
    latitude: '',
    longitude: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        address: user.address || '',
        contactNumber: user.contactNumber || '',
        latitude: user.location?.coordinates?.[1]?.toString() || '',
        longitude: user.location?.coordinates?.[0]?.toString() || '',
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        contactNumber: formData.contactNumber,
        location: {
          type: 'Point',
          coordinates: [Number(formData.longitude) || 0, Number(formData.latitude) || 0],
        },
      };

      const result = await updateMe(payload);
      
      // Update local context and localStorage
      const updatedUser = { ...user, ...result.user };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/5 border border-emerald-50 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="p-10 md:p-14">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
            <User size={32} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Account Information</h2>
            <p className="text-slate-500 font-medium tracking-tight">Manage your details and community presence.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Full Name / Organization Name"
              name="name"
              placeholder="e.g. Green Earth Restaurant"
              value={formData.name}
              onChange={handleChange}
              icon={<User size={18} />}
              required
            />
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-700 ml-1">Email Address (Read-only)</label>
              <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 font-medium">
                <Mail size={18} />
                <span>{formData.email}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input
              label="Contact Number"
              name="contactNumber"
              placeholder="e.g. +1 234 567 890"
              value={formData.contactNumber}
              onChange={handleChange}
              icon={<Phone size={18} />}
              required
            />
            <Input
              label="Pickup Address"
              name="address"
              placeholder="123 Harmony St, Community City"
              value={formData.address}
              onChange={handleChange}
              icon={<MapPin size={18} />}
              required
            />
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-2">
               <Globe size={18} className="text-emerald-500" />
               <h3 className="text-lg font-bold text-slate-800">Geographical Location</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
            <p className="text-xs text-slate-400 px-2 italic font-medium leading-relaxed">
              * Precise coordinates help neighboring food banks and restaurants find you efficiently.
            </p>
          </div>

          <div className="pt-6 border-t border-slate-50">
            <Button
              className="w-full md:w-auto px-12 py-4 rounded-2xl font-black shadow-xl shadow-emerald-200 flex items-center justify-center gap-3 hover:-translate-y-1 transition-transform"
              disabled={isLoading}
              type="submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <>
                  <Save size={20} />
                  <span>Update Profile</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileForm;
