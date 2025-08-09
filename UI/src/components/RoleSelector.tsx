import React from 'react';
import { Crown, Palette, ShoppingBag } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { UserRole } from '../types';

interface RoleSelectorProps {
  selectedRole: UserRole;
  onRoleChange: (role: UserRole) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ 
  selectedRole, 
  onRoleChange 
}) => {
  const roles = [
    { 
      id: 'admin' as UserRole, 
      name: 'Admin Dashboard 👑', 
      icon: Crown,
      description: 'Manage marketplace and resolve disputes',
      gradient: 'from-purple-500/30 to-pink-500/30'
    },
    { 
      id: 'freelancer' as UserRole, 
      name: 'Freelancer Dashboard 🎨', 
      icon: Palette,
      description: 'List services and manage orders',
      gradient: 'from-pink-500/30 to-violet-500/30'
    },
    { 
      id: 'buyer' as UserRole, 
      name: 'Buyer Dashboard 🛍️', 
      icon: ShoppingBag,
      description: 'Purchase services and manage deliveries',
      gradient: 'from-pink-500/30 to-violet-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {roles.map((role) => {
        const Icon = role.icon;
        const isSelected = selectedRole === role.id;
        
        return (
          <GlassCard
            key={role.id}
            className={`
              p-6 cursor-pointer transition-all duration-300 relative overflow-hidden
              ${isSelected 
                ? `bg-gradient-to-br ${role.gradient} border-purple-400/60 shadow-purple-500/30` 
                : 'hover:bg-black/40'
              }
            `}
            hover={!isSelected}
          >
            <button
              onClick={() => onRoleChange(role.id)}
              className="w-full text-left relative z-10"
            >
              <div className="flex items-center space-x-3 mb-3">
                <Icon className={`w-6 h-6 ${isSelected ? 'text-purple-200' : 'text-purple-300/60'}`} />
                <h3 className={`font-semibold ${isSelected ? 'text-purple-100' : 'text-purple-200/80'}`}>
                  {role.name}
                </h3>
              </div>
              <p className={`text-sm ${isSelected ? 'text-purple-200/90' : 'text-purple-300/60'}`}>
                {role.description}
              </p>
            </button>
            
            {/* Futuristic corner accent */}
            <div className={`absolute top-0 right-0 w-16 h-16 ${isSelected ? 'opacity-20' : 'opacity-10'}`}>
              <div className="absolute top-2 right-2 w-8 h-0.5 bg-gradient-to-r from-purple-400 to-transparent"></div>
              <div className="absolute top-2 right-2 w-0.5 h-8 bg-gradient-to-b from-purple-400 to-transparent"></div>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
};
