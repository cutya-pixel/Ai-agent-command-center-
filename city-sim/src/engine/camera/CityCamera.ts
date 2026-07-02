import * as THREE from "three";

const MIN_RADIUS = 12;
const MAX_RADIUS = 90;
const MIN_PHI = 0.15;
const MAX_PHI = Math.PI / 2 - 0.05;
const DAMPING = 8;

export class CityCamera {
  private readonly target = new THREE.Vector3(0, 0, 0);
  private radius = 45;
  private theta = Math.PI / 4;
  private phi = Math.PI / 3.2;

  private targetRadius = this.radius;
  private targetTheta = this.theta;
  private targetPhi = this.phi;

  private enabled = true;
  private dragging = false;
  private lastX = 0;
  private lastY = 0;

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    domElement: HTMLElement
  ) {
    domElement.addEventListener("pointerdown", this.onPointerDown);
    domElement.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
    domElement.addEventListener("wheel", this.onWheel, { passive: false });
    this.applyImmediate();
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.enabled || event.button !== 0) return;
    this.dragging = true;
    this.lastX = event.clientX;
    this.lastY = event.clientY;
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.enabled || !this.dragging) return;
    const dx = event.clientX - this.lastX;
    const dy = event.clientY - this.lastY;
    this.lastX = event.clientX;
    this.lastY = event.clientY;

    this.targetTheta -= dx * 0.005;
    this.targetPhi = THREE.MathUtils.clamp(this.targetPhi - dy * 0.005, MIN_PHI, MAX_PHI);
  };

  private onPointerUp = (): void => {
    this.dragging = false;
  };

  private onWheel = (event: WheelEvent): void => {
    if (!this.enabled) return;
    event.preventDefault();
    this.targetRadius = THREE.MathUtils.clamp(this.targetRadius + event.deltaY * 0.05, MIN_RADIUS, MAX_RADIUS);
  };

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.dragging = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  update(deltaSeconds: number): void {
    if (!this.enabled) return;
    const lerpFactor = 1 - Math.exp(-DAMPING * deltaSeconds);
    this.radius = THREE.MathUtils.lerp(this.radius, this.targetRadius, lerpFactor);
    this.theta = THREE.MathUtils.lerp(this.theta, this.targetTheta, lerpFactor);
    this.phi = THREE.MathUtils.lerp(this.phi, this.targetPhi, lerpFactor);
    this.applyImmediate();
  }

  private applyImmediate(): void {
    const sinPhi = Math.sin(this.phi);
    this.camera.position.set(
      this.target.x + this.radius * sinPhi * Math.cos(this.theta),
      this.target.y + this.radius * Math.cos(this.phi),
      this.target.z + this.radius * sinPhi * Math.sin(this.theta)
    );
    this.camera.lookAt(this.target);
  }
}
