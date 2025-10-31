'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

interface Team { _id: string; name: string }

export default function TeamsPage() {
  const [team, setTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [error, setError] = useState<string | null>(null);

  async function loadMyTeam() {
    // For brevity, assume user knows their team by ID; you may extend /api/me to include team info
    setTeam(null);
  }

  useEffect(() => { loadMyTeam(); }, []);

  async function createTeam() {
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/teams`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Алдаа гарлаа');
      setTeam({ _id: json._id, name: json.name });
      setName('');
    } catch (e: any) {
      setError(e?.message || 'Алдаа гарлаа');
    }
  }

  async function joinTeam() {
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/teams/join`, {
        method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ teamId: joinId })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Алдаа гарлаа');
      setTeam({ _id: json._id, name: json.name });
      setJoinId('');
    } catch (e: any) {
      setError(e?.message || 'Алдаа гарлаа');
    }
  }

  async function leaveTeam() {
    setError(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/teams/leave`, {
        method: 'POST', credentials: 'include'
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || 'Алдаа гарлаа');
      setTeam(null);
    } catch (e: any) {
      setError(e?.message || 'Алдаа гарлаа');
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Багууд</h1>
        {error && <div className="mb-3 rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}
        {!team ? (
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm text-white/70">Баг үүсгэх</div>
              <div className="flex gap-2">
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Багийн нэр" className="h-10 w-full rounded-md border border-white/15 bg-white/10 px-3 text-white placeholder:text-white/50 focus:outline-none" />
                <button onClick={createTeam} disabled={!name.trim()} className="rounded-md bg-emerald-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95 disabled:opacity-60">Үүсгэх</button>
              </div>
            </div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 text-sm text-white/70">Багт нэгдэх</div>
              <div className="flex gap-2">
                <input value={joinId} onChange={e => setJoinId(e.target.value)} placeholder="Team ID" className="h-10 w-full rounded-md border border-white/15 bg-white/10 px-3 text-white placeholder:text-white/50 focus:outline-none" />
                <button onClick={joinTeam} disabled={!joinId.trim()} className="rounded-md bg-sky-400 px-4 py-2 text-sm font-semibold text-black hover:brightness-95 disabled:opacity-60">Нэгдэх</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <div className="mb-2 text-sm text-white/70">Таны баг</div>
            <div className="text-lg font-extrabold">{team.name}</div>
            <div className="mt-3">
              <button onClick={leaveTeam} className="rounded-md bg-white/10 px-3 py-1.5 text-sm text-white/90 hover:bg-white/15">Гарах</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


