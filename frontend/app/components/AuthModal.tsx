'use client';

import { useState } from 'react';
import { api } from '../lib/api';

type Props = {
  open: boolean;
  onClose: () => void;
  onAuthed?: (user: any) => void;
};

export default function AuthModal({ open, onClose, onAuthed }: Props) {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let user;
      if (mode === 'signup') {
        user = await api.signup({ email, username, password });
      } else {
        user = await api.login({ email, password });
      }
      onAuthed?.(user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Алдаа гарлаа');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-sm rounded-lg bg-[#0b1020] p-4 text-white shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-bold">{mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}</h3>
          <button onClick={onClose} className="text-white/60 hover:text-white">✕</button>
        </div>
        <div className="mb-3 flex gap-2">
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-sm ${mode === 'login' ? 'bg-white/15' : 'bg-white/5'} `}
            onClick={() => setMode('login')}
          >Нэвтрэх</button>
          <button
            className={`flex-1 rounded-md px-3 py-1.5 text-sm ${mode === 'signup' ? 'bg-white/15' : 'bg-white/5'} `}
            onClick={() => setMode('signup')}
          >Бүртгүүлэх</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-white/70">Имэйл</label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" required className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20" />
          </div>
          {mode === 'signup' && (
            <div>
              <label className="mb-1 block text-xs text-white/70">Хэрэглэгчийн нэр</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20" />
            </div>
          )}
          <div>
            <label className="mb-1 block text-xs text-white/70">Нууц үг</label>
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" required className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2 text-sm outline-none focus:border-white/20" />
          </div>
          {error && <div className="text-xs text-red-400">{error}</div>}
          <button disabled={loading} className="w-full rounded-md bg-yellow-400 py-2 text-sm font-semibold text-black disabled:opacity-70">
            {loading ? 'Түр хүлээнэ үү…' : (mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх')}
          </button>
        </form>
      </div>
    </div>
  );
}


