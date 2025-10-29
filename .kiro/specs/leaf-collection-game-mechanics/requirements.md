# Requirements Document

## Introduction

The Leaf Collection Game Mechanics feature provides the core gameplay experience for Ebb & Flow, a zen-inspired 2D game where players collect flowing leaves in a peaceful, physics-based environment. The system supports multiple difficulty levels, real-time physics simulation, and engaging visual feedback.

## Glossary

- **Game_Engine**: The core system managing game state, physics, and user interactions
- **Leaf_Entity**: Individual leaf objects with physics properties and visual characteristics
- **Target_Leaf**: Special leaves that players must collect to complete levels (glowing/pulsing)
- **Regular_Leaf**: Optional leaves that provide bonus points but are not required for completion
- **Physics_System**: Component handling leaf movement, collision detection, and boundary interactions
- **Difficulty_Level**: Game configuration determining leaf count, speed, and scoring multipliers
- **Game_Session**: Individual gameplay instance with time limits and completion criteria

## Requirements

### Requirement 1

**User Story:** As a player, I want to interact with flowing leaves using touch or mouse input, so that I can collect them in an intuitive and responsive way.

#### Acceptance Criteria

1. WHEN a player clicks or touches a leaf, THE Game_Engine SHALL detect the interaction within 8 units of the leaf center
2. WHEN a leaf is successfully collected, THE Game_Engine SHALL provide immediate visual feedback with expanding circles
3. WHEN a leaf is collected, THE Game_Engine SHALL trigger haptic feedback on mobile devices
4. WHEN a leaf is collected, THE Game_Engine SHALL play audio feedback using Web Audio API
5. WHERE touch input is used, THE Game_Engine SHALL prevent default touch behaviors to avoid scrolling

### Requirement 2

**User Story:** As a player, I want leaves to move naturally with realistic physics, so that the game feels organic and peaceful.

#### Acceptance Criteria

1. WHEN the game starts, THE Physics_System SHALL generate leaves with random positions and velocities
2. WHILE the game is running, THE Physics_System SHALL update leaf positions using velocity and rotation
3. WHEN leaves reach canvas boundaries, THE Physics_System SHALL implement collision detection and bouncing
4. WHEN leaves move, THE Physics_System SHALL apply rotation based on rotationSpeed property
5. WHERE difficulty increases, THE Physics_System SHALL apply speed multipliers to leaf movement

### Requirement 3

**User Story:** As a player, I want different difficulty levels that provide appropriate challenges, so that I can progress and improve my skills.

#### Acceptance Criteria

1. WHEN selecting easy difficulty, THE Game_Engine SHALL create 5 target leaves and 5 regular leaves with 0.3x speed
2. WHEN selecting medium difficulty, THE Game_Engine SHALL create 8 target leaves and 7 regular leaves with 0.8x speed
3. WHEN selecting hard difficulty, THE Game_Engine SHALL create 12 target leaves and 8 regular leaves with 1.5x speed
4. WHEN completing levels, THE Game_Engine SHALL apply difficulty-based time bonus multipliers
5. WHERE difficulty is selected, THE Game_Engine SHALL maintain 60-second time limits across all levels

### Requirement 4

**User Story:** As a player, I want clear visual distinction between target and regular leaves, so that I can focus on the required objectives.

#### Acceptance Criteria

1. WHEN target leaves are rendered, THE Game_Engine SHALL apply glowing effects with golden color (#fbbf24)
2. WHEN target leaves are displayed, THE Game_Engine SHALL implement pulsing animation using sine wave calculations
3. WHEN regular leaves are rendered, THE Game_Engine SHALL use standard colors without special effects
4. WHEN leaves are rendered, THE Game_Engine SHALL display clickable area indicators with subtle circles
5. WHERE leaves are collected, THE Game_Engine SHALL show floating score popups with appropriate colors

### Requirement 5

**User Story:** As a player, I want immediate feedback when I collect leaves, so that I feel engaged and understand my progress.

#### Acceptance Criteria

1. WHEN a target leaf is collected, THE Game_Engine SHALL award 100 points and display golden feedback
2. WHEN a regular leaf is collected, THE Game_Engine SHALL award 10 points and display green feedback
3. WHEN leaves are collected, THE Game_Engine SHALL create expanding circle animations lasting 1 second
4. WHEN score changes occur, THE Game_Engine SHALL display floating score popups that move upward
5. WHERE visual feedback is shown, THE Game_Engine SHALL use opacity transitions for smooth animations
