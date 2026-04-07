import React from "react";
import { useLocation } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import LoginForm from "../components/LoginForm";

const LoginPage = () => {
  const location = useLocation();
  const message = location.state?.message || "";

  return (
    <AuthLayout
      title="Welcome Back To SharePlate"
      subtitle="Enter your details to access your account"
    >
      {message ? (
        <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {message}
        </div>
      ) : null}
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
