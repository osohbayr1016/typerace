'use client';

import { useEffect, useMemo, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { Award, CircleDollarSign } from 'lucide-react';

interface UserMe {
  username?: string;
  level?: number;
  exp?: number;
  expInLevel?: number;
  nextLevelXp?: number;
}

function xpForLevel(level: number): number {
  const base = 100;
  const growth = 1.15;
  return Math.round(base * Math.pow(growth, Math.max(0, level - 1)));
}

export default function LevelsPage() {
  const [user, setUser] = useState<UserMe | null>(null);

  useEffect(() => {
    api.me().then(setUser).catch(() => setUser(null));
  }, []);

  const preview = useMemo(() => {
    const rows: { level: number; need: number; total: number; reward?: { coins?: number } }[] = [];
    let total = 0;
    for (let lv = (user?.level || 1); lv < (user?.level || 1) + 12; lv++) {
      const need = xpForLevel(lv);
      total += need;
      const reward = lv % 5 === 0 ? { coins: 100 * Math.ceil(lv / 5) } : undefined;
      rows.push({ level: lv, need, total, reward });
    }
    return rows;
  }, [user?.level]);

  const progressPct = useMemo(() => {
    const have = user?.expInLevel || 0;
    const need = user?.nextLevelXp || 100;
    return Math.min(100, Math.max(0, Math.round((have / need) * 100)));
  }, [user?.expInLevel, user?.nextLevelXp]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold tracking-tight">Түвшин</h1>
          <p className="text-white/70">Түвшний систем: түвшин ахих тусам илүү их XP шаардлагатай болно.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 text-sm text-white/70">Таны ахиц</div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-md bg-blue-500/20 px-3 py-2 text-blue-200 border border-blue-500/30">
                <Award className="h-5 w-5" />
                <span className="font-semibold">Lv.{user?.level || 1}</span>
              </div>
              <div className="text-sm text-white/80">{user?.expInLevel || 0} / {user?.nextLevelXp || 100} XP</div>
            </div>
            <div className="mt-3 h-3 w-full rounded-full bg-white/10">
              <div className="h-3 rounded-full bg-gradient-to-r from-sky-400 to-emerald-400" style={{ width: `${progressPct}%` }} />
            </div>
            <div className="mt-2 text-xs text-white/60">Дараагийн түвшин хүртэл {Math.max(0, (user?.nextLevelXp || 100) - (user?.expInLevel || 0))} XP хэрэгтэй</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="mb-3 text-sm text-white/70">Түвшний муруй (ойролцоогоор)</div>
            <div className="space-y-2">
              {preview.map((r) => (
                <div key={r.level} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="w-12 text-white/70">Lv.{r.level}</span>
                    <span className="text-white/80 text-sm">{r.need} XP</span>
                  </div>
                  {r.reward?.coins ? (
                    <div className="flex items-center gap-1 rounded-md bg-yellow-500/20 px-2 py-1 text-xs font-semibold text-yellow-300 border border-yellow-500/30">
                      <CircleDollarSign className="h-3.5 w-3.5" /> +{r.reward.coins}
                    </div>
                  ) : (
                    <div className="text-xs text-white/40">—</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="mb-3 text-sm text-white/70">Шагналууд (жишээ)</div>
          <div className="grid gap-3 md:grid-cols-3">
            {[5,10,15,20,25,30].map(lv => (
              <div key={lv} className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-4">
                <div className="mb-2 font-semibold">Lv.{lv}</div>
                <div className="flex items-center gap-2 text-yellow-300">
                  <CircleDollarSign className="h-4 w-4" />
                  <span>Шагнал: {100 * Math.ceil(lv/5)} зоос</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-white/60">Тайлбар: Жишээ шагналуудыг харууллаа. Та бодит улирлын Battle Pass-тэй уялдуулж болно.</div>
        </div>
      </div>
    </div>
  );
}
