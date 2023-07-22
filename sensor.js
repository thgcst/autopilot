class Sensor {
  constructor(car) {
    this.car = car;

    this.raysDistribution = [
      { angle: 0, length: 350 },
      { angle: (10 * Math.PI) / 180, length: 300 },
      { angle: (-10 * Math.PI) / 180, length: 300 },
      { angle: (20 * Math.PI) / 180, length: 290 },
      { angle: (-20 * Math.PI) / 180, length: 290 },
      { angle: (40 * Math.PI) / 180, length: 120 },
      { angle: (-40 * Math.PI) / 180, length: 120 },
      { angle: (90 * Math.PI) / 180, length: 40 },
      { angle: (-90 * Math.PI) / 180, length: 40 },
      { angle: (120 * Math.PI) / 180, length: 40 },
      { angle: (-120 * Math.PI) / 180, length: 40 },
      { angle: (180 * Math.PI) / 180, length: 100 },
    ];
    this.rayCount = this.raysDistribution.length;

    this.rays = [];
    this.readings = [];
  }

  update(roadBorders, traffic) {
    this.#castRays();
    this.readings = [];

    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(this.#getReading(this.rays[i], roadBorders, traffic));
    }
  }

  #getReading(ray, roadBorders, traffic) {
    let touches = [];

    for (let roadBorder of roadBorders) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorder[0],
        roadBorder[1]
      );
      if (touch) {
        touches.push(touch);
      }
    }

    for (let trafficCar of traffic) {
      const poly = trafficCar.polygon;
      for (let j = 0; j < poly.length; j++) {
        const value = getIntersection(
          ray[0],
          ray[1],
          poly[j],
          poly[(j + 1) % poly.length]
        );
        if (value) {
          touches.push(value);
        }
      }
    }

    if (touches.length === 0) {
      return null;
    } else {
      const offsets = touches.map((e) => e.offset);
      const minOffset = Math.min(...offsets);
      return touches.find((e) => e.offset == minOffset);
    }
  }

  #castRays() {
    this.rays = [];
    for (let { angle, length } of this.raysDistribution) {
      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x - Math.sin(angle + this.car.angle) * length,
        y: this.car.y - Math.cos(angle + this.car.angle) * length,
      };
      this.rays.push([start, end]);
    }
  }

  draw(ctx) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];
      if (this.readings[i]) {
        end = this.readings[i];
      }
      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "yellow";
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "black";
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.stroke();
    }
  }
}
