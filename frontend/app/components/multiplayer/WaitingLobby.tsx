'use client';

import { useEffect, useState } from 'react';
import { Users, Flag } from 'lucide-react';

type WaitingPlayer = { username: string; socketId: string; imageUrl?: string };

interface WaitingLobbyProps {
  players: WaitingPlayer[];
  countdownEndsAt: number | null;
  onBack: () => void;
}

export default function WaitingLobby({ players, countdownEndsAt, onBack }: WaitingLobbyProps) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!countdownEndsAt) { setRemaining(null); return; }
    const tick = () => setRemaining(Math.max(0, Math.ceil((countdownEndsAt - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 250);
    return () => clearInterval(t);
  }, [countdownEndsAt]);

  const max = 5;
  const lanes = Array.from({ length: max }, (_, i) => players[i] || null);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#090e1a_100%)] flex items-center justify-center p-8">
      <div className="w-full max-w-4xl text-white">
        <div className="mb-6 flex items-center justify-between text-white/80">
          <div className="flex items-center gap-2"><Users className="w-5 h-5" /> <span>Тоглогчид: {players.length}/{max}</span></div>
          {remaining != null ? (
            <div className="flex items-center gap-2 font-semibold"><Flag className="w-4 h-4" /> Эхлэх: {remaining}s</div>
          ) : (
            <div className="text-white/60">Хамт тоглогчдыг хүлээж байна...</div>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-xl">
          <div className="space-y-3">
            {lanes.map((p, idx) => (
              <div key={idx} className="relative overflow-hidden rounded-lg bg-[linear-gradient(90deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))]">
                <div className="absolute inset-y-0 left-16 w-px bg-white/10" />
                <div className="absolute inset-y-0 left-32 w-px bg-white/5" />
                <div className="absolute inset-y-0 left-48 w-px bg-white/10" />
                <div className="relative flex items-center gap-4 p-3">
                  <div className={`h-10 w-10 flex items-center justify-center rounded-full ${p ? 'bg-emerald-400 text-black' : 'bg-white/10 text-white/40'}`}>{idx + 1}</div>
                  {p?.imageUrl && (
                    <div className="h-10 w-16 rounded bg-black/30 border border-white/10 overflow-hidden flex items-center justify-center">
                      <img src={p.imageUrl} alt={p.username} className="h-10 object-contain" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div className={`${p ? 'bg-emerald-400' : 'bg-white/20'} h-2 rounded-full`} style={{ width: '0%' }} />
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded text-sm ${p ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-white/5 text-white/50 border border-white/10'}`}>
                    {p ? p.username : 'Хоосон'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 text-center">
            <button onClick={onBack} className="bg-white/10 hover:bg-white/15 border border-white/10 text-white py-2.5 px-6 rounded-lg">Буцах</button>
          </div>
        </div>
      </div>
    </div>
  );
}


