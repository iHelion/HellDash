const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = 800;
canvas.height = 400;

let square = {
    x: 50,
    y: canvas.height - 30,
    width: 20,
    height: 20,
    dy: 0,
    gravity: 0.3,
    jumpPower: -8,
    isJumping: false,
    trail: []
};

let obstacles = [];
let obstacleFrequency = 70;
let frameCount = 0;
let isGameOver = false;
let animationFrameId;
const progressDuration = 139;

function startGame() {
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('you-won').style.display = 'none'; 
    sound.play();
    gameLoop();
    animateProgressBar();
}

function drawProgressBar(progress) {
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressPercentageValue = Math.floor((progress / progressDuration) * 100);

    progressBarFill.style.width = `${progressPercentageValue}%`;
    progressPercentage.textContent = `${progressPercentageValue}%`;
}

function animateProgressBar() {
    let start = null;
    function step(timestamp) {
        if (!start) start = timestamp;
        const progress = (timestamp - start) / 1000; 

        drawProgressBar(progress);

        if (progress < progressDuration) {
            animationFrameId = requestAnimationFrame(step);
        } else {
            endGame();
        }
    }
    animationFrameId = requestAnimationFrame(step);
}

function drawSquare() {
    let gradient = ctx.createLinearGradient(square.x, square.y, square.x + square.width, square.y + square.height);
    gradient.addColorStop(0, '#07aaf5');
    gradient.addColorStop(1, '#0f2df2');

    ctx.fillStyle = gradient;
    ctx.fillRect(square.x, square.y, square.width, square.height);

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.strokeRect(square.x, square.y, square.width, square.height);

    ctx.globalAlpha = 0.3;
    ctx.fillStyle = gradient;
    square.trail.forEach(pos => {
        ctx.fillRect(pos.x, pos.y, square.width, square.height);
    });
    ctx.globalAlpha = 1;
}

function handleJump() {
    if (square.isJumping) {
        square.dy = square.jumpPower;
        square.isJumping = false;
    }

    square.y += square.dy;
    square.dy += square.gravity;

    if (square.y > canvas.height - square.height) {
        square.y = canvas.height - square.height;
        square.dy = 0;
    }

    square.trail.push({ x: square.x, y: square.y });
    if (square.trail.length > 20) {
        square.trail.shift();
    }
}


function createObstacle() {
    const height = Math.floor(Math.random() * 30) + 20;
    const gradient = ctx.createLinearGradient(0, canvas.height - height, 0, canvas.height);
    gradient.addColorStop(0, '#111114');
    gradient.addColorStop(1, '#2b2b2e');

    obstacles.push({
        x: canvas.width,
        y: canvas.height - height,
        width: 20,
        height: height,
        gradient: gradient
    });
}


function drawObstacles() {
    obstacles.forEach(obstacle => {
        ctx.fillStyle = obstacle.gradient;
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });
}


function updateObstacles() {
    obstacles.forEach(obstacle => {
        obstacle.x -= 2;
    });
    obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0);
}


function checkCollision() {
    for (let obstacle of obstacles) {
        if (square.x < obstacle.x + obstacle.width &&
            square.x + square.width > obstacle.x &&
            square.y < obstacle.y + obstacle.height &&
            square.y + square.height > obstacle.y) {
            endGame();
            break;
        }
    }
}


function endGame() {
    isGameOver = true;
    sound.stop();
    cancelAnimationFrame(animationFrameId);
    if (document.getElementById('progress-bar-fill').style.width === '100%') {
        showYouWonScreen();
    } else {
        document.getElementById('game-over').style.display = 'block';
    }
}


function showYouWonScreen() {
    document.getElementById('you-won').style.display = 'block';
    animateUwuGif();
}


function animateUwuGif() {
    const uwuGif = document.getElementById('uwu-gif');
    uwuGif.style.opacity = '1'; 

    function loop() {
        uwuGif.style.transform = 'scale(1.1)'; 
        setTimeout(() => {
            uwuGif.style.transform = 'scale(1)';
            setTimeout(loop, 2000); 
        }, 1000);
    }

    loop();
}

function restartGame() {
    isGameOver = false;
    obstacles = [];
    square.x = 50;
    square.y = canvas.height - 30;
    square.trail = [];
    frameCount = 0;
    document.getElementById('game-over').style.display = 'none';
    document.getElementById('you-won').style.display = 'none';
    startGame();
}


function gameLoop() {
    if (isGameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSquare();
    handleJump();
    if (frameCount % obstacleFrequency === 0) {
        createObstacle();
    }
    drawObstacles();
    updateObstacles();
    checkCollision();
    frameCount++;
    animationFrameId = requestAnimationFrame(gameLoop);
}


document.addEventListener('keydown', (event) => {
    if (event.key === ' ' && square.y === canvas.height - square.height) {
        square.isJumping = true;
    }
    if (event.key === 'r' && isGameOver) {
        restartGame();
    }
});

document.getElementById('start-button').addEventListener('click', () => {
    document.getElementById('start-button').style.display = 'none';
    startGame();
    flashingLights(); 
});


function flashingLights() {
    const originalBg = canvas.style.background;
    let colorIndex = 0;
    let flashCount = 0;
    const flashInterval = 100; 

    function flash() {
        if (isGameOver) {
            canvas.style.background = originalBg; 
            return;
        }

        if (flashCount < 10) {
            canvas.style.background = (flashCount % 2 === 0) ? '#FFFFFF' : '#000000'; 
            flashCount++;
            setTimeout(flash, flashInterval);
        } else {
            canvas.style.background = originalBg; 
            flashCount = 0; 
            setTimeout(flash, 5000); 
        }
    }

    flash();
}


Howler.html5PoolSize = 20;
const sound = new Howl({
    src: ['assets/korden.mp3'],
    autoplay: false,
    loop: false,
    volume: 1.0,
    onend: function() {
        endGame();
    },
    onloaderror: function(id, err) {
        console.error('Błąd ładowania:', err);
    },
    onplayerror: function(id, err) {
        console.error('Błąd odtwarzania:', err);
    }
});