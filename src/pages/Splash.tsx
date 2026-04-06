import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layers, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppContext } from '../context/AppContext';

export function Splash() {
  const navigate = useNavigate();
  const { login } = useAppContext();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const duration = 2500; // 2.5 seconds
    const interval = 50;
    const steps = duration / interval;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setProgress(Math.min(Math.round((currentStep / steps) * 100), 100));
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(() => {
          login(); // Set authenticated state
          navigate('/'); // Navigate to home
        }, 500);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [navigate, login]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden items-center justify-center px-8">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#3b82f6]/20 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-[#a855f7]/20 rounded-full blur-[80px]" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center">
        {/* Logo Animation */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center mb-16"
        >
          <div className="relative mb-6">
            <h1 className="text-6xl font-black bg-gradient-to-br from-[#8b5cf6] to-[#3b82f6] text-transparent bg-clip-text tracking-tighter">
              PV
            </h1>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-2 -right-2 text-[#3b82f6]"
            >
              <Sparkles size={20} />
            </motion.div>
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-[#8b5cf6] via-[#3b82f6] to-[#06b6d4] text-transparent bg-clip-text mb-4">
            PicVibez
          </h2>
          
          <p className="text-muted-foreground text-sm flex items-center gap-2">
            Capture the Vibe. Share the Moment. 📸
          </p>
        </motion.div>

        {/* Progress Bar */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="w-full mt-12"
        >
          <div className="flex justify-between items-center mb-3">
            <span className="text-[10px] font-bold text-muted-foreground tracking-widest uppercase">
              Syncing Moments
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              {progress}%
            </span>
          </div>
          
          <div className="h-1 w-full bg-card rounded-full overflow-hidden mb-6">
            <motion.div 
              className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#06b6d4] rounded-full"
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles size={12} className="text-[#06b6d4]" />
            </motion.div>
            Enhancing your visual library...
          </div>
        </motion.div>
      </div>
    </div>
  );
}
