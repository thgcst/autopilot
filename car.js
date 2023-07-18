class Car {
  constructor(x, y, width, height, controlType, maxSpeed = 3) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = 0.2;
    this.maxSpeed = maxSpeed;
    this.friction = 0.05;
    this.angle = 0;
    this.damaged = false;

    if (controlType !== "DUMMY") {
      this.sensor = new Sensor(this);
    }
    this.controls = new Controls(controlType);
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }

    this.sensor?.update(roadBorders, traffic);
  }

  #assessDamage(roadBorders, traffic) {
    for (let roadBorder of roadBorders) {
      if (polysIntersect(this.polygon, roadBorder)) {
        return true;
      }
    }
    for (let dummyCar of traffic) {
      if (polysIntersect(this.polygon, dummyCar.polygon)) {
        return true;
      }
    }
    return false;
  }

  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan(this.width / this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad,
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad,
    });
    return points;
  }

  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }

    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed !== 0) {
      if (this.controls.left) {
        this.angle += 0.03 * (this.speed > 0 ? 1 : -1);
      }
      if (this.controls.right) {
        this.angle -= 0.03 * (this.speed > 0 ? 1 : -1);
      }
    }

    this.x -= this.speed * Math.sin(this.angle);
    this.y -= this.speed * Math.cos(this.angle);
  }

  draw(ctx, color) {
    if (this.damaged) {
      ctx.fillStyle = "gray";
    } else {
      ctx.fillStyle = color;
    }
    ctx.beginPath();
    const [firstPoint, ...polygon] = this.polygon;
    ctx.moveTo(firstPoint.x, firstPoint.y);
    for (let point of polygon) {
      ctx.lineTo(point.x, point.y);
    }
    ctx.fill();

    this.sensor?.draw(ctx);
  }
}
