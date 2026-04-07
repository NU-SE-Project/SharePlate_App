import React from "react";
import { useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout";
import ResetPasswordForm from "../components/ResetPasswordForm";

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  return (
    <AuthLayout
      title="Reset Your Password"
      subtitle="We’ll validate the reset link and let you choose a new password."
    >
      <ResetPasswordForm token={token} />
    </AuthLayout>
  );
};

export default ResetPasswordPage;
