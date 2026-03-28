import React from 'react';

const Input = ({ label, error, className = '', containerClassName = '', type = 'text', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={type}
          className={`
            w-full px-4 py-3 rounded-xl border-2 transition-all duration-200 outline-none
            placeholder:text-slate-400 text-slate-700
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 bg-red-50/10' 
              : 'border-slate-100 focus:border-emerald-500 bg-white focus:ring-4 focus:ring-emerald-50 shadow-sm'
            }
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <span className="text-xs font-medium text-red-500 ml-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};

export default Input;
