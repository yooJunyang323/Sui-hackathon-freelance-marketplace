import React from 'react';

interface InputProps {
  label?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = ''
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-purple-200/90">
          {label} {required && <span className="text-pink-400">*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="
          w-full px-4 py-3 rounded-xl
          backdrop-blur-md bg-black/30 
          border border-purple-400/25
          text-purple-100 placeholder-purple-300/40
          focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-purple-400/60
          transition-all duration-300
          hover:border-purple-400/40
        "
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      />
    </div>
  );
};
