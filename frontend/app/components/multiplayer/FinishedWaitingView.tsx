'use client';

import { Users, Clock } from 'lucide-react';

interface Player { username: string; socketId: string; progress: number; wpm: number; finished: boolean }

interface FinishedWaitingViewProps {
  players: Player[];
  onRematch: () => void;
}

export default function FinishedWaitingView({ players, onRematch }: FinishedWaitingViewProps) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] py-8 text-white">
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="mb-4 flex items-center justify-between text-white/80">
          <div className="flex items-center gap-2"><Users className="w-5 h-5" /> <span>Бусад тоглогчдын явц</span></div>
          <div className="flex items-center gap-2"><Clock className="w-5 h-5" /> <span>Үр дүнг хүлээж байна...</span></div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(#0d142a,#0a0f22)] p-4 mb-6">
          <div className="space-y-3">
            {players.map((p) => (
              <div key={p.socketId} className="relative h-14 overflow-hidden rounded-lg bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.06),rgba(255,255,255,.06)_10px,rgba(255,255,255,.02)_10px,rgba(255,255,255,.02)_20px)]">
                <div className="absolute inset-y-0 left-2 flex items-center gap-2 text-white/70">
                  <span className="text-sm font-semibold">{p.username}</span>
                  <span className="text-xs">{p.wpm} WPM</span>
                </div>
                <div className="absolute top-1/2 -translate-y-1/2 h-2 bg-sky-400 rounded" style={{ left: '0', right: `${Math.max(0, 100 - p.progress)}%` }} />
              </div>
            ))}
          </div>
        </div>

        <div className="text-center">
          <button onClick={onRematch} className="rounded-lg bg-sky-500/80 hover:bg-sky-500 text-white px-6 py-3">Дараагийн уралдаан</button>
        </div>
      </div>
    </div>
  );
}


