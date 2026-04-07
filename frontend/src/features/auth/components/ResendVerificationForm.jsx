import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Loader2, RotateCcw } from "lucide-react";
import Input from "../../../components/common/Input";
import Button from "../../../components/common/Button";
import { resendVerification } from "../services/authService";

const ResendVerificationForm = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setError("Email address is required");
      return;
    }

    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await resendVerification(email.trim());
      setSuccessMessage(
        response?.message || "Verification email sent if the account exists.",
      );
    } catch (requestError) {
      setError(
        requestError.response?.data?.message ||
          "Unable to resend verification email.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-slate-600">
        Enter your account email address to receive a fresh verification link.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Email Address"
          name="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="john@example.com"
          error={error}
        />

        {successMessage ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
            {successMessage}
          </div>
        ) : null}

        <Button
          type="submit"
          className="w-full py-4 text-lg font-bold"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={20} />
              Sending...
            </>
          ) : (
            <>
              <RotateCcw className="mr-2" size={18} />
              Resend Verification Email
            </>
          )}
        </Button>
      </form>

      <Link
        to="/auth/login"
        className="block text-center text-sm font-semibold text-emerald-600 hover:text-emerald-700"
      >
        Back to login
      </Link>
    </div>
  );
};

export default ResendVerificationForm;
