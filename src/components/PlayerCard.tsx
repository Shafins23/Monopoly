import React from 'react';
import { Player } from '../types';
import { Wallet, Map as MapIcon, ShieldAlert } from 'lucide-react';

interface PlayerCardProps {
  player: Player;
  isMe: boolean;
  isCurrentTurn: boolean;
  isBankrupt: boolean;
  key?: React.Key;
}

export default function PlayerCard({ player, isMe, isCurrentTurn, isBankrupt }: PlayerCardProps) {
  return (
    <div className={`relative p-3 rounded-xl border transition-all ${
      isBankrupt ? 'grayscale opacity-50 bg-black/40 border-red-900/20' :
      isCurrentTurn ? 'bg-emerald-900/20 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)] scale-[1.02]' :
      'bg-[#0E1B1B] border-emerald-900/20'
    }`}>
      {isCurrentTurn && (
        <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-3 h-8 bg-emerald-500 rounded-full blur-sm animate-pulse" />
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className="relative">
          <span className="text-3xl filter drop-shadow-md">{player.token}</span>
          {player.jailStatus.inJail && (
            <div className="absolute -bottom-1 -right-1 bg-red-600 text-[8px] font-bold px-1 rounded uppercase tracking-tighter shadow-lg">In Jail</div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className={`font-bold truncate text-sm ${isCurrentTurn ? 'text-emerald-400' : 'text-white'}`}>
              {player.name}
            </span>
            {isMe && <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1 rounded uppercase tracking-tighter border border-emerald-500/20">You</span>}
          </div>
          <div className="flex items-center gap-2 text-[10px] text-emerald-300/40 uppercase font-mono tracking-tighter">
            <span className="flex items-center gap-1">
              <Wallet size={10} /> ${player.balance}
            </span>
            <span className="flex items-center gap-1">
              <MapIcon size={10} /> {player.properties.length} Props
            </span>
          </div>
        </div>
      </div>

      {isCurrentTurn && (
        <div className="flex items-center gap-2 text-[8px] uppercase tracking-widest font-mono text-emerald-500 font-bold animate-pulse">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
          Thinking...
        </div>
      )}

      {isBankrupt && (
        <div className="flex items-center gap-1 text-[8px] uppercase tracking-widest font-mono text-red-500 font-bold">
          <ShieldAlert size={10} /> Bankrupt
        </div>
      )}
    </div>
  );
}
