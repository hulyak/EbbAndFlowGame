import express from 'express';
import {
  InitResponse,
  StartGameResponse,
  CollectLeafResponse,
  LeaderboardResponse,
  GameDifficulty,
} from '../shared/types/api';
import { reddit, createServer, context, getServerPort } from '@devvit/web/server';
import { createPost } from './core/post';
import { EbbFlowManager } from './core/ebbflow';

const app = express();

// Middleware for JSON body parsing
app.use(express.json());
// Middleware for URL-encoded body parsing
app.use(express.urlencoded({ extended: true }));
// Middleware for plain text body parsing
app.use(express.text());

const router = express.Router();

router.get<{ postId: string }, InitResponse | { status: string; message: string }>(
  '/api/init',
  async (_req, res): Promise<void> => {
    const { postId } = context;

    if (!postId) {
      console.error('API Init Error: postId not found in devvit context');
      res.status(400).json({
        status: 'error',
        message: 'postId is required but missing from context',
      });
      return;
    }

    try {
      const username = await reddit.getCurrentUsername();
      const gameData = await EbbFlowManager.initializeGame(username ?? 'anonymous');

      res.json({
        type: 'init',
        postId: postId,
        userStats: gameData.userStats,
        username: username ?? 'anonymous',
        canPlay: gameData.canPlay,
        dailyGamesRemaining: gameData.dailyGamesRemaining,
        leaderboard: gameData.leaderboard,
        recentGames: gameData.recentGames,
        communityGarden: gameData.communityGarden,
      });
    } catch (error) {
      console.error(`API Init Error for post ${postId}:`, error);
      let errorMessage = 'Unknown error during initialization';
      if (error instanceof Error) {
        errorMessage = `Initialization failed: ${error.message}`;
      }
      res.status(400).json({ status: 'error', message: errorMessage });
    }
  }
);

router.post<
  { postId: string },
  StartGameResponse | { status: string; message: string },
  { difficulty: string }
>('/api/start-game', async (req, res): Promise<void> => {
  const { postId } = context;
  if (!postId) {
    res.status(400).json({
      status: 'error',
      message: 'postId is required',
    });
    return;
  }

  const { difficulty } = req.body;
  if (!difficulty || !['easy', 'medium', 'hard'].includes(difficulty)) {
    res.status(400).json({
      status: 'error',
      message: 'Valid difficulty is required (easy, medium, hard)',
    });
    return;
  }

  try {
    const username = await reddit.getCurrentUsername();
    const gameSession = await EbbFlowManager.startGame(
      username ?? 'anonymous',
      difficulty as GameDifficulty
    );

    // Get remaining games
    const { remaining } = await EbbFlowManager.canUserPlay(username ?? 'anonymous');

    res.json({
      type: 'start',
      postId,
      gameSession,
      dailyGamesRemaining: remaining,
    });
  } catch (error) {
    console.error(`Start game error for post ${postId}:`, error);
    let errorMessage = 'Failed to start game';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(400).json({ status: 'error', message: errorMessage });
  }
});

router.post<
  { postId: string },
  CollectLeafResponse | { status: string; message: string },
  { leafId: string }
>('/api/collect-leaf', async (req, res): Promise<void> => {
  const { postId } = context;
  if (!postId) {
    res.status(400).json({
      status: 'error',
      message: 'postId is required',
    });
    return;
  }

  const { leafId } = req.body;
  if (!leafId) {
    res.status(400).json({
      status: 'error',
      message: 'leafId is required',
    });
    return;
  }

  try {
    const username = await reddit.getCurrentUsername();
    const { result, updatedSession, updatedUserStats } = await EbbFlowManager.collectLeaf(
      username ?? 'anonymous',
      leafId
    );

    // Get remaining games
    const { remaining } = await EbbFlowManager.canUserPlay(username ?? 'anonymous');

    res.json({
      type: 'collect',
      postId,
      result,
      updatedSession,
      updatedUserStats,
      dailyGamesRemaining: remaining,
    });
  } catch (error) {
    console.error(`Collect leaf error for post ${postId}:`, error);
    let errorMessage = 'Failed to collect leaf';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    res.status(400).json({ status: 'error', message: errorMessage });
  }
});

router.get<{ postId: string }, LeaderboardResponse | { status: string; message: string }>(
  '/api/leaderboard',
  async (_req, res): Promise<void> => {
    const { postId } = context;
    if (!postId) {
      res.status(400).json({
        status: 'error',
        message: 'postId is required',
      });
      return;
    }

    try {
      const leaderboard = await EbbFlowManager.getLeaderboard();

      res.json({
        type: 'leaderboard',
        postId,
        leaderboard,
      });
    } catch (error) {
      console.error(`Leaderboard error for post ${postId}:`, error);
      res.status(400).json({ status: 'error', message: 'Failed to get leaderboard' });
    }
  }
);

router.post('/internal/on-app-install', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      status: 'success',
      message: `Post created in subreddit ${context.subredditName} with id ${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

router.post('/internal/menu/post-create', async (_req, res): Promise<void> => {
  try {
    const post = await createPost();

    res.json({
      navigateTo: `https://reddit.com/r/${context.subredditName}/comments/${post.id}`,
    });
  } catch (error) {
    console.error(`Error creating post: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to create post',
    });
  }
});

// Admin endpoint to reset user stats (for testing)
router.post('/internal/reset-stats', async (_req, res): Promise<void> => {
  try {
    const username = await reddit.getCurrentUsername();
    if (username) {
      await EbbFlowManager.resetDailyGames(username);
      res.json({
        status: 'success',
        message: `Daily games reset for user ${username}`,
      });
    } else {
      res.json({
        status: 'success',
        message: 'Daily games reset for anonymous user',
      });
    }
  } catch (error) {
    console.error(`Error resetting stats: ${error}`);
    res.status(400).json({
      status: 'error',
      message: 'Failed to reset stats',
    });
  }
});

// Use router middleware
app.use(router);

// Get port from environment variable with fallback
const port = getServerPort();

const server = createServer(app);
server.on('error', (err) => console.error(`server error; ${err.stack}`));
server.listen(port);
