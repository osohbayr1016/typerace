'use client';

import { motion } from 'framer-motion';

interface RacerLane {
  id: string;
  name: string;
  progress: number; // 0..100
  accent: string; // tailwind color class
}

interface RaceTrackProps {
  lanes: RacerLane[];
  activeIndex?: number;
}

export default function RaceTrack({ lanes, activeIndex = 0 }: RaceTrackProps) {
  return (
    <div className="rounded-xl border border-white/10 bg-[linear-gradient(180deg,#0b1226,#0b1020)] p-4 text-white shadow">
      <div className="mb-3 text-xs uppercase tracking-wider text-white/60">Трасс</div>
      <div className="space-y-3">
        {lanes.map((lane, index) => (
          <div key={lane.id} className="relative overflow-hidden rounded-md border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className={`font-semibold ${index === activeIndex ? 'text-white' : 'text-white/80'}`}>{lane.name}</span>
              <span className="text-white/70">{Math.round(lane.progress)}%</span>
            </div>
            <div className="relative h-9 w-full rounded-full bg-black/30">
              <motion.div
                className={`h-9 rounded-full ${lane.accent}`}
                initial={{ width: '0%' }}
                animate={{ width: `${lane.progress}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 18 }}
              />
              <motion.div
                className="absolute -top-2 aspect-[2/1] h-10 select-none text-center"
                style={{ left: `calc(${lane.progress}% - 20px)` }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className="text-lg">🏎️</span>
              </motion.div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}





