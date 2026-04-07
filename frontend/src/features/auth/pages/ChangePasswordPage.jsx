import React from "react";
import AuthLayout from "../components/AuthLayout";
import ChangePasswordForm from "../components/ChangePasswordForm";

const ChangePasswordPage = () => {
  return (
    <AuthLayout
      title="Change Password"
      subtitle="Update your password while keeping your session aligned with the backend account."
    >
      <ChangePasswordForm />
    </AuthLayout>
  );
};

export default ChangePasswordPage;
