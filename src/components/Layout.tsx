import { Outlet } from 'react-router-dom';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white font-sans pb-24 transition-colors duration-300">
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl mx-auto relative min-h-screen shadow-2xl overflow-hidden bg-white dark:bg-[#0A0A0A] transition-colors duration-300">
        <Outlet />
        <BottomNav />
      </div>
    </div>
  );
}
