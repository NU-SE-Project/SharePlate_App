import React from "react";
import { Outlet } from "react-router-dom";
import FoodBankHeader from "./FoodBankHeader";
import FoodBankFooter from "./FoodBankFooter";

const FoodBankLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <FoodBankHeader />

      <main className="flex-grow">
        <div className="container mx-auto px-6 py-12">
          <Outlet />
        </div>
      </main>

      <FoodBankFooter />
    </div>
  );
};

export default FoodBankLayout;
