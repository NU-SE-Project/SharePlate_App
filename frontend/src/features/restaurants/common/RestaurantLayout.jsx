import React from 'react';
import { Outlet } from 'react-router-dom';
import RestaurantHeader from './RestaurantHeader';
import RestaurantFooter from './RestaurantFooter';

const RestaurantLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header */}
      <RestaurantHeader />

      {/* Main Content Area */}
      <main className="flex-grow">
        <div className="container mx-auto px-6 py-12">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <RestaurantFooter />
    </div>
  );
};

export default RestaurantLayout;
