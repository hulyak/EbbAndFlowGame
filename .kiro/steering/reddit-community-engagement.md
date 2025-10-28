---
inclusion: fileMatch
fileMatchPattern: 'src/server/**/*'
---

# Reddit Community Engagement Patterns

## Post Creation Strategies

### Dynamic Content Generation
Always personalize posts with contextual information:

```typescript
const date = new Date().toLocaleString('en-US', {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
});

const post = await reddit.submitCustomPost({
  title: `🍃 ${date}'s Zen Garden - Ebb & Flow`,
  splash: {
    description: `${date}'s peaceful leaf collection experience.`
  }
});
```

### Community-Driven Features
- Implement shared goals that require community participation
- Create daily/weekly challenges that reset automatically
- Track community progress and celebrate milestones
- Enable social features like leaderboards and achievements

## Engagement Mechanics

### Daily Interaction Patterns
- Limit daily plays to encourage return visits (10 games/day)
- Reset counters at consistent times (UTC midnight)
- Provide clear feedback on remaining plays
- Implement streak mechanics for consecutive days

### Social Proof Elements
```typescript
// Show community impact
const communityStats = {
  totalLeavesCollected: await getTotalLeaves(),
  activePlayersToday: await getActivePlayerCount(),
  currentSeason: await getCurrentSeason()
};
```

### Progression Systems
- Individual progress (personal stats, achievements)
- Community progress (shared goals, seasonal unlocks)
- Skill progression (difficulty levels, mastery indicators)
- Social progression (leaderboard rankings, recognition)

## Reddit Platform Integration

### Subreddit Context Awareness
```typescript
// Adapt content to subreddit culture
const subredditInfo = await reddit.getSubredditById(context.subredditId);
const isGamingSubreddit = subredditInfo.name.includes('gaming');

// Adjust messaging accordingly
const description = isGamingSubreddit 
  ? "Challenge your reflexes in this zen leaf collection game"
  : "Take a peaceful break with this relaxing leaf collection experience";
```

### Moderation Considerations
- Implement appropriate content filtering
- Provide clear community guidelines
- Enable moderator controls and oversight
- Handle user reports and feedback gracefully

## Data Privacy and User Experience

### Anonymous-First Design
- Default to anonymous gameplay
- Make account linking optional
- Respect user privacy preferences
- Implement data retention policies

### Performance Optimization
- Minimize server requests during gameplay
- Implement efficient caching strategies
- Use Redis for fast data access
- Optimize for mobile network conditions

## Community Building Features

### Collaborative Elements
- Shared community gardens that evolve based on collective play
- Seasonal themes unlocked through community effort
- Special events that require coordination
- Recognition systems for community contributors

### Feedback Loops
- Show individual impact on community goals
- Provide real-time progress updates
- Celebrate community achievements
- Enable player-to-player encouragement