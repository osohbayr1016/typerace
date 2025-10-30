'use client';

import Navbar from '../components/Navbar';
import { Trophy } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Entry {
  username: string;
  bestWpm: number;
  totalRaces?: number;
  averageAccuracy?: number;
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    // Placeholder static data; can be wired to backend /api/leaderboard
    setEntries([
      { username: 'Бат', bestWpm: 112, totalRaces: 34, averageAccuracy: 96 },
      { username: 'Болд', bestWpm: 105, totalRaces: 21, averageAccuracy: 94 },
      { username: 'Саруул', bestWpm: 99, totalRaces: 18, averageAccuracy: 92 },
    ]);
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <Trophy className="h-6 w-6 text-amber-300" /> Самбар
        </h1>
        <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-4 border-b border-white/10 bg-white/5 px-4 py-2 text-xs uppercase text-white/60">
            <div>#</div>
            <div>Хэрэглэгч</div>
            <div>Шилдэг WPM</div>
            <div>Нарийвчлал</div>
          </div>
          {entries.map((e, i) => (
            <div key={e.username} className="grid grid-cols-4 items-center px-4 py-3 text-sm odd:bg-white/0 even:bg-white/[0.03]">
              <div className="font-semibold text-white/80">{i + 1}</div>
              <div className="font-semibold">{e.username}</div>
              <div className="text-emerald-300">{e.bestWpm} WPM</div>
              <div className="text-white/80">{e.averageAccuracy ?? '-'}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}




