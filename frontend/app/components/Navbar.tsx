'use client';

import Link from 'next/link';
import { Trophy, Users, Settings, LogIn, LogOut } from 'lucide-react';
import { useEffect, useState } from 'react';
import AuthModal from './AuthModal';
import { api } from '../lib/api';

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    api.me().then(setUser).catch(() => {});
  }, []);

  async function handleLogout() {
    await api.logout();
    setUser(null);
  }

  return (
    <header className="w-full border-b border-black/10 bg-[linear-gradient(180deg,#0b1020_0%,#090e1a_100%)] text-white">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-[6px] bg-gradient-to-br from-yellow-300 to-amber-500 shadow-md" />
          <span className="text-sm font-extrabold tracking-wide">
            MONGOL TYPE RACE
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="/race" className="text-sm text-white/80 hover:text-white">
            Уралдах
          </Link>
          <Link href="/garage" className="text-sm text-white/80 hover:text-white">
            Гараж
          </Link>
          <Link href="/leaderboard" className="text-sm text-white/80 hover:text-white">
            Самбар
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <button className="hidden items-center gap-1 rounded-md bg-yellow-400 px-3 py-1.5 text-sm font-semibold text-black shadow active:translate-y-px md:flex">
            <Trophy className="h-4 w-4" />
            TOP 10
          </button>
          <Link href="/multiplayer" className="hidden rounded-md bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15 md:block">
            <Users className="mr-1 inline h-4 w-4" /> Олон тоглогч
          </Link>
          {user ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-sm text-white/80 md:inline">{user.username || user.email}</span>
              <button onClick={handleLogout} className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15">
                <LogOut className="mr-1 inline h-4 w-4" /> Гарах
              </button>
            </div>
          ) : (
            <button onClick={() => setAuthOpen(true)} className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15">
              <LogIn className="mr-1 inline h-4 w-4" /> Нэвтрэх
            </button>
          )}
          <button className="rounded-md bg-white/0 p-2 text-white/70 hover:text-white">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={setUser} />
    </header>
  );
}


