import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const AdminLayout = () => {
  return (
    <div className="flex min-h-screen bg-slate-50/50 text-slate-900">
      {/* Sidebar - Fixed on desktop, collapsible on mobile */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 transition-all duration-300 lg:pl-72">
        <div className="mx-auto max-w-[1600px] px-4 pt-24 pb-8 sm:px-8 lg:pt-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
