// Ebb and Flow Leaf Game Types
export type LeafType = 'maple' | 'oak' | 'birch' | 'willow' | 'cherry';
export type LeafColor = 'green' | 'yellow' | 'orange' | 'red' | 'brown';
export type GameDifficulty = 'easy' | 'medium' | 'hard';

export type Leaf = {
  id: string;
  type: LeafType;
  color: LeafColor;
  x: number; // Position X (0-100%)
  y: number; // Position Y (0-100%)
  vx: number; // Velocity X
  vy: number; // Velocity Y
  rotation: number; // Rotation angle
  rotationSpeed: number;
  size: number; // Size multiplier (0.5-1.5)
  isTarget: boolean; // Whether this leaf should be collected
  isCollected: boolean;
  points: number; // Points for collecting this leaf
};

export type GameSession = {
  id: string;
  username: string;
  difficulty: GameDifficulty;
  level: number;
  score: number;
  lives: number;
  timeRemaining: number; // seconds
  targetLeaves: number; // How many target leaves to collect
  collectedLeaves: number;
  leaves: Leaf[];
  status: 'playing' | 'completed' | 'failed' | 'paused';
  startTime: number;
  endTime?: number;
};

export type CommunityGoal = {
  id: string;
  title: string;
  description: string;
  targetLeaves: number;
  currentLeaves: number;
  reward: string;
  startTime: number;
  endTime: number;
  status: 'active' | 'completed' | 'expired';
  participants: number;
  type: 'daily' | 'weekly' | 'seasonal' | 'special';
};

export type CommunityGarden = {
  totalLeavesCollected: number;
  activeGoals: CommunityGoal[];
  completedGoals: number;
  currentSeason: 'spring' | 'summer' | 'autumn' | 'winter';
  seasonProgress: number; // 0-100%
  nextSeasonUnlock: number; // leaves needed
  gardenLevel: number;
  specialEvents: string[];
};

export type GameResult = {
  success: boolean;
  message: string;
  scoreEarned: number;
  levelCompleted: boolean;
  gameCompleted: boolean;
  nextLevel?: number;
  communityContribution?: number;
  goalProgress?: Array<{
    goalId: string;
    progress: number;
    completed: boolean;
  }>;
};

export type UserStats = {
  username: string;
  totalScore: number;
  highestLevel: number;
  gamesPlayed: number;
  gamesCompleted: number;
  averageScore: number;
  bestTime: number; // Best completion time in seconds
  totalLeavesCollected: number;
  favoriteLeafType: LeafType;
  lastPlayTime: number;
  dailyGamesPlayed: number;
  rank: number;
  achievements: string[];
  currentStreak: number;
  longestStreak: number;
  communityContribution: number; // Leaves contributed to community goals
};

// API Response Types
export type InitResponse = {
  type: 'init';
  postId: string;
  userStats: UserStats;
  username: string;
  canPlay: boolean;
  dailyGamesRemaining: number;
  leaderboard: UserStats[];
  recentGames: Array<{
    username: string;
    level: number;
    score: number;
    timestamp: number;
    difficulty: GameDifficulty;
  }>;
  communityGarden: CommunityGarden;
};

export type StartGameResponse = {
  type: 'start';
  postId: string;
  gameSession: GameSession;
  dailyGamesRemaining: number;
};

export type CollectLeafResponse = {
  type: 'collect';
  postId: string;
  result: GameResult;
  updatedSession: GameSession;
  updatedUserStats: UserStats;
  dailyGamesRemaining: number;
};

export type LeaderboardResponse = {
  type: 'leaderboard';
  postId: string;
  leaderboard: UserStats[];
};
