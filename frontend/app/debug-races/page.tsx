'use client';

import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';

export default function DebugRacesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}/api/debug/races`, {
      credentials: 'include'
    })
      .then(res => res.json())
      .then(json => {
        if (json.error) {
          setError(json.error);
        } else {
          setData(json);
        }
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020,#080c18)] text-white">
      <Navbar />
      <div className="mx-auto max-w-6xl px-4 py-6">
        <h1 className="mb-6 text-2xl font-bold">Debug: Your Race Data</h1>
        
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-400">Error: {error}</p>}
        
        {data && (
          <div className="space-y-6">
            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h2 className="mb-3 text-lg font-semibold">Your User Data</h2>
              <pre className="text-xs text-white/80">{JSON.stringify(data.user, null, 2)}</pre>
              <p className="mt-2 text-sm">User ID: {data.userId}</p>
              <p className="text-sm">Races Found: {data.racesFound}</p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 p-4">
              <h2 className="mb-3 text-lg font-semibold">Recent Races</h2>
              {data.races.length === 0 ? (
                <p className="text-white/60">No races found in database</p>
              ) : (
                <div className="space-y-4">
                  {data.races.map((race: any) => (
                    <div key={race.id} className="rounded border border-white/10 bg-white/5 p-3">
                      <p className="text-sm font-medium">Race ID: {race.id}</p>
                      <p className="text-xs text-white/60">Created: {new Date(race.createdAt).toLocaleString()}</p>
                      <div className="mt-2">
                        <p className="text-xs font-semibold">Players:</p>
                        {race.players.map((p: any, i: number) => (
                          <p key={i} className="text-xs text-white/70">
                            {p.username} (ID: {p.userId}) - {p.wpm} WPM
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

