export default class Alien {
  constructor(type, x, y, config) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.size = config.size;
    this.speed = config.speed;
    this.hitPoints = config.hitPoints;
    this.color = config.color;
  }

  update() {
    this.y += this.speed;
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.size, this.size);
  }
}
