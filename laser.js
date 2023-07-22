class Laser {
  constructor(x, y, width, speed = 2) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.speed = speed;

    this.borders = [
      { x: this.x - width / 2, y: this.y },
      { x: this.x + width / 2, y: this.y },
    ];
  }

  update() {
    this.#move();
  }

  #move() {
    this.y -= this.speed;
  }

  draw(ctx) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "red";

    ctx.beginPath();
    ctx.moveTo(this.borders[0].x, this.y);
    ctx.lineTo(this.borders[1].x, this.y);
    ctx.stroke();
  }
}
