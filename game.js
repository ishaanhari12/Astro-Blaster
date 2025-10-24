import Starfield from "./starfield.js";
import Player from "./player.js";
import Alien from "./alien.js";

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const shootSound = new Audio("assets/laser.mp3");
shootSound.volume = 0.5;
const powerupSound = new Audio("assets/powerup.mp3");
powerupSound.volume = 0.7;


class Game {
  constructor() {
    this.starfield = new Starfield("starfield");
    this.player = new Player(canvas, shootSound, powerupSound);
    this.aliens = [];
    this.alienTypes = {
      scout: { color: "lime", speed: 1.5, hitPoints: 1, size: 30 },
      tank: { color: "red", speed: 0.8, hitPoints: 3, size: 40 }
    };
    this.numColumns = 5;
    this.columnWidth = canvas.width / this.numColumns;
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.waveInProgress = true;
    this.gameOver = false;
    this.fadeOpacity = 0;
    this.gameStarted = false;
    this.keys = {};
    this.welcomeBanner = document.getElementById("welcomeBanner");
    this.currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
    this.initEvents();
    this.showWelcome();
    requestAnimationFrame(() => this.gameLoop());
  }

  showWelcome() {
    if (this.currentUser) {
      this.welcomeBanner.textContent = `Welcome, ${this.currentUser.name}!`;
    } else {
      this.welcomeBanner.textContent = "Welcome, Guest!";
    }
  }

  initEvents() {
    document.addEventListener("keydown", e => {
      this.keys[e.key] = true;

      if (!this.gameStarted && e.code === "Enter") {
        this.gameStarted = true;
        this.generateWave();
      }

      if (this.gameStarted && !this.gameOver) {
        if (e.code === "Space") this.player.shoot();
        if (e.code === "KeyB") this.player.fireColumnLaser();
      }

      if (this.gameOver && (e.key === "r" || e.key === "R")) {
        this.restartGame();
      }
    });

    document.addEventListener("keyup", e => {
      this.keys[e.key] = false;
    });
  }

  generateWave() {
    this.aliens.length = 0;
    const numActiveCols = Math.floor(Math.random() * 3) + 2;
    const availableCols = Array.from({ length: this.numColumns }, (_, i) => i);
    const chosenCols = [];

    for (let i = 0; i < numActiveCols; i++) {
      const randIndex = Math.floor(Math.random() * availableCols.length);
      chosenCols.push(availableCols.splice(randIndex, 1)[0]);
    }

    chosenCols.forEach(col => {
      const type = Math.random() < 0.6 ? "scout" : "tank";
      const alienData = this.alienTypes[type];
      const count = Math.floor(Math.random() * 3) + 2;

      for (let i = 0; i < count; i++) {
        this.aliens.push(
          new Alien(
            type,
            col * this.columnWidth + this.columnWidth / 2 - alienData.size / 2,
            -(i * (alienData.size + 15)),
            alienData
          )
        );
      }
    });
  }

  updateAliens() {
    for (let i = 0; i < this.aliens.length; i++) {
      const alien = this.aliens[i];
      alien.update();
      if (alien.y + alien.size >= canvas.height) {
        this.lives--;
        this.aliens.splice(i, 1);
        i--;
        if (this.lives <= 0) this.gameOver = true;
      }
    }
  }

  checkCollisions() {
    // bullets
    for (let i = 0; i < this.player.bullets.length; i++) {
      const b = this.player.bullets[i];
      for (let j = 0; j < this.aliens.length; j++) {
        const a = this.aliens[j];
        if (
          b.x < a.x + a.size &&
          b.x + b.width > a.x &&
          b.y < a.y + a.size &&
          b.y + b.height > a.y
        ) {
          a.hitPoints--;
          this.player.bullets.splice(i, 1);
          i--;
          if (a.hitPoints <= 0) {
            if (a.type === "scout") this.score += 10;
            else if (a.type === "tank") this.score += 30;
            this.aliens.splice(j, 1);
          }
          break;
        }
      }
    }

    // column lasers
    for (let i = 0; i < this.player.columnLasers.length; i++) {
      const laser = this.player.columnLasers[i];
      for (let j = this.aliens.length - 1; j >= 0; j--) {
        const alien = this.aliens[j];
        if (laser.x >= alien.x && laser.x <= alien.x + alien.size) {
          if (alien.type === "scout") this.score += 10;
          else if (alien.type === "tank") this.score += 30;
          this.aliens.splice(j, 1);
        }
      }
    }
  }

  checkNextWave() {
    if (this.aliens.length === 0 && this.waveInProgress) {
      this.waveInProgress = false;
      setTimeout(() => {
        this.wave++;
        this.generateWave();
        this.waveInProgress = true;
        this.player.superpowerCharges++;
      }, 2000);
    }
  }

  restartGame() {
    this.score = 0;
    this.wave = 1;
    this.lives = 3;
    this.aliens.length = 0;
    this.player.bullets.length = 0;
    this.player.columnLasers.length = 0;
    this.player.superpowerCharges = 0;
    this.fadeOpacity = 0;
    this.gameOver = false;
    this.waveInProgress = true;
    this.gameStarted = false;
  }

  drawHUD() {
    ctx.fillStyle = "white";
    ctx.font = "20px Orbitron, sans-serif";
    ctx.fillText("Score: " + this.score, 20, 30);
    ctx.fillText("Wave: " + this.wave, 20, 60);
    ctx.fillText("Lives: " + this.lives, 20, 90);
    ctx.fillText("Column Lasers: " + this.player.superpowerCharges, 20, 120);
  }

  gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (this.gameStarted && !this.gameOver) {
      this.player.move(this.keys);
      this.player.updateBullets();
      this.player.updateLasers();
      this.updateAliens();
      this.checkCollisions();
      this.checkNextWave();
    }

    this.player.draw();
    this.aliens.forEach(a => a.draw(ctx));
    this.drawHUD();

    if (!this.gameStarted && !this.gameOver) {
      ctx.fillStyle = "rgba(0,0,0,0.7)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#00ffff";
      ctx.font = "40px Orbitron, sans-serif";
      ctx.fillText("Press ENTER to Start", canvas.width / 2 - 230, canvas.height / 2);
    }

    if (this.gameOver) {
      this.fadeOpacity = Math.min(this.fadeOpacity + 0.02, 0.8);
      ctx.fillStyle = `rgba(0,0,0,${this.fadeOpacity})`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "red";
      ctx.font = "bold 60px Orbitron, sans-serif";
      ctx.fillText("GAME OVER", canvas.width / 2 - 180, canvas.height / 2 - 40);
      ctx.fillStyle = "white";
      ctx.font = "28px Orbitron, sans-serif";
      ctx.fillText("Final Score: " + this.score, canvas.width / 2 - 110, canvas.height / 2 + 10);
      ctx.fillText("Press R to Restart", canvas.width / 2 - 140, canvas.height / 2 + 60);
    }

    requestAnimationFrame(() => this.gameLoop());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("startGameBtn");
  if (startBtn) {
    startBtn.addEventListener("click", () => {
      const currentUser = JSON.parse(sessionStorage.getItem("currentUser"));
      if (currentUser) window.location.href = "game.html";
      else window.location.href = "login.html";
    });
  }

  new Game();
});

