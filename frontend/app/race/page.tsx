'use client';

import Navbar from '../components/Navbar';
import GameBoard from '../components/GameBoard';
import { useState, useEffect } from 'react';

interface GameStats {
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
}

const mongolianTexts = [
  "Монгол улс нь төв Азид орших бүрэн эрхт улс юм...",
  "Улаанбаатар хот нь Монгол улсын нийслэл хот юм...",
  "Монголын түүх нь маш урт бөгөөд сонирхолтой юм...",
];

export default function RacePage() {
  const [currentText, setCurrentText] = useState('');
  const [started, setStarted] = useState(false);

  // Prepare initial text after mount (but don't start game until user clicks Play)
  useEffect(() => {
    const pick = mongolianTexts[Math.floor(Math.random() * mongolianTexts.length)];
    setCurrentText(pick);
  }, []);

  const handleComplete = (_stats: GameStats) => {
    // could route to results or toast success later
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-4 text-2xl font-extrabold tracking-tight">Уралдах</h1>
        {started ? (
          <GameBoard text={currentText} onComplete={handleComplete} />
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <p className="mb-4 text-white/80">Тоглоом эхлүүлэхэд бэлэн болсон үед доорх товчийг дарна уу.</p>
            <button
              onClick={() => setStarted(true)}
              className="rounded-lg bg-emerald-400 px-6 py-3 font-semibold text-black shadow hover:brightness-95"
            >
              Тоглоом эхлүүлэх
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


