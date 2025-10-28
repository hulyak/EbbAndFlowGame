import { useState } from 'react';
import { useEbbFlow } from './hooks/useEbbFlow';
import { EbbFlowGame } from './components/EbbFlowGame';
import { GameLeaderboard } from './components/GameLeaderboard';
import { MessageDisplay } from './components/MessageDisplay';
import { SplashScreen } from './components/SplashScreen';
import { ErrorBoundary } from './components/ErrorBoundary';

const AppContent = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  
  const { 
    gameSession,
    userStats,
    loading, 
    canPlay,
    leaderboard,
    recentGames,
    lastMessage,
    gameLoading,
    startGame,
    collectLeaf,
    isGameActive,
    communityGarden
  } = useEbbFlow();

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-100 overflow-hidden" style={{ height: '100vh', width: '100vw' }}>
        <div className="text-center">
          <div className="text-3xl sm:text-4xl mb-2">🍃</div>
          <p className="text-gray-600 mb-2 text-sm sm:text-base">Loading...</p>
          <div className="animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-b-2 border-emerald-500 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="flex items-center justify-center bg-gradient-to-br from-emerald-100 via-teal-100 to-blue-100 overflow-hidden p-4" style={{ height: '100vh', width: '100vw' }}>
        <div className="text-center bg-white/90 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-xl max-w-sm sm:max-w-md w-full">
          <div className="text-4xl sm:text-6xl mb-3 sm:mb-4">⚠️</div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Connection Issue</h2>
          <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">Failed to load game data</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all text-sm sm:text-base"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Show leaderboard when requested, but not immediately after game completion
  if (showLeaderboard) {
    return (
      <>
        <MessageDisplay message={lastMessage} />
        <GameLeaderboard 
          leaderboard={leaderboard}
          userStats={userStats}
          recentGames={recentGames}
          communityGarden={communityGarden!}
        />
        {/* Floating button to start new game */}
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50">
          <button
            onClick={() => setShowLeaderboard(false)}
            className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white p-2.5 sm:p-3 rounded-full shadow-xl hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-110 active:scale-95"
          >
            <span className="text-lg sm:text-xl">🎮</span>
          </button>
        </div>
      </>
    );
  }

  // Main game view
  return (
    <>
      <MessageDisplay message={lastMessage} />
      <EbbFlowGame 
        gameSession={gameSession}
        onCollectLeaf={collectLeaf}
        onStartGame={startGame}
        onShowLeaderboard={() => setShowLeaderboard(true)}
        gameLoading={gameLoading}
        communityGarden={communityGarden}
      />
      
      {/* Floating leaderboard button during game */}
      {isGameActive() && (
        <div className="fixed top-3 left-3 sm:top-4 sm:left-4 z-50">
          <button
            onClick={() => setShowLeaderboard(true)}
            className="bg-white/90 backdrop-blur-sm text-gray-700 p-2.5 sm:p-3 rounded-full shadow-xl hover:bg-white transition-all transform hover:scale-110 active:scale-95 border border-white/20"
          >
            <span className="text-lg sm:text-xl">🏆</span>
          </button>
        </div>
      )}

      {/* Daily games remaining indicator */}
      {!canPlay && (
        <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 bg-yellow-100/90 backdrop-blur-sm text-yellow-800 px-2 py-1.5 sm:px-3 sm:py-2 rounded-lg shadow-xl border border-yellow-200 z-50">
          <p className="text-xs font-medium">
            ⏰ Daily games used!
          </p>
        </div>
      )}
    </>
  );
};

export const App = () => {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
};