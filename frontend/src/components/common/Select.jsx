import React from 'react';
import { ChevronDown } from 'lucide-react';

const Select = ({ label, options, error, className = '', containerClassName = '', ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full px-4 py-3 rounded-xl border-2 appearance-none transition-all duration-200 outline-none
            placeholder:text-slate-400 text-slate-700 bg-white
            ${error 
              ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 bg-red-50/10' 
              : 'border-slate-100 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 shadow-sm'
            }
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
          <ChevronDown size={20} />
        </div>
      </div>
      {error && (
        <span className="text-xs font-medium text-red-500 ml-1 mt-0.5">
          {error}
        </span>
      )}
    </div>
  );
};

export default Select;
