# Design Document

## Overview

The User Progression & Scoring System creates a comprehensive player advancement framework that balances engagement with sustainable play patterns. The system uses Redis for persistent storage and implements sophisticated analytics to track player development and provide meaningful feedback.

## Architecture

### System Architecture

```
User Progression System
├── Statistics Engine
│   ├── Score Calculator
│   ├── Performance Analyzer
│   └── Trend Tracker
├── Achievement Framework
│   ├── Milestone Detector
│   ├── Badge System
│   └── Recognition Engine
├── Daily Engagement Manager
│   ├── Play Limit Controller
│   ├── Reset Scheduler
│   └── Engagement Optimizer
└── Social Features
    ├── Leaderboard Manager
    ├── Ranking Calculator
    └── Activity Feed
```

### Data Flow

```
Game Completion → Score Calculator → Statistics Engine → User Stats Update
     ↓                                      ↓
Achievement Check → Milestone Detector → Badge Unlock → Social Recognition
     ↓                                      ↓
Daily Limit Update → Engagement Manager → Play Status → UI Feedback
```

## Components and Interfaces

### 1. User Statistics Core

**Purpose:** Central repository for all player progression data
**Key Methods:**

- `getUserStats(username: string): Promise<UserStats>`
- `updateStats(username: string, gameResult: GameResult): Promise<UserStats>`
- `calculateAverages(userStats: UserStats): Promise<PerformanceMetrics>`
- `getProgressionTrends(username: string): Promise<TrendData>`

### 2. Scoring System

**Purpose:** Handles all point calculations, bonuses, and performance metrics
**Scoring Rules:**

```typescript
interface ScoringConfig {
  targetLeafPoints: 100;
  regularLeafPoints: 10;
  timeBonusMultiplier: {
    easy: 1.0;
    medium: 1.5;
    hard: 2.0;
  };
  streakBonus: number; // Additional multiplier for consecutive days
  perfectGameBonus: 500; // Bonus for collecting all leaves
}
```

### 3. Achievement System

**Purpose:** Recognizes player milestones and provides progression goals
**Achievement Categories:**

```typescript
interface AchievementConfig {
  scoring: {
    firstGame: { name: 'First Steps'; description: 'Complete your first game' };
    score1000: { name: 'Leaf Collector'; description: 'Score 1,000 points' };
    score10000: { name: 'Master Collector'; description: 'Score 10,000 points' };
  };
  consistency: {
    streak7: { name: 'Weekly Warrior'; description: 'Play 7 days in a row' };
    streak30: { name: 'Monthly Master'; description: 'Play 30 days in a row' };
  };
  community: {
    contributor100: {
      name: 'Community Helper';
      description: 'Contribute 100 leaves to community goals';
    };
    goalCompleter: { name: 'Goal Crusher'; description: 'Help complete 10 community goals' };
  };
}
```

### 4. Daily Engagement System

**Purpose:** Manages play limits and encourages healthy engagement patterns
**Engagement Configuration:**

```typescript
interface EngagementConfig {
  dailyGameLimit: 10;
  resetTime: '00:00 UTC';
  warningThreshold: 2; // Warn when 2 games remaining
  cooldownPeriod: 24; // Hours until reset
  streakGracePeriod: 6; // Hours grace for maintaining streaks
}
```

### 5. Leaderboard System

**Purpose:** Provides social comparison and competitive elements
**Ranking Categories:**

```typescript
interface LeaderboardConfig {
  totalScore: { limit: 100; updateFrequency: 'real-time' };
  weeklyScore: { limit: 50; resetDay: 'monday' };
  communityContribution: { limit: 50; updateFrequency: 'hourly' };
  currentStreak: { limit: 25; updateFrequency: 'daily' };
}
```

## Data Models

### User Statistics Model

```typescript
interface UserStats {
  username: string;
  totalScore: number;
  highestLevel: number;
  gamesPlayed: number;
  gamesCompleted: number;
  averageScore: number;
  bestTime: number; // Fastest completion time in seconds
  totalLeavesCollected: number;
  favoriteLeafType: LeafType;
  lastPlayTime: number;
  dailyGamesPlayed: number;
  rank: number;
  achievements: Achievement[];
  currentStreak: number;
  longestStreak: number;
  communityContribution: number;
  performanceMetrics: PerformanceMetrics;
}
```

### Performance Analytics

```typescript
interface PerformanceMetrics {
  averageCompletionTime: number;
  accuracyRate: number; // Percentage of target leaves collected
  improvementTrend: 'improving' | 'stable' | 'declining';
  difficultyPreference: GameDifficulty;
  playTimeDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  weeklyActivity: number[]; // Games per day of week
}
```

### Achievement System

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: 'scoring' | 'consistency' | 'community' | 'special';
  unlockedAt: number;
  progress?: number; // For progressive achievements
  maxProgress?: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}
```

### Daily Engagement Tracking

```typescript
interface DailyEngagement {
  username: string;
  date: string; // YYYY-MM-DD format
  gamesPlayed: number;
  gamesRemaining: number;
  firstPlayTime: number;
  lastPlayTime: number;
  totalPlayTime: number;
  streakStatus: 'active' | 'broken' | 'grace-period';
}
```

## Error Handling

### Data Consistency

- Implement atomic operations for score updates
- Validate achievement unlock conditions
- Handle concurrent game completion scenarios
- Provide rollback mechanisms for corrupted data

### Daily Reset Management

- Handle timezone differences gracefully
- Implement failsafe mechanisms for reset failures
- Provide manual reset capabilities for edge cases
- Monitor and alert on reset anomalies

### Performance Safeguards

- Implement rate limiting for rapid game completions
- Validate score calculations for anomalies
- Monitor for potential cheating patterns
- Provide data recovery for corrupted statistics

## Testing Strategy

### Statistical Accuracy Testing

- Validate score calculation algorithms
- Test achievement unlock conditions
- Verify leaderboard ranking accuracy
- Confirm daily reset functionality

### Performance Testing

- Load testing for concurrent user updates
- Memory usage optimization for large user bases
- Database query performance optimization
- Real-time update latency measurement

### Edge Case Testing

- Timezone boundary testing for daily resets
- Concurrent game completion handling
- Achievement unlock race conditions
- Data corruption recovery scenarios

## Implementation Considerations

### Scalability Design

- Efficient Redis key structures for user data
- Batch processing for leaderboard updates
- Caching strategies for frequently accessed statistics
- Horizontal scaling for user statistics processing

### Real-time Features

- Immediate feedback for score updates
- Live leaderboard position changes
- Real-time achievement notifications
- Instant daily limit status updates

### Analytics Integration

- Comprehensive event tracking for user behavior
- Performance metrics collection and analysis
- A/B testing framework for engagement optimization
- Retention analysis and improvement recommendations

### Privacy and Security

- Secure storage of user statistics
- Privacy-compliant data collection
- User data export and deletion capabilities
- Protection against score manipulation
