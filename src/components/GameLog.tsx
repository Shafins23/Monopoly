import React from 'react';
import { LogEntry } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export default function GameLog({ logs }: { logs: LogEntry[] }) {
  const displayLogs = [...logs].reverse().slice(0, 20);

  return (
    <div className="bg-black/20 p-4 shrink-0 flex flex-col h-48 border-t border-emerald-900/10">
      <h3 className="text-[10px] uppercase tracking-widest font-mono text-emerald-500/60 mb-3">Live Activity</h3>
      <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
        <AnimatePresence mode="popLayout">
          {displayLogs.map((log) => (
            <motion.div 
              key={log.timestamp + log.message}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-[11px] leading-snug flex gap-2 font-mono border-l-2 pl-2 ${
                log.type === 'success' ? 'border-emerald-500 text-emerald-100' :
                log.type === 'danger' ? 'border-red-500 text-red-100' :
                log.type === 'warning' ? 'border-yellow-500 text-yellow-100' :
                'border-emerald-900/50 text-emerald-50/60'
              }`}
            >
              <span className="opacity-30">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
              <span>{log.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
