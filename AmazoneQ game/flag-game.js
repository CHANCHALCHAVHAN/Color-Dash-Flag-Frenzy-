/**
 * Flag Capture Game
 * An interactive game where players capture flags for points
 * Features multiple levels, animations, and obstacles
 */

// Game configuration
const GAME_CONFIG = {
    // Core game settings
    flagsPerLevel: 6,
    pointsPerFlag: 50,
    gameDuration: 60, // seconds
    
    // Player settings
    playerSize: 30,
    playerSpeed: 5,
    
    // Flag settings
    flagColors: ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6', '#1abc9c'],
    
    // Level settings
    levels: [
        { name: "Easy", flagSpeed: 0, obstacles: 0 },
        { name: "Medium", flagSpeed: 1, obstacles: 0 },
        { name: "Hard", flagSpeed: 2, obstacles: 5 },
        { name: "Expert", flagSpeed: 3, obstacles: 7 },
        { name: "Master", flagSpeed: 3.5, obstacles: 8 },
        { name: "Champion", flagSpeed: 4, obstacles: 9 },
        { name: "Legend", flagSpeed: 4.5, obstacles: 10 },
        { name: "Mythic", flagSpeed: 5, obstacles: 12 },
        { name: "Godlike", flagSpeed: 5.5, obstacles: 15 },
        { name: "Impossible", flagSpeed: 6, obstacles: 20 }
    ],
    
    // Penalties
    timePenalty: 5, // seconds
    scorePenalty: 10 // points
};

// Game state
let gameState = {
    score: 0,
    timeRemaining: GAME_CONFIG.gameDuration,
    level: 1,
    flagsCaptured: 0,
    isGameActive: false,
    timerInterval: null,
    flags: [],
    obstacles: [],
    playerPosition: { x: 0, y: 0 },
    mousePosition: { x: 0, y: 0 },
    isPlayerMoving: false
};

// DOM Elements
const gameArea = document.getElementById('gameArea');
const player = document.getElementById('player');
const scoreElement = document.getElementById('score');
const timerElement = document.getElementById('timer');
const currentLevelElement = document.getElementById('currentLevel');
const gameOverElement = document.getElementById('gameOver');
const levelCompleteElement = document.getElementById('levelComplete');
const finalScoreElement = document.getElementById('finalScore');
const nextLevelElement = document.getElementById('nextLevel');
const restartButton = document.getElementById('restartButton');

// Sound elements
const captureSound = document.getElementById('captureSound');
const levelUpSound = document.getElementById('levelUpSound');
const gameOverSound = document.getElementById('gameOverSound');
const collisionSound = document.getElementById('collisionSound');

/**
 * Initialize the game
 * Sets up the initial game state and starts the first level
 */
function initGame() {
    // Reset game state
    gameState.score = 0;
    gameState.timeRemaining = GAME_CONFIG.gameDuration;
    gameState.level = 1;
    gameState.flagsCaptured = 0;
    gameState.isGameActive = true;
    gameState.flags = [];
    gameState.obstacles = [];
    
    // Update UI
    scoreElement.textContent = gameState.score;
    timerElement.textContent = gameState.timeRemaining;
    currentLevelElement.textContent = gameState.level;
    
    // Hide game over and level complete screens
    gameOverElement.style.display = 'none';
    levelCompleteElement.style.display = 'none';
    
    // Position player in the center of the game area
    const gameAreaRect = gameArea.getBoundingClientRect();
    gameState.playerPosition = {
        x: gameAreaRect.width / 2 - GAME_CONFIG.playerSize / 2,
        y: gameAreaRect.height / 2 - GAME_CONFIG.playerSize / 2
    };
    updatePlayerPosition();
    
    // Clear game area of flags and obstacles
    clearGameElements();
    
    // Generate flags for the first level
    generateFlags();
    
    // Generate obstacles if needed for the level
    if (GAME_CONFIG.levels[gameState.level - 1].obstacles > 0) {
        generateObstacles();
    }
    
    // Start the timer
    startTimer();
    
    // Start the game loop
    requestAnimationFrame(gameLoop);
}

/**
 * Start the game timer
 * Counts down from the configured game duration
 */
function startTimer() {
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
    }
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeRemaining--;
        timerElement.textContent = gameState.timeRemaining;
        
        if (gameState.timeRemaining <= 0) {
            endGame();
        }
    }, 1000);
}

/**
 * End the game
 * Shows the game over screen and stops all game processes
 */
