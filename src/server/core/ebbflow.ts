import { redis } from '@devvit/web/server';
import type {
  GameSession,
  Leaf,
  UserStats,
  GameDifficulty,
  LeafType,
  LeafColor,
  GameResult,
  CommunityGarden,
  CommunityGoal,
} from '../../shared/types/api';

const GAME_SESSION_KEY = 'ebb-flow:session';
const USER_STATS_KEY = 'ebb-flow:user';
const DAILY_GAMES_KEY = 'ebb-flow:daily';
const COMMUNITY_GARDEN_KEY = 'ebb-flow:community-garden';

// Game configuration
const DAILY_GAME_LIMIT = 20; // Production limit: 20 games per day
const GAME_DURATION = 30; // 30 seconds per game

const DIFFICULTY_CONFIG = {
  easy: {
    targetLeaves: 10, // More target leaves for better gameplay
    totalLeaves: 25, // Adjusted total to maintain challenge
    leafSpeed: 0.15, // Very slow and relaxing
    timeBonus: 1.0,
  },
  medium: {
    targetLeaves: 15, // More target leaves for better gameplay
    totalLeaves: 35, // Adjusted total to maintain challenge
    leafSpeed: 0.25, // Gentle pace
    timeBonus: 1.5,
  },
  hard: {
    targetLeaves: 20, // More target leaves for better gameplay
    totalLeaves: 45, // Adjusted total to maintain challenge
    leafSpeed: 0.4, // Moderate but manageable
    timeBonus: 2.0,
  },
};

const LEAF_TYPES: LeafType[] = ['maple', 'oak', 'birch', 'willow', 'cherry'];
const LEAF_COLORS: LeafColor[] = ['green', 'yellow', 'orange', 'red', 'brown'];

export class EbbFlowManager {
  // Community Garden Management
  private static async getCommunityGarden(): Promise<CommunityGarden> {
    const gardenData = await redis.get(COMMUNITY_GARDEN_KEY);

    if (!gardenData) {
      const newGarden: CommunityGarden = {
        totalLeavesCollected: 0,
        activeGoals: await this.generateDailyGoals(),
        completedGoals: 0,
        currentSeason: 'spring',
        seasonProgress: 0,
        nextSeasonUnlock: 10000, // 10k leaves to next season
        gardenLevel: 1,
        specialEvents: [],
      };
      await redis.set(COMMUNITY_GARDEN_KEY, JSON.stringify(newGarden));
      return newGarden;
    }

    return JSON.parse(gardenData);
  }

  private static async saveCommunityGarden(garden: CommunityGarden): Promise<void> {
    await redis.set(COMMUNITY_GARDEN_KEY, JSON.stringify(garden));
  }

  private static async generateDailyGoals(): Promise<CommunityGoal[]> {
    const now = Date.now();
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date();
    dayEnd.setHours(23, 59, 59, 999);

    return [
      {
        id: `daily-${dayStart.getTime()}`,
        title: '🌱 Daily Harvest',
        description: 'Community goal: Collect 500 leaves together today!',
        targetLeaves: 500,
        currentLeaves: 0,
        reward: 'Unlock special leaf animations for tomorrow',
        startTime: dayStart.getTime(),
        endTime: dayEnd.getTime(),
        status: 'active',
        participants: 0,
        type: 'daily',
      },
      {
        id: `weekly-${Math.floor(now / (7 * 24 * 60 * 60 * 1000))}`,
        title: '🌿 Weekly Garden Growth',
        description: 'Help the community garden flourish with 2,500 leaves this week!',
        targetLeaves: 2500,
        currentLeaves: 0,
        reward: 'Unlock new leaf types and seasonal decorations',
        startTime: now - (now % (7 * 24 * 60 * 60 * 1000)),
        endTime: now - (now % (7 * 24 * 60 * 60 * 1000)) + 7 * 24 * 60 * 60 * 1000,
        status: 'active',
        participants: 0,
        type: 'weekly',
      },
    ];
  }

