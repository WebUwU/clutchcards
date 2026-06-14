import type { Quest } from "@/types";

export const quests: Quest[] = [
  {
    "id": "q-001",
    "title": "Win 2 Matches",
    "description": "Secure victory in two competitive or unrated matches.",
    "period": "daily",
    "type": "daily",
    "difficulty": "easy",
    "progress": 1,
    "goal": 2,
    "progressRequired": 2,
    "status": "active",
    "reward": {
      "xp": 150,
      "freeCoins": 200
    },
    "rewardXp": 150,
    "rewardFreeCoins": 200,
    "isActive": true
  },
  {
    "id": "q-002",
    "title": "Get 30 Kills",
    "description": "Eliminate 30 enemies across any game mode.",
    "period": "daily",
    "type": "daily",
    "difficulty": "medium",
    "progress": 30,
    "goal": 30,
    "progressRequired": 30,
    "status": "completed",
    "reward": {
      "xp": 250,
      "freeCoins": 300
    },
    "rewardXp": 250,
    "rewardFreeCoins": 300,
    "isActive": true
  },
  {
    "id": "q-003",
    "title": "Play 3 Controller Games",
    "description": "Complete three matches as a Controller agent.",
    "period": "daily",
    "type": "daily",
    "difficulty": "easy",
    "progress": 0,
    "goal": 3,
    "progressRequired": 3,
    "status": "not_started",
    "reward": {
      "xp": 150,
      "freeCoins": 180
    },
    "rewardXp": 150,
    "rewardFreeCoins": 180,
    "isActive": true
  },
  {
    "id": "q-004",
    "title": "Get 5 First Bloods",
    "description": "Land the opening kill of the round five times.",
    "period": "weekly",
    "type": "weekly",
    "difficulty": "hard",
    "progress": 2,
    "goal": 5,
    "progressRequired": 5,
    "status": "active",
    "reward": {
      "xp": 600,
      "freeCoins": 750,
      "packId": "pack-basic",
      "pack": "basic"
    },
    "rewardXp": 600,
    "rewardFreeCoins": 750,
    "rewardPackId": "pack-basic",
    "isActive": true
  },
  {
    "id": "q-005",
    "title": "Survive 10 Clutch Rounds",
    "description": "Win 10 rounds where you are the last player alive.",
    "period": "weekly",
    "type": "weekly",
    "difficulty": "hard",
    "progress": 4,
    "goal": 10,
    "progressRequired": 10,
    "status": "active",
    "reward": {
      "xp": 800,
      "freeCoins": 900,
      "packId": "pack-premium",
      "pack": "premium"
    },
    "rewardXp": 800,
    "rewardFreeCoins": 900,
    "rewardPackId": "pack-premium",
    "isActive": true
  },
  {
    "id": "q-006",
    "title": "Plant 15 Spikes",
    "description": "Plant the spike on attack fifteen times.",
    "period": "weekly",
    "type": "weekly",
    "difficulty": "medium",
    "progress": 15,
    "goal": 15,
    "progressRequired": 15,
    "status": "claimed",
    "reward": {
      "xp": 450,
      "freeCoins": 500
    },
    "rewardXp": 450,
    "rewardFreeCoins": 500,
    "isActive": true
  },
  {
    "id": "q-007",
    "title": "Reach Account Level 25",
    "description": "Climb to account level 25 this season.",
    "period": "seasonal",
    "type": "seasonal",
    "difficulty": "medium",
    "progress": 18,
    "goal": 25,
    "progressRequired": 25,
    "status": "active",
    "reward": {
      "xp": 1200,
      "freeCoins": 1500,
      "packId": "pack-premium",
      "pack": "premium"
    },
    "rewardXp": 1200,
    "rewardFreeCoins": 1500,
    "rewardPackId": "pack-premium",
    "isActive": true
  },
  {
    "id": "q-008",
    "title": "Collect 50 Unique Cards",
    "description": "Own 50 distinct cards in your collection.",
    "period": "seasonal",
    "type": "seasonal",
    "difficulty": "hard",
    "progress": 14,
    "goal": 50,
    "progressRequired": 50,
    "status": "active",
    "reward": {
      "xp": 2000,
      "freeCoins": 2500,
      "packId": "pack-premium",
      "pack": "premium"
    },
    "rewardXp": 2000,
    "rewardFreeCoins": 2500,
    "rewardPackId": "pack-premium",
    "isActive": true
  },
  {
    "id": "q-009",
    "title": "Complete 5 Daily Quests",
    "description": "Finish any five daily quests this week.",
    "period": "weekly",
    "type": "weekly",
    "difficulty": "easy",
    "progress": 3,
    "goal": 5,
    "progressRequired": 5,
    "status": "active",
    "reward": {
      "xp": 300,
      "freeCoins": 350
    },
    "rewardXp": 300,
    "rewardFreeCoins": 350,
    "isActive": true
  },
  {
    "id": "q-010",
    "title": "Fuse Your First Card",
    "description": "Use the fusion forge to upgrade a duplicate.",
    "period": "seasonal",
    "type": "seasonal",
    "difficulty": "easy",
    "progress": 0,
    "goal": 1,
    "progressRequired": 1,
    "status": "not_started",
    "reward": {
      "xp": 200,
      "freeCoins": 250,
      "packId": "pack-basic",
      "pack": "basic"
    },
    "rewardXp": 200,
    "rewardFreeCoins": 250,
    "rewardPackId": "pack-basic",
    "isActive": true
  }
];
