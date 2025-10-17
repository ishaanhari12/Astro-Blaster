// === STARFIELD BACKGROUND ===
const starCanvas = document.getElementById("starfield");
const starCtx = starCanvas.getContext("2d");

function resizeCanvas() {
  starCanvas.width = window.innerWidth;
  starCanvas.height = window.innerHeight;
}
resizeCanvas();

const stars = [];
const numStars = 100;

for (let i = 0; i < numStars; i++) {
  stars.push({
    x: Math.random() * starCanvas.width,
    y: Math.random() * starCanvas.height,
    size: Math.random() * 2,
    speed: Math.random() * 0.5 + 0.2
  });
}

function updateStarfield() {
  starCtx.clearRect(0, 0, starCanvas.width, starCanvas.height);
  starCtx.fillStyle = "white";
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > starCanvas.height) {
      star.y = 0;
      star.x = Math.random() * starCanvas.width;
    }
    starCtx.beginPath();
    starCtx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
    starCtx.fill();
  });
  requestAnimationFrame(updateStarfield);
}
updateStarfield();

window.addEventListener("resize", resizeCanvas);


//----------------------------------------------------------------------//
//Start Button//
document.addEventListener("DOMContentLoaded", () => {
  const startGameBtn = document.getElementById("startGameBtn");

  if (startGameBtn) {
    startGameBtn.addEventListener("click", () => {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

      if (currentUser) {
        // ✅ Logged in → go to game
        window.location.href = "game.html";
      } else {
        // 🚫 Not logged in → go to login
        window.location.href = "login.html";
      }
    });
  }
});

//--------------------------------------------------------------------//
// === BASIC GAME SETUP ===
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const shootSound = new Audio("assets/laser.mp3");
shootSound.volume = 0.5;
const powerup = new Audio("assets/powerup.mp3");
powerup.volume = 0.7;

let player = {
  x: canvas.width / 2 - 25,
  y: canvas.height - 50,
  width: 50,
  height: 20,
  color: "#00ffcc",
  speed: 6
};

const welcomeBanner = document.getElementById("welcomeBanner");
const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));

if (currentUser) {
  welcomeBanner.textContent = `Welcome, ${currentUser.name}!`;
} else {
  welcomeBanner.textContent = "Welcome, Guest!";
}

// === ALIEN CONFIGURATION ===
const alienTypes = {
  scout: { color: "lime", speed: 1.5, hitPoints: 1, size: 30 },
  tank: { color: "red", speed: 0.8, hitPoints: 3, size: 40 }
};

const numColumns = 5;       // Total number of columns on screen
const aliens = [];          // Stores active aliens
const columnWidth = canvas.width / numColumns;


// === BULLET SYSTEM ===
const bullets = [];
const bulletSpeed = 8;
let canShoot = true;
const shootDelay = 200; // milliseconds between shots

function shootBullet() {
  if (!canShoot) return; // prevent spamming
  canShoot = false;
  setTimeout(() => (canShoot = true), shootDelay);

  bullets.push({
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 15
  });

  shootSound.currentTime = 0; // rewind to start
  shootSound.play();

}

function updateBullets() {
  for (let i = 0; i < bullets.length; i++) {
    const b = bullets[i];
    b.y -= bulletSpeed;

    // Collision detection with aliens
    for (let j = 0; j < aliens.length; j++) {
      const a = aliens[j];
      if (
        b.x < a.x + a.size &&
        b.x + b.width > a.x &&
        b.y < a.y + a.size &&
        b.y + b.height > a.y
      ) {
        // hit detected
        a.hitPoints -= 1;
        bullets.splice(i, 1);
        i--;

        if (a.hitPoints <= 0) {
          aliens.splice(j, 1);
          j--;
          if (a.type === "scout") score += 10;
          else if (a.type === "tank") score += 30; // Increase score
        }
        break; // Stop checking after hit
      }
    }

    // Remove bullets that go off-screen
    if (b && b.y + b.height < 0) {
      bullets.splice(i, 1);
      i--;
    }
  }
}


function drawBullets() {
  ctx.fillStyle = "#00ffff";
  bullets.forEach(b => ctx.fillRect(b.x, b.y, b.width, b.height));
}


// === PLAYER MOVEMENT & CONTROLS ===
let keys = {};

document.addEventListener("keydown", (e) => {
  // Start game with Enter
  if (!gameStarted && e.code === "Enter") {
    gameStarted = true;
    generateWave(); // start first wave
    return;
  }

  // If game has started and not over, handle movement/shooting
  if (gameStarted && !gameOver) {
    keys[e.key] = true;

    // Spacebar shoots
    if (e.code === "Space") {
      shootBullet();
    }

    // Press B to fire column laser if available
    if (e.code === "KeyB" && superpowerCharges > 0) {
      fireColumnLaser();
      superpowerCharges--; // consume one charge
    }
  }

  //Restart game with R if over
  if (gameOver && (e.key === "r" || e.key === "R")) {
    restartGame();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key] = false;
});



function movePlayer() {
  if (keys["ArrowLeft"] && player.x > 0) player.x -= player.speed;
  if (keys["ArrowRight"] && player.x + player.width < canvas.width)
    player.x += player.speed;
}

