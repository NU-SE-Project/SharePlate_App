import React from 'react';
import AuthLayout from '../components/AuthLayout';
import SignupForm from '../components/SignupForm';

const SignupPage = () => {
  return (
    <AuthLayout 
      title="Create an Account" 
      subtitle="Help us make a difference by joining the SharePlate network"
    >
      <SignupForm />
    </AuthLayout>
  );
};

export default SignupPage;
