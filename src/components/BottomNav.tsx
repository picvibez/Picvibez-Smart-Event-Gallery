import React from 'react';
import { Home, Users, QrCode, Image as ImageIcon, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

export function BottomNav() {
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-white/10 pb-safe z-50 transition-colors duration-300">
      <div className="flex justify-around items-center h-20 px-4 relative">
        <NavItem to="/" icon={<Home size={24} />} label="HOME" />
        <NavItem to="/group" icon={<Users size={24} />} label="GROUP" />
        
        {/* Center QR Scan Button */}
        <div className="relative -top-6 flex flex-col items-center">
          <NavLink 
            to="/scan"
            className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)] border-4 border-white dark:border-[#0A0A0A] transition-colors duration-300"
          >
            <QrCode size={28} className="text-white" />
          </NavLink>
        </div>

        <NavItem to="/gallery" icon={<ImageIcon size={24} />} label="GALLERY" />
        <NavItem to="/account" icon={<User size={24} />} label="ACCOUNT" />
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex flex-col items-center justify-center w-16 gap-1 transition-colors",
          isActive ? "text-[#a855f7]" : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
        )
      }
    >
      {icon}
      <span className="text-[10px] font-bold tracking-wider">{label}</span>
    </NavLink>
  );
}
