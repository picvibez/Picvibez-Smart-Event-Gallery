import React, { useState, useRef, useEffect } from 'react';
import { PlusCircle, Upload, QrCode, ChevronRight, Sun, Bell, Merge, Check, MapPin, Cpu, Zap, Layers } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

export function Home() {
  const { events, addPhoto, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const timerRef = useRef<NodeJS.Timeout>();

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const handleQuickUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && events.length > 0) {
      const file = e.target.files[0];
      const isVideo = file.type.startsWith('video/');
      const isGif = file.type === 'image/gif';
      
      // Upload to the first event
      addPhoto(events[0].id, {
        url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=400',
        uploader: currentUser?.name || 'You',
        nameCluster: 'Quick Upload',
        type: isVideo ? 'video' : (isGif ? 'gif' : 'image')
      });
      alert(`Media uploaded to ${events[0].name}!`);
    }
  };

  const ads = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?q=80&w=800&auto=format&fit=crop",
      tag: "Featured",
      title: "Elevate Your Wedding Memories",
      desc: "Experience the PicVibez difference."
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?q=80&w=800&auto=format&fit=crop",
      tag: "Premium",
      title: "Upgrade Group Storage",
      desc: "Get 20GB for your entire event group."
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop",
      tag: "New",
      title: "Smart Photo Clustering",
      desc: "AI automatically organizes by faces."
    }
  ];

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % ads.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [ads.length]);

  const handleTouchStart = (id: string) => {
    timerRef.current = setTimeout(() => {
      toggleSelection(id);
    }, 500); // 500ms for long press
  };

  const handleTouchEnd = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedEvents(prev => 
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleEventClick = (e: React.MouseEvent, id: string) => {
    if (selectedEvents.length > 0) {
      e.preventDefault();
      toggleSelection(id);
    }
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto h-full pb-32 md:pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100" alt="Profile" className="w-8 h-8 rounded-full object-cover" />
          <span className="text-xl font-bold text-[#a855f7] tracking-tight">PicVibez</span>
        </div>
        <div className="flex gap-3">
          <button className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-gray-400 hover:text-white transition-colors">
            <Sun size={16} />
          </button>
          <button className="w-8 h-8 rounded-full bg-[#1A1A1A] flex items-center justify-center text-gray-400 hover:text-white transition-colors relative">
            <Bell size={16} />
            <div className="absolute top-2 right-2 w-1.5 h-1.5 bg-red-500 rounded-full"></div>
          </button>
        </div>
      </div>

      {/* Featured Carousel / Ad Section */}
      <div>
        <div className="relative rounded-2xl overflow-hidden h-48 mb-3 shadow-lg">
          {ads.map((ad, index) => (
            <div 
              key={ad.id}
              className={`absolute inset-0 transition-opacity duration-1000 ${index === currentAdIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
            >
              <img src={ad.image} alt={ad.title} className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-black/50 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4">
                <span className="bg-[#a855f7] text-white text-[8px] font-bold px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">{ad.tag}</span>
                <h3 className="text-lg font-bold text-white mb-1 leading-tight">{ad.title}</h3>
                <p className="text-xs text-gray-300">{ad.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-1.5">
          {ads.map((_, index) => (
            <div 
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${index === currentAdIndex ? 'w-4 bg-[#a855f7]' : 'w-1 bg-gray-600'}`}
            ></div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="bg-[#1A1A1A] rounded-2xl p-4 flex divide-x divide-white/10 border border-white/5">
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-[#a855f7] mb-0.5">127</div>
          <div className="text-[8px] text-gray-400 font-bold tracking-widest uppercase">Vibez Events</div>
        </div>
        <div className="flex-1 text-center">
          <div className="text-2xl font-bold text-white mb-0.5">2.3K</div>
          <div className="text-[8px] text-gray-400 font-bold tracking-widest uppercase">Shared Moments</div>
        </div>
      </div>

      {/* Create Event Button */}
      <Link 
        to="/create-event"
        className="block w-full bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] rounded-2xl p-5 relative overflow-hidden shadow-[0_0_30px_rgba(139,92,246,0.3)]"
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
              <PlusCircle className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-0.5">+ Create Event</h2>
              <p className="text-white/80 text-xs">Start a new PicVibez event</p>
            </div>
          </div>
          <ChevronRight className="text-white/80" size={20} />
        </div>
      </Link>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
        <input 
          type="file" 
          id="quick-upload" 
          className="hidden" 
          accept="image/*,video/*"
          onChange={handleQuickUpload}
        />
        <button 
          onClick={() => document.getElementById('quick-upload')?.click()}
          className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#2A2A2A] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
            <Upload className="text-blue-400" size={16} />
          </div>
          <span className="font-bold text-[10px] tracking-wider uppercase">Upload</span>
        </button>
        <Link 
          to="/scan"
          className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#2A2A2A] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
            <QrCode className="text-green-400" size={16} />
          </div>
          <span className="font-bold text-[10px] tracking-wider uppercase">QR Join</span>
        </Link>
        <Link 
          to="/group"
          className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 hover:bg-[#2A2A2A] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
            <Merge className="text-yellow-400" size={16} />
          </div>
          <span className="font-bold text-[10px] tracking-wider uppercase">Merge</span>
        </Link>
      </div>

      {/* Active Events */}
      <div>
        <div className="flex items-end justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold leading-tight">Active Events</h3>
            <p className="text-[8px] text-gray-400 uppercase tracking-widest mt-1">Long-press to select & merge</p>
          </div>
          <Link to="/group" className="text-[#a855f7] text-[10px] font-bold tracking-wider uppercase">See All</Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
          {events.map((event, idx) => {
            const isSelected = selectedEvents.includes(event.id);
            
            return (
              <Link 
                key={event.id} 
                to={`/event/${event.id}`}
                onClick={(e) => handleEventClick(e, event.id)}
                onTouchStart={() => handleTouchStart(event.id)}
                onTouchEnd={handleTouchEnd}
                onMouseDown={() => handleTouchStart(event.id)}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                onContextMenu={(e) => { e.preventDefault(); toggleSelection(event.id); }}
                className={`min-w-[240px] h-[160px] rounded-2xl relative overflow-hidden snap-start flex-shrink-0 group border-2 transition-all ${isSelected ? 'border-[#a855f7]' : 'border-transparent'}`}
              >
                <img src={event.coverImage} alt={event.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-[#a855f7] flex items-center justify-center z-20 shadow-lg">
                    <Check size={12} className="text-white" strokeWidth={3} />
                  </div>
                )}

                <div className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex flex-col items-center justify-center border border-white/20 z-10">
                  <span className="text-[8px] font-bold uppercase">{event.date.split(' ')[0]}</span>
                  <span className="text-xs font-bold leading-none">{event.date.split(' ')[1]}</span>
                </div>

                <div className="absolute bottom-4 left-4 right-4 z-10">
                  <h4 className="font-bold text-base mb-1 truncate">{event.name}</h4>
                  <p className="text-[10px] text-gray-300 flex items-center gap-1 truncate">
                    <MapPin size={10} />
                    {event.location}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Highlights */}
      <div>
        <h3 className="text-lg font-bold mb-4">PicVibez Highlights</h3>
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x no-scrollbar">
          {[
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200',
            'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?q=80&w=200',
            'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=200',
            'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=200'
          ].map((img, i) => (
            <div key={i} className="w-24 h-32 rounded-xl overflow-hidden flex-shrink-0 snap-start">
              <img src={img} alt="Highlight" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Join PicVibez Today Features Section */}
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0A0A0A] rounded-3xl p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#a855f7]/10 rounded-full blur-3xl -mr-16 -mt-16" />
        
        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2">Join PicVibez Today</h3>
          <p className="text-gray-400 text-sm mb-8">Experience the next generation of event memory sharing.</p>
          
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Cpu className="text-blue-400" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">AI Face Clustering</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Automatically find all your photos across every event gallery instantly.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="text-green-400" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Instant Sharing</h4>
                <p className="text-xs text-gray-500 leading-relaxed">No more waiting. Photos are shared in real-time as they are captured.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <Layers className="text-purple-400" size={20} />
              </div>
              <div>
                <h4 className="font-bold text-sm mb-1">Collaborative Vibes</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Everyone contributes to a single, high-fidelity memory pool.</p>
              </div>
            </div>
          </div>

          <button 
            onClick={() => navigate('/upgrade')}
            className="w-full mt-10 py-4 bg-white text-black font-black rounded-2xl text-xs tracking-widest uppercase hover:scale-[1.02] transition-transform"
          >
            Explore All Features
          </button>
        </div>
      </div>
    </div>
  );
}
