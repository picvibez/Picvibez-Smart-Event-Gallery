import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Zap, 
  Users, 
  Cpu, 
  ShieldCheck, 
  Share2, 
  HardDrive, 
  ArrowRight,
  CheckCircle2,
  Layers,
  Smartphone
} from 'lucide-react';
import { motion } from 'motion/react';

export function Join() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Zap className="text-yellow-400" size={24} />,
      title: "Instant Sharing",
      description: "Share photos and videos with everyone at your event in real-time. No more waiting for 'that one friend' to send the photos."
    },
    {
      icon: <Cpu className="text-blue-400" size={24} />,
      title: "AI Face Clustering",
      description: "Our advanced AI automatically organizes photos by faces. Find all photos of yourself or your loved ones instantly."
    },
    {
      icon: <HardDrive className="text-purple-400" size={24} />,
      title: "Full Resolution",
      description: "We don't compress your memories. Upload and download in high fidelity, exactly as they were captured."
    },
    {
      icon: <Users className="text-green-400" size={24} />,
      title: "Collaborative Galleries",
      description: "Every guest can contribute to the event gallery. See the celebration from every perspective."
    },
    {
      icon: <Smartphone className="text-pink-400" size={24} />,
      title: "Device Integration",
      description: "Connect your local device folders to PicVibez. View your entire media library in one unified, beautiful interface."
    },
    {
      icon: <ShieldCheck className="text-emerald-400" size={24} />,
      title: "Secure & Private",
      description: "You control who sees your events. Private links and QR codes ensure your memories stay within your circle."
    }
  ];

  const stats = [
    { label: "Active Events", value: "10K+" },
    { label: "Photos Shared", value: "2M+" },
    { label: "Happy Users", value: "50K+" },
    { label: "AI Scans", value: "5M+" }
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white overflow-y-auto pb-20">
      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-[#a855f7]/20 to-transparent blur-3xl -z-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <Layers className="text-[#a855f7]" size={40} />
            <h1 className="text-4xl font-bold tracking-tight">PicVibez</h1>
          </div>
          <h2 className="text-5xl font-extrabold mb-6 leading-tight bg-gradient-to-r from-white via-white to-gray-500 text-transparent bg-clip-text">
            Join the Future of Event Memories
          </h2>
          <p className="text-gray-400 text-lg mb-10 leading-relaxed">
            PicVibez is more than just a gallery. It's a real-time, AI-powered experience that brings people together through the moments they share.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => navigate('/login')}
              className="px-8 py-4 bg-[#a855f7] hover:bg-[#9333ea] text-white font-bold rounded-full flex items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)]"
            >
              Get Started Now <ArrowRight size={20} />
            </button>
            <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-full transition-all">
              Watch Demo
            </button>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-[#1A1A1A] border border-white/5 rounded-2xl p-6 text-center"
            >
              <div className="text-3xl font-bold text-[#a855f7] mb-1">{stat.value}</div>
              <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold mb-4">Why Choose PicVibez?</h3>
            <p className="text-gray-400">Everything you need to capture, share, and relive your events.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#1A1A1A] border border-white/5 rounded-3xl p-8 hover:bg-[#222] transition-all group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold mb-3">{feature.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-[#a855f7] to-[#6366f1] rounded-[40px] p-12 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl -ml-32 -mb-32" />
          
          <h3 className="text-4xl font-bold mb-6 relative z-10">Ready to Vibe?</h3>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto relative z-10">
            Join thousands of users who are already making their events unforgettable with PicVibez.
          </p>
          
          <button 
            onClick={() => navigate('/login')}
            className="px-10 py-5 bg-white text-[#a855f7] font-black rounded-full text-lg shadow-xl hover:scale-105 transition-transform relative z-10"
          >
            JOIN PICVIBEZ TODAY
          </button>
          
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-white/60 text-sm font-medium relative z-10">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} /> Free to start
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} /> No credit card required
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={16} /> Unlimited guests
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Layers className="text-[#a855f7]" size={24} />
          <span className="text-xl font-bold tracking-tight">PicVibez</span>
        </div>
        <p className="text-gray-500 text-sm mb-8">© 2026 PicVibez Inc. All rights reserved.</p>
        <div className="flex justify-center gap-8 text-gray-400 text-xs font-bold uppercase tracking-widest">
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors">Terms</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
      </footer>
    </div>
  );
}
