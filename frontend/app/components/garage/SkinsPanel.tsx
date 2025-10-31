'use client';

import { CircleDollarSign, Check } from 'lucide-react';

interface SkinItem {
  sku: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface Props {
  skins: SkinItem[];
  equippedSkin?: string;
  onEquip: (skinSku: string) => void;
}

export default function SkinsPanel({ skins, equippedSkin, onEquip }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="mb-3 text-sm text-white/70">Скинүүд</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {skins.length === 0 && (
          <div className="text-white/60 text-sm">Танд скин алга. Дэлгүүрээс худалдан аваарай.</div>
        )}
        {skins.map(s => (
          <div key={s.sku} className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-sm font-semibold">{s.name}</div>
            <div className="mb-3 text-xs text-white/60">{s.sku} • {s.rarity}</div>
            <div className="flex items-center justify-between">
              <button
                onClick={() => onEquip(s.sku)}
                className="rounded-lg bg-emerald-400 px-3 py-1.5 text-sm font-semibold text-black hover:brightness-95"
                disabled={equippedSkin === s.sku}
              >
                {equippedSkin === s.sku ? 'Идэвхтэй' : 'ашиглах'}
              </button>
              {equippedSkin === s.sku && (
                <div className="flex items-center gap-1 text-emerald-300 text-xs"><Check className="h-4 w-4" /> Equipped</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


