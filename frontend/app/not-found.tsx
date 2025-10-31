'use client';

import Link from 'next/link';
import Navbar from './components/Navbar';
import { Search, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <Search className="h-8 w-8 text-white/70" />
        </div>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight">Хуудас олдсонгүй</h1>
        <p className="mb-8 text-white/70">Таны хайсан хуудас байхгүй эсвэл зөөсөн байж магадгүй.</p>
        <div className="flex items-center justify-center gap-3">
          <Link href="/" className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500">
            <Home className="h-4 w-4" /> Нүүр хуудас руу буцах
          </Link>
          <Link href="/race" className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white hover:bg-white/10">
            Уралдаан эхлүүлэх
          </Link>
        </div>
      </main>
    </div>
  );
}


