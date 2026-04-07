import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from 'lucide-react';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';
import { forgotPassword } from '../services/authService';

const ForgotPasswordForm = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Email address is required');
      return;
    }

    setStatus('loading');
    try {
      await forgotPassword(email);
      setStatus('success');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
      setStatus('idle');
    }
  };

  if (status === 'success') {
    return (
      <div className="text-center bg-emerald-50 p-8 rounded-2xl border-2 border-emerald-100 animate-in fade-in zoom-in duration-300">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="text-emerald-600" size={32} />
        </div>
        <h3 className="text-xl font-bold text-emerald-900 mb-2">Check your email</h3>
        <p className="text-emerald-700 mb-6">
          We've sent a password reset link to <span className="font-bold">{email}</span>.
        </p>
        <Link to="/auth/login" className="flex cursor-pointer items-center justify-center gap-2 text-emerald-600 font-bold hover:text-emerald-700">
          <ArrowLeft size={18} /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-slate-600 text-sm mb-4">
        Enter the email address associated with your account, and we'll send you a link to reset your password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          name="email"
          type="email"
          placeholder="john@example.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError('');
          }}
          error={error}
          icon={<Mail size={18} />}
        />

        <Button
          type="submit"
          className="w-full cursor-pointer py-4 text-lg font-bold"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 className="animate-spin mr-2" size={20} />
              Sending Link...
            </>
          ) : (
            'Send Reset Link'
          )}
        </Button>

        <Link to="/auth/login" className="flex cursor-pointer items-center justify-center gap-2 text-slate-500 font-medium hover:text-emerald-600 transition-colors">
          <ArrowLeft size={18} /> Back to Login
        </Link>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;
