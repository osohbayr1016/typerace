'use client';

import { Timer, Target, XCircle } from 'lucide-react';

interface StatsHUDProps {
  timeMs: number;
  wordsDone: number;
  wordsTotal: number;
  errors: number;
  wpm?: number;
}

export default function StatsHUD({ timeMs, wordsDone, wordsTotal, errors, wpm }: StatsHUDProps) {
  const seconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const timeText = `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="grid grid-cols-4 gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white">
        <Timer className="h-4 w-4 text-sky-300" />
        <div>
          <div className="text-[10px] uppercase text-white/60">Цаг</div>
          <div className="text-sm font-semibold">{timeText}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white">
        <div className="h-4 w-4 rounded bg-amber-300" />
        <div>
          <div className="text-[10px] uppercase text-white/60">WPM</div>
          <div className="text-sm font-semibold">{Math.max(0, Math.floor(wpm || 0))}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white">
        <Target className="h-4 w-4 text-emerald-300" />
        <div>
          <div className="text-[10px] uppercase text-white/60">Ахиц</div>
          <div className="text-sm font-semibold">{wordsDone}/{wordsTotal}</div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white">
        <XCircle className="h-4 w-4 text-rose-300" />
        <div>
          <div className="text-[10px] uppercase text-white/60">Алдаа</div>
          <div className="text-sm font-semibold">{errors}</div>
        </div>
      </div>
    </div>
  );
}


