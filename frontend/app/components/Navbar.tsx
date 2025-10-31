'use client';

import Link from 'next/link';
import { Trophy, Users, Settings, LogIn, LogOut, CircleDollarSign, Award, ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import AuthModal from './AuthModal';
import { api } from '../lib/api';

export default function Navbar() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [raceMenuOpen, setRaceMenuOpen] = useState(false);

  useEffect(() => {
    const fetchUser = () => {
      api.me().then(setUser).catch(() => {
        setUser(null);
      });
    };
    fetchUser();
    // Refresh user data every 5 seconds when logged in
    const interval = setInterval(fetchUser, 5000);
    // Listen for economy-updated events to refresh immediately
    const onEconomy = () => fetchUser();
    if (typeof window !== 'undefined') window.addEventListener('economy-updated', onEconomy);
    return () => {
      clearInterval(interval);
      if (typeof window !== 'undefined') window.removeEventListener('economy-updated', onEconomy);
    };
  }, []);

  async function handleLogout() {
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if request fails
      setUser(null);
    }
  }

  function handleAuthed(newUser: any) {
    setUser(newUser);
    setAuthOpen(false);
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
        <nav className="hidden items-center gap-6 md:flex relative">
          <button
            onClick={() => setRaceMenuOpen((v) => !v)}
            className="text-sm text-white/80 hover:text-white inline-flex items-center gap-1"
          >
            Уралдах <ChevronDown className="h-4 w-4" />
          </button>
          {raceMenuOpen && (
            <div className="absolute left-0 top-10 z-50 w-44 rounded-lg border border-white/10 bg-[linear-gradient(180deg,#0b1020,#090e1a)] p-1 shadow-lg">
              <Link href="/race" onClick={() => setRaceMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm text-white/85 hover:bg-white/10">Ганцаарчилсан</Link>
              <Link href="/multiplayer" onClick={() => setRaceMenuOpen(false)} className="block rounded-md px-3 py-2 text-sm text-white/85 hover:bg-white/10">Олон тоглогч</Link>
            </div>
          )}
          <Link href="/garage" className="text-sm text-white/80 hover:text-white">
            Гараж
          </Link>
          <Link href="/leaderboard" className="text-sm text-white/80 hover:text-white">
            Leaderboard
          </Link>
          <Link href="/shop" className="text-sm text-white/80 hover:text-white">
            Дэлгүүр
          </Link>
          <Link href="/battlepass" className="text-sm text-white/80 hover:text-white">
            Battle Pass
          </Link>
          
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-3 md:flex">
                <div className="flex items-center gap-1.5 rounded-md bg-yellow-500/20 px-2.5 py-1 text-sm font-semibold text-yellow-300 border border-yellow-500/30">
                  <CircleDollarSign className="h-3.5 w-3.5" />
                  <span>{user.money || 0}</span>
                </div>
                <a href="/levels" className="flex items-center gap-1.5 rounded-md bg-blue-500/20 px-2.5 py-1 text-sm font-semibold text-blue-300 border border-blue-500/30 hover:bg-blue-500/25">
                  <Award className="h-3.5 w-3.5" />
                  <span>Lv.{user.level || 1}</span>
                  <span className="text-xs text-blue-200/70">({(user.expInLevel ?? (user.exp || 0))}/{user.nextLevelXp ?? 100})</span>
                </a>
              </div>
              <Link href={`/profile/${user.username || ''}`} className="hidden text-sm text-white/80 md:inline hover:text-white">{user.username || user.email}</Link>
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
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthed={handleAuthed} />
    </header>
  );
}


