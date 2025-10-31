'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';

interface CountdownTimerProps {
  onRefresh: () => void;
  intervalMs?: number;
}

export default function CountdownTimer({ onRefresh, intervalMs = 300000 }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(intervalMs);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    setTimeLeft(intervalMs);
    
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1000) {
          setIsRefreshing(true);
          onRefresh();
          setTimeout(() => setIsRefreshing(false), 1000);
          return intervalMs;
        }
        return prev - 1000;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [intervalMs, onRefresh]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-3">
      <RefreshCw 
        className={`h-5 w-5 text-emerald-400 ${isRefreshing ? 'animate-spin' : ''}`} 
      />
      <div>
        <div className="text-xs text-white/60">Дараагийн шинэчлэл</div>
        <div className="text-lg font-bold text-white">
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
      </div>
      <button
        onClick={() => {
          setIsRefreshing(true);
          onRefresh();
          setTimeLeft(intervalMs);
          setTimeout(() => setIsRefreshing(false), 1000);
        }}
        className="ml-auto rounded-md bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
      >
        Шинэчлэх
      </button>
    </div>
  );
}

