import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X, Check } from 'lucide-react';

/**
 * A searchable dropdown component (Combobox)
 * @param {string} label - The label for the component
 * @param {Array} options - Array of { value, label } objects
 * @param {string} value - The current selected value
 * @param {function} onChange - Callback when value changes (receives { target: { name, value } })
 * @param {string} name - The name of the field for the onChange event
 * @param {string} placeholder - Placeholder for the search input
 * @param {string} error - Error message to display
 * @param {string} containerClassName - Custom class for the wrapper
 */
const Combobox = ({ 
  label, 
  options = [], 
  value, 
  onChange, 
  name, 
  placeholder = "Search...", 
  error, 
  containerClassName = "" 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Find the label of the currently selected option
  const selectedOption = options.find(opt => opt.value === value);

  // Filter options based on search term
  const filteredOptions = options.filter(option => 
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Clear search and focus when opening
  useEffect(() => {
    if (isOpen) {
      setSearchTerm("");
      if (inputRef.current) inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (option) => {
    if (onChange) {
      onChange({ target: { name, value: option.value } });
    }
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`flex flex-col gap-1.5 w-full relative ${containerClassName}`} ref={containerRef}>
      {label && (
        <label className="text-sm font-semibold text-slate-700 ml-1">
          {label}
        </label>
      )}

      {/* Main Display Area */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-3 md:py-3.5 rounded-xl md:rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all duration-200
          ${isOpen ? 'border-indigo-500 ring-4 ring-indigo-50 bg-white' : 'border-slate-100 bg-white shadow-sm hover:border-slate-200'}
          ${error ? 'border-red-400 bg-red-50/10' : ''}
        `}
      >
        <span className={`truncate text-sm md:text-base ${!selectedOption ? 'text-slate-400' : 'text-slate-700 font-bold'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown 
          size={18} 
          className={`text-slate-400 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-[calc(100%+8px)] left-0 w-full bg-white rounded-2xl md:rounded-[1.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 z-[100] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          {/* Search Input In-Menu */}
          <div className="p-3 md:p-4 border-b border-slate-50 relative bg-slate-50/50">
            <Search size={16} className="absolute left-7 md:left-8 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Start typing to filter..."
              className="w-full pl-10 md:pl-12 pr-4 py-2.5 md:py-3 bg-white border border-slate-100 rounded-xl text-sm outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-slate-700 font-bold placeholder:text-slate-300 placeholder:font-medium"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleSelect(option)}
                  className={`
                    px-4 py-3 rounded-lg text-sm cursor-pointer flex items-center justify-between transition-colors
                    ${value === option.value ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}
                  `}
                >
                  <span className="truncate">{option.label}</span>
                  {value === option.value && <Check size={16} />}
                </div>
              ))
            ) : (
              <div className="px-4 py-8 text-center">
                <p className="text-sm text-slate-400 font-medium italic">No results found for "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <span className="text-xs font-medium text-red-500 ml-1 mt-0.5">
          {error}
        </span>
      )}

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default Combobox;
