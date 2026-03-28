import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';

const UserDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">Welcome, {user?.name || 'User'}</h1>
      <p className="mb-6 text-slate-600">Role: <strong className="capitalize">{user?.role}</strong></p>

      {user?.role === 'restaurant' ? (
        <Link to="/restaurant/dashboard" className="text-emerald-600 font-bold">Go to Restaurant Dashboard →</Link>
      ) : user?.role === 'foodbank' ? (
        <div>
          <p className="mb-3">Foodbank features coming soon — for now browse requests:</p>
          <Link to="/restaurant/requests" className="text-emerald-600 font-bold">Browse Requests →</Link>
        </div>
      ) : (
        <p>Account dashboard is under construction.</p>
      )}
    </div>
  );
};

export default UserDashboard;
