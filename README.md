# 🍃 Ebb & Flow

A fast-paced leaf collection game for Reddit. You've got 30 seconds to grab the golden leaves while dodging the regular ones. Miss too many and you're out. It's trickier than it sounds.

## What's This About?

The game is pretty straightforward - leaves fall down your screen, some are golden (the good ones), most aren't. You click the golden ones to score points, but click a regular leaf and you lose a life. Run out of lives or time, game over.

But here's where it gets interesting: everyone's playing together. Every leaf you collect helps the whole community unlock new stuff. We've got daily challenges, seasonal themes that change as people play, and leaderboards to see how you stack up.

### The Basics

- 30 seconds per game
- 3 lives to work with
- Golden leaves = 100 points (these are what you want)
- Regular leaves = lose a life but get 10 points anyway
- Three difficulty levels with more leaves and faster movement

### Community Stuff

Your games aren't just about your score. Every leaf collected by anyone helps unlock:

- New seasons (Spring → Summer → Autumn → Winter)
- Special leaf types and animations
- Daily and weekly community goals
- Shared rewards for everyone

### Polish

We spent time making this feel good to play:

- Smooth 60fps movement
- Nice gradients and particle effects
- Works great on phones and computers
- Haptic feedback when you catch leaves
- Sound effects that don't get annoying

## Tech Stack

Built with Reddit's Devvit platform using React, TypeScript, and Tailwind. Data gets stored using Devvit's built-in storage so your progress sticks around.

### Kiro Development

This project was built using Kiro as the main development tool. We set up custom hooks for automating repetitive tasks, steering rules for platform-specific guidance, and specs for organizing complex features.

Check out [KIRO_DEVELOPER_EXPERIENCE.md](./KIRO_DEVELOPER_EXPERIENCE.md) if you want to see how we used Kiro to speed up development and avoid common mistakes.

## Getting Started

> Make sure you have Node 22 downloaded on your machine before running!

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Development Mode**

   ```bash
   npm run dev
   ```

3. **Build for Production**

   ```bash
   npm run build
   ```

4. **Deploy to Reddit**
   ```bash
   npm run deploy
   ```

## How to Play

1. Pick your difficulty (Easy, Medium, or Hard)
2. Watch leaves fall down the screen
3. Click only the golden glowing ones - they're worth 100 points
4. Avoid regular leaves or you'll lose a life (though you still get 10 points)
5. You have 30 seconds and 3 lives
6. Try not to panic when it gets chaotic

The community aspect happens automatically - every leaf you collect helps everyone unlock new stuff. No extra work required.

## 🏆 Game Mechanics

### Leaf Types

- **🍁 Maple**: Classic autumn leaves
- **🍂 Oak**: Sturdy and reliable
- **🍃 Birch**: Light and delicate
- **🌿 Willow**: Graceful and flowing
- **🌸 Cherry**: Beautiful and rare

### Difficulty Levels

- **Easy**: 10 target leaves, gentle slow flow, 30 seconds
- **Medium**: 15 target leaves, moderate speed, 30 seconds
- **Hard**: 20 target leaves, fast chaotic flow, 30 seconds

### Physics System

- **Natural Movement**: Leaves bounce off edges with realistic physics
- **Gentle Flow**: Smooth, organic movement patterns
- **Size Variation**: Different leaf sizes for visual variety
- **Rotation**: Leaves spin naturally as they float

### Scoring & Progression

- **Target Leaves**: 100 points each (glowing leaves you must collect)
- **Regular Leaves**: 10 points each (optional collection)
- **Time Bonus**: Extra points for completing levels quickly
- **Difficulty Multiplier**: Higher difficulty = more points

## Community Features

Your individual games contribute to community goals automatically. Everyone works together to unlock seasonal themes and new content. There's a leaderboard if you're competitive, but the main focus is collective progress.

Daily limit of 20 games keeps things from getting too intense.

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app
