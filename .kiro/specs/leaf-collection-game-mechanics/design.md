# Design Document

## Overview

The Leaf Collection Game Mechanics system provides a zen-inspired 2D gaming experience built on HTML5 Canvas with React integration. The design emphasizes smooth physics simulation, responsive touch/mouse input, and engaging visual feedback while maintaining 60fps performance across devices.

## Architecture

### Core Components Architecture

```
Game Engine
├── Physics System
│   ├── Leaf Movement Controller
│   ├── Collision Detection
│   └── Boundary Management
├── Input Handler
│   ├── Touch Event Processor
│   ├── Mouse Event Processor
│   └── Haptic Feedback Controller
├── Rendering Engine
│   ├── Canvas Renderer
│   ├── Animation Controller
│   └── Visual Effects System
└── Game State Manager
    ├── Session Controller
    ├── Scoring System
    └── Difficulty Configuration
```

### Data Flow

```
User Input → Input Handler → Game State Manager → Physics System → Rendering Engine → Canvas Display
     ↓
Feedback Systems (Haptic, Audio, Visual)
```

## Components and Interfaces

### 1. Game Engine Core

**Purpose:** Central orchestrator managing game lifecycle and component coordination
**Key Methods:**

- `startGame(difficulty: GameDifficulty): GameSession`
- `collectLeaf(leafId: string): GameResult`
- `updatePhysics(deltaTime: number): void`
- `render(): void`

### 2. Physics System

**Purpose:** Handles realistic leaf movement and collision detection
**Configuration:**

```typescript
interface PhysicsConfig {
  speedMultiplier: number;
  rotationSpeed: number;
  boundaryBounce: boolean;
  gravityEffect: number;
}
```

### 3. Leaf Entity System

**Purpose:** Manages individual leaf properties and behaviors
**Leaf Properties:**

```typescript
interface Leaf {
  id: string;
  type: LeafType; // maple, oak, birch, willow, cherry
  color: LeafColor; // green, yellow, orange, red, brown
  x: number; // 0-100 (percentage of canvas width)
  y: number; // 0-100 (percentage of canvas height)
  vx: number; // velocity x
  vy: number; // velocity y
  rotation: number; // current rotation angle
  rotationSpeed: number; // rotation velocity
  size: number; // 1.2-1.8 scale multiplier
  isTarget: boolean; // determines if leaf is required for completion
  isCollected: boolean; // collection state
  points: number; // 100 for target, 10 for regular
}
```

### 4. Input Processing System

**Purpose:** Unified handling of touch and mouse interactions
**Event Processing:**

```typescript
interface InputEvent {
  x: number; // canvas-relative x coordinate
  y: number; // canvas-relative y coordinate
  type: 'touch' | 'mouse';
  timestamp: number;
}
```

### 5. Visual Effects System

**Purpose:** Manages animations, feedback, and visual enhancements
**Effect Types:**

- Click feedback (expanding circles)
- Score popups (floating numbers)
- Leaf glow effects (target leaves)
- Particle systems (celebration)

## Data Models

### Game Session Model

```typescript
interface GameSession {
  id: string;
  username: string;
  difficulty: GameDifficulty;
  level: number;
  score: number;
  lives: number;
  timeRemaining: number;
  targetLeaves: number;
  collectedLeaves: number;
  leaves: Leaf[];
  status: 'playing' | 'completed' | 'failed';
  startTime: number;
  endTime?: number;
}
```

### Difficulty Configuration

```typescript
interface DifficultyConfig {
  easy: {
    targetLeaves: 5;
    totalLeaves: 10;
    leafSpeed: 0.3;
    timeBonus: 1.0;
  };
  medium: {
    targetLeaves: 8;
    totalLeaves: 15;
    leafSpeed: 0.8;
    timeBonus: 1.5;
  };
  hard: {
    targetLeaves: 12;
    totalLeaves: 20;
    leafSpeed: 1.5;
    timeBonus: 2.0;
  };
}
```

### Visual Feedback Models

```typescript
interface ClickFeedback {
  id: string;
  x: number;
  y: number;
  isTarget: boolean;
  timestamp: number;
}

interface ScorePopup {
  id: string;
  x: number;
  y: number;
  points: number;
  timestamp: number;
}
```

## Error Handling

### Input Validation

- Validate canvas coordinates are within bounds
- Ensure leaf IDs exist before collection attempts
- Verify game session is active before processing interactions

### Performance Safeguards

- Limit animation frame rate to 60fps
- Implement object pooling for frequently created/destroyed objects
- Use requestAnimationFrame for smooth animations
- Cleanup event listeners and timers on component unmount

### Cross-Platform Compatibility

- Fallback for Web Audio API failures
- Graceful degradation when haptic feedback is unavailable
- Touch event normalization across different devices

## Testing Strategy

### Unit Testing Focus

- Physics calculations (movement, collision detection)
- Scoring logic (point calculation, time bonuses)
- Input coordinate transformation
- Leaf generation algorithms

### Integration Testing

- Canvas rendering performance
- Touch/mouse event handling
- Animation smoothness
- Memory usage during extended play

### Performance Testing

- 60fps maintenance across devices
- Memory leak detection
- Battery usage optimization
- Network efficiency (minimal server calls during gameplay)

## Implementation Considerations

### Canvas Optimization

- Use efficient drawing operations
- Implement viewport culling for off-screen objects
- Minimize canvas state changes
- Batch similar drawing operations

### Mobile Performance

- Optimize touch event handling
- Implement efficient collision detection
- Use CSS transforms for hardware acceleration
- Consider device pixel ratio for crisp rendering

### Accessibility

- Ensure adequate color contrast for leaf visibility
- Provide alternative input methods
- Support screen readers with appropriate ARIA labels
- Implement keyboard navigation fallbacks
