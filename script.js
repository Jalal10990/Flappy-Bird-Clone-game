//first i make variables
// Game Variables
// Game Variables
// Game Elements
const bird = document.getElementById('bird');
const pipesContainer = document.getElementById('pipes');
const scoreDisplay = document.getElementById('score');
const highScoreDisplay = document.getElementById('high-score');
const levelDisplay = document.getElementById('level');
const gameOverDisplay = document.getElementById('game-over');
const finalScoreDisplay = document.getElementById('final-score');
const finalHighScoreDisplay = document.getElementById('final-high-score');

// Game Settings
const BIRD_WIDTH = 40;
const BIRD_HEIGHT = 30;
const PIPE_WIDTH = 60;
const GRAVITY = 0.5;
const JUMP_FORCE = -10;
const INITIAL_PIPE_SPEED = 2;
const INITIAL_PIPE_GAP = 150;
const INITIAL_PIPE_FREQUENCY = 2000; // ms

// Game State
let birdY = 250;
let birdVelocity = 0;
let gameRunning = false;
let score = 0;
let highScore = localStorage.getItem('flappyHighScore') || 0;
let pipeSpeed = INITIAL_PIPE_SPEED;
let pipeGap = INITIAL_PIPE_GAP;
let pipeFrequency = INITIAL_PIPE_FREQUENCY;
let level = 1;
let animationFrameId;
let pipeGenerationTimeout;

// Initialize game
function init() {
    highScoreDisplay.textContent = highScore;
    document.addEventListener('keydown', handleInput);
    document.addEventListener('click', handleInput);
    resetGame();
}

// Handle user input
function handleInput(e) {
    if (e.type === 'keydown' && e.code !== 'Space') return;
    
    if (!gameRunning) {
        resetGame();
    }
    birdVelocity = JUMP_FORCE;
    bird.style.transform = 'rotate(-30deg)';
    setTimeout(() => {
        bird.style.transform = 'rotate(0deg)';
    }, 200);
}

// Main game loop
function gameLoop() {
    if (!gameRunning) return;

    // Update bird position
    birdVelocity += GRAVITY;
    birdY += birdVelocity;
    bird.style.top = `${birdY}px`;

    // Check boundaries
    if (birdY <= 0 || birdY >= 570) {
        gameOver();
        return;
    }

    // Update pipes
    const pipes = document.querySelectorAll('.pipe');
    let scored = false;
    
    pipes.forEach(pipe => {
        const pipeX = parseFloat(pipe.style.left);
        const newX = pipeX - pipeSpeed;
        pipe.style.left = `${newX}px`;

        // Check for score
        if (!pipe.classList.contains('scored')) {
            if (pipeX > 50 && newX <= 50) {
                pipe.classList.add('scored');
                scored = true;
            }
        }

        // Remove off-screen pipes
        if (newX < -PIPE_WIDTH) {
            pipesContainer.removeChild(pipe);
        }

        // Collision detection
        if (newX < BIRD_WIDTH + 50 && newX > -PIPE_WIDTH) {
            const pipeTop = parseInt(pipe.dataset.top || '0');
            const pipeBottom = parseInt(pipe.dataset.bottom || '600');
            const birdRect = {
                left: 50,
                right: 50 + BIRD_WIDTH,
                top: birdY,
                bottom: birdY + BIRD_HEIGHT
            };
            
            const pipeRect = {
                left: newX,
                right: newX + PIPE_WIDTH,
                top: pipe.classList.contains('top') ? 0 : pipeBottom,
                bottom: pipe.classList.contains('top') ? pipeTop : 600
            };

            if (isColliding(birdRect, pipeRect)) {
                gameOver();
                return;
            }
        }
    });

    // Update score
    if (scored) {
        score++;
        scoreDisplay.textContent = score;
        
        // Increase difficulty
        if (score % 5 === 0) {
            levelUp();
        }
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

// Collision detection helper
function isColliding(rect1, rect2) {
    return (
        rect1.left < rect2.right &&
        rect1.right > rect2.left &&
        rect1.top < rect2.bottom &&
        rect1.bottom > rect2.top
    );
}

// Level up system
function levelUp() {
    level++;
    levelDisplay.textContent = `Level: ${level}`;
    pipeSpeed = Math.min(pipeSpeed + 0.25, 6);
    pipeGap = Math.max(pipeGap - 5, 100);
    pipeFrequency = Math.max(pipeFrequency - 100, 1000);
    
    // Visual feedback
    document.body.style.backgroundColor = `hsl(${190 + level * 5}, 70%, 70%)`;
    bird.style.backgroundColor = `hsl(${50 + level * 2}, 100%, 50%)`;
}

// Generate pipes
function generatePipes() {
    if (!gameRunning) return;

    const topHeight = Math.floor(Math.random() * 200) + 50;
    const bottomHeight = 600 - topHeight - pipeGap;

    // Top pipe
    const topPipe = document.createElement('div');
    topPipe.className = 'pipe top';
    topPipe.style.height = `${topHeight}px`;
    topPipe.style.left = '400px';
    topPipe.dataset.top = topHeight;

    // Bottom pipe
    const bottomPipe = document.createElement('div');
    bottomPipe.className = 'pipe bottom';
    bottomPipe.style.height = `${bottomHeight}px`;
    bottomPipe.style.left = '400px';
    bottomPipe.dataset.bottom = 600 - bottomHeight;

    pipesContainer.appendChild(topPipe);
    pipesContainer.appendChild(bottomPipe);

    // Schedule next pipe generation
    const nextPipeTime = pipeFrequency + (Math.random() * 500 - 250);
    pipeGenerationTimeout = setTimeout(generatePipes, nextPipeTime);
}

// Game over handler
function gameOver() {
    gameRunning = false;
    cancelAnimationFrame(animationFrameId);
    clearTimeout(pipeGenerationTimeout);
    
    // Update high score
    if (score > highScore) {
        highScore = score;
        localStorage.setItem('flappyHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
    
    // Show game over screen
    finalScoreDisplay.textContent = score;
    finalHighScoreDisplay.textContent = highScore;
    gameOverDisplay.style.display = 'block';
}

// Reset game state
function resetGame() {
    // Clear existing game elements
    pipesContainer.innerHTML = '';
    clearTimeout(pipeGenerationTimeout);
    cancelAnimationFrame(animationFrameId);
    
    // Reset game state
    gameRunning = true;
    birdY = 250;
    birdVelocity = 0;
    score = 0;
    level = 1;
    pipeSpeed = INITIAL_PIPE_SPEED;
    pipeGap = INITIAL_PIPE_GAP;
    pipeFrequency = INITIAL_PIPE_FREQUENCY;
    
    // Reset displays
    scoreDisplay.textContent = '0';
    levelDisplay.textContent = 'Level: 1';
    gameOverDisplay.style.display = 'none';
    bird.style.top = `${birdY}px`;
    bird.style.transform = 'rotate(0deg)';
    document.body.style.backgroundColor = '#70c5ce';
    bird.style.backgroundColor = '#ffcc00';
    
    // Start game systems
    generatePipes();
    gameLoop();
}

// Start the game
init();


//function for stare the game
// function for reset game 
//function for game over
//function for generate pipes
//function for check collosion with pipes
//function for removes pipes that go off-screen
//function for check if birds passes a pipe  ( score++)
//function for check if bird hits ground or ceiling
//apply gravity feature
//function for moves pipes
//function for game loop
//function for jump on Spacebar or click