import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Heart, PlusCircle, LayoutDashboard, UserCircle, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const RestaurantHeader = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  const navLinks = [
    { name: 'Dashboard', path: '/restaurant/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Donate Food', path: '/restaurant/donate', icon: <PlusCircle size={20} /> },
    { name: 'Requests', path: '/restaurant/requests', icon: <Bell size={20} /> },
    { name: 'Profile', path: '/restaurant/profile', icon: <UserCircle size={20} /> },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-emerald-50 shadow-sm backdrop-blur-md bg-white/95">
      <div className="container mx-auto px-6 h-20 flex items-center justify-between">
        <Link to="/restaurant/dashboard" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-105 transition-transform duration-200">
            <Heart className="text-white" fill="currentColor" size={24} />
          </div>
          <span className="text-xl font-bold text-slate-900 tracking-tight">SharePlate<span className="text-emerald-600">.Resto</span></span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`
                flex items-center gap-2 text-sm font-semibold transition-all duration-200 px-3 py-2 rounded-lg
                ${location.pathname === link.path 
                  ? 'text-emerald-600 bg-emerald-50' 
                  : 'text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50'
                }
              `}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          <button
            onClick={async () => {
              await auth.logout();
              navigate('/auth/login');
            }}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 hover:bg-emerald-50/50 transition-all duration-200 px-3 py-2 rounded-lg"
            title="Logout"
          >
            <LogOut size={18} />
            Logout
          </button>
        </nav>

        {/* Mobile menu toggle (simplified for now) */}
        <div className="md:hidden flex items-center gap-4">
          <Link to="/restaurant/profile" className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
             <UserCircle size={24} />
          </Link>
          <button
            onClick={async () => {
              await auth.logout();
              navigate('/auth/login');
            }}
            className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default RestaurantHeader;
