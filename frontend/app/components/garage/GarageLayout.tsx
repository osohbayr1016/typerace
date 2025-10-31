 'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { api } from '../../lib/api';
import GarageSidebar from './GarageSidebar';
import CarViewer from './CarViewer';
import CarCarousel from './CarCarousel';
import SkinsPanel from './SkinsPanel';

type TabKey = 'cars' | 'paint' | 'decals' | 'titles';

interface InventoryItem { sku: string; acquiredAt: string }

export default function GarageLayout() {
  const [tab, setTab] = useState<TabKey>('cars');
  const [cars, setCars] = useState<{ sku: string; name: string; rarity: 'common' | 'rare' | 'epic' | 'legendary'; image?: string }[]>([]);
  const [selected, setSelected] = useState<string>('car.basic');
  const [skins, setSkins] = useState<{ sku: string; name: string; rarity: 'common' | 'rare' | 'epic' | 'legendary' }[]>([]);
  const [equipped, setEquipped] = useState<{ carSku?: string; skinSku?: string }>({});
  const pathname = usePathname();

  const load = useCallback(async () => {
      try {
        const [me, inv, catalog] = await Promise.all([
          api.me().catch(() => null),
          api.inventory().catch(() => ({ items: [] })),
          api.catalog().catch(() => []),
        ]);
        if (me) setEquipped(me?.equipped || {});
        const catalogCars = (catalog || []).filter((it: any) => it.type === 'car');
        const catalogSkins = (catalog || []).filter((it: any) => it.type === 'skin');
        setSkins(catalogSkins.map((s: any) => ({ sku: s.sku, name: s.name, rarity: s.rarity })));

        const ownedSkus = new Set((inv?.items || []).map((i: any) => i.sku));
        ownedSkus.add('car.basic');
        const mappedFromCatalog = catalogCars
          .filter((c: any) => ownedSkus.has(c.sku))
          .map((c: any) => ({ sku: c.sku, name: c.name, rarity: c.rarity, image: (c.meta && c.meta.image) || undefined }));
        // Include any owned car SKUs that might be missing from current catalog (legacy or temporarily absent)
        const catalogCarSkus = new Set((catalogCars || []).map((c: any) => c.sku));
        const ownedList = Array.from(ownedSkus) as string[];
        const missingOwned = ownedList.filter((sku) => sku.startsWith('car.') && !catalogCarSkus.has(sku));
        const synthesized = missingOwned.map((sku) => ({ sku, name: sku, rarity: 'common' as const, image: undefined }));
        const ownedCars = [...mappedFromCatalog, ...synthesized];
        setCars(ownedCars);
        if (ownedCars.length > 0) {
          setSelected(prev => ownedCars.find(c => c.sku === prev)?.sku || ownedCars[0].sku);
        }
      } catch {}
    }, []);

  useEffect(() => {
    load();
    const onInv = () => load();
    const onEco = () => load();
    const onFocus = () => load();
    const onStorage = (e: StorageEvent) => { if (e.key === 'inventory-updated') load(); };
    if (typeof window !== 'undefined') {
      window.addEventListener('inventory-updated', onInv);
      window.addEventListener('economy-updated', onEco);
      window.addEventListener('focus', onFocus);
      window.addEventListener('storage', onStorage as any);
    }
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('inventory-updated', onInv);
        window.removeEventListener('economy-updated', onEco);
        window.removeEventListener('focus', onFocus);
        window.removeEventListener('storage', onStorage as any);
      }
    };
  }, []);

  // Reload when route changes (e.g., navigating from Shop -> Garage)
  useEffect(() => {
    load();
  }, [pathname, load]);

  const selectedCar = cars.find(c => c.sku === selected);

  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight">Гараж</h1>
        <div className="text-white/70 text-sm">NitroType хэв маягийн гараж</div>
      </div>
      <div className="grid gap-5 md:grid-cols-[220px_1fr]">
        <GarageSidebar active={tab} onChange={setTab} />
        <div className="grid gap-4">
          <CarViewer selectedSku={selectedCar?.sku} name={selectedCar?.name} rarity={selectedCar?.rarity} imageUrl={selectedCar?.image} equippedSku={equipped?.carSku} onEquip={async () => {
            try {
              await api.equip({ carSku: selected });
              const me = await api.me();
              setEquipped(me?.equipped || {});
            } catch {}
          }} />
          <CarCarousel cars={cars} selected={selected} onSelect={setSelected} />
          {tab === 'paint' && (
            <SkinsPanel
              skins={skins}
              equippedSkin={equipped?.skinSku}
              onEquip={async (skinSku) => {
                try {
                  await api.equip({ skinSku });
                  const me = await api.me();
                  setEquipped(me?.equipped || {});
                } catch {}
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}


