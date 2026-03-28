import React from 'react';
import AuthLayout from '../components/AuthLayout';
import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <AuthLayout 
      title="Welcome Back" 
      subtitle="Enter your details to access your account"
    >
      <LoginForm />
    </AuthLayout>
  );
};

export default LoginPage;
