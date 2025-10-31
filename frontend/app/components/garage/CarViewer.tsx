'use client';

import Image from 'next/image';
import { CircleDollarSign, Settings2 } from 'lucide-react';

interface Props {
  selectedSku?: string;
  name?: string;
  rarity?: 'common' | 'rare' | 'epic' | 'legendary';
  imageUrl?: string;
  onEquip?: () => void;
  equippedSku?: string;
}

const rarityStyles: Record<string, string> = {
  common: 'from-slate-500/30 to-slate-500/10 border-slate-400/30',
  rare: 'from-sky-500/30 to-sky-500/10 border-sky-400/30',
  epic: 'from-fuchsia-500/30 to-fuchsia-500/10 border-fuchsia-400/30',
  legendary: 'from-amber-500/30 to-amber-500/10 border-amber-400/30',
};

export default function CarViewer({ selectedSku, name, rarity = 'common', imageUrl, onEquip, equippedSku }: Props) {
  return (
    <div className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${rarityStyles[rarity]} p-4`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-white/70">Сонгосон машин</div>
          <div className="text-xl font-extrabold">{name || 'Starter Car'}</div>
        </div>
        <div className="flex items-center gap-2 text-amber-300">
          <CircleDollarSign className="h-5 w-5" />
          <span className="text-sm">Засвар үйлчилгээ үнэгүй</span>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="col-span-2">
          <div className="relative h-48 w-full rounded-xl bg-[radial-gradient(600px_200px_at_50%_0%,rgba(255,255,255,.08),transparent)]">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-28 w-[75%] rounded-xl bg-white/10 blur" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Image src={imageUrl || '/placeholder-car.png'} alt="car" width={520} height={160} className="opacity-95" />
            </div>
          </div>
        </div>
        <div className="grid content-between">
          <div className="rounded-xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 text-sm text-white/70">Дэлгэрэнгүй</div>
            <div className="space-y-1 text-sm text-white/80">
              <div>SKU: {selectedSku || 'car.basic'}</div>
              <div>Ангилал: {rarity}</div>
              <div>Засвар: 0 зоос</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={onEquip} disabled={equippedSku === selectedSku} className={`rounded-lg px-3 py-2 text-sm font-semibold hover:brightness-95 ${equippedSku === selectedSku ? 'bg-emerald-500/30 text-emerald-200 cursor-not-allowed' : 'bg-emerald-400 text-black'}`}>{equippedSku === selectedSku ? 'Идэвхтэй' : 'ашиглах'}</button>
            <button className="rounded-lg bg-white/10 px-3 py-2 text-sm text-white/90 hover:bg-white/15 border border-white/10 flex items-center justify-center gap-1"><Settings2 className="h-4 w-4" /> Тохиргоо</button>
          </div>
        </div>
      </div>
    </div>
  );
}


