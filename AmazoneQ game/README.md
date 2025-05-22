# Flag Capture Game

An interactive flag capture game where players move around to collect flags and earn points.

## Game Features

### Core Mechanics
- Six flags of different colors placed randomly across the screen
- Each flag looks like a triangular banner on a brown stick (flagpole)
- A movable circle (player) can capture flags by moving over them
- Each captured flag gives 50 points
- Game ends when all six flags are captured or time runs out

### Levels
1. **Level 1: Easy** — 6 stationary flags
2. **Level 2: Medium** — Flags move slowly around the screen
3. **Level 3: Hard** — Includes obstacles, faster flags, and penalties
4. **Level 4: Expert** — More obstacles and faster flags
5. **Level 5: Master** — Even more challenging with faster movement
6. **Level 6: Champion** — Increased difficulty with more obstacles
7. **Level 7: Legend** — Faster flags and more obstacles
8. **Level 8: Mythic** — Very challenging speed and obstacle count
9. **Level 9: Godlike** — Extremely fast flags and many obstacles
10. **Level 10: Impossible** — The ultimate challenge with maximum difficulty

The game continues beyond level 10 with increasing difficulty for endless gameplay!

### Enhancements
- **Flag Animation**: Flags wave gently to attract attention
- **Restart Option**: "Play Again" button after game over
- **Countdown Timer**: 60 seconds for each level
- **Score + Timer UI**: Clean display at the bottom
- **Flag Capture Effect**: Sparkle animation when a flag is captured
- **Obstacle Collision**: Touching walls in Level 3+ deducts points and time
- **Sound Effects**: For flag capture, game over, and level changes
- **Responsive Design**: Works on both PC and mobile screens

## How to Play

1. Move your mouse or finger (on touch devices) to control the player circle
2. Capture all six flags before the timer runs out
3. Avoid obstacles in Level 3
4. Complete all three levels to win the game

## Technical Implementation

The game is built using HTML, CSS, and JavaScript with the following structure:

- **HTML**: Basic structure with game container, player, and UI elements
- **CSS**: Styling for game elements, animations, and responsive design
- **JavaScript**: Game logic including player movement, collision detection, and scoring

## Educational Value

This game demonstrates several programming concepts:
- Object-oriented design
- Game loop implementation
- Collision detection
- Animation using CSS and JavaScript
- Event handling for mouse and touch input
- Responsive design principles

## Getting Started

Simply open `flag-game.html` in a web browser to start playing!