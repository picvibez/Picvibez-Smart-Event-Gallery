import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Calendar, MapPin, Type, Clock, Shield, Sparkles, Briefcase, Gift, Home, Heart } from 'lucide-react';
import { useAppContext, EventType } from '../context/AppContext';

const TEMPLATES = [
  { id: 'wedding', name: "Smith & Doe's Wedding", type: 'Wedding' as EventType, icon: Heart, color: 'text-pink-500', bg: 'bg-pink-500/10' },
  { id: 'birthday', name: "Alex's 30th Birthday", type: 'Birthday' as EventType, icon: Gift, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
  { id: 'corporate', name: "Annual Tech Conference", type: 'Corporate' as EventType, icon: Briefcase, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  { id: 'housewarming', name: "The Millers' House Warming", type: 'House Warming' as EventType, icon: Home, color: 'text-green-500', bg: 'bg-green-500/10' },
];

export function CreateEvent() {
  const navigate = useNavigate();
  const { addEvent, eventPasses, setEventPasses } = useAppContext();
  
  const [name, setName] = useState('');
  const [type, setType] = useState<EventType>('Wedding');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [isPremium, setIsPremium] = useState(false);

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setName(template.name);
    setType(template.type);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isPremium) {
      if (eventPasses > 0) {
        setEventPasses(eventPasses - 1);
      } else {
        // Redirect to buy passes if they don't have any
        navigate('/upgrade');
        return;
      }
    }

    addEvent({
      name,
      type,
      date: date || 'TBD',
      location: location || 'TBD',
      coverImage: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800&auto=format&fit=crop'
    });
    
    navigate('/');
  };

  return (
    <div className="p-6 h-full flex flex-col overflow-y-auto pb-24 bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-white transition-colors duration-300">
      <div className="md:max-w-2xl md:mx-auto md:w-full">
        <div className="flex items-center mb-8">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
            <ChevronLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold ml-2">Create Event</h1>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Quick Templates</label>
            <div className="grid grid-cols-2 gap-3">
              {TEMPLATES.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A] hover:border-[#a855f7] dark:hover:border-[#a855f7] transition-colors text-left"
                >
                  <div className={`w-10 h-10 rounded-lg ${template.bg} flex items-center justify-center shrink-0`}>
                    <template.icon className={template.color} size={20} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{template.type}</p>
                    <p className="text-[10px] text-gray-500 truncate">{template.name}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Event Name</label>
            <div className="relative">
              <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input 
                required
                type="text" 
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Smith-Muller Wedding"
                className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#a855f7] transition-colors shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Event Type</label>
            <select 
              value={type}
              onChange={e => setType(e.target.value as EventType)}
              className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-4 px-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#a855f7] transition-colors appearance-none shadow-sm"
            >
            <option value="Wedding">Wedding</option>
            <option value="House Warming">House Warming</option>
            <option value="Engagement">Engagement</option>
            <option value="Birthday">Birthday</option>
            <option value="Corporate">Corporate</option>
            <option value="Other">Other</option>
          </select>
        </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input 
                type="text" 
                value={date}
                onChange={e => setDate(e.target.value)}
                placeholder="e.g. OCT 12"
                className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#a855f7] transition-colors shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Location</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20} />
              <input 
                type="text" 
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. The Glass House, NY"
                className="w-full bg-white dark:bg-[#1A1A1A] border border-gray-200 dark:border-white/10 rounded-xl py-4 pl-12 pr-4 text-gray-900 dark:text-white focus:outline-none focus:border-[#a855f7] transition-colors shadow-sm placeholder:text-gray-400 dark:placeholder:text-gray-500"
              />
            </div>
          </div>

          <div className="space-y-3 mt-2">
            <label className="text-sm font-semibold text-gray-500 dark:text-gray-400">Event Tier</label>
            
            <div 
              onClick={() => setIsPremium(false)}
              className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm ${!isPremium ? 'border-gray-400 dark:border-white/30 bg-gray-100 dark:bg-[#2A2A2A]' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A]'}`}
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <Clock size={18} className={!isPremium ? 'text-gray-700 dark:text-white' : 'text-gray-400'} />
                  <span className="font-bold text-gray-900 dark:text-white">Standard Event</span>
                </div>
                <span className="font-bold text-gray-500">Free</span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-7">Photos auto-delete after 10 days. Standard resolution.</p>
            </div>

            <div 
              onClick={() => setIsPremium(true)}
              className={`p-4 rounded-xl border cursor-pointer transition-all shadow-sm relative overflow-hidden ${isPremium ? 'border-[#a855f7] bg-purple-50 dark:bg-[#a855f7]/10' : 'border-gray-200 dark:border-white/10 bg-white dark:bg-[#1A1A1A]'}`}
            >
              {isPremium && (
                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-[#8b5cf6] to-[#d946ef] opacity-10 rounded-bl-full" />
              )}
              <div className="flex justify-between items-center mb-1 relative z-10">
                <div className="flex items-center gap-2">
                  <Shield size={18} className={isPremium ? 'text-[#a855f7]' : 'text-gray-400'} />
                  <span className={`font-bold ${isPremium ? 'text-[#a855f7]' : 'text-gray-900 dark:text-white'}`}>Premium Event</span>
                </div>
                <span className="font-bold text-[#a855f7] flex items-center gap-1">
                  1 Pass
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 ml-7 relative z-10 mb-2">Permanent storage, AI Face Recognition, High-res downloads.</p>
              
              {isPremium && (
                <div className="ml-7 mt-3 pt-3 border-t border-[#a855f7]/20 flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-600 dark:text-gray-300">Available Passes: <strong className="text-[#a855f7]">{eventPasses}</strong></span>
                  {eventPasses === 0 && (
                    <span className="text-[10px] bg-red-500/10 text-red-500 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                      Insufficient Passes
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <button 
              type="submit"
              className={`w-full rounded-xl py-4 font-bold text-lg text-white shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all ${isPremium && eventPasses === 0 ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#8b5cf6] to-[#d946ef] hover:opacity-90'}`}
            >
              {isPremium && eventPasses === 0 ? 'Buy Passes to Continue' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
