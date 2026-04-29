import React from 'react';
import { BOARD_SPACES, COLORS } from '../constants';
import { GameState, Space as SpaceType } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface BoardProps {
  state: GameState;
}

export default function Board({ state }: BoardProps) {
  return (
    <div className="relative bg-[#F4F1EA] shadow-2xl border-4 border-black box-content grid-board select-none">
      {/* Center Logo/Pot Area */}
      <div className="absolute inset-[13.63%] bg-[#D2E5D2] border-2 border-black flex flex-col items-center justify-center pointer-events-none p-12 text-center">
        <h1 className="text-8xl font-serif italic font-black uppercase tracking-tighter text-black/10 absolute rotate-[-45deg] scale-150">
          MONOPOLY
        </h1>
        {state.settings.freeParkingPot && (
          <div className="relative z-10 bg-black/5 p-6 rounded-3xl border-2 border-dashed border-black/20">
            <div className="text-xs uppercase tracking-widest font-bold text-black/60 mb-1">Free Parking Pot</div>
            <div className="text-4xl font-mono font-bold text-emerald-700">${state.pot}</div>
          </div>
        )}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
          <div className="w-[400px] h-[400px] bg-emerald-900 rounded-full blur-[100px]" />
        </div>
      </div>

      {BOARD_SPACES.map((space, index) => (
        <Space 
          key={space.id} 
          space={space} 
          index={index} 
          state={state}
        />
      ))}
    </div>
  );
}

function Space({ space, index, state }: { space: SpaceType, index: number, state: GameState, key?: React.Key }) {
  const property = state.propertyState[space.id];
  const owner = property?.ownerId ? state.players.find(p => p.uid === property.ownerId) : null;
  const playersHere = state.players.filter(p => p.position === index && !p.isBankrupt);

  // Grid positioning logic
  let style: React.CSSProperties = {};
  if (index === 0) style = { gridArea: '11 / 11' };
  else if (index > 0 && index < 10) style = { gridArea: `11 / ${11 - index}` };
  else if (index === 10) style = { gridArea: '11 / 1' };
  else if (index > 10 && index < 20) style = { gridArea: `${11 - (index - 10)} / 1` };
  else if (index === 20) style = { gridArea: '1 / 1' };
  else if (index > 20 && index < 30) style = { gridArea: `1 / ${index - 19}` };
  else if (index === 30) style = { gridArea: '1 / 11' };
  else if (index > 30 && index < 40) style = { gridArea: `${index - 29} / 11` };

  const isCorner = index % 10 === 0;
  const rotation = index < 10 ? 0 : index < 20 ? 90 : index < 30 ? 180 : 270;

  return (
    <div 
      className={`border border-black flex flex-col items-center justify-between relative bg-white transition-colors
        ${isCorner ? 'w-[100px] h-[100px]' : 'w-[70px] h-[100px]'}
        ${index > 10 && index < 20 ? 'flex-row' : ''}
        ${index > 30 && index < 40 ? 'flex-row-reverse' : ''}
        ${rotation === 180 ? 'flex-col-reverse' : ''}
      `}
      style={style}
    >
      {/* Property Color Bar */}
      {space.type === 'property' && space.color && (
        <div 
          className={`w-full h-[25px] border-b border-black flex items-center justify-center gap-1
            ${index > 10 && index < 20 ? 'h-full w-[25px] border-r border-b-0' : ''}
            ${index > 30 && index < 40 ? 'h-full w-[25px] border-l border-b-0' : ''}
            ${index > 20 && index < 30 ? 'border-b-0 border-t' : ''}
          `}
          style={{ backgroundColor: COLORS[space.color] }}
        >
          {property.houses > 0 && property.houses < 5 && (
            <div className="flex gap-0.5">
              {[...Array(property.houses)].map((_, i) => <span key={i} className="text-[10px]">🏠</span>)}
            </div>
          )}
          {property.houses === 5 && <span className="text-[12px]">🏨</span>}
        </div>
      )}

      {/* Name and Price */}
      <div className={`p-1 flex flex-col items-center justify-center flex-1 text-center
        ${rotation === 90 ? 'rotate-[-90deg]' : ''}
        ${rotation === 270 ? 'rotate-[90deg]' : ''}
        ${rotation === 180 ? 'rotate-180' : ''}
      `}>
        <span className="text-[8px] font-bold leading-tight uppercase mb-0.5 line-clamp-2">{space.name}</span>
        {space.price && <span className="text-[10px] font-mono font-black">${space.price}</span>}
      </div>

      {/* Owner Badge */}
      {owner && (
        <div className="absolute inset-0 border-4 border-current opacity-20 pointer-events-none" style={{ color: owner.color }} />
      )}
      {property?.isMortgaged && (
        <div className="absolute inset-0 bg-red-900/60 backdrop-blur-[1px] flex items-center justify-center rotate-45 text-[10px] font-bold text-white uppercase tracking-tighter">
          Mortgaged
        </div>
      )}

      {/* Players */}
      <div className="absolute inset-0 flex items-center justify-center flex-wrap gap-0.5 p-1 pointer-events-none z-10">
        <AnimatePresence>
          {playersHere.map((p, i) => (
            <motion.div
              key={p.uid}
              layoutId={p.uid}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="text-2xl drop-shadow-lg filter"
              style={{ 
                zIndex: i + 20,
                marginTop: i * -5,
                marginLeft: i * 5
              }}
            >
              {p.token}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
