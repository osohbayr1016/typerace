'use client';

import { Car, Palette, Sticker, Crown } from 'lucide-react';

type TabKey = 'cars' | 'paint' | 'decals' | 'titles';

interface Props {
  active: TabKey;
  onChange: (t: TabKey) => void;
}

export default function GarageSidebar({ active, onChange }: Props) {
  const tabs: { key: TabKey; label: string; icon: any }[] = [
    { key: 'cars', label: 'Машинууд', icon: Car },
    { key: 'paint', label: 'Будалт', icon: Palette },
    { key: 'decals', label: 'Наалт', icon: Sticker },
    { key: 'titles', label: 'Цол', icon: Crown },
  ];

  return (
    <aside className="w-full md:w-56 shrink-0">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
        <div className="mb-2 text-xs uppercase tracking-wider text-white/60">Табууд</div>
        <div className="grid gap-2">
          {tabs.map(t => {
            const Icon = t.icon;
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                onClick={() => onChange(t.key)}
                className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors border ${isActive ? 'bg-white/15 border-white/20 text-white' : 'bg-white/5 border-white/10 text-white/80 hover:bg-white/10'}`}
              >
                <Icon className="h-4 w-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}


