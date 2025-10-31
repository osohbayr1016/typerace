'use client';

import Navbar from '../components/Navbar';
import { Trophy } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import CountdownTimer from '../components/leaderboard/CountdownTimer';
import LeaderboardTable from '../components/leaderboard/LeaderboardTable';

type Scope = 'daily' | 'weekly' | 'monthly' | 'alltime';
type Metric = 'speed' | 'accuracy' | 'games';

interface Entry { username: string; value: number }

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [me, setMe] = useState<{ username: string; value: number; rank: number } | null>(null);
  const [scope, setScope] = useState<Scope>('alltime');
  const [metric, setMetric] = useState<Metric>('speed');
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/leaderboard2?scope=${scope}&metric=${metric}&limit=20`,
        { credentials: 'include' }
      );
      const json = await res.json();
      setEntries((json?.entries || []).map((e: any) => ({ username: e.username, value: e.value })));
      setMe(json?.me ? { username: json.me.username, value: json.me.value, rank: json.me.rank } : null);
    } catch {
      setEntries([]);
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, [scope, metric]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="flex items-center gap-2 text-3xl font-extrabold tracking-tight">
            <Trophy className="h-8 w-8 text-amber-300" /> Leaderboard
          </h1>
        </div>

        <div className="mb-6">
          <CountdownTimer onRefresh={fetchData} intervalMs={300000} />
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white/70">Хугацаа:</label>
            <select
              value={scope}
              onChange={(e) => setScope(e.target.value as Scope)}
              className="rounded-lg border border-white/20 bg-[#0a0f1e] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d1328] hover:border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              <option value="daily" className="bg-[#0a0f1e] text-white">Өнөөдөр</option>
              <option value="weekly" className="bg-[#0a0f1e] text-white">7 хоног</option>
              <option value="monthly" className="bg-[#0a0f1e] text-white">Сарын</option>
              <option value="alltime" className="bg-[#0a0f1e] text-white">Бүх цаг</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-white/70">Үзүүлэлт:</label>
            <select
              value={metric}
              onChange={(e) => setMetric(e.target.value as Metric)}
              className="rounded-lg border border-white/20 bg-[#0a0f1e] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0d1328] hover:border-emerald-500/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 cursor-pointer"
            >
              <option value="speed" className="bg-[#0a0f1e] text-white">Хурд (WPM)</option>
              <option value="accuracy" className="bg-[#0a0f1e] text-white">Нарийвчлал (%)</option>
              <option value="games" className="bg-[#0a0f1e] text-white">Тоглолтын тоо</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center rounded-xl border border-white/10 bg-white/5 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-white/10 border-t-emerald-500" />
          </div>
        ) : (
          <LeaderboardTable entries={entries} me={me} metric={metric} />
        )}
      </div>
    </div>
  );
}




