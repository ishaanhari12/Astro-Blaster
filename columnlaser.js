export default class ColumnLaser {
  constructor(x, duration = 20) {
    this.x = x;
    this.timer = duration;
  }

  update() {
    this.timer--;
  }

  draw(ctx, playerY) {
    ctx.fillStyle = "#1f51ff";
    ctx.fillRect(this.x - 2, 0, 4, playerY);
  }

  isExpired() {
    return this.timer <= 0;
  }
}
