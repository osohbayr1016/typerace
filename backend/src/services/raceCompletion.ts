import { Server } from 'socket.io';
import { AuthSocket } from '../config/socket';
import { Player, RaceData } from '../types';
import { calculateRewards, calculateLevel } from '../utils/rewardCalculator';
import { User } from '../models/User';

interface PlayerFinishedData {
  progress: number;
  wpm: number;
  errors: number;
}

export const handlePlayerFinished = async (
  io: Server,
  socket: AuthSocket,
  player: Player,
  data: PlayerFinishedData,
  raceData: RaceData | undefined,
  raceStartTime: number,
  checkCompletion: () => Promise<void>
): Promise<void> => {
  player.finished = true;
  player.finishTime = Date.now() - raceStartTime;

  const textLength = raceData?.text.length || 100;
  const totalChars = textLength;
  const accuracy = Math.max(0, Math.min(100, ((totalChars - (data.errors || 0)) / totalChars) * 100));

  // Calculate immediate rewards (without placement)
  const rewards = calculateRewards(data.wpm, accuracy, 0, textLength);

  // Award coins and exp to authenticated users
  if (player.userId) {
    try {
      const user = await User.findById(player.userId);
      if (user) {
        const oldLevel = user.level;
        user.coins += rewards.coins;
        user.exp += rewards.exp;
        user.level = calculateLevel(user.exp);
        await user.save();

        const levelUp = user.level > oldLevel ? user.level : 0;

        socket.emit('player-finished-reward', {
          coins: rewards.coins,
          exp: rewards.exp,
          levelUp
        });
      }
    } catch (error) {
      console.error('Error awarding rewards:', error);
    }
  }

  await checkCompletion();
};

interface RaceResult {
  username: string;
  userId?: string;
  socketId: string;
  wpm: number;
  placement: number;
  finishTime: number;
}

export const finishRace = async (io: Server, players: Map<string, Player>): Promise<RaceResult[]> => {
  const results: RaceResult[] = Array.from(players.values())
    .filter(p => p.finished)
    .sort((a, b) => (a.finishTime || 0) - (b.finishTime || 0))
    .map((player, index) => ({
      username: player.username,
      userId: player.userId,
      socketId: player.socketId,
      wpm: player.wpm,
      placement: index + 1,
      finishTime: player.finishTime || 0
    }));

  // Award placement bonuses
  for (const result of results) {
    if (result.userId && result.placement <= 3) {
      const placementReward = calculateRewards(0, 100, result.placement, 0);
      try {
        const user = await User.findById(result.userId);
        if (user) {
          const oldLevel = user.level;
          user.exp += placementReward.exp;
          user.level = calculateLevel(user.exp);
          await user.save();

          const socket = io.sockets.sockets.get(result.socketId);
          if (socket) {
            socket.emit('placement-bonus', {
              exp: placementReward.exp,
              levelUp: user.level > oldLevel ? user.level : 0
            });
          }
        }
      } catch (error) {
        console.error('Error awarding placement bonus:', error);
      }
    }
  }

  io.emit('race-results', { results });

  return results;
};