function endGame() {
    gameState.isGameActive = false;
    clearInterval(gameState.timerInterval);
    
    // Play game over sound
    gameOverSound.play();
    
    // Show game over screen with level reached
    finalScoreElement.textContent = `${gameState.score} (Level ${gameState.level})`;
    gameOverElement.style.display = 'flex';
}

/**
 * Complete the current level
 * Shows the level complete screen and prepares for the next level
 */
function completeLevel() {
    clearInterval(gameState.timerInterval);
    
    // Play level up sound
    levelUpSound.play();
    
    // Show level complete screen
    nextLevelElement.textContent = gameState.level + 1;
    levelCompleteElement.style.display = 'flex';
    
    // Wait 2 seconds before starting the next level
    setTimeout(() => {
        gameState.level++;
        
        // If we've completed all levels, show a victory message but continue playing
        // This allows players to go beyond level 10 with increasing difficulty
        if (gameState.level > GAME_CONFIG.levels.length) {
            // We'll still continue the game with the highest difficulty settings
            // Just update the UI to show the current level
            currentLevelElement.textContent = gameState.level;
        } else {
            // Update level indicator
            currentLevelElement.textContent = gameState.level;
        }
        
        // Reset for next level
        gameState.timeRemaining = GAME_CONFIG.gameDuration;
        gameState.flagsCaptured = 0;
        timerElement.textContent = gameState.timeRemaining;
        
        // Hide level complete screen
        levelCompleteElement.style.display = 'none';
        
        // Clear game elements
        clearGameElements();
        
        // Generate new flags and obstacles for the level
        generateFlags();
        
        // Generate obstacles for level 3 and above
        if (gameState.level >= 3) {
            generateObstacles();
        }
        
        // Restart the timer
        startTimer();
    }, 2000);
}

/**
 * Clear all game elements
 * Removes all flags and obstacles from the game area
 */
function clearGameElements() {
    // Remove all flags
    const flagElements = document.querySelectorAll('.flag');
    flagElements.forEach(flag => flag.remove());
    gameState.flags = [];
    
    // Remove all obstacles
    const obstacleElements = document.querySelectorAll('.obstacle');
    obstacleElements.forEach(obstacle => obstacle.remove());
    gameState.obstacles = [];
}

/**
 * Generate flags for the current level
 * Creates flag elements and positions them randomly in the game area
 */
function generateFlags() {
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    for (let i = 0; i < GAME_CONFIG.flagsPerLevel; i++) {
        // Create flag container
        const flag = document.createElement('div');
        flag.className = 'flag';
        
        // Create flag pole
        const pole = document.createElement('div');
        pole.className = 'flag-pole';
        flag.appendChild(pole);
        
        // Create flag banner
        const banner = document.createElement('div');
        banner.className = 'flag-banner wave-animation';
        banner.style.backgroundColor = GAME_CONFIG.flagColors[i % GAME_CONFIG.flagColors.length];
        flag.appendChild(banner);
        
        // Set random position
        const flagWidth = 40;
        const flagHeight = 60;
        const maxX = gameAreaRect.width - flagWidth;
        const maxY = gameAreaRect.height - flagHeight;
        
        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);
        
        flag.style.left = `${x}px`;
        flag.style.top = `${y}px`;
        
        // Add to game area
        gameArea.appendChild(flag);
        
        // Store flag data
        gameState.flags.push({
            element: flag,
            x: x,
            y: y,
            width: flagWidth,
            height: flagHeight,
            speedX: Math.random() * 2 - 1,
            speedY: Math.random() * 2 - 1
        });
    }
}

/**
 * Generate obstacles for the current level
 * Creates obstacle elements and positions them randomly in the game area
 */
function generateObstacles() {
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    // Get current level settings, with fallback for levels beyond defined ones
    const levelIndex = Math.min(gameState.level - 1, GAME_CONFIG.levels.length - 1);
    const obstacleCount = GAME_CONFIG.levels[levelIndex].obstacles;
    
    for (let i = 0; i < obstacleCount; i++) {
        // Create obstacle element
        const obstacle = document.createElement('div');
        obstacle.className = 'obstacle';
        
        // Random size (smaller obstacles in higher levels for increased difficulty)
        const sizeModifier = Math.max(0.5, 1 - (gameState.level * 0.05)); // Obstacles get smaller in higher levels
        const width = Math.floor((Math.random() * 100) + 50) * sizeModifier;
        const height = Math.floor((Math.random() * 100) + 50) * sizeModifier;
        
        // Random position
        const maxX = gameAreaRect.width - width;
        const maxY = gameAreaRect.height - height;
        
        const x = Math.floor(Math.random() * maxX);
        const y = Math.floor(Math.random() * maxY);
        
        obstacle.style.width = `${width}px`;
        obstacle.style.height = `${height}px`;
        obstacle.style.left = `${x}px`;
        obstacle.style.top = `${y}px`;
        
        // Add to game area
        gameArea.appendChild(obstacle);
        
        // Store obstacle data
        gameState.obstacles.push({
            element: obstacle,
            x: x,
            y: y,
            width: width,
            height: height
        });
    }
}

