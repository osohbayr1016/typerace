'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '../../components/Navbar';

interface ProfileData {
  username: string;
  level: number; exp: number; money: number; wins: number; bestWpm: number; totalRaces: number; averageAccuracy: number;
  equipped?: { carSku?: string; skinSku?: string };
  team?: { _id: string; name: string } | null;
  friendsCount?: number;
}

export default function ProfilePage() {
  const params = useParams();
  const username = String(params?.username || '');
  const [data, setData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/profile/${username}`, { credentials: 'include' });
        const json = await res.json();
        setData(json);
      } catch {
        setData(null);
      }
    };
    if (username) load();
  }, [username]);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        {!data ? (
          <div className="text-white/70">Ачааллаж байна...</div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 md:col-span-2">
              <div className="mb-2 text-sm text-white/70">Хэрэглэгч</div>
              <div className="text-2xl font-extrabold">{data.username}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-white/80">
                <div>Түвшин: {data.level}</div>
                <div>XP: {data.exp}</div>
                <div>Зоос: {data.money}</div>
                <div>Шилдэг WPM: {data.bestWpm}</div>
                <div>Нийт тоглолт: {data.totalRaces}</div>
                <div>Нарийвчлал: {data.averageAccuracy}%</div>
                <div>Ялалт: {data.wins}</div>
                <div>Найзууд: {data.friendsCount || 0}</div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm text-white/70">Тоноглол</div>
              <div className="text-sm text-white/80">Машин: {data.equipped?.carSku || '—'}</div>
              <div className="text-sm text-white/80">Скин: {data.equipped?.skinSku || '—'}</div>
              <div className="mt-3 text-sm text-white/70">Баг: {data.team?.name || '—'}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


