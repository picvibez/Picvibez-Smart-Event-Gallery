import { ArrowLeft, Zap, Bell, Key, Rocket, History, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ScanQR() {
  const navigate = useNavigate();

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0A0A0A] overflow-y-auto pb-12 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1 border border-dashed border-blue-500/50 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
            <ArrowLeft size={20} className="text-gray-900 dark:text-white" />
          </button>
          <span className="font-bold text-lg">Join Event</span>
        </div>
        <div className="flex items-center gap-4">
          <button>
            <Zap size={20} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" />
          </button>
          <button>
            <Bell size={20} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors" />
          </button>
        </div>
      </div>

      <div className="px-6 flex-1 flex flex-col md:max-w-2xl md:mx-auto md:w-full">
        {/* Scanner Area */}
        <div className="relative w-full aspect-square md:aspect-video rounded-3xl overflow-hidden mb-4 shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1540039155732-684735035727?q=80&w=800&auto=format&fit=crop" 
            alt="Concert" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />
          
          {/* Cyan Corner Brackets */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-cyan-400 rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-cyan-400 rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-cyan-400 rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-cyan-400 rounded-br-3xl" />
        </div>

        {/* Caption */}
        <div className="text-center mb-8">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Scan to Connect</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Point your camera at the event's QR code to instantly join the shared gallery and start vibing.</p>
        </div>

        {/* Divider */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="h-[1px] flex-1 bg-gray-300 dark:bg-white/10"></div>
          <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">Or Enter Manually</span>
          <div className="h-[1px] flex-1 bg-gray-300 dark:bg-white/10"></div>
        </div>

        {/* Input Field */}
        <div className="relative mb-6">
          <input 
            type="text" 
            placeholder="Enter Event Code" 
            className="w-full bg-white dark:bg-[#1A1A1A] text-gray-900 dark:text-white border border-gray-200 dark:border-transparent rounded-2xl py-4 px-5 pr-12 outline-none focus:ring-2 focus:ring-[#a855f7]/50 transition-all font-medium placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm"
          />
          <Key size={20} className="absolute right-5 top-1/2 -translate-y-1/2 text-[#a855f7]" />
        </div>

        {/* Join Button */}
        <button className="w-full bg-gradient-to-r from-[#6366f1] to-[#22d3ee] text-white font-bold rounded-full py-4 flex items-center justify-center gap-2 mb-8 shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:opacity-90 transition-opacity">
          Join Group <Rocket size={18} />
        </button>

        {/* Bottom Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <button className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-transparent rounded-2xl p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors text-left shadow-sm">
            <div className="w-8 h-8 rounded-full bg-[#a855f7]/10 flex items-center justify-center flex-shrink-0">
              <History size={16} className="text-[#a855f7]" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Last Event</div>
              <div className="text-[10px] text-gray-500">Vibez2024</div>
            </div>
          </button>
          
          <button className="bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-transparent rounded-2xl p-4 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-[#2A2A2A] transition-colors text-left shadow-sm">
            <div className="w-8 h-8 rounded-full bg-cyan-400/10 flex items-center justify-center flex-shrink-0">
              <Navigation size={16} className="text-cyan-600 dark:text-cyan-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Nearby</div>
              <div className="text-[10px] text-gray-500">Neon Night</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
