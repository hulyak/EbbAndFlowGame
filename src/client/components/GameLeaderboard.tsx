import { UserStats, CommunityGarden as CommunityGardenType } from '../../shared/types/api';
import { CommunityGarden } from './CommunityGarden';

interface GameLeaderboardProps {
  leaderboard: UserStats[];
  userStats: UserStats;
  recentGames: Array<{
    username: string;
    level: number;
    score: number;
    timestamp: number;
    difficulty: string;
  }>;
  communityGarden: CommunityGardenType;
}

const formatTimeAgo = (timestamp: number) => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
};

const getRankEmoji = (rank: number) => {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'easy': return 'text-green-600';
    case 'medium': return 'text-yellow-600';
    case 'hard': return 'text-red-600';
    default: return 'text-gray-600';
  }
};

export const GameLeaderboard = ({ leaderboard, userStats, recentGames, communityGarden }: GameLeaderboardProps) => {
  return (
    <div className="bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 p-2 sm:p-4 overflow-y-auto" style={{ height: '100vh', width: '100vw' }}>
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="absolute text-xl opacity-10 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            {['🍃', '🍂', '🍁', '🌿', '🌸'][Math.floor(Math.random() * 5)]}
          </div>
        ))}
      </div>

      <div className="max-w-6xl mx-auto relative z-10 flex flex-col">
        {/* Header */}
        <div className="text-center mb-3 sm:mb-4 flex-shrink-0">
          <div className="relative mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
              🍃 Ebb & Flow
            </h1>
            <div className="absolute inset-0 text-2xl sm:text-3xl font-bold opacity-20 animate-pulse">
              🌿 Ebb & Flow
            </div>
          </div>
          <p className="text-gray-600 text-sm sm:text-base">Community Rankings & Recent Games</p>
        </div>

        {/* Community Garden - Full Width */}
        <div className="mb-3 sm:mb-4 flex-shrink-0">
          <CommunityGarden 
            communityGarden={communityGarden}
            userContribution={userStats.communityContribution || 0}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Your Stats */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-white/20 h-fit">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 sm:mb-4 flex items-center">
              <span className="mr-2">📊</span>
              Your Stats
            </h2>
            <div className="space-y-2 sm:space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Total Score</span>
                <span className="font-bold text-blue-600 text-sm">{userStats.totalScore.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Highest Level</span>
                <span className="font-bold text-purple-600 text-sm">{userStats.highestLevel}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Games Played</span>
                <span className="font-bold text-green-600 text-sm">{userStats.gamesPlayed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Completion Rate</span>
                <span className="font-bold text-orange-600 text-sm">
                  {userStats.gamesPlayed > 0 ? Math.round((userStats.gamesCompleted / userStats.gamesPlayed) * 100) : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Leaves Collected</span>
                <span className="font-bold text-yellow-600 text-sm">{userStats.totalLeavesCollected}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Current Streak</span>
                <span className="font-bold text-red-600 text-sm">{userStats.currentStreak} 🔥</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm">Community Contribution</span>
                <span className="font-bold text-emerald-600 text-sm">{userStats.communityContribution || 0} 🌱</span>
              </div>
            </div>

            {userStats.achievements.length > 0 && (
              <div className="mt-3 sm:mt-4">
                <h3 className="font-semibold text-gray-800 mb-2 text-sm">🏅 Achievements</h3>
                <div className="flex flex-wrap gap-1">
                  {userStats.achievements.map((achievement, index) => (
                    <span key={index} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                      {achievement}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Leaderboard */}
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-3 sm:p-4 shadow-xl border border-white/20 h-fit">
            <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-3 sm:mb-4 flex items-center">
              <span className="mr-2">🏆</span>
              Top Players
            </h2>
            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.slice(0, 10).map((user) => (
                  <div key={user.username} 
                       className={`flex items-center justify-between p-3 rounded-lg ${
                         user.username === userStats.username ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                       }`}>
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">{getRankEmoji(user.rank)}</span>
                      <div>
                        <div className="font-medium text-gray-800">{user.username}</div>
                        <div className="text-xs text-gray-600">
                          Level {user.highestLevel} • {user.gamesCompleted} completed
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-blue-600">{user.totalScore.toLocaleString()}</div>
                      <div className="text-xs text-gray-500">points</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No players yet</p>
            )}
          </div>

          {/* Recent Games */}
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
            <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 flex items-center">
              <span className="mr-2">🎮</span>
              Recent Games
            </h2>
            {recentGames.length > 0 ? (
              <div className="space-y-3">
                {recentGames.slice(0, 8).map((game, index) => (
                  <div key={`${game.username}-${game.timestamp}-${index}`} 
                       className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">🍃</span>
                      <div>
                        <span className="font-medium text-gray-800">{game.username}</span>
                        <div className="text-xs text-gray-600">
                          Level {game.level} • 
                          <span className={`ml-1 ${getDifficultyColor(game.difficulty)}`}>
                            {game.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-green-600">{game.score}</div>
                      <div className="text-xs text-gray-500">
                        {formatTimeAgo(game.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No recent games</p>
            )}
          </div>
        </div>

        {/* Game Tips */}
        <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
          <h2 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-6 flex items-center">
            <span className="mr-2">🌟</span>
            Game Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">🎯 Gameplay</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Look for glowing leaves - they're your targets!</li>
                <li>• Leaves flow naturally with physics</li>
                <li>• Click or tap to collect leaves</li>
                <li>• Collect all target leaves before time runs out</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700">🏆 Scoring</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Target leaves give more points</li>
                <li>• Faster collection = bonus points</li>
                <li>• Higher difficulty = more points</li>
                <li>• Complete levels to unlock achievements</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};