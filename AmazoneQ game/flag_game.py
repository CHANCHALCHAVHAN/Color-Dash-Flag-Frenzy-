import pygame
import random
import math
import sys

# Initialize pygame
pygame.init()
pygame.mixer.init()

# Game configuration
GAME_CONFIG = {
    # Core game settings
    "flags_per_level": 6,
    "points_per_flag": 50,
    "game_duration": 60,  # seconds
    
    # Player settings
    "player_size": 30,
    "player_speed": 5,
    
    # Flag settings
    "flag_colors": [(231, 76, 60), (52, 152, 219), (46, 204, 113), 
                   (243, 156, 18), (155, 89, 182), (26, 188, 156)],
    
    # Level settings
    "levels": [
        {"name": "Easy", "flag_speed": 0, "obstacles": 0},
        {"name": "Medium", "flag_speed": 1, "obstacles": 0},
        {"name": "Hard", "flag_speed": 2, "obstacles": 5},
        {"name": "Expert", "flag_speed": 3, "obstacles": 7},
        {"name": "Master", "flag_speed": 3.5, "obstacles": 8},
        {"name": "Champion", "flag_speed": 4, "obstacles": 9},
        {"name": "Legend", "flag_speed": 4.5, "obstacles": 10},
        {"name": "Mythic", "flag_speed": 5, "obstacles": 12},
        {"name": "Godlike", "flag_speed": 5.5, "obstacles": 15},
        {"name": "Impossible", "flag_speed": 6, "obstacles": 20}
    ],
    
    # Penalties
    "time_penalty": 5,  # seconds
    "score_penalty": 10  # points
}

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
BLUE = (52, 152, 219)
RED = (231, 76, 60)
GREEN = (46, 204, 113)
GRAY = (127, 140, 141)
DARK_BLUE = (44, 62, 80)
ORANGE = (243, 156, 18)
BROWN = (139, 69, 19)

# Screen dimensions
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
HEADER_HEIGHT = 60
FOOTER_HEIGHT = 60
GAME_AREA_HEIGHT = SCREEN_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT

# Load sounds
try:
    capture_sound = pygame.mixer.Sound("capture.wav")
    level_up_sound = pygame.mixer.Sound("levelup.wav")
    game_over_sound = pygame.mixer.Sound("gameover.wav")
    collision_sound = pygame.mixer.Sound("collision.wav")
except:
    # Create silent sounds if files not found
    capture_sound = pygame.mixer.Sound(buffer=bytearray([]))
    level_up_sound = pygame.mixer.Sound(buffer=bytearray([]))
    game_over_sound = pygame.mixer.Sound(buffer=bytearray([]))
    collision_sound = pygame.mixer.Sound(buffer=bytearray([]))

# Set up the display
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("Flag Capture Game")
clock = pygame.time.Clock()

# Font setup
font_large = pygame.font.SysFont("Arial", 48)
font_medium = pygame.font.SysFont("Arial", 32)
font_small = pygame.font.SysFont("Arial", 24)

class Player:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.size = GAME_CONFIG["player_size"]
        self.speed = GAME_CONFIG["player_speed"]
        self.color = BLUE
        self.rect = pygame.Rect(x, y, self.size, self.size)
    
    def update(self, target_x, target_y):
        # Move towards target position
        dx = target_x - self.x - self.size / 2
        dy = target_y - self.y - self.size / 2
        distance = math.sqrt(dx * dx + dy * dy)
        
        if distance > 5:
            self.x += (dx / distance) * self.speed
            self.y += (dy / distance) * self.speed
        
        # Update rectangle position
        self.rect.x = self.x
        self.rect.y = self.y
    
    def draw(self, surface):
        pygame.draw.circle(surface, self.color, 
                          (int(self.x + self.size / 2), int(self.y + self.size / 2)), 
                          int(self.size / 2))

