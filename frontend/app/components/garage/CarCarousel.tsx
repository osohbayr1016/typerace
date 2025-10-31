'use client';

import Image from 'next/image';
import { Car as CarIcon } from 'lucide-react';

interface CarItem {
  sku: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  image?: string;
}

interface Props {
  cars: CarItem[];
  selected?: string;
  onSelect: (sku: string) => void;
}

export default function CarCarousel({ cars, selected, onSelect }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-white/70">Таны цуглуулга</div>
        <div className="text-xs text-white/50">{cars.length} машин</div>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {cars.map(c => (
          <button
            key={c.sku}
            onClick={() => onSelect(c.sku)}
            className={`relative h-24 w-40 shrink-0 rounded-xl border transition-all ${selected === c.sku ? 'border-sky-400/60 bg-sky-500/10' : 'border-white/10 bg-white/5 hover:bg-white/10'}`}
            title={c.name}
          >
            <div className="absolute inset-x-0 top-0 flex items-center justify-between p-2 text-[10px] uppercase tracking-wide">
              <span className="rounded bg-black/40 px-1.5 py-0.5 text-white/80">{c.rarity}</span>
              <span className="rounded bg-black/40 px-1.5 py-0.5 text-white/60">{c.sku}</span>
            </div>
            <div className="flex h-full items-center justify-center">
              {c.image ? (
                <img src={c.image} alt={c.name} className="h-16 object-contain" />
              ) : (
                <CarIcon className="h-10 w-10 text-white/70" />
              )}
            </div>
            <div className="truncate px-2 pb-2 text-xs text-white/80">{c.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
}


