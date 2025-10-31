'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../lib/api';
import { CircleDollarSign, ShoppingCart, Car as CarIcon, Zap, BadgeDollarSign } from 'lucide-react';

type Item = { sku: string; name: string; type: 'car' | 'skin' | 'boost'; rarity: 'common' | 'rare' | 'epic' | 'legendary'; price: number; meta?: { image?: string } };

export default function ShopPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [balance, setBalance] = useState<number>(0);
  const [owned, setOwned] = useState<Set<string>>(new Set());
  const [loadingSku, setLoadingSku] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [catalog, me, inv] = await Promise.all([api.catalog(), api.me().catch(() => null), api.inventory().catch(() => ({ items: [] }))]);
        setItems(catalog || []);
        if (me) setBalance(me.money || 0);
        setOwned(new Set((inv?.items || []).map((i: any) => i.sku)));
      } catch {
        setItems([]);
      }
    };
    load();
  }, []);

  async function handlePurchase(sku: string, price: number) {
    setError(null);
    if (owned.has(sku) || balance < price) return;
    // Optimistic UI: mark owned & deduct balance immediately
    const prevOwned = new Set(owned);
    const prevBalance = balance;
    const nextOwned = new Set(owned);
    nextOwned.add(sku);
    setOwned(nextOwned);
    setBalance((b) => Math.max(0, b - price));
    setLoadingSku(sku);
    try {
      await api.purchase(sku);
      // Best-effort sync user balance
      const me = await api.me().catch(() => null);
      if (me) setBalance(me.money || 0);
      // Notify other pages (e.g., Garage) to refresh inventory immediately
      try { window.dispatchEvent(new Event('inventory-updated')); } catch {}
      // Cross-tab notification via localStorage event
      try { localStorage.setItem('inventory-updated', String(Date.now())); } catch {}
    } catch (e: any) {
      // Rollback on failure
      setOwned(prevOwned);
      setBalance(prevBalance);
      setError(e?.message || 'Алдаа гарлаа');
    } finally {
      setLoadingSku(null);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Дэлгүүр</h1>
          <div className="flex items-center gap-2 rounded-md bg-yellow-500/20 px-3 py-1 text-sm font-semibold text-yellow-300 border border-yellow-500/30">
            <CircleDollarSign className="h-4 w-4" /> {balance}
          </div>
        </div>

        {error && <div className="mb-3 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div key={it.sku} className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-1 text-xs uppercase tracking-wider text-white/60">{it.type}</div>
              <div className="mb-2 text-lg font-extrabold">{it.name}</div>
              <div className="mb-3 text-xs text-white/60">SKU: {it.sku} • {it.rarity}</div>
              <div className="pointer-events-none absolute right-2 top-2 h-24 w-40 opacity-95 flex items-center justify-center">
                {it.meta?.image ? (
                  <img src={it.meta.image} alt={it.name} className="h-full w-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)]" />
                ) : (
                  <div className="text-white/70">
                    {it.type === 'car' ? (
                      <CarIcon className="h-16 w-16" />
                    ) : it.sku === 'boost.exp' ? (
                      <Zap className="h-16 w-16 text-yellow-300" />
                    ) : it.sku?.startsWith('boost.coin') ? (
                      <BadgeDollarSign className="h-16 w-16 text-yellow-300" />
                    ) : (
                      <CarIcon className="h-16 w-16" />
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-yellow-300">
                  <CircleDollarSign className="h-5 w-5" />
                  <span className="text-sm font-semibold">{it.price}</span>
                </div>
                {owned.has(it.sku) ? (
                  <span className="text-xs text-emerald-300">Худалдан авсан</span>
                ) : (
                  <button
                    onClick={() => handlePurchase(it.sku, it.price)}
                    className="rounded-lg bg-sky-400 px-3 py-2 text-sm font-semibold text-black hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-1"
                    disabled={loadingSku === it.sku || balance < it.price}
                  >
                    <ShoppingCart className="h-4 w-4" /> {loadingSku === it.sku ? 'Худалдаж байна…' : 'Худалдан авах'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


