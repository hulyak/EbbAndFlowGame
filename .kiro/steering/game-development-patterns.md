---
inclusion: fileMatch
fileMatchPattern: 'src/client/**/*'
---

# Game Development Patterns for Reddit Devvit

## Canvas-Based Game Architecture

When developing 2D games for Devvit, follow these patterns:

### Game Loop Structure

```typescript
class GameEngine {
  private animationId: number | null = null;
  private lastTime = 0;

  start() {
    this.gameLoop(0);
  }

  private gameLoop = (currentTime: number) => {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame(this.gameLoop);
  };
}
```

### Physics Integration

- Use consistent time-based movement: `position += velocity * deltaTime`
- Implement boundary collision detection for canvas edges
- Consider using simple physics libraries like Matter.js for complex interactions

### Performance Optimization

- Limit particle systems to <100 active particles
- Use object pooling for frequently created/destroyed objects
- Implement viewport culling for off-screen objects
- Target 60fps with graceful degradation

## Touch and Mouse Input Handling

### Universal Input Pattern

```typescript
const handlePointerEvent = (event: PointerEvent) => {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const y = event.clientY - rect.top;

  // Handle both touch and mouse
  processInput(x, y);
};

canvas.addEventListener('pointerdown', handlePointerEvent);
```

### Mobile Considerations

- Ensure touch targets are at least 44px for accessibility
- Implement haptic feedback with `navigator.vibrate()`
- Consider device orientation changes
- Test on various screen sizes and pixel densities

## State Management for Games

### Game State Pattern

```typescript
enum GameState {
  MENU = 'menu',
  PLAYING = 'playing',
  PAUSED = 'paused',
  GAME_OVER = 'game_over',
}

class GameStateManager {
  private currentState: GameState = GameState.MENU;

  setState(newState: GameState) {
    this.onStateExit(this.currentState);
    this.currentState = newState;
    this.onStateEnter(newState);
  }
}
```

### Data Persistence

- Use Devvit's Redis integration for persistent game data
- Implement local storage fallback for client-side preferences
- Consider data synchronization patterns for multiplayer features

## Visual Design Guidelines

### Color Schemes

- Use high contrast ratios for accessibility (4.5:1 minimum)
- Implement consistent color palettes across game elements
- Consider colorblind-friendly palettes

### Animation Principles

- Use easing functions for smooth transitions
- Implement anticipation and follow-through for natural movement
- Provide visual feedback for all user interactions

### UI/UX Patterns

- Keep game controls simple and discoverable
- Provide clear visual hierarchy
- Implement loading states and error handling
- Use consistent iconography and typography
