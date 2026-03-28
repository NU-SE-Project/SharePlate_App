import React from 'react';
import { Heart } from 'lucide-react';

const RestaurantFooter = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-16">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Heart className="text-emerald-500" fill="currentColor" size={24} />
            <span className="text-xl font-bold text-white tracking-tight">SharePlate<span className="text-emerald-500">.Resto</span></span>
          </div>
          <p className="text-sm leading-relaxed text-slate-400">
            Empowering restaurants to reduce food waste and support local food banks. Together, let's feed the hungry.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Features</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Direct Donation</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Manage Donated Foods</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Food Bank Requests</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Analytics Dashboard</a></li>
          </ul>
        </div>

        <div>
           <h4 className="text-white font-bold mb-6">Support</h4>
          <ul className="space-y-4 text-sm">
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-emerald-500 transition-colors">Contact Us</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">Social</h4>
          <div className="flex gap-4">
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04 4.28 4.28 0 0 0-7.29 3.9A12.15 12.15 0 0 1 3.15 4.6a4.28 4.28 0 0 0 1.32 5.71 4.22 4.22 0 0 1-1.94-.54v.05a4.28 4.28 0 0 0 3.43 4.2 4.3 4.3 0 0 1-1.93.07 4.29 4.29 0 0 0 4 2.98A8.6 8.6 0 0 1 2 19.54a12.14 12.14 0 0 0 6.57 1.93c7.88 0 12.2-6.53 12.2-12.2 0-.19-.01-.39-.02-.58A8.7 8.7 0 0 0 22.46 6z" />
              </svg>
            </a>
            <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M22 12a10 10 0 1 0-11.5 9.9v-7H8v-3h2.5V9.5c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12H20l-.5 3h-2.4v7A10 10 0 0 0 22 12z" />
              </svg>
            </a>
             <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm5 6.5A4.5 4.5 0 1 0 16.5 13 4.5 4.5 0 0 0 12 8.5zm6.5-2.9a1.1 1.1 0 1 0 1.1 1.1 1.1 1.1 0 0 0-1.1-1.1zM12 10.5A1.5 1.5 0 1 1 10.5 12 1.5 1.5 0 0 1 12 10.5z" />
              </svg>
            </a>
             <a href="#" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-all duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 .5C5.73.5.77 5.46.77 11.73c0 4.88 3.16 9.02 7.55 10.49.55.1.75-.24.75-.53 0-.26-.01-1.12-.01-2.03-3.07.67-3.72-1.48-3.72-1.48-.5-1.28-1.22-1.62-1.22-1.62-.99-.68.08-.67.08-.67 1.09.08 1.66 1.12 1.66 1.12.97 1.66 2.55 1.18 3.17.9.1-.7.38-1.18.69-1.45-2.45-.28-5.02-1.22-5.02-5.43 0-1.2.43-2.18 1.13-2.95-.11-.28-.49-1.42.11-2.96 0 0 .92-.29 3.02 1.12.88-.25 1.82-.38 2.76-.38.94 0 1.88.13 2.76.38 2.1-1.41 3.02-1.12 3.02-1.12.6 1.54.22 2.68.11 2.96.7.77 1.13 1.75 1.13 2.95 0 4.22-2.58 5.15-5.04 5.42.39.34.74 1.01.74 2.04 0 1.47-.01 2.66-.01 3.02 0 .29.2.64.76.53 4.38-1.47 7.54-5.61 7.54-10.48C23.23 5.46 18.27.5 12 .5z" />
              </svg>
            </a>
          </div>
          <p className="mt-8 text-xs text-slate-500">
            © 2026 SharePlate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default RestaurantFooter;
