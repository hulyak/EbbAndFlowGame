import { reddit, context } from '@devvit/web/server';

export async function createPost() {
  if (!context.subredditName) {
    throw new Error('Subreddit name not found in context');
  }

  // Get current date for dynamic content
  const date = (new Date()).toLocaleString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const post = await reddit.submitCustomPost({
    subredditName: context.subredditName,
    title: `🍃 ${date}'s Ebb & Flow - Leaf Collection Game`,
    splash: {
      appDisplayName: 'Ebb & Flow',
      // Use a working gradient background since PNG isn't loading
      backgroundUri: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MzAiIHZpZXdCb3g9IjAgMCAxMjAwIDYzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojMDY0ZTNiO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjMwJSIgc3R5bGU9InN0b3AtY29sb3I6IzA1OTY2OTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSI3MCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwZDk0ODg7c3RvcC1vcGFjaXR5OjEiIC8+CiAgICAgIDxzdG9wIG9mZnNldD0iMTAwJSIgc3R5bGU9InN0b3AtY29sb3I6IzEwYjk4MTtzdG9wLW9wYWNpdHk6MSIgLz4KICAgIDwvbGluZWFyR3JhZGllbnQ+CiAgPC9kZWZzPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JhZGllbnQpIiAvPgogIDx0ZXh0IHg9IjYwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNzIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBvcGFjaXR5PSIwLjgiPvCfjeM8L3RleHQ+CiAgPHRleHQgeD0iNjAwIiB5PSIzMDAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0OCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIG9wYWNpdHk9IjAuOSI+RWJiICZhbXA7IEZsb3c8L3RleHQ+CiAgPHRleHQgeD0iNjAwIiB5PSIzNjAiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIyNCIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIG9wYWNpdHk9IjAuOCI+TGVhZiBDb2xsZWN0aW9uIEdhbWU8L3RleHQ+CiAgPGNpcmNsZSBjeD0iMjAwIiBjeT0iMTUwIiByPSI0IiBmaWxsPSJ3aGl0ZSIgb3BhY2l0eT0iMC42Ij4KICAgIDxhbmltYXRlIGF0dHJpYnV0ZU5hbWU9Im9wYWNpdHkiIHZhbHVlcz0iMC42OzE7MC42IiBkdXI9IjJzIiByZXBlYXRDb3VudD0iaW5kZWZpbml0ZSIvPgogIDwvY2lyY2xlPgogIDxjaXJjbGUgY3g9IjEwMDAiIGN5PSI0MDAiIHI9IjMiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjUiPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIwLjU7MC45OzAuNSIgZHVyPSIzcy4gcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz4KICA8L2NpcmNsZT4KICA8Y2lyY2xlIGN4PSI5MDAiIGN5PSIxMDAiIHI9IjIiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjciPgogICAgPGFuaW1hdGUgYXR0cmlidXRlTmFtZT0ib3BhY2l0eSIgdmFsdWVzPSIwLjc7MTswLjciIGR1cj0iMS41cyIgcmVwZWF0Q291bnQ9ImluZGVmaW5pdGUiLz4KICA8L2NpcmNsZT4KPC9zdmc+',
      buttonLabel: 'Start Playing',
      description: 'Fast-paced 30-second leaf collection challenge! Collect golden leaves, avoid regular ones, and climb the leaderboard!',
      heading: 'Welcome to Ebb & Flow',
      appIconUri: 'default-icon.png',
    }
  });

  return post;
}