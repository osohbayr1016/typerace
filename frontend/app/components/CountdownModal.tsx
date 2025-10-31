'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CountdownModalProps {
  isOpen: boolean;
  seconds?: number;
  onComplete: () => void;
}

export default function CountdownModal({ isOpen, seconds = 3, onComplete }: CountdownModalProps) {
  const [count, setCount] = useState(seconds);
  const [showGo, setShowGo] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setCount(seconds);
    setShowGo(false);
  }, [isOpen, seconds]);

  useEffect(() => {
    if (!isOpen) return;
    if (count <= 0) {
      setShowGo(true);
      const t = setTimeout(() => {
        setShowGo(false);
        onComplete();
      }, 600);
      return () => clearTimeout(t);
    }
    const interval = setInterval(() => setCount((c) => c - 1), 1000);
    return () => clearInterval(interval);
  }, [isOpen, count, onComplete]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            key={showGo ? 'go' : count}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="flex h-40 w-40 items-center justify-center rounded-2xl bg-[linear-gradient(180deg,#101a35,#0b1020)] text-white shadow-2xl"
          >
            <span className="select-none text-6xl font-extrabold tracking-tight">
              {showGo ? 'ЭХЭЛ!' : count}
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}







