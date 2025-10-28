import { useCallback, useEffect, useState } from 'react';
import type { 
  InitResponse, 
  StartGameResponse, 
  CollectLeafResponse,
  LeaderboardResponse,
  GameSession, 
  UserStats, 
  GameDifficulty,
  CommunityGarden
} from '../../shared/types/api';

interface EbbFlowState {
  gameSession: GameSession | null;
  userStats: UserStats | null;
  username: string | null;
  loading: boolean;
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
  lastMessage: string;
  gameLoading: boolean;
  communityGarden: CommunityGarden | null;
}

export const useEbbFlow = () => {
  const [state, setState] = useState<EbbFlowState>({
    gameSession: null,
    userStats: null,
    username: null,
    loading: true,
    canPlay: false,
    dailyGamesRemaining: 0,
    leaderboard: [],
    recentGames: [],
    lastMessage: '',
    gameLoading: false,
    communityGarden: null,
  });
  const [postId, setPostId] = useState<string | null>(null);

  // Initialize game data
  useEffect(() => {
    const init = async () => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
        
        const res = await fetch('/api/init', {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
        }
        
        const data: InitResponse = await res.json();
        if (data.type !== 'init') {
          throw new Error('Invalid response format from server');
        }
        
        setState({
          gameSession: null,
          userStats: data.userStats,
          username: data.username,
          loading: false,
          canPlay: data.canPlay,
          dailyGamesRemaining: data.dailyGamesRemaining,
          leaderboard: data.leaderboard,
          recentGames: data.recentGames,
          lastMessage: '',
          gameLoading: false,
          communityGarden: data.communityGarden,
        });
        setPostId(data.postId);
      } catch (err) {
        console.error('Failed to init ebb flow game', err);
        setState((prev) => ({ 
          ...prev, 
          loading: false,
          lastMessage: err instanceof Error ? err.message : 'Failed to connect to game server'
        }));
      }
    };
    void init();
  }, []);

  // Auto-refresh leaderboard every 30 seconds
  useEffect(() => {
    if (!postId) return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch('/api/leaderboard');
        if (!res.ok) return;
        const data: LeaderboardResponse = await res.json();
        if (data.type !== 'leaderboard') return;
        
        setState((prev) => ({
          ...prev,
          leaderboard: data.leaderboard,
        }));
      } catch (err) {
        console.error('Failed to refresh leaderboard', err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [postId]);

  // Game loop for updating leaf positions and timer
  useEffect(() => {
    if (!state.gameSession || state.gameSession.status !== 'playing') return;

    // Only handle timer, let the game component handle physics

    // Separate timer for countdown (every 1 second)
    const timerInterval = setInterval(() => {
      setState((prev) => {
        if (!prev.gameSession || prev.gameSession.status !== 'playing') return prev;

        const updatedSession = { ...prev.gameSession };
        
        // Calculate time remaining based on start time and game duration (30 seconds)
        const elapsedTime = Math.floor((Date.now() - updatedSession.startTime) / 1000);
        updatedSession.timeRemaining = Math.max(0, 30 - elapsedTime);
        
        // Check game completion or failure conditions
        if (updatedSession.collectedLeaves >= updatedSession.targetLeaves) {
          updatedSession.status = 'completed';
        } else if (updatedSession.timeRemaining <= 0) {
          // Time up - player failed to collect enough target leaves
          updatedSession.status = 'failed';
        } else if (updatedSession.lives <= 0) {
          // No lives left - player failed
          updatedSession.status = 'failed';
        }

        return {
          ...prev,
          gameSession: updatedSession,
        };
      });
    }, 1000); // Update timer every 1 second

    return () => {
      clearInterval(timerInterval);
    };
  }, [state.gameSession]);

  const startGame = useCallback(
    async (difficulty: GameDifficulty) => {
      console.log('Starting game with difficulty:', difficulty, 'postId:', postId, 'gameLoading:', state.gameLoading);
      
      if (!postId || state.gameLoading) {
        console.log('Cannot start game - missing postId or already loading');
        return;
      }

      setState((prev) => ({ ...prev, gameLoading: true, lastMessage: '' }));

      try {
        console.log('Sending start game request...');
        const res = await fetch('/api/start-game', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ difficulty }),
        });
        
        console.log('Start game response status:', res.status);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `HTTP ${res.status}`);
        }
        
        const data: StartGameResponse = await res.json();
        console.log('Game started successfully:', data);
        
        setState((prev) => ({
          ...prev,
          gameSession: data.gameSession,
          dailyGamesRemaining: data.dailyGamesRemaining,
          canPlay: data.dailyGamesRemaining > 0,
          gameLoading: false,
        }));
      } catch (err) {
        console.error(`Failed to start game with difficulty: ${difficulty}`, err);
        setState((prev) => ({ 
          ...prev, 
          gameLoading: false,
          lastMessage: err instanceof Error ? err.message : 'Failed to start game'
        }));
      }
    },
    [postId, state.gameLoading]
  );

  const collectLeaf = useCallback(
    async (leafId: string) => {
      if (!postId || !state.gameSession || state.gameSession.status !== 'playing') {
        console.log('collectLeaf: Game not active or missing data');
        return;
      }

      console.log(`collectLeaf: Attempting to collect leaf ${leafId}`);

      try {
        const res = await fetch('/api/collect-leaf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leafId }),
        });
        
        console.log(`collectLeaf: API response status ${res.status}`);
        
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || `HTTP ${res.status}`);
        }
        
        const data: CollectLeafResponse = await res.json();
        console.log('collectLeaf: Success', data.result.message);
        
        setState((prev) => ({
          ...prev,
          gameSession: {
            ...data.updatedSession,
            // Calculate accurate time remaining based on start time
            timeRemaining: prev.gameSession?.startTime 
              ? Math.max(0, 30 - Math.floor((Date.now() - prev.gameSession.startTime) / 1000))
              : data.updatedSession.timeRemaining,
          },
          userStats: data.updatedUserStats,
          dailyGamesRemaining: data.dailyGamesRemaining,
          canPlay: data.dailyGamesRemaining > 0,
          lastMessage: data.result.message,
        }));

        // Clear message after 3 seconds
        setTimeout(() => {
          setState((prev) => ({ ...prev, lastMessage: '' }));
        }, 3000);
      } catch (err) {
        console.error(`Failed to collect leaf ${leafId}`, err);
        setState((prev) => ({ 
          ...prev, 
          lastMessage: err instanceof Error ? err.message : 'Failed to collect leaf'
        }));
      }
    },
    [postId, state.gameSession]
  );

  const isGameActive = useCallback((): boolean => {
    return state.gameSession?.status === 'playing';
  }, [state.gameSession]);

  const getGameProgress = useCallback((): number => {
    if (!state.gameSession) return 0;
    return Math.round((state.gameSession.collectedLeaves / state.gameSession.targetLeaves) * 100);
  }, [state.gameSession]);

  const clearMessage = useCallback(() => {
    setState((prev) => ({ ...prev, lastMessage: '' }));
  }, []);

  return {
    ...state,
    startGame,
    collectLeaf,
    isGameActive,
    getGameProgress,
    clearMessage,
  } as const;
};