import React from "react";
import AuthLayout from "../components/AuthLayout";
import ResendVerificationForm from "../components/ResendVerificationForm";

const ResendVerificationPage = () => {
  return (
    <AuthLayout
      title="Resend Verification Link"
      subtitle="Request a new email verification link for your SharePlate account."
    >
      <ResendVerificationForm />
    </AuthLayout>
  );
};

export default ResendVerificationPage;
