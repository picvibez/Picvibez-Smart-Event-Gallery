import React from 'react';
import { Home, Users, QrCode, Image as ImageIcon, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../lib/utils';

export function BottomNav() {
  return (
    <>
      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 w-full bg-white dark:bg-[#0A0A0A] border-t border-gray-200 dark:border-white/10 pb-safe z-50 transition-colors duration-300">
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

      {/* Tablet/Desktop Sidebar */}
      <div className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-24 lg:w-64 bg-white dark:bg-[#0A0A0A] border-r border-gray-200 dark:border-white/10 z-50 transition-colors duration-300 py-8">
        <div className="flex flex-col items-center lg:items-start lg:px-8 gap-8 h-full">
          <div className="text-[#a855f7] font-bold text-2xl tracking-tight hidden lg:block">PicVibez</div>
          <div className="text-[#a855f7] font-bold text-2xl tracking-tight lg:hidden">PV</div>
          
          <div className="flex flex-col gap-6 w-full mt-8">
            <SideNavItem to="/" icon={<Home size={24} />} label="Home" />
            <SideNavItem to="/group" icon={<Users size={24} />} label="Groups" />
            <SideNavItem to="/gallery" icon={<ImageIcon size={24} />} label="Gallery" />
            <SideNavItem to="/account" icon={<User size={24} />} label="Account" />
          </div>

          <div className="mt-auto w-full flex justify-center lg:justify-start">
            <NavLink 
              to="/scan"
              className="w-14 h-14 lg:w-full lg:h-12 lg:rounded-xl rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center lg:justify-start lg:px-4 gap-3 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-colors duration-300 hover:opacity-90"
            >
              <QrCode size={24} className="text-white" />
              <span className="text-white font-bold hidden lg:block">Scan QR</span>
            </NavLink>
          </div>
        </div>
      </div>
    </>
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

function SideNavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-center lg:justify-start gap-4 p-3 rounded-xl transition-all w-full",
          isActive 
            ? "text-[#a855f7] bg-[#a855f7]/10 font-bold" 
            : "text-gray-500 hover:text-gray-900 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
        )
      }
    >
      {icon}
      <span className="hidden lg:block text-sm tracking-wide">{label}</span>
    </NavLink>
  );
}
