'use client';

import { Trophy, Award, Target } from 'lucide-react';

interface Entry {
  username: string;
  value: number;
}

interface LeaderboardTableProps {
  entries: Entry[];
  me: { username: string; value: number; rank: number } | null;
  metric: 'speed' | 'accuracy' | 'games';
}

export default function LeaderboardTable({ entries, me, metric }: LeaderboardTableProps) {
  const getIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-400" />;
    if (rank === 2) return <Award className="h-5 w-5 text-gray-400" />;
    if (rank === 3) return <Award className="h-5 w-5 text-amber-600" />;
    return null;
  };

  const getMetricDisplay = (value: number) => {
    if (metric === 'speed') return `${value} WPM`;
    if (metric === 'accuracy') return `${value}%`;
    return value;
  };

  const getMetricLabel = () => {
    if (metric === 'speed') return 'Хурд (WPM)';
    if (metric === 'accuracy') return 'Нарийвчлал';
    return 'Тоглолтууд';
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
    return 'bg-white/10 text-white/80';
  };

  return (
    <div className="overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02]">
      <div className="grid grid-cols-12 border-b border-white/10 bg-white/5 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-white/60">
        <div className="col-span-2">Байр</div>
        <div className="col-span-6">Хэрэглэгч</div>
        <div className="col-span-4 text-right">{getMetricLabel()}</div>
      </div>
      
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-white/40">
          <Target className="mb-3 h-12 w-12" />
          <p>Одоогоор өгөгдөл байхгүй байна</p>
        </div>
      ) : (
        <>
          {entries.map((e, i) => {
            const rank = i + 1;
            const isMe = me && e.username === me.username;
            
            return (
              <div
                key={`${e.username}-${i}`}
                className={`grid grid-cols-12 items-center px-4 py-4 transition-colors ${
                  isMe
                    ? 'bg-emerald-500/10 border-y border-emerald-500/30'
                    : 'odd:bg-white/0 even:bg-white/[0.03] hover:bg-white/5'
                }`}
              >
                <div className="col-span-2 flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${getRankBadgeColor(
                      rank
                    )}`}
                  >
                    {rank <= 3 ? getIcon(rank) : rank}
                  </div>
                </div>
                <div className="col-span-6 flex items-center gap-2">
                  <span className={`font-semibold ${isMe ? 'text-emerald-300' : 'text-white'}`}>
                    {e.username}
                  </span>
                  {isMe && (
                    <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                      Та
                    </span>
                  )}
                </div>
                <div className="col-span-4 text-right">
                  <span
                    className={`text-lg font-bold ${
                      rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-gray-400' : rank === 3 ? 'text-amber-600' : 'text-emerald-300'
                    }`}
                  >
                    {getMetricDisplay(e.value)}
                  </span>
                </div>
              </div>
            );
          })}
          
          {me && !entries.find(e => e.username === me.username) && (
            <div className="grid grid-cols-12 items-center border-t-2 border-emerald-500/30 bg-emerald-500/10 px-4 py-4">
              <div className="col-span-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-white/80">
                  {me.rank}
                </div>
              </div>
              <div className="col-span-6 flex items-center gap-2">
                <span className="font-semibold text-emerald-300">{me.username}</span>
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                  Та
                </span>
              </div>
              <div className="col-span-4 text-right">
                <span className="text-lg font-bold text-emerald-300">{getMetricDisplay(me.value)}</span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

