'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

interface Friend { _id: string; username: string }

export default function FriendsPage() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function refresh() {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/friends`, { credentials: 'include' });
      const list = await res.json();
      setFriends(list || []);
    } catch {}
  }

  useEffect(() => { refresh(); }, []);

  async function addFriend() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/friends/add`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Алдаа гарлаа');
      setUsername('');
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  async function removeFriend(id: string) {
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/friends/remove`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId: id })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Алдаа гарлаа');
      await refresh();
    } catch (e: any) {
      setError(e?.message || 'Алдаа гарлаа');
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Найзын жагсаалт</h1>
        {error && <div className="mb-3 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        <div className="mb-4 flex gap-2">
          <input value={username} onChange={e => setUsername(e.target.value)} placeholder="Хэрэглэгчийн нэр" className="h-10 rounded-md border border-white/15 bg-white/10 px-3 text-white placeholder:text-white/50 focus:outline-none" />
          <button onClick={addFriend} disabled={!username.trim() || loading} className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95 disabled:opacity-60">Нэмэх</button>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5">
          <div className="grid grid-cols-3 border-b border-white/10 bg-white/5 px-4 py-2 text-xs uppercase text-white/60">
            <div>#</div>
            <div>Хэрэглэгч</div>
            <div>Үйлдэл</div>
          </div>
          {friends.map((f, idx) => (
            <div key={f._id} className="grid grid-cols-3 items-center px-4 py-3 text-sm odd:bg-white/0 even:bg-white/[0.03]">
              <div className="text-white/70">{idx + 1}</div>
              <div className="font-semibold">{f.username}</div>
              <div>
                <button onClick={() => removeFriend(f._id)} className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15">Устгах</button>
              </div>
            </div>
          ))}
          {friends.length === 0 && (
            <div className="px-4 py-6 text-sm text-white/60">Найз байхгүй байна.</div>
          )}
        </div>
      </div>
    </div>
  );
}


