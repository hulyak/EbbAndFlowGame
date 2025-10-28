# 🍃 Ebb & Flow - Zen Leaf Collection Game 🍃

A relaxing and engaging leaf collection game built for Reddit's Developer Platform using Devvit Web. Inspired by Lumosity-style brain training games, players collect flowing leaves in a peaceful, physics-based environment with touch and cursor controls.

## 🎮 Game Features

### ✨ Polished Experience
- **Stunning Splash Screen**: Beautiful animated intro with floating leaves
- **Responsive Design**: Perfect on desktop, tablet, and mobile devices
- **Smooth Animations**: 60fps physics with natural leaf movement
- **Error Handling**: Graceful error recovery and user feedback

### � **CoGmmunity Garden - Collaborative Features**
- **Shared Goals**: Every leaf collected contributes to community objectives
- **Seasonal Progression**: Unlock new seasons through collective effort
- **Daily & Weekly Challenges**: Time-limited goals that bring players together
- **Community Rewards**: Special animations, leaf types, and decorations
- **Real-time Progress**: See community goals update as players contribute
- **Personal Impact**: Track your individual contribution to shared success

### 🎯 Zen Gameplay Mechanics
- **Physics-Based Movement**: Leaves flow naturally with realistic physics
- **Multi-Touch Support**: Intuitive interaction for all devices
- **Target Collection**: Collect glowing, pulsing target leaves
- **Progressive Difficulty**: Easy, Medium, and Hard modes with unique challenges
- **Dual Purpose**: Personal scoring + community contribution system

### 🎨 Visual & Audio Polish
- **Gradient Backgrounds**: Beautiful emerald-to-teal color schemes
- **Particle Effects**: Celebration animations and click feedback
- **Haptic Feedback**: Vibration on mobile devices when catching leaves
- **Audio Cues**: Pleasant sound effects for successful catches
- **Visual Feedback**: Expanding rings and floating score popups
- **Seasonal Themes**: Visual changes based on community garden progress

### 📊 Engagement Systems
- **Daily Games**: 10 games per day for balanced, sustainable play
- **Smart Scoring**: Points for target leaves (100pts) and regular leaves (10pts)
- **Leaderboards**: Community rankings and recent game activity
- **Personal Stats**: Comprehensive progress tracking and achievements
- **Community Impact**: See how your play helps achieve shared goals

## 🛠 Technical Implementation

Built with:
- **Devvit Web**: Reddit's interactive post platform
- **React 19**: Modern React with hooks for state management
- **TypeScript**: Full type safety across client and server
- **Tailwind CSS**: Responsive, beautiful UI design
- **Redis**: Persistent data storage for puzzle state and user progress
- **Express**: Server-side API handling

## 🎯 Hackathon Categories

This project targets:
- **Community Play**: Massively multiplayer mechanics bringing Redditors together
- **Best Kiro Developer Experience**: Leveraging Kiro for enhanced development workflow

### 🚀 Kiro Integration Showcase

This project demonstrates sophisticated Kiro integration through:
- **Intelligent Automation**: 6 custom hooks for asset management, performance optimization, and testing
- **Context-Aware Guidance**: 8 steering rules providing platform-specific expertise
- **Spec-Driven Development**: EARS-compliant requirements with full traceability
- **Creative Solutions**: Anticipatory automation that transforms developer workflow

**📖 See [KIRO_DEVELOPER_EXPERIENCE.md](./KIRO_DEVELOPER_EXPERIENCE.md) for detailed analysis of how Kiro transformed our development process.**

## 🚀 Getting Started

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

## 🎮 How to Play

### Individual Gameplay:
1. **Launch**: Experience the beautiful splash screen and enter the zen garden
2. **Check Community Goals**: See what the community is working toward together
3. **Choose Difficulty**: Select Easy (5 leaves), Medium (8 leaves), or Hard (12 leaves)
4. **Watch the Flow**: Leaves gently float and bounce with realistic physics
5. **Spot Targets**: Look for glowing, pulsing leaves - these are your collection targets
6. **Tap or Click**: Touch or click on target leaves to collect them (works on all devices)
7. **Get Feedback**: Enjoy visual, audio, and haptic feedback when you catch leaves
8. **Beat the Clock**: Collect all target leaves within 60 seconds to win!

### Community Collaboration:
1. **Every Leaf Counts**: Each leaf you collect contributes to community goals
2. **Daily Challenges**: Work together to collect 500 leaves per day
3. **Weekly Goals**: Help achieve larger objectives like 2,500 leaves per week
4. **Seasonal Progress**: Unlock new seasons (Spring → Summer → Autumn → Winter)
5. **Shared Rewards**: Unlock special animations, leaf types, and decorations
6. **Track Impact**: See your personal contribution to community success

## 🏆 Game Mechanics

### Leaf Types
- **🍁 Maple**: Classic autumn leaves
- **� Oaek**: Sturdy and reliable
- **� Birgch**: Light and delicate
- **🌿 Willow**: Graceful and flowing
- **🌸 Cherry**: Beautiful and rare

### Difficulty Levels
- **Easy**: 5 target leaves, gentle slow flow, 60 seconds
- **Medium**: 8 target leaves, moderate speed, 60 seconds  
- **Hard**: 12 target leaves, fast chaotic flow, 60 seconds

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

## 🤝 Community Aspects

- **Personal Journey**: Individual gameplay with community leaderboards
- **Daily Challenges**: 10 games per day keeps engagement balanced
- **Bite-sized Sessions**: Each game takes 60 seconds
- **Persistent Progress**: Your stats and achievements are saved
- **Social Recognition**: Leaderboard celebrates top collectors
- **Relaxing Competition**: Zen gameplay with friendly competition

## 🎨 Visual Design

- **Calming Colors**: Peaceful blue-green gradients for relaxation
- **Smooth Animation**: 60fps physics simulation for natural movement
- **Glowing Effects**: Target leaves have subtle glow effects
- **Touch-Friendly**: Large, easy-to-tap leaf targets
- **Responsive Canvas**: Adapts to different screen sizes perfectly

## Commands

- `npm run dev`: Starts a development server where you can develop your application live on Reddit.
- `npm run build`: Builds your client and server projects
- `npm run deploy`: Uploads a new version of your app
- `npm run launch`: Publishes your app for review
- `npm run login`: Logs your CLI into Reddit
- `npm run check`: Type checks, lints, and prettifies your app