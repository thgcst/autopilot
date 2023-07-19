const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
document.getElementById("generation").innerText =
  "Geração: " + localStorage.getItem("generation");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
const spot = new Spot(road.getLaneCenter(2), -160, 60, 40);

const N = 100;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i in cars) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.1);
    }
  }
}

const traffic = [
  new Car(road.getLaneCenter(2), -0, 50, 30, "DUMMY"),
  new Car(road.getLaneCenter(2), -40, 50, 30, "DUMMY"),
  new Car(road.getLaneCenter(2), -80, 50, 30, "DUMMY"),
  new Car(road.getLaneCenter(2), -120, 50, 30, "DUMMY"),
  new Car(road.getLaneCenter(2), -200, 50, 30, "DUMMY"),
  // new Car(road.getLaneCenter(1), -500, 30, 250, "DUMMY", 2),
  // new Car(road.getLaneCenter(2), -400, 30, 50, "DUMMY", 2),
  // new Car(road.getLaneCenter(0), -800, 30, 50, "DUMMY", 2),
  // new Car(road.getLaneCenter(1), -900, 30, 50, "DUMMY", 2),
  // new Car(road.getLaneCenter(2), -1100, 30, 50, "DUMMY", 2),
  // new Car(road.getLaneCenter(0), -1200, 30, 50, "DUMMY", 2),
  // new Car(road.getLaneCenter(1), -1300, 30, 50, "DUMMY", 2),
];

animate();

function save() {
  localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
}

function discard() {
  localStorage.removeItem("bestBrain");
}

function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function animate(time) {
  for (let trafficCar of traffic) {
    trafficCar.update(road.borders, [], spot.polygon);
  }
  for (let car of cars) {
    car.update(road.borders, traffic, spot.polygon);
  }

  bestCar =
    cars
      .filter((c) => c.parked)
      .find(
        (c, _, obj) =>
          c.sensor.squareDistances ==
          Math.min(...obj.map((c) => c.sensor.squareDistances))
      ) ||
    cars.reduce(
      (acm, c) => (c.distanceToSpot < acm.distanceToSpot ? c : acm),
      cars[0]
    );

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, carCanvas.height * 0.5);

  road.draw(carCtx);
  spot.draw(carCtx);

  for (let trafficCar of traffic) {
    trafficCar.draw(carCtx, "red");
  }
  carCtx.globalAlpha = 0.2;
  for (let car of cars) {
    car.draw(carCtx, "blue");
  }
  carCtx.globalAlpha = 1;
  bestCar.draw(carCtx, "blue", true);

  carCtx.restore();

  networkCtx.lineDashOffset = -time / 50;
  Visualizer.drawNetwork(networkCtx, bestCar.brain);
  requestAnimationFrame(animate);

  if (time > 10000 || cars.every((c) => c.damaged)) {
    save();
    localStorage.setItem(
      "generation",
      (Number(localStorage.getItem("generation")) || 0) + 1
    );
    location.reload();
  }
}