// === GENERATE ALIEN WAVE ===
function generateWave() {
  aliens.length = 0; // clear previous aliens

  // Pick random columns to fill (between 2 and 4 columns active)
  const numActiveCols = Math.floor(Math.random() * 3) + 2;
  const availableCols = Array.from({ length: numColumns }, (_, i) => i);
  const chosenCols = [];

  for (let i = 0; i < numActiveCols; i++) {
    const randIndex = Math.floor(Math.random() * availableCols.length);
    chosenCols.push(availableCols.splice(randIndex, 1)[0]);
  }

  // For each chosen column, pick a type (scout or tank)
  chosenCols.forEach(col => {
    const type = Math.random() < 0.6 ? "scout" : "tank"; // 60% scouts, 40% tanks
    const alienData = alienTypes[type];
    const count = Math.floor(Math.random() * 3) + 2; // 2–4 aliens per column

    for (let i = 0; i < count; i++) {
      aliens.push({
        type,
        x: col * columnWidth + columnWidth / 2 - alienData.size / 2,
        y: -(i * (alienData.size + 15)), // stack upwards, off-screen initially
        hitPoints: alienData.hitPoints,
        color: alienData.color,
        speed: alienData.speed,
        size: alienData.size
      });
    }
  });
}

// Move this OUTSIDE generateWave()
function updateAliens() {
  aliens.forEach(alien => {
    alien.y += alien.speed;

    // If alien reaches bottom
    if (alien.y + alien.size >= canvas.height) {
      if (!gameOver) {
        lives--;
      }
  aliens.splice(aliens.indexOf(alien), 1); // remove alien that reached bottom

    if (lives <= 0 && !gameOver) {
    gameOver = true;
    saveScoreToLeaderboard();
  }
    }
  });
}


let score = 0;
let wave = 1;
let lives = 3;
let superpowerCharges = 0; // Number of column lasers the player has
const columnLasers = []; 
let waveInProgress = true;
let gameOver = false;
let fadeOpacity = 0;
let gameStarted = false;



function checkNextWave() {
  if (aliens.length === 0 && waveInProgress) {
    waveInProgress = false;
    setTimeout(() => {
      wave++;
      generateWave();
      waveInProgress = true;
      superpowerCharges++;
    }, 2000); // 2-second delay before next wave
  }
}

function restartGame() {
  score = 0;
  wave = 1;
  lives = 3;
  aliens.length = 0;
  bullets.length = 0;
  columnLasers.length = 0;
  superpowerCharges = 0;
  fadeOpacity = 0;
  gameOver = false;
  generateWave();
}

// === SAVE SCORE TO LEADERBOARD ===
function saveScoreToLeaderboard() {
  const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
  if (!currentUser) return; // only save if logged in

  // get existing users from localStorage
  let users = JSON.parse(localStorage.getItem("users")) || [];

  // find this user
  const userIndex = users.findIndex(u => u.email === currentUser.email);
  if (userIndex !== -1) {
    // update high score if current score is higher
    if (!users[userIndex].highScore || score > users[userIndex].highScore) {
      users[userIndex].highScore = score;
    }
  }

  // save updated users list
  localStorage.setItem("users", JSON.stringify(users));
}

function fireColumnLaser() {
  const laserX = player.x + player.width / 2; // center of player
  columnLasers.push({ x: laserX, timer: 20 }); // laser stays on screen for 20 frames

  powerup.currentTime = 0;
  powerup.play();
}


// === MAIN GAME LOOP ===
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

   // Only update when game started and not over
  if (gameStarted && !gameOver) {
    movePlayer();
    updateBullets();
    updateAliens();
    checkNextWave();
  }

  // Draw everything
  ctx.fillStyle = player.color;
  ctx.fillRect(player.x, player.y, player.width, player.height);

  drawBullets();

  aliens.forEach(alien => {
    ctx.fillStyle = alien.color;
    ctx.fillRect(alien.x, alien.y, alien.size, alien.size);
  });

  // === HUD (Score, Wave, Lives) ===
  ctx.fillStyle = "white";
  ctx.font = "20px Orbitron, sans-serif";
  ctx.fillText("Score: " + score, 20, 30);
  ctx.fillText("Wave: " + wave, 20, 60);
  ctx.fillText("Lives: " + lives, 20, 90);
  ctx.fillText("Column Lasers: " + superpowerCharges, 20, 120);

  for (let i = 0; i < columnLasers.length; i++) {
  const laser = columnLasers[i];

  // Draw vertical laser
  ctx.fillStyle = "#1f51ff";
  ctx.fillRect(laser.x - 2, 0, 4, player.y);

  // Destroy aliens in this column
  for (let j = aliens.length - 1; j >= 0; j--) {
    const alien = aliens[j];
    if (laser.x >= alien.x && laser.x <= alien.x + alien.size) {
      if (alien.type === "scout") score += 10;
      else if (alien.type === "tank") score += 30;
      aliens.splice(j, 1);
    }
  }

  // Reduce timer and remove laser when done
  laser.timer--;
  if (laser.timer <= 0) columnLasers.splice(i, 1);
}

// === SHOW "Press Enter to Start" if game not started ===
  if (!gameStarted && !gameOver) {
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#00ffff";
    ctx.font = "40px Orbitron, sans-serif";
    ctx.fillText("Press ENTER to Start", canvas.width / 2 - 230, canvas.height / 2);
  }


// === GAME OVER SCREEN ===
if (gameOver) {
  // fade-in background overlay
  fadeOpacity = Math.min(fadeOpacity + 0.02, 0.8);
  ctx.fillStyle = `rgba(0, 0, 0, ${fadeOpacity})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw text
  ctx.fillStyle = "red";
  ctx.font = "bold 60px Orbitron, sans-serif";
  ctx.fillText("GAME OVER", canvas.width / 2 - 180, canvas.height / 2 - 40);

  ctx.fillStyle = "white";
  ctx.font = "28px Orbitron, sans-serif";
  ctx.fillText("Final Score: " + score, canvas.width / 2 - 110, canvas.height / 2 + 10);
  ctx.fillText("Press R to Restart", canvas.width / 2 - 140, canvas.height / 2 + 60);
}

  requestAnimationFrame(gameLoop);
}
gameLoop();

