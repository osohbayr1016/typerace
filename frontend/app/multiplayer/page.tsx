'use client';

import Navbar from '../components/Navbar';
import MultiplayerGame from '../components/MultiplayerGame';
import { useEffect, useState } from 'react';

export default function MultiplayerPage() {
  const [username, setUsername] = useState('');
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('mp_username');
    if (saved) setUsername(saved);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setUsername(v);
    localStorage.setItem('mp_username', v);
  };

  if (joining) {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
        <Navbar />
        <MultiplayerGame username={username} onBack={() => setJoining(false)} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Олон тоглогч</h1>
        <p className="mb-6 text-white/70">Найзуудтайгаа бодит цагт уралдаарай.</p>
        <div className="mx-auto max-w-md rounded-xl border border-white/10 bg-white/5 p-5">
          <label className="mb-2 block text-sm text-white/70">Хэрэглэгчийн нэр</label>
          <input
            value={username}
            onChange={handleChange}
            placeholder="Жишээ: Бат"
            className="mb-4 h-12 w-full rounded-lg border border-white/15 bg-black/30 px-4 text-white placeholder:text-white/40 focus:outline-none"
          />
          <button
            onClick={() => username.trim() && setJoining(true)}
            className="h-11 w-full rounded-lg bg-sky-400 font-semibold text-black hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!username.trim()}
          >
            Уралдаанд нэгдэх
          </button>
        </div>
      </div>
    </div>
  );
}




