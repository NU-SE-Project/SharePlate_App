import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, User, LogOut, Menu, X, Heart } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

const FoodBankHeader = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Browse Food', path: '/foodbank/donated-food' },
    { name: 'Broadcast Need', path: '/foodbank/post-request' },
    { name: 'My Broadcasts', path: '/foodbank/my-proactive-requests' },
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? 'py-3' : 'py-5'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className={`relative flex items-center justify-between transition-all duration-500 px-6 py-3 rounded-[2rem] border backdrop-blur-xl ${isScrolled ? 'bg-white/80 shadow-xl shadow-emerald-900/5 border-emerald-50' : 'bg-white/40 border-white/40 shadow-none'}`}>
          <Link to="/foodbank/donated-food" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-200 group-hover:rotate-6 transition-transform duration-300">
              <Heart size={20} fill="currentColor" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">
              Share<span className="text-emerald-600">Plate</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={`text-sm font-bold transition-all duration-300 hover:text-emerald-600 ${location.pathname === link.path ? 'text-emerald-600 flex flex-col items-center' : 'text-slate-600'}`}
              >
                {link.name}
                {location.pathname === link.path && <div className="w-1 h-1 bg-emerald-600 rounded-full mt-1" />}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all duration-300 relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
            </button>
            <div className="h-6 w-[1px] bg-slate-200 mx-2" />
            <Link to="/foodbank/profile" className="flex items-center gap-3 pl-2 pr-4 py-2 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all duration-300 group">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-sm">
                {auth.user?.name?.slice(0, 2)?.toUpperCase() || 'FB'}
              </div>
              <span className="text-sm font-bold text-slate-700">Profile</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await auth.logout();
                navigate('/auth/login');
              }}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all duration-300"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </div>

          <button
            className="md:hidden w-10 h-10 rounded-xl flex items-center justify-center text-slate-600 bg-slate-50 border border-slate-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>
      </div>

      <div className={`md:hidden absolute top-full left-0 right-0 mt-2 px-4 transition-all duration-300 transform ${isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`text-lg font-bold p-3 rounded-2xl transition-all ${location.pathname === link.path ? 'bg-emerald-50 text-emerald-600' : 'text-slate-600'}`}
            >
              {link.name}
            </Link>
          ))}
          <div className="h-[1px] bg-slate-100 my-2" />
          <Link
            to="/foodbank/profile"
            onClick={() => setIsMobileMenuOpen(false)}
            className="flex items-center gap-3 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-all font-bold"
          >
            <User size={20} />
            Profile
          </Link>
          <button
            type="button"
            className="flex items-center gap-3 p-3 rounded-2xl text-red-600 hover:bg-red-50 transition-all"
            onClick={async () => {
              await auth.logout();
              navigate('/auth/login');
            }}
          >
            <LogOut size={20} />
            <span className="font-bold">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default FoodBankHeader;
