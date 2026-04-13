import { ChevronLeft, Check, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function Upgrade() {
  const navigate = useNavigate();
  const { eventPasses } = useAppContext();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0A0A0A] overflow-y-auto pb-24 md:pb-12 text-gray-900 dark:text-white transition-colors duration-300">
      <div className="p-6 md:max-w-2xl md:mx-auto md:w-full">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 mb-6 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
          <ChevronLeft size={24} />
        </button>
        
        <h1 className="text-3xl font-bold text-center mb-2">Premium Event Passes</h1>
        <p className="text-gray-500 dark:text-gray-400 text-center text-sm mb-8">Unlock AI features, permanent storage, and high-res sharing for your events.</p>

        <div className="space-y-4">
          {/* Single Pass */}
          <div className="rounded-2xl p-6 border border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-[#1A1A1A]/50 transition-colors">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Single Pass</h3>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">₹499</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Perfect for one-off events</p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Check size={16} className="text-[#a855f7]" />
                1 Premium Event
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Check size={16} className="text-[#a855f7]" />
                AI Face Recognition & Clustering
              </li>
              <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
                <Check size={16} className="text-[#a855f7]" />
                Permanent Storage
              </li>
            </ul>
            <button 
              onClick={() => navigate('/payment')}
              className="w-full bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-white/10 rounded-xl py-3 font-bold text-sm text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Buy 1 Pass
            </button>
          </div>

          {/* 5 Passes Bundle */}
          <div className="rounded-2xl p-6 border-2 border-[#a855f7] bg-purple-50 dark:bg-[#a855f7]/10 shadow-md relative transition-all">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
              <Sparkles size={12} /> BEST VALUE (-20%)
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-[#a855f7] flex items-center gap-2">
                5 Passes Bundle
              </h3>
              <div className="text-right">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">₹1999</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400 block">₹399 PER PASS</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">For professional photographers & planners</p>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-[#a855f7]/20 flex items-center justify-center">
                  <Check size={12} className="text-[#a855f7]" />
                </div>
                5 Premium Events
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-[#a855f7]/20 flex items-center justify-center">
                  <Check size={12} className="text-[#a855f7]" />
                </div>
                All Premium Features Included
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-[#a855f7]/20 flex items-center justify-center">
                  <Check size={12} className="text-[#a855f7]" />
                </div>
                Priority Support
              </li>
              <li className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                <div className="w-5 h-5 rounded-full bg-purple-100 dark:bg-[#a855f7]/20 flex items-center justify-center">
                  <Check size={12} className="text-[#a855f7]" />
                </div>
                Custom Branding Options
              </li>
            </ul>

            <button 
              onClick={() => navigate('/payment')}
              className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-xl py-4 font-bold text-lg text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Buy 5 Passes
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <p className="text-[10px] text-gray-500 dark:text-gray-500 text-center mt-8 leading-relaxed">
          Passes never expire. One pass is consumed when you upgrade a standard event to a premium event.
        </p>
      </div>
    </div>
  );
}
