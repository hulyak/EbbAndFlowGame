import React from 'react';
import { CommunityGarden as CommunityGardenType, CommunityGoal } from '../../shared/types/api';

interface CommunityGardenProps {
  communityGarden: CommunityGardenType;
  userContribution: number;
}

const getSeasonEmoji = (season: string) => {
  switch (season) {
    case 'spring':
      return '🌸';
    case 'summer':
      return '☀️';
    case 'autumn':
      return '🍂';
    case 'winter':
      return '❄️';
    default:
      return '🌱';
  }
};

const getSeasonColor = (season: string) => {
  switch (season) {
    case 'spring':
      return 'from-pink-400 to-green-400';
    case 'summer':
      return 'from-yellow-400 to-orange-400';
    case 'autumn':
      return 'from-orange-400 to-red-400';
    case 'winter':
      return 'from-blue-400 to-cyan-400';
    default:
      return 'from-green-400 to-teal-400';
  }
};

const formatTimeRemaining = (endTime: number) => {
  const now = Date.now();
  const remaining = endTime - now;

  if (remaining <= 0) return 'Expired';

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
  }

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
};

const GoalCard: React.FC<{ goal: CommunityGoal }> = ({ goal }) => {
  const progress = Math.min(100, (goal.currentLeaves / goal.targetLeaves) * 100);
  const isCompleted = goal.status === 'completed';

  return (
    <div
      className={`p-4 rounded-xl border-2 transition-all ${
        isCompleted
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-200 hover:border-emerald-300'
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-semibold text-gray-800 flex items-center">
            {goal.title}
            {isCompleted && <span className="ml-2 text-green-500">✅</span>}
          </h4>
          <p className="text-sm text-gray-600 mt-1">{goal.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium text-gray-700">
            {goal.currentLeaves.toLocaleString()} / {goal.targetLeaves.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500">{formatTimeRemaining(goal.endTime)}</div>
        </div>
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600">Progress</span>
          <span className="font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isCompleted ? 'bg-green-400' : 'bg-gradient-to-r from-emerald-400 to-teal-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-600">Reward: {goal.reward}</span>
        <span className="text-emerald-600 font-medium">{goal.participants} players</span>
      </div>
    </div>
  );
};

export const CommunityGarden: React.FC<CommunityGardenProps> = ({
  communityGarden,
  userContribution,
}) => {
  const seasonEmoji = getSeasonEmoji(communityGarden.currentSeason);
  const seasonColor = getSeasonColor(communityGarden.currentSeason);

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center mb-3">
          <div className="text-4xl mr-3">{seasonEmoji}</div>
          <div>
            <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Community Garden
            </h2>
            <p className="text-sm text-gray-600 capitalize">
              {communityGarden.currentSeason} Season • Level {communityGarden.gardenLevel}
            </p>
          </div>
        </div>

        {/* Season Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Season Progress</span>
            <span className="font-medium">{communityGarden.seasonProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full bg-gradient-to-r ${seasonColor} transition-all duration-500`}
              style={{ width: `${communityGarden.seasonProgress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {communityGarden.nextSeasonUnlock -
              (communityGarden.totalLeavesCollected % communityGarden.nextSeasonUnlock)}{' '}
            leaves to next season
          </p>
        </div>
      </div>

      {/* Community Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="text-center p-3 bg-emerald-50 rounded-xl">
          <div className="text-2xl font-bold text-emerald-600">
            {communityGarden.totalLeavesCollected.toLocaleString()}
          </div>
          <div className="text-xs text-gray-600">Total Leaves</div>
        </div>
        <div className="text-center p-3 bg-teal-50 rounded-xl">
          <div className="text-2xl font-bold text-teal-600">{communityGarden.completedGoals}</div>
          <div className="text-xs text-gray-600">Goals Completed</div>
        </div>
      </div>

      {/* Your Contribution */}
      <div className="mb-6 p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-emerald-800">Your Contribution</h3>
            <p className="text-sm text-emerald-600">Every leaf you collect helps the community!</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-emerald-600">{userContribution}</div>
            <div className="text-xs text-emerald-600">leaves contributed</div>
          </div>
        </div>
      </div>

      {/* Active Goals */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
          <span className="mr-2">🎯</span>
          Active Community Goals
        </h3>
        <div className="space-y-4">
          {communityGarden.activeGoals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))}
        </div>
      </div>

      {/* Special Events */}
      {communityGarden.specialEvents.length > 0 && (
        <div className="mt-6 p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <h3 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <span className="mr-2">🎉</span>
            Special Events
          </h3>
          <div className="space-y-2">
            {communityGarden.specialEvents.map((event, index) => (
              <p key={index} className="text-sm text-yellow-700">
                {event}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Call to Action */}
      <div className="mt-6 text-center p-4 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-xl">
        <p className="text-sm text-emerald-800 font-medium">
          🌱 Every leaf you collect grows our shared garden! 🌱
        </p>
        <p className="text-xs text-emerald-600 mt-1">
          Work together to unlock seasonal rewards and special events
        </p>
      </div>
    </div>
  );
};
