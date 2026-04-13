import { ArrowLeft, Gift, Share2, Copy, CheckCircle2, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function ReferAndEarn() {
  const [copied, setCopied] = useState(false);
  const referralCode = 'VIBEZ-2026';

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join PicVibez',
        text: `Use my code ${referralCode} to get a free event pass on PicVibez!`,
        url: 'https://picvibez.com/join',
      }).catch(console.error);
    } else {
      handleCopy();
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5 sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md z-10">
        <Link to="/account" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-lg font-bold">Refer & Earn</h1>
        <div className="w-10 h-10" /> {/* Spacer for centering */}
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-32 md:pb-6">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-[#a855f7]/20 to-[#ec4899]/20 rounded-full flex items-center justify-center mb-6 relative">
            <Gift size={48} className="text-[#a855f7]" />
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#ec4899] rounded-full flex items-center justify-center animate-bounce">
              <Sparkles size={16} className="text-white" />
            </div>
          </div>
          <h2 className="text-3xl font-black mb-3">Invite Friends,<br/>Earn Free Passes</h2>
          <p className="text-gray-400">Give a friend 1 free premium event pass, and get 1 free pass when they host their first event.</p>
        </div>

        {/* Code Section */}
        <div className="bg-[#1A1A1A] border border-white/10 rounded-3xl p-6 mb-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#a855f7] to-[#ec4899]" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Your Referral Code</p>
          
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="text-4xl font-black tracking-wider text-white">{referralCode}</div>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleCopy}
              className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl py-4 flex items-center justify-center gap-2 font-bold transition-colors"
            >
              {copied ? <CheckCircle2 size={20} className="text-green-400" /> : <Copy size={20} />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
            <button 
              onClick={handleShare}
              className="flex-1 bg-gradient-to-r from-[#a855f7] to-[#ec4899] rounded-xl py-4 flex items-center justify-center gap-2 font-bold shadow-lg shadow-[#a855f7]/20 hover:opacity-90 transition-opacity"
            >
              <Share2 size={20} />
              Share Link
            </button>
          </div>
        </div>

        {/* How it works */}
        <div>
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">How it works</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#a855f7]/20 flex items-center justify-center flex-shrink-0">
                <Share2 size={20} className="text-[#a855f7]" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">1. Share your code</h4>
                <p className="text-sm text-gray-400">Send your unique referral code to friends who are planning an event.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#3b82f6]/20 flex items-center justify-center flex-shrink-0">
                <Users size={20} className="text-[#3b82f6]" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">2. They sign up & get a pass</h4>
                <p className="text-sm text-gray-400">When they sign up using your code, they instantly receive 1 premium event pass.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[#10b981]/20 flex items-center justify-center flex-shrink-0">
                <Gift size={20} className="text-[#10b981]" />
              </div>
              <div>
                <h4 className="font-bold text-white mb-1">3. You earn a pass</h4>
                <p className="text-sm text-gray-400">Once they host their first event, you'll automatically receive 1 premium event pass.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
