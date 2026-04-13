import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, Merge, Plus, Search, ChevronRight, Check, AlertTriangle, X, Sparkles, Loader2 } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'motion/react';

export function Group() {
  const { events, mergeEvents, currentUser } = useAppContext();
  const [search, setSearch] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [selectedForMerge, setSelectedForMerge] = useState<string[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSmartSearch, setIsSmartSearch] = useState(false);
  const [isSearchingAI, setIsSearchingAI] = useState(false);

  const filteredEvents = events.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

  const handleSmartSearch = () => {
    if (!search) return;
    setIsSearchingAI(true);
    setIsSmartSearch(true);
    // Simulate RAG search
    setTimeout(() => {
      setIsSearchingAI(false);
    }, 2000);
  };

  const handleMergeToggle = (id: string) => {
    if (selectedForMerge.includes(id)) {
      setSelectedForMerge(selectedForMerge.filter(i => i !== id));
    } else if (selectedForMerge.length < 2) {
      setSelectedForMerge([...selectedForMerge, id]);
    }
  };

  const executeMerge = () => {
    if (selectedForMerge.length === 2 && newGroupName) {
      setShowConfirmModal(true);
    }
  };

  const confirmMerge = () => {
    if (selectedForMerge.length === 2 && newGroupName) {
      mergeEvents(selectedForMerge[0], selectedForMerge[1], newGroupName);
      setIsMerging(false);
      setSelectedForMerge([]);
      setNewGroupName('');
      setShowConfirmModal(false);
    }
  };

  return (
    <div className="p-6 h-full flex flex-col pb-32 md:pb-6 overflow-y-auto bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="md:max-w-2xl md:mx-auto md:w-full">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Groups</h1>
          <button 
            onClick={() => setIsMerging(!isMerging)}
            className={`p-2 rounded-full transition-colors ${isMerging ? 'bg-[#a855f7] text-white' : 'bg-gray-200 dark:bg-[#1A1A1A] text-gray-600 dark:text-gray-400'}`}
          >
            <Merge size={24} />
          </button>
        </div>

        <div className="relative mb-6 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
            <input 
              type="text" 
              value={search}
              onChange={e => {
                setSearch(e.target.value);
                if (e.target.value === '') setIsSmartSearch(false);
              }}
              placeholder="Search groups or Ask AI..."
              className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#a855f7] transition-colors shadow-sm"
            />
          </div>
          <button 
            onClick={handleSmartSearch}
            disabled={!search || isSearchingAI}
            className={`px-4 rounded-xl flex items-center justify-center gap-2 font-bold transition-all ${search ? 'bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] text-white shadow-lg shadow-[#8b5cf6]/20 hover:opacity-90' : 'bg-gray-200 dark:bg-[#1A1A1A] text-gray-400 cursor-not-allowed'}`}
          >
            {isSearchingAI ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
            <span className="hidden sm:inline">Ask AI</span>
          </button>
        </div>

        {isSmartSearch && !isSearchingAI && search && (
          <div className="bg-gradient-to-r from-[#a855f7]/10 to-[#3b82f6]/10 border border-[#a855f7]/20 rounded-2xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#a855f7]/20 flex items-center justify-center shrink-0 mt-1">
                <Sparkles size={16} className="text-[#a855f7]" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  I searched across all your groups for "{search}".
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Found 2 matching photos in "Smith-Muller Wedding" based on visual context.
                </p>
              </div>
            </div>
          </div>
        )}

        {isMerging && (
          <div className="bg-white dark:bg-[#1A1A1A] border border-[#a855f7]/50 rounded-2xl p-4 mb-6 shadow-sm">
            <h3 className="font-bold text-[#a855f7] mb-2">Merge Groups</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Select 2 groups to merge their photos and videos.</p>
            
            <div className="flex gap-2 mb-4">
              <div className="flex-1 h-12 bg-gray-50 dark:bg-[#0A0A0A] rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-sm truncate px-2 text-gray-900 dark:text-white">
                {selectedForMerge[0] ? events.find(e => e.id === selectedForMerge[0])?.name : 'Select 1st'}
              </div>
              <div className="flex items-center justify-center px-2 text-gray-400 dark:text-gray-500">+</div>
              <div className="flex-1 h-12 bg-gray-50 dark:bg-[#0A0A0A] rounded-lg border border-gray-200 dark:border-white/10 flex items-center justify-center text-sm truncate px-2 text-gray-900 dark:text-white">
                {selectedForMerge[1] ? events.find(e => e.id === selectedForMerge[1])?.name : 'Select 2nd'}
              </div>
            </div>

            {selectedForMerge.length === 2 && (
              <div className="space-y-3">
                <input 
                  type="text" 
                  value={newGroupName}
                  onChange={e => setNewGroupName(e.target.value)}
                  placeholder="New merged group name"
                  className="w-full bg-gray-50 dark:bg-[#0A0A0A] border border-gray-200 dark:border-white/10 rounded-xl py-3 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#a855f7] transition-colors text-sm"
                />
                <button 
                  onClick={executeMerge}
                  disabled={!newGroupName}
                  className="w-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-xl py-3 font-bold text-sm text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
                >
                  Confirm Merge
                </button>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4">
          {!isMerging && (
            <Link to="/create-event" className="flex items-center gap-4 p-4 rounded-2xl border border-dashed border-gray-300 dark:border-white/20 hover:border-[#a855f7] hover:bg-[#a855f7]/5 transition-colors cursor-pointer justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center">
                <Plus className="text-[#a855f7]" size={24} />
              </div>
              <span className="font-bold text-gray-600 dark:text-gray-300">Create New Group</span>
            </Link>
          )}

          {filteredEvents.map(event => (
            <div 
              key={event.id}
              onClick={() => isMerging ? handleMergeToggle(event.id) : null}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-colors shadow-sm ${
                isMerging 
                  ? selectedForMerge.includes(event.id) 
                    ? 'border-[#a855f7] bg-[#a855f7]/10' 
                    : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#1A1A1A] cursor-pointer hover:border-gray-300 dark:hover:border-white/20'
                  : 'border-gray-200 dark:border-white/5 bg-white dark:bg-[#1A1A1A]'
              }`}
            >
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img src={event.coverImage} alt={event.name} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-lg truncate">{event.name}</h4>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{event.photos.length} photos • {event.date}</p>
              </div>
              {!isMerging && (
                <Link to={`/event/${event.id}`} className="w-10 h-10 rounded-full bg-gray-100 dark:bg-[#2A2A2A] flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#3A3A3A] transition-colors text-gray-600 dark:text-gray-300">
                  <ChevronRight size={20} />
                </Link>
              )}
              {isMerging && (
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${selectedForMerge.includes(event.id) ? 'border-[#a855f7] bg-[#a855f7]' : 'border-gray-300 dark:border-gray-500'}`}>
                  {selectedForMerge.includes(event.id) && <Check size={14} className="text-white" />}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfirmModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white dark:bg-[#1A1A1A] rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl border border-white/10"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <AlertTriangle size={28} />
                </div>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <h3 className="text-2xl font-black mb-2">Confirm Merge</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">
                You are about to merge two groups. This action will combine all photos and videos into a new group.
              </p>

              <div className="bg-gray-50 dark:bg-black/20 rounded-2xl p-4 mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
                  <span className="text-sm font-bold truncate">{events.find(e => e.id === selectedForMerge[0])?.name}</span>
                </div>
                <div className="flex items-center justify-center">
                  <Plus size={14} className="text-gray-400" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-[#3b82f6]" />
                  <span className="text-sm font-bold truncate">{events.find(e => e.id === selectedForMerge[1])?.name}</span>
                </div>
                <div className="pt-3 border-t border-gray-200 dark:border-white/5">
                  <p className="text-[10px] uppercase tracking-widest text-gray-500 font-black mb-1">New Group Name</p>
                  <p className="text-[#a855f7] font-black">{newGroupName}</p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button 
                  onClick={confirmMerge}
                  className="w-full bg-[#a855f7] py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#a855f7]/25"
                >
                  Confirm as {currentUser?.name || 'Group Owner'}
                </button>
                <button 
                  onClick={() => setShowConfirmModal(false)}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-gray-500 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}


