'use client';

import { useEffect, useState, useMemo } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { CircleDollarSign, Gift, Lock, Check, Car, Award } from 'lucide-react';

type Tier = { xp: number; free: { coins?: number; sku?: string; title?: string }; premium: { coins?: number; sku?: string; title?: string } };

export default function BattlepassPage() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [xp, setXp] = useState<number>(0);
  const [claimed, setClaimed] = useState<Set<string>>(new Set());
  const [claiming, setClaiming] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seasonId, setSeasonId] = useState<string>('');
  const [overflowCount, setOverflowCount] = useState<number>(0);

  const maxXp = useMemo(() => tiers.length > 0 ? tiers[tiers.length - 1].xp : 1000, [tiers]);
  const currentTier = useMemo(() => {
    for (let i = tiers.length - 1; i >= 0; i--) {
      if (xp >= tiers[i].xp) return i;
    }
    return 0;
  }, [xp, tiers]);

  const progressPercent = useMemo(() => {
    if (tiers.length === 0) return 0;
    const current = tiers[currentTier];
    const next = tiers[currentTier + 1];
    if (!next) return 100;
    const range = next.xp - current.xp;
    const progress = xp - current.xp;
    return Math.min(100, Math.max(0, (progress / range) * 100));
  }, [xp, tiers, currentTier]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await (await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/battlepass`, { credentials: 'include' })).json();
        setTiers(data?.tiers || []);
        setXp(data?.xp || 0);
        setSeasonId(data?.seasonId || '');
        setClaimed(new Set(data?.claimed || []));
        setOverflowCount(Number(data?.overflow?.count || 0));
      } catch {
        setTiers([]);
      }
    };
    load();
  }, []);

  async function handleClaim(tierXp: number, track: 'free' | 'premium' | 'overflow') {
    setError(null);
    const key = `${tierXp}_${track}`;
    setClaiming(key);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/battlepass/claim`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: tierXp, track }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Алдаа гарлаа');
      const periodStart = new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth(), 1, 0, 0, 0));
      const claimKey = track === 'overflow' ? `bp_overflow_${seasonId}_${tierXp}` : `bp_${seasonId}_${tierXp}_${track}`;
      setClaimed(prev => new Set([...prev, claimKey]));
      await api.me().catch(() => {});
    } catch (e: any) {
      setError(e?.message || 'Алдаа гарлаа');
    } finally {
      setClaiming(null);
    }
  }

  function isClaimed(tierXp: number, track: 'free' | 'premium'): boolean {
    return claimed.has(`bp_${seasonId}_${tierXp}_${track}`);
  }

  function canClaim(tierXp: number): boolean {
    return xp >= tierXp;
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-1">Battle Pass</h1>
            <div className="text-white/70 text-sm">Season {seasonId}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="rounded-xl border border-blue-400/30 bg-blue-500/10 px-4 py-2">
              <div className="text-xs text-blue-200/80 mb-1">Таны XP</div>
              <div className="text-xl font-bold text-blue-200">{xp}</div>
            </div>
          </div>
        </div>

        {error && <div className="mb-4 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

        {/* Progress Track */}
        <div className="mb-8 relative">
          <div className="relative h-3 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="absolute inset-0 h-3 bg-gradient-to-r from-emerald-400/30 via-blue-400/30 to-purple-400/30" style={{ width: `${Math.min(100, (xp / maxXp) * 100)}%` }} />
            <div className="absolute top-0 left-0 h-3 w-1 bg-white/50" style={{ left: `${Math.min(100, (xp / maxXp) * 100)}%` }} />
          </div>
          <div className="mt-2 text-center text-sm text-white/60">
            Түвшин {currentTier + 1} / {tiers.length} • {xp} / {maxXp} XP
          </div>
        </div>

        {/* Tier Track */}
        <div className="space-y-8">
          {tiers.map((tier, idx) => {
            const unlocked = canClaim(tier.xp);
            const freeClaimed = isClaimed(tier.xp, 'free');
            const premiumClaimed = isClaimed(tier.xp, 'premium');
            const isCurrent = idx === currentTier;
            
            return (
              <div key={tier.xp} className={`relative rounded-2xl border p-6 ${isCurrent ? 'border-sky-400/50 bg-sky-500/10' : 'border-white/10 bg-white/5'}`}>
                <div className="absolute -top-3 left-6 bg-[linear-gradient(180deg,#0b1020,#080c18)] px-2 text-xs font-semibold text-white/80">
                  Tier {idx + 1} • {tier.xp} XP
                </div>

                <div className="grid grid-cols-2 gap-6 mt-4">
                  {/* Free Track */}
                  <div className={`rounded-xl border p-4 ${unlocked ? 'border-emerald-400/30 bg-emerald-500/5' : 'border-white/10 bg-white/5 opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Gift className="h-4 w-4 text-emerald-300" />
                      <span className="text-sm font-semibold text-emerald-300">FREE</span>
                      {freeClaimed && <Check className="h-4 w-4 text-emerald-400 ml-auto" />}
                    </div>
                    <div className="space-y-2">
                      {tier.free.coins ? (
                        <div className="flex items-center gap-2 text-sm">
                          <CircleDollarSign className="h-4 w-4 text-yellow-300" />
                          <span className="text-white/90">{tier.free.coins} зоос</span>
                        </div>
                      ) : null}
                      {tier.free.sku ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-blue-300" />
                          <span className="text-white/90">{tier.free.sku}</span>
                        </div>
                      ) : null}
                      {tier.free.title ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-purple-300" />
                          <span className="text-white/90">{tier.free.title}</span>
                        </div>
                      ) : null}
                    </div>
                    <button
                      onClick={() => handleClaim(tier.xp, 'free')}
                      disabled={!unlocked || freeClaimed || claiming === `${tier.xp}_free`}
                      className="mt-3 w-full rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-black hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {claiming === `${tier.xp}_free` ? 'Авч байна…' : freeClaimed ? 'Авсан' : unlocked ? 'Авах' : <><Lock className="inline h-3 w-3 mr-1" /> Түгжээтэй</>}
                    </button>
                  </div>

                  {/* Premium Track */}
                  <div className={`rounded-xl border p-4 ${unlocked ? 'border-amber-400/30 bg-amber-500/5' : 'border-white/10 bg-white/5 opacity-60'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <Award className="h-4 w-4 text-amber-300" />
                      <span className="text-sm font-semibold text-amber-300">PREMIUM</span>
                      {premiumClaimed && <Check className="h-4 w-4 text-amber-400 ml-auto" />}
                    </div>
                    <div className="space-y-2">
                      {tier.premium.coins ? (
                        <div className="flex items-center gap-2 text-sm">
                          <CircleDollarSign className="h-4 w-4 text-yellow-300" />
                          <span className="text-white/90">{tier.premium.coins} зоос</span>
                        </div>
                      ) : null}
                      {tier.premium.sku ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Car className="h-4 w-4 text-blue-300" />
                          <span className="text-white/90">{tier.premium.sku}</span>
                        </div>
                      ) : null}
                      {tier.premium.title ? (
                        <div className="flex items-center gap-2 text-sm">
                          <Award className="h-4 w-4 text-purple-300" />
                          <span className="text-white/90">{tier.premium.title}</span>
                        </div>
                      ) : null}
                    </div>
                    <button
                      onClick={() => handleClaim(tier.xp, 'premium')}
                      disabled={!unlocked || premiumClaimed || claiming === `${tier.xp}_premium`}
                      className="mt-3 w-full rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-black hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {claiming === `${tier.xp}_premium` ? 'Авч байна…' : premiumClaimed ? 'Авсан' : unlocked ? 'Авах' : <><Lock className="inline h-3 w-3 mr-1" /> Түгжээтэй</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Overflow */}
        {overflowCount > 0 && (
          <div className="mt-10 rounded-2xl border border-yellow-400/30 bg-yellow-500/10 p-6">
            <div className="mb-3 text-sm font-semibold text-yellow-300">Overflow</div>
            <div className="text-white/80 text-sm mb-4">Та Tier 30-с давсан {overflowCount} түвшинд хүрсэн байна. Түвшин бүрт +1000 зоос.</div>
            <div className="grid gap-3 md:grid-cols-3">
              {Array.from({ length: overflowCount }).map((_, i) => {
                const baseXp = tiers.length > 0 ? tiers[tiers.length - 1].xp : 0;
                const tierXp = baseXp + i + 1;
                // tierXp above is placeholder; backend validates with cumulative xp threshold supplied by request. We use last tier xp as label.
                const label = 31 + i;
                const key = `bp_overflow_${seasonId}_${tierXp}`;
                const already = claimed.has(key);
                return (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="mb-2 text-sm">Overflow Tier {label}</div>
                    <div className="flex items-center gap-2 text-yellow-300 mb-3"><CircleDollarSign className="h-4 w-4" /> +1000 зоос</div>
                    <button
                      onClick={() => handleClaim(tierXp, 'overflow')}
                      disabled={already || claiming === `overflow_${label}`}
                      className="rounded-lg bg-yellow-400 px-3 py-2 text-sm font-semibold text-black hover:brightness-95 disabled:opacity-60"
                    >
                      {already ? 'Авсан' : claiming === `overflow_${label}` ? 'Авч байна…' : 'Авах'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
