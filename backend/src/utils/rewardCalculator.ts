interface RewardResult {
  coins: number;
  exp: number;
}

export const calculateRewards = (
  wpm: number,
  accuracy: number,
  placement: number,
  textLength: number
): RewardResult => {
  // Base rewards
  let coins = Math.floor(wpm * 2);
  let exp = Math.floor(wpm * 3);

  // Accuracy bonus
  if (accuracy >= 95) {
    coins += 50;
    exp += 75;
  } else if (accuracy >= 90) {
    coins += 30;
    exp += 50;
  } else if (accuracy >= 85) {
    coins += 15;
    exp += 25;
  }

  // Placement bonus
  const placementBonuses = [
    { coins: 200, exp: 300 }, // 1st place
    { coins: 100, exp: 150 }, // 2nd place
    { coins: 50, exp: 75 },   // 3rd place
  ];

  if (placement > 0 && placement <= 3) {
    const bonus = placementBonuses[placement - 1];
    coins += bonus.coins;
    exp += bonus.exp;
  }

  // Minimum rewards
  coins = Math.max(coins, 10);
  exp = Math.max(exp, 15);

  return { coins, exp };
};

export const calculateLevel = (exp: number): number => {
  return Math.floor(Math.sqrt(exp / 100)) + 1;
};

