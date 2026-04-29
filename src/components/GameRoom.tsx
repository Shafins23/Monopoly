import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, ArrowLeft, Play, Users } from 'lucide-react';
import { GameService } from '../services/gameService';
import { GameState, Player } from '../types';
import { TOKENS, PLAYER_COLORS } from '../utils/gameLogic';
import Board from './Board';
import ActionPanel from './ActionPanel';
import PlayerCard from './PlayerCard';
import GameLog from './GameLog';

interface GameRoomProps {
  roomId: string;
  user: User;
  onExit: () => void;
}

import VictoryScreen from './VictoryScreen';

export default function GameRoom({ roomId, user, onExit }: GameRoomProps) {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [me, setMe] = useState<Player | null>(null);

  const solventPlayers = gameState?.players.filter(p => !p.isBankrupt) || [];
  const hasWinner = gameState?.status === 'playing' && solventPlayers.length === 1;

  useEffect(() => {
    const unsubscribe = GameService.subscribeToGame(roomId, (state) => {
      setGameState(state);
      const myPlayer = state.players.find(p => p.uid === user.uid);
      if (myPlayer) setMe(myPlayer);
    });

    return () => unsubscribe();
  }, [roomId, user.uid]);

  useEffect(() => {
    if (hasWinner && gameState?.status === 'playing') {
      GameService.updateGameState(roomId, { status: 'finished', winner: solventPlayers[0].uid });
    }
  }, [hasWinner, gameState?.status, roomId, solventPlayers]);

  const handleJoin = async (name: string) => {
    const player: Player = {
      uid: user.uid,
      name,
      color: PLAYER_COLORS[gameState?.players.length || 0],
      token: TOKENS[gameState?.players.length || 0],
      balance: gameState?.settings.startingMoney || 1500,
      position: 0,
      properties: [],
      jailStatus: { inJail: false, turnsInJail: 0, hasGetOutFree: 0 },
      isBankrupt: false
    };
    await GameService.joinGame(roomId, player);
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-[#0E1B1B] flex items-center justify-center">
        <div className="text-emerald-500 animate-pulse font-serif italic text-xl">
          Connecting to room {roomId}...
        </div>
      </div>
    );
  }

  // Lobby View
  if (gameState.status === 'waiting') {
    return (
      <div className="min-h-screen bg-[#0E1B1B] text-white p-6 flex flex-col items-center">
        <div className="w-full max-w-4xl">
          <div className="flex justify-between items-center mb-12">
            <button onClick={onExit} className="flex items-center gap-2 text-emerald-500/60 hover:text-emerald-500 transition-colors">
              <ArrowLeft size={20} /> Back to Menu
            </button>
            <div className="bg-[#1B2B2B] px-6 py-2 rounded-full border border-emerald-900/30 flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest text-emerald-500/60 font-mono">Room Code</span>
                <span className="text-xl font-mono font-bold tracking-tighter">{roomId}</span>
              </div>
              <button 
                onClick={() => {
                  const shareUrl = window.location.origin + '/#room=' + roomId;
                  
                  try {
                    navigator.clipboard.writeText(shareUrl);
                    alert('Join link copied to clipboard! You can also share exactly this Room Code: ' + roomId);
                  } catch (e) {
                    alert('Due to browser security, please manually copy this link to share: ' + shareUrl + '\n\nOr the Room Code: ' + roomId);
                  }
                }}
                className="bg-emerald-600 p-2 rounded-lg hover:bg-emerald-500 transition-colors"
                title="Copy share link"
              >
                <Share2 size={18} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-6">
              <h2 className="text-4xl font-serif italic font-bold">Waiting Lobby</h2>
              <p className="text-emerald-300/60 leading-relaxed">
                Invite your friends to join using the room code or link above. 
                Host can start once there are at least 2 players.
              </p>

              {!me && (
                <div className="bg-[#1B2B2B] p-6 rounded-2xl border border-emerald-900/30 space-y-4">
                  <h3 className="text-sm font-mono uppercase tracking-widest text-emerald-500">Pick a Name to Join</h3>
                  <div className="flex gap-2">
                    <input 
                      id="lobby-name-input"
                      type="text" 
                      placeholder="Enter name..."
                      className="flex-1 bg-[#0E1B1B] border border-emerald-900/50 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('lobby-name-input') as HTMLInputElement;
                        if (input.value) handleJoin(input.value);
                      }}
                      className="bg-emerald-600 px-6 rounded-xl font-bold hover:bg-emerald-500 transition-all"
                    >
                      Join
                    </button>
                  </div>
                </div>
              )}

              {gameState.hostId === user.uid && gameState.players.length >= 2 && (
                <button 
                  onClick={() => GameService.startGame(roomId)}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 py-4 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-xl shadow-emerald-900/20 active:scale-95 transition-all"
                >
                  <Play fill="currentColor" /> Start Game
                </button>
              )}
            </div>

            <div className="bg-[#1B2B2B] p-8 rounded-3xl border border-emerald-900/30">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-mono uppercase tracking-widest text-emerald-500 flex items-center gap-2">
                  <Users size={16} /> Players ({gameState.players.length}/6)
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {gameState.players.map((p, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    key={p.uid} 
                    className="bg-[#0E1B1B] p-4 rounded-2xl border border-emerald-900/20 flex flex-col items-center gap-2 text-center relative overflow-hidden"
                  >
                    {p.uid === gameState.hostId && (
                      <span className="absolute top-0 right-0 bg-yellow-500 text-black text-[8px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-tighter">Host</span>
                    )}
                    <span className="text-4xl">{p.token}</span>
                    <span className="font-bold truncate w-full">{p.name}</span>
                  </motion.div>
                ))}
                {[...Array(Math.max(0, 6 - gameState.players.length))].map((_, i) => (
                  <div key={i} className="bg-[#0E1B1B]/30 border border-dashed border-emerald-900/20 p-4 rounded-2xl flex flex-col items-center justify-center gap-2 opacity-30">
                    <div className="w-10 h-10 rounded-full bg-emerald-900/20" />
                    <div className="w-16 h-2 bg-emerald-900/20 rounded-full" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Game View
  return (
    <div className="min-h-screen bg-[#0E1B1B] text-white flex flex-col xl:flex-row overflow-hidden font-sans">
      <AnimatePresence>
        {gameState.status === 'finished' && gameState.winner && (
          <VictoryScreen 
            winner={gameState.players.find(p => p.uid === gameState.winner)!} 
            onExit={onExit} 
          />
        )}
      </AnimatePresence>
      
      {/* Left Sidebar: Logo + Players */}
      <div className="w-full xl:w-80 bg-[#1B2B2B] border-r border-emerald-900/30 flex flex-col h-full overflow-hidden shrink-0">
        <div className="p-6 border-b border-emerald-900/20">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-serif italic font-bold">Monopoly</span>
            <span className="text-emerald-500 font-mono text-[10px] tracking-widest border border-emerald-500 px-1 rounded uppercase">Online</span>
          </div>
          <div className="text-[10px] text-emerald-300/40 uppercase font-mono tracking-tighter">Room: {roomId}</div>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {gameState.players.map((p, idx) => (
            <PlayerCard 
              key={p.uid} 
              player={p} 
              isMe={p.uid === user.uid} 
              isCurrentTurn={gameState.turnIndex === idx} 
              isBankrupt={p.isBankrupt}
            />
          ))}
        </div>
        
        <GameLog logs={gameState.log} />
      </div>

      {/* Main Area: Board */}
      <div className="flex-1 bg-[#0A0F0F] relative overflow-auto flex items-center justify-center p-4 min-h-[600px] custom-scrollbar">
        <div className="relative">
          <Board state={gameState} />
        </div>
      </div>

      {/* Bottom Actions Panel */}
      <div className="fixed bottom-0 left-0 xl:left-80 right-0 z-50 pointer-events-none p-4">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">
          <ActionPanel 
            state={gameState} 
            me={me} 
            roomId={roomId}
          />
        </div>
      </div>
    </div>
  );
}
