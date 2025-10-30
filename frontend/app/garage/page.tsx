'use client';

import Navbar from '../components/Navbar';
import { Wrench, Car, Palette } from 'lucide-react';

export default function GaragePage() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Гараж</h1>
        <p className="mb-6 text-white/70">Машинаа сонгож, өнгө загвараа тохируулна уу.</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <Car className="mb-2 h-6 w-6 text-amber-300" />
            <div className="font-semibold">Машин сонгох</div>
            <div className="text-sm text-white/70">Түргэн тэрэгнүүд</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <Palette className="mb-2 h-6 w-6 text-pink-300" />
            <div className="font-semibold">Өнгө, стикер</div>
            <div className="text-sm text-white/70">Гадаад төрхийг өөрчил</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <Wrench className="mb-2 h-6 w-6 text-sky-300" />
            <div className="font-semibold">Тохиргоо</div>
            <div className="text-sm text-white/70">Түлхүүр товчлуурууд</div>
          </div>
        </div>
      </div>
    </div>
  );
}