class Flag:
    def __init__(self, x, y, color):
        self.x = x
        self.y = y
        self.width = 40
        self.height = 60
        self.color = color
        self.speed_x = random.uniform(-1, 1)
        self.speed_y = random.uniform(-1, 1)
        self.rect = pygame.Rect(x, y, self.width, self.height)
        self.wave_angle = 0
    
    def update(self, flag_speed):
        if flag_speed > 0:
            # Move flag
            self.x += self.speed_x * flag_speed
            self.y += self.speed_y * flag_speed
            
            # Bounce off walls
            if self.x <= 0 or self.x + self.width >= SCREEN_WIDTH:
                self.speed_x *= -1
            
            if self.y <= HEADER_HEIGHT or self.y + self.height >= SCREEN_HEIGHT - FOOTER_HEIGHT:
                self.speed_y *= -1
        
        # Update wave animation
        self.wave_angle = (self.wave_angle + 2) % 360
        
        # Update rectangle position
        self.rect.x = self.x
        self.rect.y = self.y
    
    def draw(self, surface):
        # Draw pole
        pole_rect = pygame.Rect(self.x, self.y, 4, self.height)
        pygame.draw.rect(surface, BROWN, pole_rect)
        
        # Draw banner with wave effect
        wave_offset = math.sin(math.radians(self.wave_angle)) * 5
        
        # Create polygon points for triangular banner
        points = [
            (self.x + 4, self.y + 5),
            (self.x + 34, self.y + 5 + wave_offset),
            (self.x + 34, self.y + 25 + wave_offset),
            (self.x + 4, self.y + 15)
        ]
        
        pygame.draw.polygon(surface, self.color, points)

class Obstacle:
    def __init__(self, x, y, width, height):
        self.x = x
        self.y = y
        self.width = width
        self.height = height
        self.rect = pygame.Rect(x, y, width, height)
    
    def draw(self, surface):
        pygame.draw.rect(surface, GRAY, self.rect)

class CaptureEffect:
    def __init__(self, x, y):
        self.x = x
        self.y = y
        self.radius = 0
        self.max_radius = 50
        self.alpha = 255
    
    def update(self):
        self.radius += 3
        self.alpha -= 10
        return self.alpha > 0
    
    def draw(self, surface):
        if self.alpha > 0:
            s = pygame.Surface((self.radius * 2, self.radius * 2), pygame.SRCALPHA)
            pygame.draw.circle(s, (255, 255, 255, self.alpha), (self.radius, self.radius), self.radius)
            surface.blit(s, (self.x - self.radius, self.y - self.radius))

