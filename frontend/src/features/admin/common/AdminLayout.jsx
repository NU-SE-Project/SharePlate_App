import React from "react";
import { Outlet } from "react-router-dom";
import AdminHeader from "./AdminHeader";

const AdminLayout = () => {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(15,23,42,0.07),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.1),_transparent_24%),linear-gradient(180deg,_#f8fafc_0%,_#ffffff_34%,_#f0fdf4_100%)] text-slate-900">
      <AdminHeader />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
