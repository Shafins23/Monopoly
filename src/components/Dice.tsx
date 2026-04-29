import React from 'react';
import { motion } from 'motion/react';

export default function Dice({ values, rolling }: { values: [number, number], rolling: boolean }) {
  return (
    <div className="flex gap-4">
      <DiceCube value={values[0]} rolling={rolling} />
      <DiceCube value={values[1]} rolling={rolling} />
    </div>
  );
}

function DiceCube({ value, rolling }: { value: number, rolling: boolean }) {
  const dotPositions: Record<number, number[]> = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 1, 2, 6, 7, 8]
  };

  return (
    <motion.div 
      animate={rolling ? {
        rotate: [0, 90, 180, 270, 360],
        scale: [1, 1.1, 1],
        x: [0, 5, -5, 0]
      } : {}}
      transition={rolling ? { repeat: Infinity, duration: 0.2 } : {}}
      className="w-14 h-14 bg-white rounded-xl shadow-lg border-2 border-slate-200 grid grid-cols-3 p-2.5 gap-1.5"
    >
      {[...Array(9)].map((_, i) => (
        <div key={i} className="flex items-center justify-center">
          {dotPositions[value]?.includes(i) && (
            <div className="w-full h-full bg-slate-900 rounded-full" />
          )}
        </div>
      ))}
    </motion.div>
  );
}
