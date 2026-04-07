import React, { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { useAuth } from "../../../context/AuthContext";

const ChangePasswordForm = () => {
  const auth = useAuth();
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const togglePassword = (field) => {
    setShowPassword((current) => ({
      ...current,
      [field]: !current[field],
    }));
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
    setError("");
    setSuccessMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.currentPassword || !formData.newPassword) {
      setError("Current and new password are required.");
      return;
    }

    if (formData.newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await auth.changePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccessMessage(
        response?.message || "Password changed successfully.",
      );
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to change password right now.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const passwordFields = [
    {
      name: "currentPassword",
      label: "Current Password",
      placeholder: "Enter your current password",
    },
    {
      name: "newPassword",
      label: "New Password",
      placeholder: "Enter a new password",
    },
    {
      name: "confirmPassword",
      label: "Confirm New Password",
      placeholder: "Re-enter your new password",
    },
  ];

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Update your password for this account. Your current session remains
        active unless you also choose to log out all devices.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {passwordFields.map((field) => (
          <div key={field.name} className="relative">
            <Input
              label={field.label}
              name={field.name}
              type={showPassword[field.name] ? "text" : "password"}
              value={formData[field.name]}
              onChange={handleChange}
              placeholder={field.placeholder}
              error={field.name === "currentPassword" ? error : ""}
            />
            <button
              type="button"
              onClick={() => togglePassword(field.name)}
              className="absolute right-4 top-[38px] cursor-pointer text-slate-400 hover:text-emerald-600"
            >
              {showPassword[field.name] ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        ))}

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full cursor-pointer py-4 text-lg font-bold"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={20} />
              Updating Password...
            </>
          ) : (
            "Change Password"
          )}
        </Button>
      </form>
    </div>
  );
};

export default ChangePasswordForm;
