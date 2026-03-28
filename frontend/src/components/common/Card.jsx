import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div 
      className={`
        bg-white rounded-2xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] 
        border border-slate-100 backdrop-blur-sm bg-white/95 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
