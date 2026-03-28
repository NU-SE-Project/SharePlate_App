import React from 'react';
import { Outlet } from 'react-router-dom';
import FoodBankHeader from './FoodBankHeader';
import FoodBankFooter from './FoodBankFooter';

const FoodBankLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Header occupies fixed height or stays fixed at top */}
      <FoodBankHeader />
      
      {/* Main Content Area */}
      <main className="flex-grow pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      {/* Footer */}
      <FoodBankFooter />
    </div>
  );
};

export default FoodBankLayout;
