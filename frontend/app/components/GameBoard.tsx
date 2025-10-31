'use client';

import { useState, useEffect, useRef } from 'react';
import RaceTrack from './RaceTrack';
import { useMemo } from 'react';
import { api } from '../lib/api';
import StatsHUD from './StatsHUD';
import CountdownModal from './CountdownModal';
import ResultsModal from './ResultsModal';

interface GameBoardProps {
  text: string;
  onComplete: (stats: GameStats) => void;
}

interface GameStats {
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
}

export default function GameBoard({ text, onComplete }: GameBoardProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const [isGameActive, setIsGameActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showCountdown, setShowCountdown] = useState(true);
  const [showResults, setShowResults] = useState(false);
  const [finalStats, setFinalStats] = useState<GameStats | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const words = (text || '').split(' ');
  const currentWord = words[currentIndex] || '';
  const totalWords = words.length;
  const elapsedMinutes = Math.max(0.001, (timeElapsed || 0) / 60000);
  const wordsCompleted = currentIndex;
  const liveWpm = Math.floor(wordsCompleted / elapsedMinutes);

  const [carImageUrl, setCarImageUrl] = useState<string | undefined>(undefined);
  useEffect(() => {
    (async () => {
      try {
        const [me, catalog] = await Promise.all([api.me().catch(() => null), api.catalog().catch(() => [])]);
        const carSku = (me as any)?.equipped?.carSku || 'car.basic';
        const item = (catalog as any[]).find(i => i.sku === carSku);
        setCarImageUrl(item?.meta?.image);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    if (isGameActive && startTime) {
      const interval = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
      return () => clearInterval(interval);
    }
  }, [isGameActive, startTime]);

  const handleCountdownComplete = () => {
    setShowCountdown(false);
    setIsGameActive(true);
    const now = Date.now();
    setStartTime(now);
    // Delay to allow modal exit animation to finish before focusing
    setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 300);
  };

  useEffect(() => {
    if (!showCountdown && !isCompleted) {
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [showCountdown, isCompleted]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (!isGameActive) {
      setIsGameActive(true);
      setStartTime(Date.now());
    }

    // If user hits space, treat as submit attempt for current word
    if (raw.endsWith(' ')) {
      const typed = raw.trim();
      if (typed === currentWord) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setUserInput('');
        if (nextIndex >= totalWords) {
          setIsCompleted(true);
          const finalTime = (Date.now() - (startTime || Date.now())) / 1000;
          const wpm = Math.round((totalWords / finalTime) * 60);
          const accuracy = Math.max(0, Math.round(((totalWords - errors) / totalWords) * 100));
          const stats = { wpm, accuracy, time: finalTime, errors };
          setFinalStats(stats);
          setShowResults(true);
          onComplete(stats);
        }
      } else {
        // Ignore accidental space; do not count as error, keep current input trimmed
        setUserInput(typed);
      }
      return;
    }

    // Normal per-keystroke validation
    if (currentWord.startsWith(raw)) {
      setUserInput(raw);
    } else {
      setErrors((p) => p + 1);
    }
  };

  const progressPct = ((currentIndex + (userInput.length / Math.max(1, currentWord.length))) / Math.max(1, totalWords)) * 100;

  const lanes = [
    { id: 'me', name: 'Та', progress: progressPct, accent: 'bg-gradient-to-r from-yellow-300 to-amber-500', imageUrl: carImageUrl },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-4 px-4 py-6">
      <StatsHUD timeMs={timeElapsed} wordsDone={currentIndex} wordsTotal={totalWords} errors={errors} wpm={liveWpm} />
      <RaceTrack lanes={lanes} activeIndex={0} />
      <div className="rounded-xl border border-white/10 bg-white/5 p-5 text-white overflow-hidden relative">
        <div className="mb-3 text-xs uppercase tracking-wider text-white/60">Текст</div>
        {!text ? (
          <>
            <div className="h-24 animate-pulse rounded-lg bg-white/5" />
            <div className="mt-4 h-40 animate-pulse rounded-lg bg-white/5" />
          </>
        ) : (
          <>
            <div className="text-base leading-7 break-words whitespace-pre-wrap max-w-full">
              {words.map((word, idx) => (
                <span
                  key={idx}
                  className={`mr-1 rounded px-1 ${
                    idx < currentIndex ? 'bg-emerald-400/20 text-emerald-200' : idx === currentIndex ? 'bg-sky-400/20 text-sky-200' : 'text-white/70'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
            <div className="mt-4 text-center">
              <input
                ref={inputRef}
                value={userInput}
                onChange={handleInputChange}
                placeholder={isCompleted ? 'Тоглолт дууссан!' : 'Энд бичнэ үү...'}
                disabled={isCompleted || showCountdown}
                className="h-12 w-full max-w-xl rounded-lg border border-white/15 bg-black/30 px-4 text-center text-white placeholder:text-white/40 focus:outline-none"
                autoFocus
              />
            </div>
          </>
        )}
      </div>
      <CountdownModal isOpen={showCountdown && !!text} seconds={3} onComplete={handleCountdownComplete} />
      <ResultsModal open={showResults} stats={finalStats} onClose={() => setShowResults(false)} />
    </div>
  );
}


