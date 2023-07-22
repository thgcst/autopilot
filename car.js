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

    this.useBrain = controlType === "AI";

    if (controlType !== "DUMMY") {
      this.sensor = new Sensor(this);
      this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4]);
    }
    this.controls = new Controls(controlType);
  }

  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }

    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);
      const offsets = this.sensor.readings.map((s) =>
        s == null ? 0 : 1 - s.offset
      );
      const outputs = NeuralNetwork.feedForward(offsets, this.brain);

      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
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
      this.speed += lerp(0, this.acceleration, this.controls.forward);
    }
    if (this.controls.reverse) {
      this.speed -= lerp(0, this.acceleration, this.controls.reverse);
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
        this.angle +=
          lerp(0, 0.03, this.controls.left) * (this.speed > 0 ? 1 : -1);
      }
      if (this.controls.right) {
        this.angle -=
          lerp(0, 0.03, this.controls.right) * (this.speed > 0 ? 1 : -1);
      }
    }

    this.x -= this.speed * Math.sin(this.angle);
    this.y -= this.speed * Math.cos(this.angle);
  }

  draw(ctx, color, drawSensor = false) {
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

    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
  }

  static getBestBrain() {
    const brains = localStorage.getItem("bestBrain");
    return JSON.parse(brains);
  }

  save() {
    const bestBrain = Car.getBestBrain();
    if (bestBrain) {
      Car.crossover(bestBrain, this.brain);
      localStorage.setItem("bestBrain", JSON.stringify(this.brain));
    } else {
      localStorage.setItem("bestBrain", JSON.stringify(this.brain));
    }
  }

  static discardBestBrain() {
    localStorage.removeItem("bestBrain");
  }

  static crossover(brain1, brain2) {
    for (let level in brain1) {
      for (let i in level.biases) {
        const biasAverage =
          (brain1[level].biases[i] + brain2[level].biases[i]) / 2;
        brain1[level].biases[i] = biasAverage;
        // brain2[level].biases[i] = biasAverage;
      }
      for (let i in brain1[level].weights) {
        for (let j in brain1[level].weights[i]) {
          const weightAverage =
            (brain1[level].weights[i][j] + brain2[level].weights[i][j]) / 2;
          brain1[level].weights[i][j] = weightAverage;
          // brain2[level].weights[i][j] = weightAverage;
        }
      }
    }
  }
}
