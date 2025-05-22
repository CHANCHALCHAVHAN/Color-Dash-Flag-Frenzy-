# Flag Capture Game (Python Version)

A Python implementation of the Flag Capture Game using Pygame.

## Requirements

- Python 3.x
- Pygame library

## Installation

1. Make sure you have Python installed on your system
2. Install Pygame using pip:
   ```
   pip install pygame
   ```
3. Run the game:
   ```
   python flag_game.py
   ```

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

## How to Play

1. Move your mouse to control the player circle
2. Capture all six flags before the timer runs out
3. Avoid obstacles in Level 3 and above
4. Complete all levels to win the game

## Sound Files

The game looks for the following sound files in the same directory:
- `capture.wav` - Played when capturing a flag
- `levelup.wav` - Played when completing a level
- `gameover.wav` - Played when the game ends
- `collision.wav` - Played when colliding with an obstacle

If these files are not found, the game will run without sound effects.

## Code Structure

The game is built using object-oriented programming principles with the following classes:
- `Player` - Handles player movement and rendering
- `Flag` - Manages flag behavior, movement, and animation
- `Obstacle` - Creates obstacles for higher difficulty levels
- `CaptureEffect` - Creates visual effects when capturing flags
- `Game` - Main game class that coordinates all game elements and logic