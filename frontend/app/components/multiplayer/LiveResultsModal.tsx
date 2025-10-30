'use client';

import { AnimatePresence, motion } from 'framer-motion';

type Player = { socketId: string; username: string; wpm: number; progress: number; finished: boolean };
type Ranking = { socketId: string; username: string; wpm: number; accuracy: number };

interface LiveResultsModalProps {
  open: boolean;
  players?: Player[];
  rankings?: Ranking[] | null;
  onClose?: () => void;
  onRematch: () => void;
}

export default function LiveResultsModal({ open, players = [], rankings, onClose, onRematch }: LiveResultsModalProps) {
  const liveOrder = [...players]
    .sort((a, b) => (b.finished === a.finished ? (b.progress - a.progress) || (b.wpm - a.wpm) : Number(b.finished) - Number(a.finished)));

  const list = rankings && rankings.length > 0
    ? rankings.map(r => ({ id: r.socketId, name: r.username, meta: `${r.wpm} WPM` }))
    : liveOrder.map(p => ({ id: p.socketId, name: p.username, meta: `${Math.max(0, p.wpm || 0)} WPM • ${Math.floor(p.progress)}%` }));

  const isFinal = !!rankings && rankings.length > 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="w-full max-w-2xl rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#101a35,#0b1020)] text-white shadow-2xl p-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Уралдааны дүн</h3>
              <span className={`text-xs px-2 py-0.5 rounded border ${isFinal ? 'border-emerald-400/40 text-emerald-300 bg-emerald-400/10' : 'border-yellow-400/40 text-yellow-300 bg-yellow-400/10'}`}>{isFinal ? 'Final' : 'Live'}</span>
            </div>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {list.map((item, index) => (
                <motion.div key={item.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: index * 0.04 }} className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-right text-white/70">{index + 1}.</span>
                    <span className="font-semibold">{item.name}</span>
                  </div>
                  <div className="text-sm text-white/70">{item.meta}</div>
                </motion.div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-2 gap-3">
              <button onClick={onClose} className="rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 py-2.5">Үргэлжлүүлэх</button>
              <button onClick={onRematch} className="rounded-lg bg-sky-500/80 hover:bg-sky-500 py-2.5">Дараагийн тоглолт</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