/**
 * Update player position based on mouse movement
 * Moves the player towards the mouse position
 */
function updatePlayerPosition() {
    player.style.left = `${gameState.playerPosition.x}px`;
    player.style.top = `${gameState.playerPosition.y}px`;
}

/**
 * Create capture effect animation
 * Displays a visual effect when a flag is captured
 */
function createCaptureEffect(x, y) {
    const effectElement = document.createElement('div');
    effectElement.className = 'capture-effect';
    
    effectElement.style.left = `${x}px`;
    effectElement.style.top = `${y}px`;
    
    gameArea.appendChild(effectElement);
    
    // Remove the effect after animation completes
    setTimeout(() => {
        effectElement.remove();
    }, 600);
}

/**
 * Check for collisions between player and flags
 * Handles flag capture logic
 */
function checkFlagCollisions() {
    const playerRect = {
        x: gameState.playerPosition.x,
        y: gameState.playerPosition.y,
        width: GAME_CONFIG.playerSize,
        height: GAME_CONFIG.playerSize
    };
    
    for (let i = gameState.flags.length - 1; i >= 0; i--) {
        const flag = gameState.flags[i];
        
        // Check for collision
        if (
            playerRect.x < flag.x + flag.width &&
            playerRect.x + playerRect.width > flag.x &&
            playerRect.y < flag.y + flag.height &&
            playerRect.y + playerRect.height > flag.y
        ) {
            // Capture the flag
            captureFlag(i);
        }
    }
}

/**
 * Check for collisions between player and obstacles
 * Applies penalties when player hits obstacles
 */
function checkObstacleCollisions() {
    const playerRect = {
        x: gameState.playerPosition.x,
        y: gameState.playerPosition.y,
        width: GAME_CONFIG.playerSize,
        height: GAME_CONFIG.playerSize
    };
    
    for (const obstacle of gameState.obstacles) {
        // Check for collision
        if (
            playerRect.x < obstacle.x + obstacle.width &&
            playerRect.x + playerRect.width > obstacle.x &&
            playerRect.y < obstacle.y + obstacle.height &&
            playerRect.y + playerRect.height > obstacle.y
        ) {
            // Apply penalty
            applyObstaclePenalty();
            break;
        }
    }
}

/**
 * Apply penalty when player hits an obstacle
 * Reduces score and time
 */
function applyObstaclePenalty() {
    // Play collision sound
    collisionSound.play();
    
    // Calculate penalties based on level (higher penalties in higher levels)
    const levelIndex = Math.min(gameState.level - 1, GAME_CONFIG.levels.length - 1);
    const levelMultiplier = 1 + (levelIndex * 0.1); // 10% increase per level
    
    const scorePenalty = Math.round(GAME_CONFIG.scorePenalty * levelMultiplier);
    const timePenalty = Math.round(GAME_CONFIG.timePenalty * levelMultiplier);
    
    // Reduce score
    gameState.score = Math.max(0, gameState.score - scorePenalty);
    scoreElement.textContent = gameState.score;
    
    // Reduce time
    gameState.timeRemaining = Math.max(1, gameState.timeRemaining - timePenalty);
    timerElement.textContent = gameState.timeRemaining;
    
    // Visual feedback
    player.style.backgroundColor = '#e74c3c';
    setTimeout(() => {
        player.style.backgroundColor = '#3498db';
    }, 300);
}

/**
 * Capture a flag
 * Removes the flag, updates score, and checks for level completion
 */
function captureFlag(flagIndex) {
    const flag = gameState.flags[flagIndex];
    
    // Play capture sound
    captureSound.play();
    
    // Create capture effect
    createCaptureEffect(flag.x + flag.width / 2, flag.y + flag.height / 2);
    
    // Remove flag element
    flag.element.remove();
    
    // Remove flag from array
    gameState.flags.splice(flagIndex, 1);
    
    // Update score
    gameState.score += GAME_CONFIG.pointsPerFlag;
    scoreElement.textContent = gameState.score;
    
    // Update flags captured
    gameState.flagsCaptured++;
    
    // Check if all flags are captured
    if (gameState.flagsCaptured >= GAME_CONFIG.flagsPerLevel) {
        completeLevel();
    }
}

