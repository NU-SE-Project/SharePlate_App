import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  ChevronDown, 
  ChevronRight, 
  LogOut, 
  Menu, 
  X,
  Store,
  Building2,
  ShieldCheck
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import toast from "react-hot-toast";
import sharePlateLogo from "../../../assets/SharePlate_OffcialLogo.png";

const SidebarItem = ({ icon: Icon, label, to, isActive, onClick, children, hasDropdown, isOpen }) => {
  return (
    <div className="w-full">
      <Link
        to={to || "#"}
        onClick={onClick}
        className={`group flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
          isActive 
            ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" 
            : "text-slate-600 hover:bg-slate-100 hover:text-emerald-600"
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={20} className={`${isActive ? "text-white" : "group-hover:text-emerald-600"}`} />
          <span>{label}</span>
        </div>
        {hasDropdown && (
          <div className="transition-transform duration-200">
            {isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </div>
        )}
      </Link>
      {hasDropdown && isOpen && (
        <div className="mt-1 ml-4 flex flex-col gap-1 border-l-2 border-slate-100 pl-4 animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
};

const SubItem = ({ label, to, isActive }) => (
  <Link
    to={to}
    className={`rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActive 
        ? "text-emerald-600 bg-emerald-50 font-bold" 
        : "text-slate-500 hover:text-emerald-600 hover:bg-slate-50"
    }`}
  >
    {label}
  </Link>
);

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isUsersOpen, setIsUsersOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    // Keep dropdown open if we are on a sub-route
    if (
      location.pathname.includes("/admin/foodbanks") || 
      location.pathname.includes("/admin/restaurants") ||
      location.pathname.includes("/admin/users")
    ) {
      setIsUsersOpen(true);
    }
  }, [location.pathname]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/auth/login");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      to: "/admin/dashboard",
      isActive: location.pathname === "/admin/dashboard"
    },
    {
      icon: Users,
      label: "User Management",
      hasDropdown: true,
      isOpen: isUsersOpen,
      onClick: (e) => {
        e.preventDefault();
        setIsUsersOpen(!isUsersOpen);
      },
      children: (
        <>
          <SubItem 
            label="All Users" 
            to="/admin/users" 
            isActive={location.pathname === "/admin/users"} 
          />
          <SubItem 
            label="Food Banks" 
            to="/admin/foodbanks" 
            isActive={location.pathname === "/admin/foodbanks"} 
          />
          <SubItem 
            label="Restaurants" 
            to="/admin/restaurants" 
            isActive={location.pathname === "/admin/restaurants"} 
          />
        </>
      )
    },
    {
      icon: Settings,
      label: "Admin Settings",
      to: "/admin/settings",
      isActive: location.pathname === "/admin/settings"
    }
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="fixed top-4 left-4 z-[60] flex h-10 w-10 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 shadow-sm lg:hidden hover:bg-slate-50 transition-all duration-200"
      >
        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Backdrop for mobile */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-[50] bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside className={`fixed left-0 top-0 z-[55] h-screen w-72 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="flex h-full flex-col p-6">
          {/* Brand */}
          <Link to="/admin/dashboard" className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-100 text-emerald-600 shadow-sm overflow-hidden">
               <img src={sharePlateLogo} alt="Logo" className="h-full w-full object-cover" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">SharePlate</h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Admin Panel</span>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {menuItems.map((item, index) => (
              <SidebarItem key={index} {...item} />
            ))}
          </nav>

          {/* User Profile Summary */}
          <div className="mt-auto border-t border-slate-100 pt-6">
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-slate-50 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <ShieldCheck size={20} />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{user?.name || "Admin"}</p>
                <p className="truncate text-xs text-slate-500">{user?.email}</p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-rose-600 transition-all duration-200 hover:bg-rose-50"
            >
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
