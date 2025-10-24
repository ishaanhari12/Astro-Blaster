import Bullet from "./bullet.js";
import ColumnLaser from "./columnlaser.js";

export default class Player {
  constructor(canvas, shootSound, powerupSound) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.width = 50;
    this.height = 20;
    this.x = canvas.width / 2 - this.width / 2;
    this.y = canvas.height - 50;
    this.color = "#00ffcc";
    this.speed = 6;
    this.bullets = [];
    this.canShoot = true;
    this.shootDelay = 200;
    this.shootSound = shootSound;
    this.powerupSound = powerupSound;
    this.columnLasers = [];
    this.superpowerCharges = 0;
  }

  move(keys) {
    if (keys["ArrowLeft"] && this.x > 0) this.x -= this.speed;
    if (keys["ArrowRight"] && this.x + this.width < this.canvas.width)
      this.x += this.speed;
  }

  shoot() {
    if (!this.canShoot) return;
    this.canShoot = false;
    setTimeout(() => (this.canShoot = true), this.shootDelay);
    const bullet = new Bullet(this.x + this.width / 2 - 2, this.y);
    this.bullets.push(bullet);
    this.shootSound.currentTime = 0;
    this.shootSound.play();
  }

  fireColumnLaser() {
    if (this.superpowerCharges <= 0) return;
    const laser = new ColumnLaser(this.x + this.width / 2);
    this.columnLasers.push(laser);
    this.superpowerCharges--;
    this.powerupSound.currentTime = 0;
    this.powerupSound.play();
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
    this.bullets.forEach(b => b.draw(this.ctx));
    this.columnLasers.forEach(l => l.draw(this.ctx, this.y));
  }

  updateBullets() {
    for (let i = 0; i < this.bullets.length; i++) {
      const b = this.bullets[i];
      b.update();
      if (b.isOffScreen(this.canvas.height)) {
        this.bullets.splice(i, 1);
        i--;
      }
    }
  }

  updateLasers() {
    for (let i = 0; i < this.columnLasers.length; i++) {
      const l = this.columnLasers[i];
      l.update();
      if (l.isExpired()) {
        this.columnLasers.splice(i, 1);
        i--;
      }
    }
  }
}
