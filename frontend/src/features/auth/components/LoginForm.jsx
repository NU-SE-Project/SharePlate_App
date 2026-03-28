import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { login } from '../services/authService';
import { useAuth } from '../../../context/AuthContext';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email address';
    if (!formData.password) newErrors.password = 'Password is required';
    return newErrors;
  };

  const auth = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);
    try {
      const data = await auth.login(formData);
      const role = data?.user?.role || '';
      if (role === 'restaurant') navigate('/restaurant/dashboard');
      else if (role === 'foodbank') navigate('/foodbank/donated-food');
      else navigate('/dashboard');
    } catch (error) {
      setErrors({ server: error.response?.data?.message || 'Invalid email or password' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email Address"
        name="email"
        type="email"
        placeholder="john@example.com"
        value={formData.email}
        onChange={handleChange}
        error={errors.email}
      />

      <div className="relative">
        <Input
          label="Password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          placeholder="••••••••"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-[38px] text-slate-400 hover:text-emerald-600 transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="flex items-center justify-between ml-1">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
          <span className="text-sm text-slate-600">Remember me</span>
        </label>
        <Link to="/auth/forgot-password" name="forgot-password" id="forgot-password" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
          Forgot password?
        </Link>
      </div>

      {errors.server && (
        <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm font-medium border border-red-100 animate-shake">
          {errors.server}
        </div>
      )}

      <Button
        type="submit"
        className="w-full py-4 text-lg font-bold"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin mr-2" size={20} />
            Signing in...
          </>
        ) : (
          'Sign In'
        )}
      </Button>

      <p className="text-center text-slate-600 text-sm">
        Don't have an account?{' '}
        <Link to="/auth/signup" className="font-bold text-emerald-600 hover:text-emerald-700">
          Create one for free
        </Link>
      </p>
    </form>
  );
};

export default LoginForm;
