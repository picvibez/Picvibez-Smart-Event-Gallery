import { Settings, LogOut, ChevronRight, CreditCard, Cloud, Smartphone, Shield, Gift } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

export function Account() {
  const { eventPasses, autoUpload, setAutoUpload } = useAppContext();
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div className="p-6 h-full flex flex-col pb-32 md:pb-6 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Profile</h1>
        <button className="p-2 rounded-full bg-[#1A1A1A] text-gray-400 hover:text-white transition-colors">
          <Settings size={24} />
        </button>
      </div>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6366f1] to-[#a855f7] p-1">
          <img src={user.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200"} alt="Profile" className="w-full h-full rounded-full object-cover border-4 border-[#0A0A0A]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">{user.displayName || 'User'}</h2>
          <p className="text-gray-400 text-sm">{user.email}</p>
          <div className="flex gap-2 mt-2">
            <div className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-[#a855f7]/20 border border-[#a855f7]/50">
              <Shield size={12} className="text-[#a855f7]" />
              <span className="text-[10px] font-bold text-[#a855f7] uppercase tracking-wider">{eventPasses} PASSES</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Event Passes & Billing</h3>
          <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5">
            <Link to="/upgrade" className="flex items-center justify-between p-4 hover:bg-[#2A2A2A] transition-colors border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <CreditCard className="text-purple-400" size={20} />
                </div>
                <div>
                  <p className="font-bold">Buy Event Passes</p>
                  <p className="text-xs text-gray-400">Unlock premium features for your events</p>
                </div>
              </div>
              <ChevronRight className="text-gray-500" size={20} />
            </Link>
            <Link to="/refer" className="flex items-center justify-between p-4 hover:bg-[#2A2A2A] transition-colors border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center">
                  <Gift className="text-pink-400" size={20} />
                </div>
                <div>
                  <p className="font-bold">Refer & Earn</p>
                  <p className="text-xs text-gray-400">Get free passes for inviting friends</p>
                </div>
              </div>
              <ChevronRight className="text-gray-500" size={20} />
            </Link>
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                  <Shield className="text-blue-400" size={20} />
                </div>
                <div>
                  <p className="font-bold">Available Passes</p>
                  <p className="text-xs text-gray-400">You have {eventPasses} premium passes</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Settings</h3>
          <div className="bg-[#1A1A1A] rounded-2xl overflow-hidden border border-white/5">
            <div className="flex items-center justify-between p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                  <Smartphone className="text-green-400" size={20} />
                </div>
                <div>
                  <p className="font-bold">Auto Upload</p>
                  <p className="text-xs text-gray-400">Sync photos automatically</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={autoUpload} onChange={(e) => setAutoUpload(e.target.checked)} />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#a855f7]"></div>
              </label>
            </div>
          </div>
        </div>

        <button 
          onClick={logout}
          className="w-full bg-[#1A1A1A] border border-red-500/20 rounded-2xl p-4 flex items-center justify-center gap-2 text-red-400 font-bold hover:bg-red-500/10 transition-colors mt-8"
        >
          <LogOut size={20} />
          Log Out
        </button>
      </div>
    </div>
  );
}
