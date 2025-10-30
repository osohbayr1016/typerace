'use client';

import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

interface ResultsViewProps {
  rankings: Array<{ socketId: string; username: string; wpm: number; accuracy: number }>;
  onBack: () => void;
  onRematch?: () => void;
}

export default function ResultsView({ rankings, onBack, onRematch }: ResultsViewProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] flex items-center justify-center p-8 text-white">
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-2xl border border-white/10 bg-white/5 p-8 max-w-2xl w-full shadow-xl">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-6 text-center">Уралдааны дүн</h2>
        <div className="space-y-4 mb-6">
          {rankings.map((player, index) => (
            <motion.div key={player.socketId} initial={{ x: -50, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.1 }} className={`flex justify-between items-center p-4 rounded-lg border ${index === 0 ? 'bg-yellow-500/10 border-yellow-400/40' : index === 1 ? 'bg-white/5 border-white/20' : index === 2 ? 'bg-orange-500/10 border-orange-400/40' : 'bg-white/5 border-white/10'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold">{index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}.`}</span>
                <span className="font-semibold">{player.username}</span>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{player.wpm} WPM</div>
                <div className="text-sm text-white/70">{player.accuracy}% нарийвчлал</div>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="flex gap-4">
          <button onClick={onBack} className="flex-1 bg-white/10 hover:bg-white/15 border border-white/10 text-white py-3 rounded-lg">Буцах</button>
          <button onClick={onRematch} className="flex-1 bg-sky-500/80 hover:bg-sky-500 text-white py-3 rounded-lg">Дахин тоглох</button>
        </div>
      </motion.div>
    </div>
  );
}


