import { Check, X, Cloud, Image as ImageIcon, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useEffect } from 'react';

export function PaymentSuccess() {
  const navigate = useNavigate();
  const { setUserPlan } = useAppContext();

  useEffect(() => {
    setUserPlan('pro');
  }, [setUserPlan]);

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0A0A0A] overflow-y-auto pb-24 md:pb-12 relative text-gray-900 dark:text-white transition-colors duration-300">
      <div className="absolute inset-0 bg-gradient-to-b from-purple-100 dark:from-[#a855f7]/20 via-gray-50 dark:via-[#0A0A0A] to-gray-50 dark:to-[#0A0A0A] pointer-events-none transition-colors duration-300" />
      
      <div className="p-6 flex-1 flex flex-col items-center justify-center relative z-10 md:max-w-2xl md:mx-auto md:w-full">
        <div className="w-full flex justify-between items-center absolute top-6 left-6 right-6">
          <span className="font-bold text-sm tracking-widest uppercase">PicVibez</span>
          <button onClick={() => navigate('/')} className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="relative mb-12">
          <div className="absolute inset-0 bg-[#a855f7] blur-[40px] opacity-30 dark:opacity-50 rounded-full" />
          <div className="w-32 h-32 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] flex items-center justify-center relative z-10 shadow-[0_0_40px_rgba(168,85,247,0.4)] dark:shadow-[0_0_40px_rgba(168,85,247,0.6)] border-4 border-white dark:border-[#0A0A0A] transition-colors duration-300">
            <Check size={64} className="text-white" strokeWidth={3} />
          </div>
          
          {/* Confetti/Sparkles decorative elements */}
          <div className="absolute -top-4 -right-4 w-8 h-8 rounded-lg bg-blue-500/20 rotate-12 backdrop-blur-sm" />
          <div className="absolute top-1/2 -left-8 w-6 h-6 rounded-full bg-pink-500/20 backdrop-blur-sm" />
          <div className="absolute -bottom-6 right-4 w-10 h-10 rounded-xl bg-purple-500/20 -rotate-12 backdrop-blur-sm" />
        </div>

        <h1 className="text-4xl font-bold text-center mb-4 bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400 bg-clip-text text-transparent">
          Upgrade<br/>Successful!
        </h1>
        
        <p className="text-gray-600 dark:text-gray-400 text-center mb-12 max-w-[240px]">
          Your memories are now safe forever in <span className="text-[#a855f7] font-bold">PicVibez Pro</span>
        </p>

        <div className="flex gap-6 mb-16">
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1A1A1A] flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-sm">
              <Cloud size={20} className="text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unlimited</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1A1A1A] flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-sm">
              <ImageIcon size={20} className="text-purple-500 dark:text-purple-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">4K Quality</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#1A1A1A] flex items-center justify-center border border-gray-200 dark:border-white/10 shadow-sm">
              <Users size={20} className="text-pink-500 dark:text-pink-400" />
            </div>
            <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Shared</span>
          </div>
        </div>

        <div className="w-full mt-auto">
          <button 
            onClick={() => navigate('/')}
            className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-xl py-4 font-bold text-lg text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] mb-4 hover:opacity-90 transition-opacity"
          >
            Back to Home
          </button>
          <button className="w-full py-4 font-bold text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            View Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
