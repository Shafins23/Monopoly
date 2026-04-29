import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { nanoid } from 'nanoid';
import { Building2, Users, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { GameService } from '../services/gameService';
import { createInitialGameState } from '../utils/gameLogic';

interface LobbyProps {
  user: User;
  onJoin: (roomId: string) => void;
}

export default function Lobby({ user, onJoin }: LobbyProps) {
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!name) return alert('Please enter your name');
    setIsCreating(true);
    const code = nanoid(6).toUpperCase();
    const initialState = createInitialGameState(user.uid, name);
    await GameService.createGame(code, initialState);
    onJoin(code);
  };

  const handleJoin = async () => {
    if (!name || !roomCode) return alert('Please enter name and room code');
    onJoin(roomCode.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-[#0E1B1B] text-white flex flex-col items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[#1B2B2B] p-8 rounded-2xl shadow-2xl border border-emerald-900/30"
      >
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="bg-emerald-600 p-3 rounded-xl shadow-lg shadow-emerald-600/20">
            <Building2 size={32} />
          </div>
          <h1 className="text-3xl font-serif italic font-bold tracking-tight text-emerald-50">
            Monopoly <span className="text-emerald-500">Online</span>
          </h1>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-emerald-300/60 mb-2 uppercase tracking-widest">
              Your Display Name
            </label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rich Uncle Pennybags"
              className="w-full bg-[#0E1B1B] border border-emerald-900/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-sans"
            />
          </div>

          <div className="h-px bg-emerald-900/30 my-2" />

          <div className="grid grid-cols-2 gap-4">
            <button 
              onClick={handleCreate}
              disabled={isCreating}
              className="flex flex-col items-center gap-3 p-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl transition-all group active:scale-95 disabled:opacity-50"
            >
              <Users size={24} />
              <span className="font-bold flex items-center gap-1">
                Create Room <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </button>

            <div className="flex flex-col gap-2">
              <input 
                type="text" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value)}
                placeholder="ROOM CODE"
                className="w-full bg-[#0E1B1B] border border-emerald-900/50 rounded-xl px-3 py-3 text-center font-mono tracking-tighter uppercase focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <button 
                onClick={handleJoin}
                className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-emerald-50 active:scale-95 transition-all"
              >
                Join Game
              </button>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-emerald-900/60 text-xs font-mono uppercase tracking-tighter">
          Instant multiplayer • Real-time sync • Free to play
        </p>
      </motion.div>
    </div>
  );
}
