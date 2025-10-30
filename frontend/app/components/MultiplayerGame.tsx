'use client';

import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import WaitingLobby from './multiplayer/WaitingLobby';
import RacingView from './multiplayer/RacingView';
import ResultsView from './multiplayer/ResultsView';
import FinishedWaitingView from './multiplayer/FinishedWaitingView';
import LiveResultsModal from './multiplayer/LiveResultsModal';

interface MultiplayerGameProps {
  username: string;
  onBack: () => void;
}

interface Player { username: string; socketId: string; progress: number; wpm: number; finished: boolean; }
interface RaceData { raceId: string; text: string; players: Player[]; }

export default function MultiplayerGame({ username, onBack }: MultiplayerGameProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [gameState, setGameState] = useState<'waiting' | 'racing' | 'finished' | 'finishedWaiting'>('waiting');
  const [raceData, setRaceData] = useState<RaceData | null>(null);
  const [waitingPlayers, setWaitingPlayers] = useState<{ username: string; socketId: string }[]>([]);
  const [waitingCountdownEndsAt, setWaitingCountdownEndsAt] = useState<number | null>(null);
  const [raceCountdownSeconds, setRaceCountdownSeconds] = useState<number>(0);
  const [raceCountdownMs, setRaceCountdownMs] = useState<number>(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [errors, setErrors] = useState(0);
  const [showCountdown, setShowCountdown] = useState(false);
  const [raceResults, setRaceResults] = useState<any>(null);
  const [showLiveResults, setShowLiveResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const s = io('http://localhost:5000');
    setSocket(s);
    s.on('waiting-state', (data: { players: { username: string; socketId: string }[]; countdownEndsAt: number | null }) => {
      setWaitingPlayers(data.players || []);
      setWaitingCountdownEndsAt(data.countdownEndsAt || null);
    });
    s.on('race-starting', (data: { startsInMs: number }) => {
      setWaitingCountdownEndsAt(Date.now() + (data?.startsInMs || 0));
    });
    s.on('race-started', (data: any) => {
      setRaceData(data);
      setGameState('racing');
      // Show popup countdown using server-provided grace
      const ms = Math.max(0, Number(data?.startsInMs || 0));
      const remainingSeconds = Math.max(1, Math.ceil(ms / 1000));
      setRaceCountdownMs(ms);
      if (remainingSeconds > 0) {
        setRaceCountdownSeconds(remainingSeconds);
        setShowCountdown(true);
      } else {
        setShowCountdown(false);
      }
      setCurrentIndex(0);
      setUserInput('');
      setErrors(0);
      if (remainingSeconds <= 0) {
        const now = Date.now();
        setStartTime(now);
        setTimeout(() => inputRef.current?.focus(), 0);
      }
    });
    s.on('player-progress', (data: { playerId: string; progress: number; wpm: number }) => {
      setRaceData(prev => prev ? { ...prev, players: prev.players.map(p => p.socketId === data.playerId ? { ...p, progress: data.progress, wpm: data.wpm } : p) } : prev);
    });
    s.on('race-results', (data) => { 
      // Update the same modal to Final state; do not navigate or open new modals
      setRaceResults(data);
      // Keep current gameState; do not force another view
    });
    s.emit('join-waiting', { username });
    return () => { s.disconnect(); };
  }, [username]);

  useEffect(() => {
    if (!startTime) return;
    const t = setInterval(() => setTimeElapsed(Date.now() - startTime), 100);
    return () => clearInterval(t);
  }, [startTime]);

  // Safety: ensure countdown closes even if modal callback is interrupted
  useEffect(() => {
    if (!showCountdown || raceCountdownMs <= 0) return;
    const t = setTimeout(() => {
      setShowCountdown(false);
      const now = Date.now();
      setStartTime(now);
      setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 0);
    }, raceCountdownMs + 800);
    return () => clearTimeout(t);
  }, [showCountdown, raceCountdownMs]);

  // After countdown ends and race is active, force focus to input to start typing immediately
  useEffect(() => {
    if (gameState !== 'racing') return;
    if (showCountdown) return;
    // small delay to ensure modal unmounted and input enabled
    const t = setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 50);
    return () => clearTimeout(t);
  }, [gameState, showCountdown]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!raceData || showCountdown) return;
    const raw = e.target.value;
    const words = raceData.text.split(' ');
    const currentWord = words[currentIndex] || '';
    if (raw.endsWith(' ')) {
      const typed = raw.trim();
      if (typed === currentWord) {
        const nextIndex = currentIndex + 1;
        setCurrentIndex(nextIndex);
        setUserInput('');
        const progress = (nextIndex / words.length) * 100;
        const wpm = Math.round(nextIndex / ((Date.now() - (startTime || Date.now())) / 60000));
        socket?.emit('typing-progress', { raceId: raceData.raceId, progress, wpm });
        if (nextIndex >= words.length) {
          const finalTime = (Date.now() - (startTime || Date.now())) / 1000;
          const finalWpm = Math.round((words.length / finalTime) * 60);
          const accuracy = Math.round(((words.length - errors) / words.length) * 100);
          socket?.emit('race-complete', { raceId: raceData.raceId, wpm: finalWpm, accuracy, time: finalTime, errors });
          // Show live results modal immediately; keep background race rendering
          setShowLiveResults(true);
        }
      } else {
        setUserInput(typed);
      }
      return;
    }
    if (currentWord.startsWith(raw)) setUserInput(raw); else setErrors(prev => prev + 1);
  };

  if (gameState === 'waiting') {
    return <WaitingLobby players={waitingPlayers} countdownEndsAt={waitingCountdownEndsAt} onBack={onBack} />;
  }
  if (gameState === 'racing' && raceData) {
    return (
      <>
        <RacingView
          raceData={raceData}
          currentIndex={currentIndex}
          userInput={userInput}
          timeElapsed={timeElapsed}
          showCountdown={showCountdown}
          countdownSeconds={raceCountdownSeconds}
          inputRef={inputRef}
          onInputChange={handleInputChange}
          onCountdownComplete={() => { setShowCountdown(false); const now = Date.now(); setStartTime(now); setTimeout(() => inputRef.current?.focus(), 0); }}
        />
        <LiveResultsModal
          open={showLiveResults}
          players={raceData.players}
          rankings={raceResults?.rankings || null}
          onClose={() => setShowLiveResults(false)}
          onRematch={() => {
            setShowLiveResults(false);
            setRaceData(null);
            setCurrentIndex(0);
            setUserInput('');
            setErrors(0);
            setTimeElapsed(0);
            setShowCountdown(false);
            setGameState('waiting');
            socket?.emit('join-waiting', { username });
          }}
        />
      </>
    );
  }
  // Remove legacy final results view; keep single modal flow
  return null;
}