  private static async updateCommunityGoals(
    leavesContributed: number,
    _username: string
  ): Promise<
    Array<{
      goalId: string;
      progress: number;
      completed: boolean;
    }>
  > {
    const garden = await this.getCommunityGarden();
    const goalProgress: Array<{ goalId: string; progress: number; completed: boolean }> = [];

    // Update total leaves
    garden.totalLeavesCollected += leavesContributed;

    // Update active goals
    for (const goal of garden.activeGoals) {
      if (goal.status === 'active' && Date.now() <= goal.endTime) {
        goal.currentLeaves += leavesContributed;

        // Check if goal is completed
        if (goal.currentLeaves >= goal.targetLeaves && goal.status === 'active') {
          goal.status = 'completed';
          garden.completedGoals++;
          goalProgress.push({
            goalId: goal.id,
            progress: 100,
            completed: true,
          });
        } else {
          goalProgress.push({
            goalId: goal.id,
            progress: Math.round((goal.currentLeaves / goal.targetLeaves) * 100),
            completed: false,
          });
        }
      }
    }

    // Update season progress
    const seasonLeaves = garden.totalLeavesCollected % garden.nextSeasonUnlock;
    garden.seasonProgress = Math.round((seasonLeaves / garden.nextSeasonUnlock) * 100);

    // Check for season change
    if (garden.totalLeavesCollected >= garden.nextSeasonUnlock * garden.gardenLevel) {
      garden.gardenLevel++;
      garden.seasonProgress = 0;
      // Cycle through seasons
      const seasons: Array<'spring' | 'summer' | 'autumn' | 'winter'> = [
        'spring',
        'summer',
        'autumn',
        'winter',
      ];
      const currentIndex = seasons.indexOf(garden.currentSeason);
      garden.currentSeason = seasons[(currentIndex + 1) % seasons.length] as
        | 'spring'
        | 'summer'
        | 'autumn'
        | 'winter';
    }

    await this.saveCommunityGarden(garden);
    return goalProgress;
  }

