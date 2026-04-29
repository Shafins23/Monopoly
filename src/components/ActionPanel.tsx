import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Dice5, Home, Building, ShieldCheck, UserMinus, ArrowRightCircle, ShoppingCart, CreditCard, Layers } from 'lucide-react';
import { GameState, Player } from '../types';
import { GameService } from '../services/gameService';
import { BOARD_SPACES, COLORS } from '../constants';
import { calculateRent } from '../utils/gameLogic';
import Dice from './Dice';

import ManageProperties from './ManageProperties';

interface ActionPanelProps {
  state: GameState;
  me: Player | null;
  roomId: string;
}

export default function ActionPanel({ state, me, roomId }: ActionPanelProps) {
  const [isRolling, setIsRolling] = useState(false);
  const [showManage, setShowManage] = useState(false);
  const isMyTurn = me && state.players[state.turnIndex].uid === me.uid;
  const isPlaying = state.status === 'playing';
  
  if (!me || !isPlaying) return null;

  const currentPlayer = state.players[state.turnIndex];
  const currentSpace = BOARD_SPACES[currentPlayer.position];
  const propertyState = state.propertyState[currentSpace.id];
  const isBuyable = currentSpace.price && !propertyState?.ownerId && ['property', 'railroad', 'utility'].includes(currentSpace.type);
  const mustPayRent = propertyState?.ownerId && propertyState.ownerId !== currentPlayer.uid && !propertyState.isMortgaged;

  const handleRoll = async () => {
    if (isRolling) return;
    setIsRolling(true);
    
    setTimeout(async () => {
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      const doubles = d1 === d2;

      await GameService.performTurn(roomId, (game) => {
        const player = game.players[game.turnIndex];
        let newPos = (player.position + total) % 40;
        let newBalance = player.balance;
        let passedGo = player.position + total >= 40;
        
        if (passedGo) newBalance += 200;

        const nextSpace = BOARD_SPACES[newPos];
        let inJail = player.jailStatus.inJail;
        let extraLog = "";

        if (newPos === 30) {
          newPos = 10;
          inJail = true;
          extraLog = " (Sent to Jail!)";
        } else if (nextSpace.type === 'tax') {
          newBalance -= nextSpace.price || 0;
          extraLog = ` (Paid $${nextSpace.price} Tax)`;
        } else if (nextSpace.type === 'chance' || nextSpace.type === 'community-chest') {
          const amount = (Math.floor(Math.random() * 20) - 10) * 10;
          newBalance += amount;
          extraLog = ` (${nextSpace.type === 'chance' ? 'Chance' : 'Comm. Chest'}: ${amount >= 0 ? 'Gained' : 'Lost'} $${Math.abs(amount)})`;
        }

        const updatedPlayers = game.players.map(p => 
          p.uid === player.uid 
            ? { 
                ...p, 
                position: newPos, 
                balance: newBalance,
                jailStatus: { ...p.jailStatus, inJail }
              } 
            : p
        );

        let logMsg = `${player.name} rolled ${total} and landed on ${nextSpace.name}${extraLog}.`;

        return {
          players: updatedPlayers,
          dice: [d1, d2],
          lastRoll: { doubles, val1: d1, val2: d2 },
          log: [{ message: logMsg, timestamp: Date.now(), type: (doubles ? 'warning' : 'info') as 'info' | 'warning' | 'success' | 'danger' }, ...game.log].slice(0, 50)
        };
      });

      setIsRolling(false);
    }, 800);
  };

  const handleBuy = async () => {
    if (!currentSpace.price || currentPlayer.balance < currentSpace.price) return;

    await GameService.performTurn(roomId, (game) => {
      const player = game.players[game.turnIndex];
      const updatedPlayers = game.players.map(p => 
        p.uid === player.uid 
          ? { ...p, balance: p.balance - (currentSpace.price || 0), properties: [...p.properties, currentSpace.id] } 
          : p
      );

      const updatedPropState = { ...game.propertyState };
      updatedPropState[currentSpace.id] = { ownerId: player.uid, houses: 0, isMortgaged: false };

      return {
        players: updatedPlayers,
        propertyState: updatedPropState,
        log: [{ 
          message: `${player.name} bought ${currentSpace.name} for $${currentSpace.price}.`, 
          timestamp: Date.now(), 
          type: 'success' as const
        }, ...game.log].slice(0, 50)
      };
    });
  };

  const handlePayRent = async () => {
    const rent = calculateRent(state, currentSpace.id, currentPlayer);
    const ownerId = propertyState.ownerId!;

    await GameService.performTurn(roomId, (game) => {
      const updatedPlayers = game.players.map(p => {
        if (p.uid === currentPlayer.uid) return { ...p, balance: p.balance - rent };
        if (p.uid === ownerId) return { ...p, balance: p.balance + rent };
        return p;
      });

      return {
        players: updatedPlayers,
        log: [{ 
          message: `${currentPlayer.name} paid $${rent} rent to ${game.players.find(p => p.uid === ownerId)?.name}.`, 
          timestamp: Date.now(), 
          type: 'danger' as const
        }, ...game.log].slice(0, 50)
      };
    });
  };

  const handleEndTurn = async () => {
    await GameService.performTurn(roomId, (game) => {
      let nextIndex = (game.turnIndex + 1) % game.players.length;
      while (game.players[nextIndex].isBankrupt) {
        nextIndex = (nextIndex + 1) % game.players.length;
      }
      return { turnIndex: nextIndex, lastRoll: undefined };
    });
  };

  const showBuyBtn = isMyTurn && state.lastRoll && isBuyable;
  const showPayBtn = isMyTurn && state.lastRoll && mustPayRent;
  const canEnd = isMyTurn && state.lastRoll && !mustPayRent;

  return (
    <div className="bg-[#1B2B2B] border border-emerald-900/30 rounded-3xl p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Dice5 size={120} />
      </div>

      <div className="flex items-center gap-8 z-10 w-full md:w-auto">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500/60">Current Turn</span>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{state.players[state.turnIndex].token}</span>
            <div className="flex flex-col">
              <span className="text-xl font-bold italic font-serif tracking-tight">
                {isMyTurn ? "Your Turn" : `${state.players[state.turnIndex].name}'s Turn`}
              </span>
              <span className="text-[10px] font-mono text-emerald-500/60 uppercase">On: {currentSpace.name}</span>
            </div>
          </div>
        </div>
        
        <div className="h-10 w-px bg-emerald-900/20 hidden md:block" />
        
        <Dice values={state.dice} rolling={isRolling} />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto justify-end z-10">
        {!isMyTurn ? (
          <div className="flex items-center gap-2 bg-black/40 px-6 py-4 rounded-xl border border-emerald-900/10 text-emerald-300/40 font-mono text-sm uppercase tracking-widest">
            <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-2 h-2 bg-emerald-500 rounded-full" />
            Waiting for {state.players[state.turnIndex].name}
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 w-full md:w-auto justify-center md:justify-end">
            {!state.lastRoll ? (
              <button 
                onClick={handleRoll}
                disabled={isRolling}
                className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 active:scale-95 disabled:opacity-50 transition-all font-bold px-8 py-4 rounded-2xl shadow-xl shadow-emerald-500/10"
              >
                <Dice5 size={20} /> Roll Dice
              </button>
            ) : (
              <AnimatePresence mode="wait">
                {showBuyBtn && (
                  <button 
                    onClick={handleBuy}
                    disabled={currentPlayer.balance < (currentSpace.price || 0)}
                    className="flex items-center gap-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 disabled:opacity-30 transition-all font-bold px-6 py-4 rounded-2xl border border-emerald-400/30"
                  >
                    <ShoppingCart size={20} /> Buy {currentSpace.name} (${currentSpace.price})
                  </button>
                )}
                {showPayBtn && (
                  <button 
                    onClick={handlePayRent}
                    className="flex items-center gap-3 bg-red-600 hover:bg-red-500 active:scale-95 transition-all font-bold px-6 py-4 rounded-2xl animate-bounce"
                  >
                    <CreditCard size={20} /> Pay Rent (${calculateRent(state, currentSpace.id, currentPlayer)})
                  </button>
                )}
                {canEnd && (
                  <button 
                    onClick={handleEndTurn}
                    className="flex items-center gap-3 bg-white text-black hover:bg-emerald-50 active:scale-95 transition-all font-bold px-8 py-4 rounded-2xl shadow-xl"
                  >
                    End Turn <ArrowRightCircle size={20} />
                  </button>
                )}
              </AnimatePresence>
            )}
            
            <button 
              onClick={() => setShowManage(true)}
              className="p-4 bg-[#0E1B1B] hover:bg-emerald-900/30 rounded-2xl border border-emerald-900/40 text-emerald-500 transition-all active:scale-95" 
              title="Manage Properties"
            >
              <Layers size={20} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showManage && (
          <ManageProperties 
            state={state} 
            player={me} 
            roomId={roomId} 
            onClose={() => setShowManage(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
