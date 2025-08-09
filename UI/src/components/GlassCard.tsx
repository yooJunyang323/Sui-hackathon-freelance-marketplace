import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className = '', 
  hover = false 
}) => {
  return (
    <div 
      className={`
        backdrop-blur-md bg-black/30 
        border border-purple-400/20 
        rounded-2xl shadow-2xl shadow-purple-900/20
        ${hover ? 'hover:bg-black/40 hover:border-purple-400/30 hover:shadow-purple-900/30 transition-all duration-300' : ''}
        ${className}
      `}
      style={{
        backdropFilter: 'blur(15px)',
        WebkitBackdropFilter: 'blur(15px)',
        boxShadow: '0 8px 32px rgba(147, 51, 234, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {children}
    </div>
  );
};
