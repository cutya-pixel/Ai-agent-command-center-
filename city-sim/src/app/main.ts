import * as THREE from "three";
import "../styles.css";
import { assetDefinitions } from "../data/assets";
import { buildings as buildingData } from "../data/buildings";
import { citizens as citizenData } from "../data/citizens";
import { AssetRegistry } from "../engine/assets/AssetRegistry";
import { BuildingEngine } from "../engine/buildings/BuildingEngine";
import { BuildModeSystem } from "../engine/buildMode/BuildModeSystem";
import { CityCamera } from "../engine/camera/CityCamera";
import { CitizenSystem } from "../engine/citizens/CitizenSystem";
import { DoorSystem } from "../engine/doors/DoorSystem";
import { FounderInteriorEntrySystem } from "../engine/interiors/FounderInteriorEntrySystem";
import { InteriorSystem } from "../engine/interiors/InteriorSystem";
import { LightingSystem } from "../engine/lighting/LightingSystem";
import { PathNetwork } from "../engine/navigation/PathNetwork";
import { TimeSystem } from "../engine/time/TimeSystem";
import { Dashboard } from "../engine/ui/Dashboard";
import { WorldSystem } from "../engine/world/WorldSystem";

const app = document.querySelector<HTMLDivElement>("#app");
if (!app) throw new Error("App root not found");

app.innerHTML = `
  <main class="shell">
    <section id="viewport" class="viewport"></section>
    <aside class="dashboard">
      <div id="dashboard"></div>
      <div class="time-controls" aria-label="Time controls">
        <button type="button" data-speed="1">1x</button>
        <button type="button" data-speed="2">2x</button>
        <button type="button" data-speed="4">4x</button>
      </div>
      <button id="cityButton" type="button">City View</button>
      <div id="interiorButtons" class="button-list"></div>
    </aside>
  </main>
`;

const viewport = document.querySelector<HTMLElement>("#viewport");
const dashboardRoot = document.querySelector<HTMLElement>("#dashboard");
const timeControls = document.querySelector<HTMLElement>(".time-controls");
const cityButton = document.querySelector<HTMLButtonElement>("#cityButton");
const interiorButtons = document.querySelector<HTMLElement>("#interiorButtons");
if (!viewport || !dashboardRoot || !timeControls || !cityButton || !interiorButtons) throw new Error("UI shell failed");
const viewportElement = viewport;
const dashboardElement = dashboardRoot;
const timeControlsElement = timeControls;
const cityButtonElement = cityButton;
const interiorButtonsElement = interiorButtons;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
viewportElement.appendChild(renderer.domElement);

const clock = new THREE.Clock();
const time = new TimeSystem(360);
const assets = new AssetRegistry(assetDefinitions);
const lighting = new LightingSystem(scene);
const world = new WorldSystem(scene, assets, lighting);
const doors = new DoorSystem(assets);
const interiors = new InteriorSystem(assets);
const buildings = new BuildingEngine(scene, assets, doors, interiors);
const paths = new PathNetwork();
const citizens = new CitizenSystem(scene, buildings, doors, paths);
const cityCamera = new CityCamera(camera, renderer.domElement);
const buildMode = new BuildModeSystem(scene, camera, renderer.domElement, cityCamera);
const founderEntry = new FounderInteriorEntrySystem(camera, renderer.domElement, cityCamera, buildings, doors);
const dashboard = new Dashboard(dashboardElement);

world.createFirstLivingBlock(buildingData);
buildings.createBuildings(buildingData);
citizens.createCitizens(citizenData);
renderInteriorButtons();
resize();
animate();

window.addEventListener("resize", resize);
window.addEventListener("keydown", event => {
  if (event.key === "1") time.setSpeed(1);
  if (event.key === "2") time.setSpeed(2);
  if (event.key === "3") time.setSpeed(4);
});
timeControlsElement.addEventListener("click", event => {
  const button = event.target instanceof HTMLButtonElement ? event.target : null;
  const speed = Number(button?.dataset.speed);
  if (speed) time.setSpeed(speed);
});
cityButtonElement.addEventListener("click", () => {
  founderEntry.exit();
});
renderer.domElement.addEventListener("pointerdown", event => {
  if (buildMode.isDragging()) return;
  if (founderEntry.handlePointerDown(event, time.getMinute())) {
    event.preventDefault();
    event.stopPropagation();
  }
}, { capture: true });
renderer.domElement.addEventListener("dblclick", event => {
  const buildingId = pickBuildingId(event);
  if (buildingId) founderEntry.enter(buildingId, time.getMinute());
});

function animate(): void {
  requestAnimationFrame(animate);
  const deltaSeconds = Math.min(clock.getDelta(), 0.05);
  time.update(deltaSeconds);
  lighting.update(time.getMinute());
  doors.update(time.getMinute(), deltaSeconds);
  citizens.update(time.getMinute(), deltaSeconds);
  buildings.updateWindowGlow(time.getMinute());
  cityCamera.update(deltaSeconds);
  buildMode.update();
  syncTimeControls();
  cityButtonElement.textContent = founderEntry.getActiveBuildingId() ? "Exit Interior" : "City View";
  dashboard.render(time, citizens, buildings, founderEntry.getActiveBuildingId(), buildMode, assets);
  renderer.render(scene, camera);
}

function resize(): void {
  const width = Math.max(320, viewportElement.clientWidth);
  const height = Math.max(320, viewportElement.clientHeight);
  renderer.setSize(width, height, false);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

function renderInteriorButtons(): void {
  interiorButtonsElement.innerHTML = "";
  for (const building of buildingData) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = building.name;
    button.addEventListener("click", () => founderEntry.enter(building.id, time.getMinute()));
    interiorButtonsElement.appendChild(button);
  }
}

function syncTimeControls(): void {
  for (const button of timeControlsElement.querySelectorAll<HTMLButtonElement>("button")) {
    button.classList.toggle("active", Number(button.dataset.speed) === time.getSpeed());
  }
}

function pickBuildingId(event: MouseEvent): string | null {
  const rect = renderer.domElement.getBoundingClientRect();
  const pointer = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(scene.children, true).find(result => {
    if (!isVisibleInScene(result.object)) return false;
    const category = findUserData(result.object, "category");
    return category === "building" || category === "door";
  });
  return hit ? String(findUserData(hit.object, "buildingId") ?? "") || null : null;
}

function findUserData(object: THREE.Object3D, key: string): unknown {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (current.userData[key] !== undefined) return current.userData[key];
    current = current.parent;
  }
  return undefined;
}

function isVisibleInScene(object: THREE.Object3D): boolean {
  let current: THREE.Object3D | null = object;
  while (current) {
    if (!current.visible) return false;
    current = current.parent;
  }
  return true;
}
