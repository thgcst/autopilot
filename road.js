class Road {
  constructor(x, width, laneCount = 3) {
    this.x = x;
    this.width = width;
    this.laneCount = laneCount;

    this.left = x - width / 2;
    this.right = x + width / 2;

    this.top = -500;
    this.bottom = 500;

    const topLeft = { x: this.left, y: this.top };
    const topRight = { x: this.right, y: this.top };
    const bottomLeft = { x: this.left, y: this.bottom };
    const bottomRight = { x: this.right, y: this.bottom };
    this.borders = [
      [topLeft, bottomLeft],
      [topLeft, topRight],
      [topRight, bottomRight],
      [bottomLeft, bottomRight],
    ];
  }

  getLaneCenter(laneIndex) {
    const laneWidth = this.width / this.laneCount;
    return (
      this.left + laneWidth * (Math.min(laneIndex, this.laneCount - 1) + 0.5)
    );
  }

  draw(ctx) {
    ctx.lineWidth = 5;
    ctx.strokeStyle = "white";

    for (let i = 1; i <= this.laneCount - 1; i++) {
      const x = lerp(this.left, this.right, i / this.laneCount);

      ctx.setLineDash([20, 20]);
      ctx.beginPath();
      ctx.moveTo(x, this.top);
      ctx.lineTo(x, this.bottom);
      ctx.stroke();
    }

    ctx.setLineDash([]);
    this.borders.forEach(([start, end]) => {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
    });
  }
}
