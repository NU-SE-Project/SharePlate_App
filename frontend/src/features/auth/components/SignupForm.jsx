import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Loader2, ChevronRight, Search } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import Select from '../../../components/common/Select';
import { register } from '../services/authService';
import LocationPicker from '../../../components/common/LocationPicker';
import axios from 'axios';
import toast from 'react-hot-toast';

const SignupForm = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    contactNumber: '',
    role: 'restaurant',
    location: { type: 'Point', coordinates: [79.8612, 6.9271] }, // Default to Colombo
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);

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
      toast.error('Please enter an address first');
      return;
    }

    setIsGeocoding(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          formData.address
        )}&limit=1`
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
        toast.success('Location found on map!');
      } else {
        toast.error('Could not find location for this address.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      toast.error('Error searching for location');
    } finally {
      setIsGeocoding(false);
    }
  };

  const roles = [
    { value: 'restaurant', label: 'Restaurant / Hotel' },
    { value: 'foodbank', label: 'Food Bank / NGO' },
    { value: 'admin', label: 'Administrator' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validateStep1 = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = 'Full name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};
    if (!formData.address) newErrors.address = 'Detailed address is required';
    if (!formData.contactNumber) newErrors.contactNumber = 'Contact number is required';
    else if (!/^\+947[0-9]{8}$/.test(formData.contactNumber)) newErrors.contactNumber = 'Use format +947XXXXXXXX';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
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
      await register(submitData);
      navigate('/auth/login', { state: { message: 'Account created! Please log in.' } });
    } catch (error) {
      setErrors({ server: error.response?.data?.message || 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Steps Indicator */}
      <div className="flex items-center gap-2 mb-8">
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
        <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
      </div>

      <form onSubmit={step === 1 ? (e) => { e.preventDefault(); handleNext(); } : handleSubmit} className="space-y-5">
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
            />
            <Select
              label="Account Type"
              name="role"
              options={roles}
              value={formData.role}
              onChange={handleChange}
              error={errors.role}
            />
            <Button type="button" onClick={handleNext} className="w-full py-4 text-lg font-bold">
              Next Step <ChevronRight className="ml-2" size={20} />
            </Button>
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
                className="absolute right-2 bottom-2 p-2 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:bg-slate-300"
                title="Find on Map"
              >
                {isGeocoding ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
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
                {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Complete Registration'}
              </Button>
            </div>
          </>
        )}
      </form>

      <p className="text-center text-slate-600 text-sm">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-bold text-emerald-600 hover:text-emerald-700">
          Sign in here
        </Link>
      </p>
    </div>
  );
};

export default SignupForm;
