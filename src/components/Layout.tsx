import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-sans pb-24 md:pb-0 md:pl-24 lg:pl-64 transition-colors duration-300">
      <BottomNav />
      <div className="w-full max-w-md md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto relative min-h-screen shadow-2xl overflow-hidden bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
        <Outlet />
      </div>
    </div>
  );
}
