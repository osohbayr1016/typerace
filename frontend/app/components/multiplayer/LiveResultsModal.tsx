'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CircleDollarSign, Award } from 'lucide-react';
import { useEffect } from 'react';
import { api } from '../../lib/api';

type Player = { socketId: string; username: string; wpm: number; progress: number; finished: boolean };
type Ranking = { socketId: string; username: string; wpm: number; accuracy: number; rewards?: { coins: number; exp: number; levelUp: number } };

interface LiveResultsModalProps {
  open: boolean;
  players?: Player[];
  rankings?: Ranking[] | null;
  currentUsername?: string;
  provisionalRewards?: { coins: number; exp: number };
  onClose?: () => void;
  onRematch: () => void;
}

export default function LiveResultsModal({ open, players = [], rankings, currentUsername, provisionalRewards, onClose, onRematch }: LiveResultsModalProps) {
  const liveOrder = [...players]
    .sort((a, b) => (b.finished === a.finished ? (b.progress - a.progress) || (b.wpm - a.wpm) : Number(b.finished) - Number(a.finished)));

  // Refresh user data when final results arrive to update currency
  useEffect(() => {
    if (open && rankings && rankings.length > 0) {
      api.me().catch(() => {});
    }
  }, [open, rankings]);

  const list = rankings && rankings.length > 0
    ? rankings.map(r => ({ 
        id: r.socketId, 
        name: r.username, 
        meta: `${r.wpm} WPM`,
        rewards: r.rewards
      }))
    : liveOrder.map(p => ({ 
        id: p.socketId, 
        name: p.username, 
        meta: `${Math.max(0, p.wpm || 0)} WPM • ${Math.floor(p.progress)}%`,
        rewards: undefined
      }));

  const isFinal = !!rankings && rankings.length > 0;
  
  // Find current user's rewards (prefer final; fallback to provisional)
  const finalReward = currentUsername && rankings
    ? rankings.find(r => r.username === currentUsername)?.rewards
    : null;
  const currentUserRewards = finalReward || (provisionalRewards ? { coins: provisionalRewards.coins, exp: provisionalRewards.exp, levelUp: 0 } : null);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#101a35,#0b1020)] text-white shadow-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Уралдааны дүн</h3>
              <span className={`text-xs px-2 py-0.5 rounded border ${isFinal ? 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10' : 'border-yellow-400/40 text-yellow-300 bg-yellow-400/10'}`}>{isFinal ? 'Final' : 'Live'}</span>
            </div>
            {currentUserRewards && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }} 
                className="mb-4 rounded-lg border border-yellow-400/50 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 p-4"
              >
                <div className="text-center mb-2">
                  <span className="text-sm font-semibold text-yellow-300">Таны шагнал</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-2 rounded-md bg-yellow-500/30 px-4 py-2 text-lg font-bold text-yellow-200 border border-yellow-400/50">
                    <CircleDollarSign className="h-5 w-5" />
                    <span>+{currentUserRewards.coins}</span>
                  </div>
                  <div className="flex items-center gap-2 rounded-md bg-blue-500/30 px-4 py-2 text-lg font-bold text-blue-200 border border-blue-400/50">
                    <Award className="h-5 w-5" />
                    <span>+{currentUserRewards.exp} EXP</span>
                    {currentUserRewards.levelUp > 0 && (
                      <span className="ml-1 text-sm text-emerald-300 font-bold">Level {currentUserRewards.levelUp} ↑</span>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {list.map((item, index) => {
                const isCurrentUser = currentUsername && item.name === currentUsername;
                const rewards = item.rewards;
                return (
                  <motion.div key={item.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.04 }} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${isCurrentUser && rewards ? 'border-yellow-400/50 bg-yellow-500/10' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <span className="w-6 text-right text-white/70">{index + 1}.</span>
                      <span className="font-semibold">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-sm text-white/70">{item.meta}</div>
                      {rewards && (
                        <div className="flex items-center gap-2 ml-3">
                          <div className="flex items-center gap-1 rounded-md bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300 border border-yellow-500/30">
                            <CircleDollarSign className="h-3 w-3" />
                            <span>+{rewards.coins}</span>
                          </div>
                          <div className="flex items-center gap-1 rounded-md bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-300 border border-blue-500/30">
                            <Award className="h-3 w-3" />
                            <span>+{rewards.exp}</span>
                            {rewards.levelUp > 0 && (
                              <span className="ml-1 text-xs text-emerald-300">Lv.{rewards.levelUp}↑</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={onClose} className="rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 py-2.5">Буцах</button>
              <button onClick={onRematch} className="rounded-lg bg-sky-500/80 hover:bg-sky-500 py-2.5">Дараагийн тоглолт</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