/**
 * Move flags based on current level
 * Flags move faster in higher levels
 */
function moveFlags() {
    // Get current level settings, with fallback for levels beyond defined ones
    const levelIndex = Math.min(gameState.level - 1, GAME_CONFIG.levels.length - 1);
    const flagSpeed = GAME_CONFIG.levels[levelIndex].flagSpeed;
    
    if (flagSpeed === 0) return; // No movement in level 1
    
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    for (const flag of gameState.flags) {
        // Update position
        flag.x += flag.speedX * flagSpeed;
        flag.y += flag.speedY * flagSpeed;
        
        // Bounce off walls
        if (flag.x <= 0 || flag.x + flag.width >= gameAreaRect.width) {
            flag.speedX *= -1;
        }
        
        if (flag.y <= 0 || flag.y + flag.height >= gameAreaRect.height) {
            flag.speedY *= -1;
        }
        
        // Update element position
        flag.element.style.left = `${flag.x}px`;
        flag.element.style.top = `${flag.y}px`;
    }
}

/**
 * Main game loop
 * Handles player movement, collisions, and flag movement
 */
function gameLoop() {
    if (!gameState.isGameActive) return;
    
    // Move player towards mouse position if moving
    if (gameState.isPlayerMoving) {
        const dx = gameState.mousePosition.x - gameState.playerPosition.x - GAME_CONFIG.playerSize / 2;
        const dy = gameState.mousePosition.y - gameState.playerPosition.y - GAME_CONFIG.playerSize / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 5) {
            gameState.playerPosition.x += (dx / distance) * GAME_CONFIG.playerSpeed;
            gameState.playerPosition.y += (dy / distance) * GAME_CONFIG.playerSpeed;
            updatePlayerPosition();
        }
    }
    
    // Check for collisions
    checkFlagCollisions();
    
    // Check for obstacle collisions in level 3 and above
    if (gameState.level >= 3) {
        checkObstacleCollisions();
    }
    
    // Move flags based on level
    moveFlags();
    
    // Continue the game loop
    requestAnimationFrame(gameLoop);
}

// Event listeners
restartButton.addEventListener('click', initGame);

// Mouse movement to control player
gameArea.addEventListener('mousemove', (e) => {
    const gameAreaRect = gameArea.getBoundingClientRect();
    gameState.mousePosition = {
        x: e.clientX - gameAreaRect.left,
        y: e.clientY - gameAreaRect.top
    };
    gameState.isPlayerMoving = true;
});

// Touch movement for mobile
gameArea.addEventListener('touchmove', (e) => {
    e.preventDefault();
    const gameAreaRect = gameArea.getBoundingClientRect();
    const touch = e.touches[0];
    gameState.mousePosition = {
        x: touch.clientX - gameAreaRect.left,
        y: touch.clientY - gameAreaRect.top
    };
    gameState.isPlayerMoving = true;
});

// Stop player movement when mouse leaves game area
gameArea.addEventListener('mouseleave', () => {
    gameState.isPlayerMoving = false;
});

// Handle window resize
window.addEventListener('resize', () => {
    if (!gameState.isGameActive) return;
    
    // Reposition flags and obstacles to ensure they're within bounds
    const gameAreaRect = gameArea.getBoundingClientRect();
    
    for (const flag of gameState.flags) {
        // Keep flags within bounds
        flag.x = Math.min(flag.x, gameAreaRect.width - flag.width);
        flag.y = Math.min(flag.y, gameAreaRect.height - flag.height);
        
        // Update element position
        flag.element.style.left = `${flag.x}px`;
        flag.element.style.top = `${flag.y}px`;
    }
    
    for (const obstacle of gameState.obstacles) {
        // Keep obstacles within bounds
        obstacle.x = Math.min(obstacle.x, gameAreaRect.width - obstacle.width);
        obstacle.y = Math.min(obstacle.y, gameAreaRect.height - obstacle.height);
        
        // Update element position
        obstacle.element.style.left = `${obstacle.x}px`;
        obstacle.element.style.top = `${obstacle.y}px`;
    }
});

// Start the game when the page loads
window.addEventListener('load', initGame);