class Game:
    def __init__(self):
        self.reset()
    
    def reset(self):
        self.score = 0
        self.time_remaining = GAME_CONFIG["game_duration"]
        self.level = 1
        self.flags_captured = 0
        self.is_game_active = True
        self.game_over = False
        self.level_complete = False
        self.flags = []
        self.obstacles = []
        self.effects = []
        
        # Create player in center of game area
        self.player = Player(
            SCREEN_WIDTH / 2 - GAME_CONFIG["player_size"] / 2,
            HEADER_HEIGHT + GAME_AREA_HEIGHT / 2 - GAME_CONFIG["player_size"] / 2
        )
        
        # Generate flags
        self.generate_flags()
        
        # Start timer
        self.last_second = pygame.time.get_ticks()
    
    def generate_flags(self):
        self.flags = []
        for i in range(GAME_CONFIG["flags_per_level"]):
            # Random position within game area
            x = random.randint(0, SCREEN_WIDTH - 40)
            y = random.randint(HEADER_HEIGHT, SCREEN_HEIGHT - FOOTER_HEIGHT - 60)
            
            # Create flag with random color
            color = GAME_CONFIG["flag_colors"][i % len(GAME_CONFIG["flag_colors"])]
            self.flags.append(Flag(x, y, color))
    
    def generate_obstacles(self):
        self.obstacles = []
        
        # Get current level settings with fallback
        level_index = min(self.level - 1, len(GAME_CONFIG["levels"]) - 1)
        obstacle_count = GAME_CONFIG["levels"][level_index]["obstacles"]
        
        for i in range(obstacle_count):
            # Random size (smaller in higher levels)
            size_modifier = max(0.5, 1 - (self.level * 0.05))
            width = int((random.randint(50, 150)) * size_modifier)
            height = int((random.randint(50, 150)) * size_modifier)
            
            # Random position
            x = random.randint(0, SCREEN_WIDTH - width)
            y = random.randint(HEADER_HEIGHT, SCREEN_HEIGHT - FOOTER_HEIGHT - height)
            
            self.obstacles.append(Obstacle(x, y, width, height))
    
    def update(self, mouse_pos):
        # Update timer
        current_time = pygame.time.get_ticks()
        if current_time - self.last_second >= 1000:
            self.time_remaining -= 1
            self.last_second = current_time
            
            if self.time_remaining <= 0:
                self.end_game()
        
        # Update player
        if self.is_game_active and not self.game_over and not self.level_complete:
            self.player.update(mouse_pos[0], mouse_pos[1])
            
            # Check for flag collisions
            self.check_flag_collisions()
            
            # Check for obstacle collisions in level 3+
            if self.level >= 3:
                self.check_obstacle_collisions()
            
            # Update flags
            level_index = min(self.level - 1, len(GAME_CONFIG["levels"]) - 1)
            flag_speed = GAME_CONFIG["levels"][level_index]["flag_speed"]
            
            for flag in self.flags:
                flag.update(flag_speed)
        
        # Update effects
        self.effects = [effect for effect in self.effects if effect.update()]
    
    def check_flag_collisions(self):
        for i, flag in enumerate(self.flags[:]):
            if self.player.rect.colliderect(flag.rect):
                self.capture_flag(i)
    
    def check_obstacle_collisions(self):
        for obstacle in self.obstacles:
            if self.player.rect.colliderect(obstacle.rect):
                self.apply_obstacle_penalty()
                break
    
    def capture_flag(self, index):
        # Play sound
        capture_sound.play()
        
        # Create effect
        flag = self.flags[index]
        self.effects.append(CaptureEffect(flag.x + flag.width / 2, flag.y + flag.height / 2))
        
        # Remove flag
        self.flags.pop(index)
        
        # Update score
        self.score += GAME_CONFIG["points_per_flag"]
        
        # Update flags captured
        self.flags_captured += 1
        
        # Check if all flags are captured
        if self.flags_captured >= GAME_CONFIG["flags_per_level"]:
            self.complete_level()
    
    def apply_obstacle_penalty(self):
        # Play sound
        collision_sound.play()
        
        # Calculate penalties based on level
        level_index = min(self.level - 1, len(GAME_CONFIG["levels"]) - 1)
        level_multiplier = 1 + (level_index * 0.1)  # 10% increase per level
        
        score_penalty = round(GAME_CONFIG["score_penalty"] * level_multiplier)
        time_penalty = round(GAME_CONFIG["time_penalty"] * level_multiplier)
        
        # Apply penalties
        self.score = max(0, self.score - score_penalty)
        self.time_remaining = max(1, self.time_remaining - time_penalty)
        
        # Visual feedback
        self.player.color = RED
        pygame.time.set_timer(pygame.USEREVENT, 300)  # Reset color after 300ms
    
    def complete_level(self):
        # Play sound
        level_up_sound.play()
        
        # Show level complete screen
        self.level_complete = True
        self.level += 1
        
        # Set timer to start next level
        pygame.time.set_timer(pygame.USEREVENT + 1, 2000)  # 2 seconds
    
    def start_next_level(self):
        # Reset for next level
        self.level_complete = False
        self.time_remaining = GAME_CONFIG["game_duration"]
        self.flags_captured = 0
        
        # Generate new flags and obstacles
        self.generate_flags()
        
        if self.level >= 3:
            self.generate_obstacles()
    
    def end_game(self):
        # Play sound
        game_over_sound.play()
        
        # Show game over screen
        self.is_game_active = False
        self.game_over = True
    
    def draw(self, surface):
        # Clear screen
        surface.fill(WHITE)
        
        # Draw game area background
        game_area = pygame.Rect(0, HEADER_HEIGHT, SCREEN_WIDTH, GAME_AREA_HEIGHT)
        pygame.draw.rect(surface, (236, 240, 241), game_area)
        
        # Draw header
        header = pygame.Rect(0, 0, SCREEN_WIDTH, HEADER_HEIGHT)
        pygame.draw.rect(surface, DARK_BLUE, header)
        
        title = font_medium.render("Flag Capture Game", True, WHITE)
        surface.blit(title, (SCREEN_WIDTH / 2 - title.get_width() / 2, 10))
        
        level_text = font_small.render(f"Level: {self.level}", True, WHITE)
        level_bg = pygame.Rect(SCREEN_WIDTH - level_text.get_width() - 20, 15, 
                              level_text.get_width() + 10, level_text.get_height() + 10)
        pygame.draw.rect(surface, RED, level_bg, border_radius=5)
        surface.blit(level_text, (SCREEN_WIDTH - level_text.get_width() - 15, 20))
        
        # Draw footer
        footer = pygame.Rect(0, SCREEN_HEIGHT - FOOTER_HEIGHT, SCREEN_WIDTH, FOOTER_HEIGHT)
        pygame.draw.rect(surface, DARK_BLUE, footer)
        
        # Draw separator line
        pygame.draw.line(surface, ORANGE, (0, SCREEN_HEIGHT - FOOTER_HEIGHT), 
                        (SCREEN_WIDTH, SCREEN_HEIGHT - FOOTER_HEIGHT), 2)
        
        # Draw score and timer
        score_text = font_small.render(f"Score: {self.score}", True, WHITE)
        surface.blit(score_text, (20, SCREEN_HEIGHT - FOOTER_HEIGHT + 20))
        
        timer_text = font_small.render(f"Time: {self.time_remaining}", True, WHITE)
        surface.blit(timer_text, (SCREEN_WIDTH - timer_text.get_width() - 20, 
                                 SCREEN_HEIGHT - FOOTER_HEIGHT + 20))
        
        # Draw obstacles
        for obstacle in self.obstacles:
            obstacle.draw(surface)
        
        # Draw flags
        for flag in self.flags:
            flag.draw(surface)
        
        # Draw player
        self.player.draw(surface)
        
        # Draw effects
        for effect in self.effects:
            effect.draw(surface)
        
        # Draw level complete overlay
        if self.level_complete:
            # Semi-transparent overlay
            overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 200))
            surface.blit(overlay, (0, 0))
            
            # Level complete text
            level_complete_text = font_large.render("Level Complete!", True, GREEN)
            surface.blit(level_complete_text, 
                        (SCREEN_WIDTH / 2 - level_complete_text.get_width() / 2, 
                         SCREEN_HEIGHT / 2 - 50))
            
            next_level_text = font_medium.render(f"Moving to Level {self.level}", True, WHITE)
            surface.blit(next_level_text, 
                        (SCREEN_WIDTH / 2 - next_level_text.get_width() / 2, 
                         SCREEN_HEIGHT / 2 + 20))
        
        # Draw game over overlay
        if self.game_over:
            # Semi-transparent overlay
            overlay = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
            overlay.fill((0, 0, 0, 200))
            surface.blit(overlay, (0, 0))
            
            # Game over text
            game_over_text = font_large.render("Game Over!", True, RED)
            surface.blit(game_over_text, 
                        (SCREEN_WIDTH / 2 - game_over_text.get_width() / 2, 
                         SCREEN_HEIGHT / 2 - 70))
            
            score_text = font_medium.render(f"Your score: {self.score} (Level {self.level})", True, WHITE)
            surface.blit(score_text, 
                        (SCREEN_WIDTH / 2 - score_text.get_width() / 2, 
                         SCREEN_HEIGHT / 2))
            
            # Restart button
            button_width, button_height = 200, 50
            button_x = SCREEN_WIDTH / 2 - button_width / 2
            button_y = SCREEN_HEIGHT / 2 + 70
            
            button_rect = pygame.Rect(button_x, button_y, button_width, button_height)
            pygame.draw.rect(surface, BLUE, button_rect, border_radius=5)
            
            restart_text = font_small.render("Play Again", True, WHITE)
            surface.blit(restart_text, 
                        (button_x + button_width / 2 - restart_text.get_width() / 2, 
                         button_y + button_height / 2 - restart_text.get_height() / 2))

def main():
    game = Game()
    running = True
    mouse_pos = (SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2)
    
    while running:
        # Handle events
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False
            
            elif event.type == pygame.MOUSEMOTION:
                mouse_pos = event.pos
            
            elif event.type == pygame.MOUSEBUTTONDOWN:
                # Check if restart button is clicked
                if game.game_over:
                    button_width, button_height = 200, 50
                    button_x = SCREEN_WIDTH / 2 - button_width / 2
                    button_y = SCREEN_HEIGHT / 2 + 70
                    
                    button_rect = pygame.Rect(button_x, button_y, button_width, button_height)
                    
                    if button_rect.collidepoint(event.pos):
                        game.reset()
            
            elif event.type == pygame.USEREVENT:
                # Reset player color after collision
                game.player.color = BLUE
            
            elif event.type == pygame.USEREVENT + 1:
                # Start next level after delay
                game.start_next_level()
        
        # Update game state
        game.update(mouse_pos)
        
        # Draw everything
        game.draw(screen)
        
        # Update display
        pygame.display.flip()
        
        # Cap the frame rate
        clock.tick(60)
    
    pygame.quit()
    sys.exit()

if __name__ == "__main__":
    main()