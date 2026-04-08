import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import {
  resetPassword,
  validateResetToken,
} from "../services/authService";

const ResetPasswordForm = ({ token }) => {
  const [status, setStatus] = useState("validating");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    let isMounted = true;

    const validateToken = async () => {
      if (!token) {
        if (isMounted) {
          setStatus("invalid");
          setError("Reset token is missing.");
        }
        return;
      }

      try {
        await validateResetToken(token);
        if (isMounted) {
          setStatus("ready");
        }
      } catch (validationError) {
        if (isMounted) {
          setStatus("invalid");
          setError(
            validationError.response?.data?.message ||
              "Reset link is invalid or expired.",
          );
        }
      }
    };

    validateToken();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.password) {
      setError("New password is required");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setStatus("submitting");
    setError("");

    try {
      const response = await resetPassword({
        token,
        password: formData.password,
      });
      setSuccessMessage(
        response?.message ||
          "Password reset successful. Please login with your new password.",
      );
      setStatus("success");
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to reset password with this link.",
      );
      setStatus("ready");
    }
  };

  if (status === "validating") {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-8 text-center shadow-sm">
        <Loader2 className="mx-auto mb-4 animate-spin text-emerald-600" size={32} />
        <p className="text-sm font-medium text-slate-500">
          Validating your reset link...
        </p>
      </div>
    );
  }

  if (status === "invalid") {
    return (
      <div className="space-y-6 rounded-3xl border border-red-100 bg-red-50 p-8">
        <div>
          <h3 className="text-xl font-bold text-red-700">Invalid reset link</h3>
          <p className="mt-2 text-sm text-red-600">{error}</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/auth/forgot-password"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
          >
            Request another link
          </Link>
          <Link
            to="/auth/login"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-200 px-5 py-3 font-semibold text-slate-600"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-6 rounded-3xl border border-emerald-100 bg-emerald-50 p-8">
        <div>
          <h3 className="text-xl font-bold text-emerald-700">
            Password updated
          </h3>
          <p className="mt-2 text-sm text-emerald-700">{successMessage}</p>
        </div>
        <Link
          to="/auth/login"
          className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 font-semibold text-white"
        >
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="relative">
        <Input
          label="New Password"
          name="password"
          type={showPassword ? "text" : "password"}
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter a secure password"
          error={error}
        />
        <button
          type="button"
          onClick={() => setShowPassword((current) => !current)}
          className="absolute right-4 top-[38px] cursor-pointer text-slate-400 hover:text-emerald-600"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <div className="relative">
        <Input
          label="Confirm Password"
          name="confirmPassword"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Re-enter your new password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword((current) => !current)}
          className="absolute right-4 top-[38px] cursor-pointer text-slate-400 hover:text-emerald-600"
        >
          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      <Button
        type="submit"
        className="w-full cursor-pointer py-4 text-lg font-bold"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? (
          <>
            <Loader2 className="mr-2 animate-spin" size={20} />
            Resetting Password...
          </>
        ) : (
          "Reset Password"
        )}
      </Button>

      <Link
        to="/auth/login"
        className="block cursor-pointer text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700"
      >
        Back to login
      </Link>
    </form>
  );
};

export default ResetPasswordForm;
