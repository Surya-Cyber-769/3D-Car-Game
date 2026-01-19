// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  2000
);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Light
const sun = new THREE.DirectionalLight(0xffffff, 1);
sun.position.set(0, 10, 5);
scene.add(sun);
scene.add(new THREE.AmbientLight(0x404040));

// Road
const road = new THREE.Mesh(
  new THREE.PlaneGeometry(50, 5000),
  new THREE.MeshStandardMaterial({ color: 0x333333 })
);
road.rotation.x = -Math.PI / 2;
scene.add(road);

// Player Car
const car = new THREE.Mesh(
  new THREE.BoxGeometry(1, 0.5, 2),
  new THREE.MeshStandardMaterial({ color: 0xff0000 })
);
car.position.y = 0.3;
scene.add(car);

// AI Cars
const aiCars = [];
for (let i = 0; i < 15; i++) {
  const ai = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.5, 2),
    new THREE.MeshStandardMaterial({ color: 0x00ff00 })
  );
  ai.position.set((Math.random() * 6) - 3, 0.3, -50 - i * 40);
  scene.add(ai);
  aiCars.push(ai);
}

// Camera Position
camera.position.set(0, 4, 7);

// Audio
const engine = new Audio("assets/sounds/engine.mp3");
engine.loop = true;

const bg = new Audio("assets/sounds/bg.mp3");
bg.loop = true;
bg.volume = 0.4;
bg.play();

const nitroSound = new Audio("assets/sounds/nitro.mp3");

// Game State
let speed = 0;
let distance = 0;
let score = 0;
let paused = false;
let night = false;
let nitroReady = true;
const keys = {};

// Input
window.onkeydown = e => {
  keys[e.key] = true;
  engine.play();
};

window.onkeyup = e => keys[e.key] = false;

// Controls
function pauseGame() {
  paused = !paused;
}

function restartGame() {
  location.reload();
}

function toggleNight() {
  night = !night;
  sun.intensity = night ? 0.2 : 1;
  scene.background = new THREE.Color(night ? 0x000011 : 0x87ceeb);
}

function useNitro() {
  if (!nitroReady) return;
  nitroReady = false;
  nitroSound.play();
  speed += 1.5;
  nitro.innerText = "COOLDOWN";
  setTimeout(() => {
    nitroReady = true;
    nitro.innerText = "READY";
  }, 3000);
}

// Collision
function collide(a, b) {
  return (
    Math.abs(a.position.z - b.position.z) < 1.5 &&
    Math.abs(a.position.x - b.position.x) < 1
  );
}

// Loop
function animate() {
  requestAnimationFrame(animate);
  if (paused) return;

  if (keys.w) speed += 0.03;
  if (keys.s) speed -= 0.03;
  if (keys.a) car.rotation.y += 0.04;
  if (keys.d) car.rotation.y -= 0.04;

  speed *= 0.98;
  speed = Math.min(speed, 2);
  car.translateZ(-speed);

  camera.position.z = car.position.z + 7;
  camera.position.x = car.position.x;
  camera.lookAt(car.position);

  aiCars.forEach(ai => {
    ai.position.z += 0.15;
    if (ai.position.z > car.position.z + 10) {
      ai.position.z = car.position.z - 300;
      ai.position.x = (Math.random() * 6) - 3;
    }
    if (collide(car, ai)) {
      alert("💥 Crash!");
      restartGame();
    }
  });

  distance += Math.abs(speed);
  score = Math.floor(distance);

  speedEl.innerText = Math.abs(speed * 100).toFixed(0);
  distanceEl.innerText = distance.toFixed(0);
  scoreEl.innerText = score;

  renderer.render(scene, camera);
}
animate();

// Resize
window.onresize = () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
};

// HUD refs
const speedEl = document.getElementById("speed");
const distanceEl = document.getElementById("distance");
const scoreEl = document.getElementById("score");
const nitro = document.getElementById("nitro");
