import { Server } from 'socket.io';
import { AuthSocket } from '../config/socket';
import { Player, RaceData } from '../types';
import { getRandomRaceText } from '../utils/raceTexts';
import { handlePlayerFinished, finishRace } from './raceCompletion';
import { v4 as uuidv4 } from 'uuid';

interface Lobby {
  players: Map<string, Player>;
  state: 'waiting' | 'countdown' | 'racing' | 'finished';
  countdownTimer?: NodeJS.Timeout;
  countdownEndsAt?: number;
  raceData?: RaceData;
  raceStartTime?: number;
}

const lobby: Lobby = {
  players: new Map(),
  state: 'waiting'
};

const MIN_PLAYERS = 2;
const COUNTDOWN_DURATION = 10000; // 10 seconds
const GRACE_PERIOD = 3000; // 3 seconds grace period after race starts

export const setupRaceHandlers = (io: Server) => {
  io.on('connection', (socket: AuthSocket) => {
    console.log(`Player connected: ${socket.user?.username} (${socket.id})`);

    // Add player to lobby
    const player: Player = {
      username: socket.user?.username || 'Guest',
      socketId: socket.id,
      userId: socket.user?.id,
      progress: 0,
      wpm: 0,
      finished: false
    };

    lobby.players.set(socket.id, player);
    emitWaitingState(io);

    // Start countdown if enough players
    if (lobby.players.size >= MIN_PLAYERS && lobby.state === 'waiting') {
      startCountdown(io);
    }

    // Handle player progress updates
    socket.on('update-progress', (data: { progress: number; wpm: number; errors: number }) => {
      const player = lobby.players.get(socket.id);
      if (player && lobby.state === 'racing') {
        player.progress = data.progress;
        player.wpm = data.wpm;
        player.errors = data.errors;

        io.emit('player-progress', {
          playerId: socket.id,
          progress: data.progress,
          wpm: data.wpm
        });

        // Check if player finished
        if (data.progress >= 100 && !player.finished) {
          handlePlayerFinished(
            io, 
            socket, 
            player, 
            data, 
            lobby.raceData, 
            lobby.raceStartTime || Date.now(),
            () => checkRaceCompletion(io)
          );
        }
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Player disconnected: ${socket.user?.username}`);
      lobby.players.delete(socket.id);

      if (lobby.state === 'waiting' || lobby.state === 'countdown') {
        // Cancel countdown if not enough players
        if (lobby.players.size < MIN_PLAYERS && lobby.countdownTimer) {
          clearTimeout(lobby.countdownTimer);
          lobby.countdownTimer = undefined;
          lobby.countdownEndsAt = undefined;
          lobby.state = 'waiting';
        }
        emitWaitingState(io);
      } else if (lobby.state === 'racing') {
        checkRaceCompletion(io);
      }
    });
  });
};

const emitWaitingState = (io: Server) => {
  const playersList = Array.from(lobby.players.values()).map(p => ({
    username: p.username,
    socketId: p.socketId
  }));

  io.emit('waiting-state', {
    players: playersList,
    countdownEndsAt: lobby.countdownEndsAt || null
  });
};

const startCountdown = (io: Server) => {
  lobby.state = 'countdown';
  lobby.countdownEndsAt = Date.now() + COUNTDOWN_DURATION;

  io.emit('race-starting', {
    startsInMs: COUNTDOWN_DURATION
  });

  lobby.countdownTimer = setTimeout(() => {
    startRace(io);
  }, COUNTDOWN_DURATION);

  emitWaitingState(io);
};

const startRace = (io: Server) => {
  lobby.state = 'racing';
  const raceText = getRandomRaceText();
  const raceId = uuidv4();

  lobby.raceData = {
    raceId,
    text: raceText,
    players: Array.from(lobby.players.values()),
    startedAt: Date.now(),
    startsInMs: GRACE_PERIOD
  };

  lobby.raceStartTime = Date.now();

  io.emit('race-started', lobby.raceData);
};

const checkRaceCompletion = async (io: Server) => {
  const allFinished = Array.from(lobby.players.values()).every(p => p.finished);
  const activePlayers = Array.from(lobby.players.values());

  if (allFinished && activePlayers.length > 0) {
    lobby.state = 'finished';
    await finishRace(io, lobby.players);
    
    // Reset lobby after 5 seconds
    setTimeout(() => {
      resetLobby(io);
    }, 5000);
  }
};

const resetLobby = (io: Server) => {
  lobby.state = 'waiting';
  lobby.countdownEndsAt = undefined;
  lobby.raceData = undefined;
  lobby.raceStartTime = undefined;

  // Reset all players
  lobby.players.forEach(player => {
    player.progress = 0;
    player.wpm = 0;
    player.finished = false;
    player.finishTime = undefined;
    player.errors = undefined;
  });

  emitWaitingState(io);

  // Start new countdown if enough players
  if (lobby.players.size >= MIN_PLAYERS) {
    startCountdown(io);
  }
};

