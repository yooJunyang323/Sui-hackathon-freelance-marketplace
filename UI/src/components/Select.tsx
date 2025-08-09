import React from 'react';

interface SelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  options,
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
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="
          w-full px-4 py-3 rounded-xl
          backdrop-blur-md bg-black/30 
          border border-purple-400/25
          text-purple-100
          focus:outline-none focus:ring-2 focus:ring-purple-400/60 focus:border-purple-400/60
          transition-all duration-300
          hover:border-purple-400/40
        "
        style={{
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <option value="" className="bg-gray-900">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-gray-900">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};
