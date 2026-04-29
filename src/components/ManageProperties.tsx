import React from 'react';
import { motion } from 'motion/react';
import { X, Home, Building, ShieldAlert } from 'lucide-react';
import { GameState, Player } from '../types';
import { BOARD_SPACES, COLORS } from '../constants';
import { GameService } from '../services/gameService';

interface ManagePropertiesProps {
  state: GameState;
  player: Player;
  roomId: string;
  onClose: () => void;
}

export default function ManageProperties({ state, player, roomId, onClose }: ManagePropertiesProps) {
  const myProperties = BOARD_SPACES.filter(s => player.properties.includes(s.id));
  
  const handleBuild = async (spaceId: string) => {
    const space = BOARD_SPACES.find(s => s.id === spaceId)!;
    const propState = state.propertyState[spaceId];
    if (!space.housePrice || player.balance < space.housePrice) return;

    await GameService.performTurn(roomId, (game) => {
      const updatedPlayers = game.players.map(p => 
        p.uid === player.uid ? { ...p, balance: p.balance - (space.housePrice || 0) } : p
      );
      const updatedPropState = { ...game.propertyState };
      updatedPropState[spaceId] = { ...propState, houses: propState.houses + 1 };

      return {
        players: updatedPlayers,
        propertyState: updatedPropState,
        log: [{ 
          message: `${player.name} built a ${propState.houses === 4 ? 'Hotel' : 'House'} on ${space.name}.`, 
          timestamp: Date.now(), 
          type: 'success' as const
        }, ...game.log].slice(0, 50)
      };
    });
  };

  const handleMortgage = async (spaceId: string) => {
    const space = BOARD_SPACES.find(s => s.id === spaceId)!;
    const propState = state.propertyState[spaceId];
    const mortgageValue = (space.price || 0) / 2;

    await GameService.performTurn(roomId, (game) => {
      const updatedPlayers = game.players.map(p => 
        p.uid === player.uid ? { ...p, balance: p.balance + (propState.isMortgaged ? -mortgageValue * 1.1 : mortgageValue) } : p
      );
      const updatedPropState = { ...game.propertyState };
      updatedPropState[spaceId] = { ...propState, isMortgaged: !propState.isMortgaged };

      return {
        players: updatedPlayers,
        propertyState: updatedPropState,
        log: [{ 
          message: `${player.name} ${propState.isMortgaged ? 'unmortgaged' : 'mortgaged'} ${space.name}.`, 
          timestamp: Date.now(), 
          type: 'warning' as const
        }, ...game.log].slice(0, 50)
      };
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#1B2B2B] w-full max-w-2xl rounded-3xl border border-emerald-900/30 overflow-hidden flex flex-col max-h-[80vh]"
      >
        <div className="p-6 border-b border-emerald-900/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Building className="text-emerald-500" />
            <h2 className="text-2xl font-serif italic font-bold">Manage Assets</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
          {myProperties.length === 0 ? (
            <div className="text-center py-12 text-emerald-300/40 font-serif italic">
              You don't own any properties yet.
            </div>
          ) : (
            myProperties.map(space => {
              const propState = state.propertyState[space.id];
              const colorGroup = BOARD_SPACES.filter(s => s.color === space.color);
              const hasFullSet = space.type === 'property' && colorGroup.every(s => state.propertyState[s.id].ownerId === player.uid);
              const canBuild = hasFullSet && propState.houses < 5 && !propState.isMortgaged;

              return (
                <div key={space.id} className="bg-[#0E1B1B] p-4 rounded-2xl border border-emerald-900/20 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-4 h-12 rounded-full" style={{ backgroundColor: space.color ? COLORS[space.color] : '#ccc' }} />
                    <div>
                      <h4 className="font-bold">{space.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] uppercase font-mono tracking-tighter text-emerald-300/40">
                        {propState.houses > 0 && (
                          <span className="flex items-center gap-1 text-emerald-400">
                            {propState.houses === 5 ? 'Hotel' : `${propState.houses} Houses`}
                          </span>
                        )}
                        {propState.isMortgaged && <span className="text-red-400">Mortgaged</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canBuild && (
                      <button 
                        onClick={() => handleBuild(space.id)}
                        disabled={player.balance < (space.housePrice || 0)}
                        className="flex items-center gap-1 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-all disabled:opacity-30"
                      >
                        <Home size={14} /> build (${space.housePrice})
                      </button>
                    )}
                    <button 
                      onClick={() => handleMortgage(space.id)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        propState.isMortgaged 
                          ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600 hover:text-white' 
                          : 'bg-red-600/20 text-red-400 hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      <ShieldAlert size={14} /> {propState.isMortgaged ? `unmortgage ($${Math.floor((space.price || 0) * 0.55)})` : `mortgage ($${(space.price || 0) / 2})`}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
}
