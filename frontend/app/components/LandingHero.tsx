'use client';

// Icons removed with feature cards
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function LandingHero() {
  const router = useRouter();
  const [username, setUsername] = useState('');
  return (
    <section className="relative overflow-hidden bg-[radial-gradient(1200px_400px_at_50%_-50%,#122042,transparent)]">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow md:text-5xl">
            Монгол Type Race
          </h1>
          <p className="mt-3 text-white/70">
            NitroType хэв маягийн уралдаант бичлэг — Монгол хэлээр
          </p>
        </div>

        {/* Feature cards removed for simplified home page */}

        <div className="mt-8 flex flex-col items-center gap-3 md:flex-row md:justify-center">
          <button onClick={() => router.push('/race')} className="rounded-lg bg-emerald-400 px-6 py-3 font-semibold text-black shadow hover:brightness-95">
            Ганцаарчилсан тоглолт
          </button>
          <div className="flex items-center gap-2">
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Хэрэглэгчийн нэр"
              className="h-11 rounded-lg border border-white/15 bg-white/10 px-4 text-white placeholder:text-white/50 focus:outline-none"
            />
            <button onClick={() => router.push('/multiplayer')} className="rounded-lg bg-sky-400 px-6 py-3 font-semibold text-black shadow hover:brightness-95">
              Олон тоглогч
            </button>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent,rgba(0,0,0,.4))]" />
    </section>
  );
}


