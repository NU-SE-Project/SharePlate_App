import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin } from 'lucide-react';

const FacebookIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 5.02 3.66 9.17 8.44 9.93v-7.03H8.1v-2.9h2.34V9.41c0-2.32 1.38-3.6 3.5-3.6.99 0 2.03.18 2.03.18v2.23h-1.14c-1.12 0-1.47.7-1.47 1.42v1.71h2.5l-.4 2.9h-2.1V22c4.78-.76 8.44-4.91 8.44-9.93z" fill="currentColor"/>
  </svg>
);

const TwitterIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 5.92c-.66.3-1.37.5-2.12.6a3.7 3.7 0 0 0 1.62-2.04 7.34 7.34 0 0 1-2.34.9 3.66 3.66 0 0 0-6.24 3.34A10.4 10.4 0 0 1 3.16 4.6a3.66 3.66 0 0 0 1.13 4.88 3.6 3.6 0 0 1-1.66-.46v.05a3.66 3.66 0 0 0 2.94 3.59c-.5.14-1.03.18-1.57.07a3.67 3.67 0 0 0 3.42 2.55A7.34 7.34 0 0 1 2 19.54a10.35 10.35 0 0 0 5.6 1.64c6.72 0 10.4-5.57 10.4-10.4v-.47A7.48 7.48 0 0 0 22 5.92z" fill="currentColor"/>
  </svg>
);

const InstagramIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
    <circle cx="12" cy="12" r="3.2" fill="currentColor" />
    <circle cx="17.5" cy="6.5" r="0.8" fill="currentColor" />
  </svg>
);

const GithubIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.22.09 1.86 1.26 1.86 1.26 1.08 1.85 2.84 1.32 3.53 1.01.11-.78.42-1.32.76-1.62-2.67-.3-5.48-1.34-5.48-5.96 0-1.32.47-2.4 1.25-3.25-.13-.3-.54-1.5.12-3.13 0 0 1.02-.33 3.34 1.24a11.5 11.5 0 0 1 6.08 0c2.32-1.57 3.34-1.24 3.34-1.24.66 1.63.25 2.83.12 3.13.78.85 1.25 1.93 1.25 3.25 0 4.63-2.82 5.66-5.5 5.96.43.37.82 1.1.82 2.22v3.29c0 .32.21.7.83.58A12 12 0 0 0 12 .5z" fill="currentColor"/>
  </svg>
);

const FoodBankFooter = () => {
  return (
    <footer className="pt-24 pb-12 bg-slate-50 relative overflow-hidden">
      {/* Decorative Orbs */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20 text-center md:text-left">
          {/* Brand Col */}
          <div className="flex flex-col items-center md:items-start space-y-6">
            <Link to="/foodbank/donated-food" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                <Heart size={24} fill="currentColor" />
              </div>
              <span className="text-2xl font-black text-slate-900 tracking-tight">
                Share<span className="text-emerald-600">Plate</span>
              </span>
            </Link>
            <p className="text-slate-500 font-medium max-w-xs leading-relaxed">
              Empowering communities to reduce food waste and feed the hungry through technology and kindness.
            </p>
            <div className="flex gap-4">
              {[FacebookIcon, TwitterIcon, InstagramIcon, GithubIcon].map((Icon, i) => (
                <button key={i} className="w-10 h-10 rounded-xl bg-white text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 shadow-sm border border-slate-100 transition-all duration-300">
                  <Icon size={18} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">Quick Links</h4>
            <div className="flex flex-col gap-4">
              {['Browse Donations', 'My Requests', 'Impact Map', 'Leaderboard'].map((link) => (
                <Link key={link} className="text-slate-500 hover:text-emerald-600 font-medium transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">Support</h4>
            <div className="flex flex-col gap-4">
              {['Help Center', 'Safety Guidelines', 'Privacy Policy', 'Terms of Service'].map((link) => (
                <Link key={link} className="text-slate-500 hover:text-emerald-600 font-medium transition-colors">
                  {link}
                </Link>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-6">
            <h4 className="text-lg font-bold text-slate-900 tracking-tight">Contact Us</h4>
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 justify-center md:justify-start group">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Mail size={18} />
                </div>
                <span className="text-slate-500 font-medium">support@shareplate.org</span>
              </div>
              <div className="flex items-center gap-3 justify-center md:justify-start group text-slate-500 hover:text-emerald-600 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-white text-emerald-600 flex items-center justify-center shadow-sm border border-slate-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Phone size={18} />
                </div>
                <span className="font-medium">+1 (234) 567-890</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-200 text-center">
          <p className="text-slate-400 text-sm font-medium">
            &copy; 2026 SharePlate App. All rights reserved. Together, we make a difference.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FoodBankFooter;
