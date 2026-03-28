import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RequireAuth = ({ children, roles } = {}) => {
  const auth = useAuth();
  const location = useLocation();

  // Quick check: prefer context, but fall back to localStorage to avoid flash on initial load
  const stored = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch (e) {
      return null;
    }
  })();

  const hasStored = !!(localStorage.getItem('accessToken') || stored || localStorage.getItem('restaurantId'));

  const effectiveUser = auth.user || stored || null;
  const role = effectiveUser?.role || null;

  // Not authenticated
  if (!(auth.isAuthenticated || hasStored)) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // If roles are specified, enforce role membership
  if (roles && Array.isArray(roles) && roles.length > 0) {
    if (!role || !roles.includes(role)) {
      // If authenticated but wrong role, redirect to login
      return <Navigate to="/auth/login" state={{ from: location }} replace />;
    }
  }

  return children;
};

export default RequireAuth;
