import React from "react";
import AuthLayout from "../components/AuthLayout";
import SignupForm from "../components/SignupForm";

const SignupPage = () => {
  return (
    <AuthLayout
      title="Join SharePlate"
      subtitle="Join SharePlate to reduce food waste and deliver meals to those who need them most"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage;
