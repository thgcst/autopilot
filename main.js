const carCanvas = document.getElementById("carCanvas");
carCanvas.width = 200;
const networkCanvas = document.getElementById("networkCanvas");
networkCanvas.width = 300;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

const road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

const N = 1000;
const cars = generateCars(N);
let bestCar = cars[0];
if (localStorage.getItem("bestBrain")) {
  for (let i in cars) {
    cars[i].brain = JSON.parse(localStorage.getItem("bestBrain"));
    if (i != 0) {
      NeuralNetwork.mutate(cars[i].brain, 0.05);
    }
  }
}

const traffic = [];

function increaseTraffic() {
  for (let i = 0; i < 10; i++) {
    const carsOnRow = weightedRand({ 1: 0.3, 2: 0.7 });
    for (let lane of getRandomNumbers(carsOnRow, road.laneCount)) {
      traffic.push(
        new Car(road.getLaneCenter(lane), -i * 150, 35, 50, "DUMMY", 2)
      );
    }
  }
}
increaseTraffic();

animate();

function generateCars(N) {
  const cars = [];
  for (let i = 1; i <= N; i++) {
    cars.push(new Car(road.getLaneCenter(1), 100, 30, 50, "AI"));
  }
  return cars;
}

function animate(time) {
  for (let trafficCar of traffic) {
    trafficCar.update(road.borders, []);
  }
  for (let car of cars) {
    car.update(road.borders, traffic);
  }

  bestCar = cars.find((c) => c.y == Math.min(...cars.map((c) => c.y)));

  carCanvas.height = window.innerHeight;
  networkCanvas.height = window.innerHeight;

  carCtx.save();
  carCtx.translate(0, -bestCar.y + carCanvas.height * 0.7);

  road.draw(carCtx);
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
}
