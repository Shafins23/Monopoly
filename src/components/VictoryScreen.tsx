import React from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { Trophy, ArrowRight, Home, LayoutList } from 'lucide-react';
import { Player } from '../types';

interface VictoryScreenProps {
  winner: Player;
  onExit: () => void;
}

export default function VictoryScreen({ winner, onExit }: VictoryScreenProps) {
  React.useEffect(() => {
    const duration = 15 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[200] bg-black flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full"
      >
        <div className="relative mb-12">
          <motion.div 
            animate={{ rotate: [0, -10, 10, -10, 0] }} 
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-[120px]"
          >
            {winner.token}
          </motion.div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <Trophy size={160} className="text-yellow-500/20" />
          </div>
        </div>

        <h1 className="text-6xl font-serif italic font-black text-emerald-50 mb-2">VICTORY</h1>
        <p className="text-emerald-500 font-mono tracking-widest uppercase mb-8">{winner.name} is the new Tycoon!</p>

        <div className="bg-[#1B2B2B] p-8 rounded-3xl border border-emerald-900/30 mb-8 space-y-4">
          <div className="flex justify-between items-center text-sm font-mono text-emerald-300/40 uppercase">
            <span>Final Wealth</span>
            <span className="text-white text-xl">${winner.balance}</span>
          </div>
          <div className="flex justify-between items-center text-sm font-mono text-emerald-300/40 uppercase">
            <span>Properties Owned</span>
            <span className="text-white text-xl">{winner.properties.length}</span>
          </div>
        </div>

        <button 
          onClick={onExit}
          className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all active:scale-95"
        >
          Exit Game <ArrowRight />
        </button>
      </motion.div>
    </div>
  );
}
