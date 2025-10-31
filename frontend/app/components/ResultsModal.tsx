'use client';

import { motion, AnimatePresence } from 'framer-motion';

type Stats = { wpm: number; accuracy: number; time: number; errors: number };

interface ResultsModalProps {
  open: boolean;
  stats: Stats | null;
  onClose: () => void;
}

export default function ResultsModal({ open, stats, onClose }: ResultsModalProps) {
  return (
    <AnimatePresence>
      {open && stats && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className="w-full max-w-sm rounded-2xl border border-white/10 bg-[linear-gradient(180deg,#101a35,#0b1020)] p-5 text-white shadow-2xl"
          >
            <div className="mb-3 text-center text-lg font-extrabold tracking-tight">Үр дүн</div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-[10px] uppercase text-white/60">WPM</div>
                <div className="text-xl font-bold">{Math.round(stats.wpm)}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-[10px] uppercase text-white/60">Нарийвчлал</div>
                <div className="text-xl font-bold">{stats.accuracy}%</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-[10px] uppercase text-white/60">Алдаа</div>
                <div className="text-xl font-bold">{stats.errors}</div>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-center">
                <div className="text-[10px] uppercase text-white/60">Цаг (сек)</div>
                <div className="text-xl font-bold">{Math.round(stats.time)}</div>
              </div>
            </div>
            <div className="mt-5 text-center">
              <button onClick={onClose} className="rounded-md bg-yellow-400 px-4 py-2 text-sm font-semibold text-black">Хаах</button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}







