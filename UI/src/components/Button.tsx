import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const baseClasses = `
    px-6 py-3 rounded-xl font-medium transition-all duration-300
    backdrop-blur-md border shadow-lg
    disabled:opacity-50 disabled:cursor-not-allowed
    hover:shadow-xl transform hover:-translate-y-0.5
    relative overflow-hidden
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-purple-600/40 to-pink-600/40 
      border-purple-400/50 text-purple-100 
      hover:from-purple-600/50 hover:to-pink-600/50
      hover:shadow-purple-500/25
    `,
    secondary: `
      bg-gradient-to-r from-gray-600/40 to-slate-600/40 
      border-gray-400/50 text-gray-100 
      hover:from-gray-600/50 hover:to-slate-600/50
      hover:shadow-gray-500/25
    `,
    danger: `
      bg-gradient-to-r from-red-600/40 to-pink-600/40 
      border-red-400/50 text-red-100 
      hover:from-red-600/50 hover:to-pink-600/50
      hover:shadow-red-500/25
    `,
    success: `
      bg-gradient-to-r from-green-600/40 to-emerald-600/40 
      border-green-400/50 text-green-100 
      hover:from-green-600/50 hover:to-emerald-600/50
      hover:shadow-green-500/25
    `
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      <span className="relative z-10">{children}</span>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 transform translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-700"></div>
    </button>
  );
};
