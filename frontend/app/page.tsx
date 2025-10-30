'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Users, Settings } from 'lucide-react';
import GameBoard from './components/GameBoard';
import MultiplayerGame from './components/MultiplayerGame';
import Navbar from './components/Navbar';
import LandingHero from './components/LandingHero';

interface GameStats {
  wpm: number;
  accuracy: number;
  time: number;
  errors: number;
}

const mongolianTexts = [
  "Монгол улс нь төв Азид орших бүрэн эрхт улс юм. Энэ улс нь маш том газар нутагтай бөгөөд хүн ам нь цөөхөн байдаг. Монголчууд нь мал аж ахуй эрхэлдэг бөгөөд тэдний амьдралын хэв маяг нь маш онцлогтой юм.",
  "Улаанбаатар хот нь Монгол улсын нийслэл хот юм. Энэ хот нь маш хурдацтай хөгжиж байгаа бөгөөд орчин үеийн технологийн дэвшилтэт байгууламжуудтай болжээ. Хотын хүн ам нь жил бүр нэмэгдэж байгаа.",
  "Монголын түүх нь маш урт бөгөөд сонирхолтой юм. Чингис хаан нь дэлхийн түүхэнд хамгийн агуу цэргийн удирдагчдын нэг байсан. Тэрээр маш том эзэнт гүрэн байгуулсан бөгөөд түүний нөлөө нь өнөөг хүртэл үргэлжилж байна.",
  "Монголын соёл урлаг нь маш баялаг бөгөөд онцлогтой юм. Морин хуур нь Монголчуудын хамгийн алдартай хөгжмийн зэмсэг юм. Тэдний дуу хөгжим нь дэлхий даяар алдартай болсон.",
  "Монголын байгаль орчин нь маш сайхан бөгөөд эрүүл юм. Тэнд маш олон төрлийн амьтан амьдардаг бөгөөд тэдний дунд мал, ан амьтан, шувууд зэрэг орно. Монголчууд нь байгаль орчинг хамгаалах талаар маш анхааралтай хандаж байна."
];

export default function Home() {
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'results' | 'multiplayer'>('menu');
  const [currentText, setCurrentText] = useState('');
  const [gameStats, setGameStats] = useState<GameStats | null>(null);
  const [username, setUsername] = useState('');

  const startGame = () => {
    const randomText = mongolianTexts[Math.floor(Math.random() * mongolianTexts.length)];
    setCurrentText(randomText);
    setGameState('playing');
  };

  const handleGameComplete = (stats: GameStats) => {
    setGameStats(stats);
    setGameState('results');
  };

  const resetGame = () => {
    setGameState('menu');
    setGameStats(null);
  };

  const startMultiplayer = () => {
    if (!username.trim()) {
      alert('Хэрэглэгчийн нэр оруулна уу!');
      return;
    }
    setGameState('multiplayer');
  };

  if (gameState === 'playing') {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)]">
        <Navbar />
        <GameBoard text={currentText} onComplete={handleGameComplete} />
      </div>
    );
  }

  if (gameState === 'multiplayer') {
    return (
      <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)]">
        <Navbar />
        <MultiplayerGame username={username} onBack={resetGame} />
      </div>
    );
  }

  if (gameState === 'results' && gameStats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center"
        >
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Тоглолт дууссан!</h2>
          
          <div className="space-y-4 mb-6">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
              <span className="text-gray-600">Хурд (WPM):</span>
              <span className="font-bold text-blue-600">{gameStats.wpm}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
              <span className="text-gray-600">Нарийвчлал:</span>
              <span className="font-bold text-green-600">{gameStats.accuracy}%</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
              <span className="text-gray-600">Цаг:</span>
              <span className="font-bold text-purple-600">{gameStats.time.toFixed(1)}с</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
              <span className="text-gray-600">Алдаа:</span>
              <span className="font-bold text-red-600">{gameStats.errors}</span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={resetGame}
              className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Буцах
            </button>
            <button
              onClick={startGame}
              className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Дахин тоглох
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <LandingHero />
    </div>
  );
}
