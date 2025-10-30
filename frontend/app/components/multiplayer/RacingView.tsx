'use client';

import { RefObject } from 'react';
import { motion } from 'framer-motion';
import { Timer, Users, Target, Car } from 'lucide-react';
import CountdownModal from '../CountdownModal';

interface Player {
  username: string;
  socketId: string;
  progress: number;
  wpm: number;
  finished: boolean;
}

interface RaceData {
  raceId: string;
  text: string;
  players: Player[];
}

interface RacingViewProps {
  raceData: RaceData;
  currentIndex: number;
  userInput: string;
  timeElapsed: number;
  showCountdown: boolean;
  countdownSeconds?: number;
  inputRef: RefObject<HTMLInputElement>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountdownComplete: () => void;
}

export default function RacingView({ raceData, currentIndex, userInput, timeElapsed, showCountdown, countdownSeconds = 2, inputRef, onInputChange, onCountdownComplete }: RacingViewProps) {
  const words = raceData.text.split(' ');
  const currentWord = words[currentIndex] || '';
  const progress = ((currentIndex + (userInput.length / Math.max(1, currentWord.length))) / words.length) * 100;

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] py-8 text-white">
      <div className="w-full max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6 text-white/80">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5" />
              <span className="font-mono text-lg">{formatTime(timeElapsed)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              <span className="font-mono text-lg">{currentIndex}/{words.length}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span className="font-mono text-lg">{raceData.players.length}</span>
          </div>
        </div>

        {/* Road-style lanes */}
        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(#0d142a,#0a0f22)] p-4 mb-6">
          <div className="space-y-3">
            {raceData.players.map((p, idx) => (
              <div key={p.socketId} className="relative h-14 overflow-hidden rounded-lg bg-[repeating-linear-gradient(90deg,rgba(255,255,255,.06),rgba(255,255,255,.06)_10px,rgba(255,255,255,.02)_10px,rgba(255,255,255,.02)_20px)]">
                <div className="absolute inset-y-0 left-20 w-px bg-white/10" />
                <div className="absolute inset-y-0 left-40 w-px bg-white/10" />
                <div className="absolute inset-y-0 left-60 w-px bg-white/10" />
                <div className="absolute inset-y-0 left-80 w-px bg-white/10" />

                <div className="absolute inset-y-0 left-2 flex items-center gap-2 text-white/70">
                  <span className="text-xs px-2 py-0.5 rounded bg-white/5 border border-white/10">{idx + 1}</span>
                  <span className="text-sm font-semibold">{p.username}</span>
                  <span className="text-xs">{p.wpm} WPM</span>
                </div>

                <motion.div className="absolute top-1/2 -translate-y-1/2" animate={{ left: `${Math.min(96, Math.max(0, p.progress))}%` }} transition={{ type: 'tween', duration: 0.25 }}>
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-10 rounded bg-gradient-to-r from-sky-400 to-blue-500 flex items-center justify-center shadow-lg">
                      <Car className="w-4 h-4 text-black" />
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5 p-4 mb-6 relative overflow-hidden">
          <div className="text-base leading-7 break-words whitespace-pre-wrap text-white/90">
            {words.map((word, index) => (
              <span key={index} className={`px-1 py-0.5 rounded ${index < currentIndex ? 'bg-emerald-400/20 text-emerald-200' : index === currentIndex ? 'bg-sky-400/20 text-sky-200' : 'text-white/60'}`}>{word}</span>
            ))}
          </div>
          <CountdownModal isOpen={showCountdown} seconds={countdownSeconds} onComplete={onCountdownComplete} />
        </div>

        <div className="text-center">
          <input ref={inputRef} type="text" value={userInput} onChange={onInputChange} placeholder="Энд бичнэ үү..." className="w-full max-w-md px-4 py-3 text-lg rounded-lg border border-white/15 bg-black/30 text-white focus:outline-none text-center font-mono" autoFocus disabled={showCountdown} />
          <p className="mt-2 text-sm text-white/60">Дараагийн үг: {currentWord}</p>
        </div>
      </div>
    </div>
  );
}


