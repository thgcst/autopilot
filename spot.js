class Spot {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    const topLeft = {
      x: this.x - this.width / 2,
      y: this.y - this.height / 2,
    };
    const topRight = {
      x: this.x + this.width / 2,
      y: this.y - this.height / 2,
    };
    const bottomLeft = {
      x: this.x - this.width / 2,
      y: this.y + this.height / 2,
    };
    const bottomRight = {
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
    };
    this.polygon = [topLeft, topRight, bottomRight, bottomLeft];
  }

  draw(ctx) {
    ctx.lineWidth = 1;
    ctx.strokeStyle = "green";
    ctx.fillStyle = "lightgreen";
    ctx.setLineDash([5, 5]);

    const [firstPoint, ...polygon] = this.polygon;
    ctx.beginPath();
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (let { x, y } of polygon) {
      ctx.lineTo(x, y);
    }
    ctx.lineTo(firstPoint.x, firstPoint.y);
    ctx.fill();
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
