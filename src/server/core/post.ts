import { reddit, context } from '@devvit/web/server';

export async function createPost() {
  if (!context.subredditName) {
    throw new Error('Subreddit name not found in context');
  }

  // Get current date for dynamic content
  const date = new Date().toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const post = await reddit.submitCustomPost({
    subredditName: context.subredditName,
    title: `🍃 ${date}'s Ebb & Flow - Leaf Collection Game`,
    splash: {
      appDisplayName: 'Ebb & Flow',
      // Use a working gradient background since PNG isn't loading
      backgroundUri: 'default-splash.png',
      buttonLabel: 'Start Playing',
      description:
        'Fast-paced 30-second leaf collection challenge! Collect golden leaves, avoid regular ones, and climb the leaderboard!',
      heading: 'Welcome to Ebb & Flow',
      appIconUri: 'default-icon.png',
    },
  });

  return post;
}