  private static generateLeaf(
    id: string,
    isTarget: boolean = false,
    speedMultiplier: number = 1.0
  ): Leaf {
    // Generate leaves with better spread and varied movement
    const angle = Math.random() * Math.PI * 2; // Random direction
    const speed = (0.1 + Math.random() * 0.3) * speedMultiplier; // Much slower varied speed

    return {
      id,
      type: LEAF_TYPES[Math.floor(Math.random() * LEAF_TYPES.length)] as LeafType,
      color: LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)] as LeafColor,
      x: 10 + Math.random() * 80, // Use more of the screen area
      y: 10 + Math.random() * 80, // Use more of the screen area
      vx: Math.cos(angle) * speed, // Direction based on angle
      vy: Math.sin(angle) * speed, // Direction based on angle
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.08 * speedMultiplier,
      size: 0.6 + Math.random() * 0.3, // Smaller leaves with variation
      isTarget,
      isCollected: false,
      points: isTarget ? 100 : 10,
    };
  }

  private static async saveGameSession(username: string, session: GameSession): Promise<void> {
    const sessionKey = `${GAME_SESSION_KEY}:${username}`;
    await redis.set(sessionKey, JSON.stringify(session));
    await redis.expire(sessionKey, 3600); // Expire after 1 hour
  }

  private static async getGameSession(username: string): Promise<GameSession | null> {
    const sessionKey = `${GAME_SESSION_KEY}:${username}`;
    const sessionData = await redis.get(sessionKey);
    return sessionData ? JSON.parse(sessionData) : null;
  }

  private static async getUserStats(username: string): Promise<UserStats> {
    const userKey = `${USER_STATS_KEY}:${username}`;
    const userData = await redis.get(userKey);

    if (!userData) {
      const newUser: UserStats = {
        username,
        totalScore: 0,
        highestLevel: 1,
        gamesPlayed: 0,
        gamesCompleted: 0,
        averageScore: 0,
        bestTime: 0,
        totalLeavesCollected: 0,
        favoriteLeafType: 'maple',
        lastPlayTime: 0,
        dailyGamesPlayed: 0,
        rank: 0,
        achievements: [],
        currentStreak: 0,
        longestStreak: 0,
        communityContribution: 0,
      };
      await redis.set(userKey, JSON.stringify(newUser));
      return newUser;
    }

    return JSON.parse(userData);
  }

  private static async saveUserStats(userStats: UserStats): Promise<void> {
    const userKey = `${USER_STATS_KEY}:${userStats.username}`;
    await redis.set(userKey, JSON.stringify(userStats));
  }

  private static async getDailyGamesPlayed(username: string): Promise<number> {
    const today = new Date().toDateString();
    const dailyKey = `${DAILY_GAMES_KEY}:${username}:${today}`;
    const count = await redis.get(dailyKey);
    return count ? parseInt(count) : 0;
  }

  private static async incrementDailyGames(username: string): Promise<number> {
    const today = new Date().toDateString();
    const dailyKey = `${DAILY_GAMES_KEY}:${username}:${today}`;
    const count = await redis.incrBy(dailyKey, 1);
    await redis.expire(dailyKey, 24 * 60 * 60);
    return count;
  }

  public static async canUserPlay(
    username: string
  ): Promise<{ canPlay: boolean; remaining: number }> {
    const used = await this.getDailyGamesPlayed(username);
    const remaining = Math.max(0, DAILY_GAME_LIMIT - used);
    return {
      canPlay: remaining > 0,
      remaining,
    };
  }

  public static async startGame(
    username: string,
    difficulty: GameDifficulty
  ): Promise<GameSession> {
    // Check if user can play
    const { canPlay } = await this.canUserPlay(username);
    if (!canPlay) {
      throw new Error(
        "You've used all your daily games! Come back tomorrow for more leaf collecting! 🍃"
      );
    }

    const config = DIFFICULTY_CONFIG[difficulty];
    const userStats = await this.getUserStats(username);

    // Generate leaves
    const leaves: Leaf[] = [];

    // Generate target leaves
    for (let i = 0; i < config.targetLeaves; i++) {
      leaves.push(this.generateLeaf(`target-${i}`, true, config.leafSpeed));
    }

    // Generate regular leaves
    for (let i = 0; i < config.totalLeaves - config.targetLeaves; i++) {
      leaves.push(this.generateLeaf(`regular-${i}`, false, config.leafSpeed));
    }

    const gameSession: GameSession = {
      id: `game-${Date.now()}-${username}`,
      username,
      difficulty,
      level: userStats.highestLevel,
      score: 0,
      lives: 3,
      timeRemaining: GAME_DURATION,
      targetLeaves: config.targetLeaves,
      collectedLeaves: 0,
      leaves,
      status: 'playing',
      startTime: Date.now(),
    };

    await this.saveGameSession(username, gameSession);
    await this.incrementDailyGames(username);

    // Update user stats
    userStats.gamesPlayed++;
    userStats.lastPlayTime = Date.now();
    await this.saveUserStats(userStats);

    return gameSession;
  }

  public static async collectLeaf(
    username: string,
    leafId: string
  ): Promise<{ result: GameResult; updatedSession: GameSession; updatedUserStats: UserStats }> {
    const session = await this.getGameSession(username);
    if (!session) {
      throw new Error('No active game session found');
    }

    if (session.status !== 'playing') {
      // Game has ended - return a graceful response instead of throwing an error
      const userStats = await this.getUserStats(username);
      return {
        result: {
          success: false,
          message: session.status === 'completed' ? 'Game completed!' : 'Game over!',
          scoreEarned: 0,
          levelCompleted: session.status === 'completed',
          gameCompleted: session.status === 'completed',
          communityContribution: 0,
          goalProgress: [],
        },
        updatedSession: session,
        updatedUserStats: userStats,
      };
    }

    const leaf = session.leaves.find((l) => l.id === leafId);
    if (!leaf) {
      throw new Error('Leaf not found');
    }

    if (leaf.isCollected) {
      throw new Error('Leaf already collected');
    }

    // Collect the leaf
    leaf.isCollected = true;

    if (leaf.isTarget) {
      // Target leaf - award points and count towards completion
      session.score += leaf.points;
      session.collectedLeaves++;
    } else {
      // Regular leaf - lose a life (penalty for clicking wrong leaves)
      session.lives = Math.max(0, session.lives - 1);
      session.score += leaf.points; // Still get some points, but lose a life
    }

    // Check if game is over
    const levelCompleted = session.collectedLeaves >= session.targetLeaves;
    const gameOver = session.lives <= 0;

    if (gameOver) {
      session.status = 'failed';
      session.endTime = Date.now();
    } else if (levelCompleted) {
      session.status = 'completed';
      session.endTime = Date.now();

      // Time bonus
      const timeBonus = Math.floor(
        session.timeRemaining * DIFFICULTY_CONFIG[session.difficulty].timeBonus
      );
      session.score += timeBonus;
    }

    await this.saveGameSession(username, session);

    // Update community garden (every leaf contributes to community goals)
    const communityContribution = 1; // Each leaf = 1 contribution
    const goalProgress = await this.updateCommunityGoals(communityContribution, username);

    // Update user stats
    const userStats = await this.getUserStats(username);
    userStats.totalScore += leaf.points;
    userStats.totalLeavesCollected++;
    userStats.communityContribution =
      (userStats.communityContribution || 0) + communityContribution;

    if (levelCompleted) {
      userStats.gamesCompleted++;
      userStats.currentStreak++;
      userStats.longestStreak = Math.max(userStats.longestStreak, userStats.currentStreak);

      if (session.level >= userStats.highestLevel) {
        userStats.highestLevel = session.level + 1;
      }

      // Calculate best time
      const gameTime = (session.endTime! - session.startTime) / 1000;
      if (userStats.bestTime === 0 || gameTime < userStats.bestTime) {
        userStats.bestTime = gameTime;
      }
    }

    // Update average score
    userStats.averageScore = Math.round(userStats.totalScore / userStats.gamesPlayed);

    await this.saveUserStats(userStats);

    // Create enhanced result message
    let message: string;
    if (leaf.isTarget) {
      message = `🌟 Target leaf collected! +${leaf.points} points!`;
    } else {
      message = `💔 Wrong leaf! -1 life, +${leaf.points} points`;
    }

    // Add game over messages
    if (gameOver) {
      message += ` 💀 Game Over! No lives left.`;
    } else if (levelCompleted) {
      message += ` 🎉 Level completed!`;
    }

    // Add community goal progress messages
    const completedGoals = goalProgress.filter((g) => g.completed);
    if (completedGoals.length > 0) {
      message += ` 🎉 Community goal completed!`;
    } else if (goalProgress.length > 0) {
      message += ` 🌱 +1 to community garden!`;
    }

    const result: GameResult = {
      success: true,
      message,
      scoreEarned: leaf.points,
      levelCompleted,
      gameCompleted: levelCompleted && !gameOver,
      communityContribution,
      goalProgress,
      ...(levelCompleted && !gameOver && { nextLevel: session.level + 1 }),
    };

    return {
      result,
      updatedSession: session,
      updatedUserStats: userStats,
    };
  }

  public static async getLeaderboard(): Promise<UserStats[]> {
    // In a real implementation, you'd use Redis sorted sets for efficient leaderboards
    // For now, we'll return an empty array
    return [];
  }

  public static async getRecentGames(): Promise<
    Array<{
      username: string;
      level: number;
      score: number;
      timestamp: number;
      difficulty: GameDifficulty;
    }>
  > {
    // In a real implementation, you'd store recent games in Redis
    // For now, we'll return an empty array
    return [];
  }

  public static async initializeGame(username: string): Promise<{
    userStats: UserStats;
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
  }> {
    const [userStats, playInfo, leaderboard, recentGames, communityGarden] = await Promise.all([
      this.getUserStats(username),
      this.canUserPlay(username),
      this.getLeaderboard(),
      this.getRecentGames(),
      this.getCommunityGarden(),
    ]);

    return {
      userStats,
      canPlay: playInfo.canPlay,
      dailyGamesRemaining: playInfo.remaining,
      leaderboard,
      recentGames,
      communityGarden,
    };
  }

  public static async resetDailyGames(username: string): Promise<void> {
    const today = new Date().toDateString();
    const dailyKey = `${DAILY_GAMES_KEY}:${username}:${today}`;
    await redis.del(dailyKey);
  }
}
