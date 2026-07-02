import * as THREE from "three";
import { CityCamera } from "../camera/CityCamera";

const GROUND_PLANE = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);

export class BuildModeSystem {
  private active = false;
  private dragging = false;
  private draggedObject: THREE.Object3D | null = null;

  private readonly raycaster = new THREE.Raycaster();
  private readonly pointerNdc = new THREE.Vector2();
  private readonly dragPoint = new THREE.Vector3();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly camera: THREE.PerspectiveCamera,
    private readonly domElement: HTMLElement,
    private readonly cityCamera: CityCamera
  ) {
    window.addEventListener("keydown", this.onKeyDown);
    domElement.addEventListener("pointerdown", this.onPointerDown);
    domElement.addEventListener("pointermove", this.onPointerMove);
    window.addEventListener("pointerup", this.onPointerUp);
  }

  private onKeyDown = (event: KeyboardEvent): void => {
    if (event.key.toLowerCase() === "b") {
      this.active = !this.active;
      if (!this.active) this.stopDragging();
    }
  };

  private updatePointerNdc(event: PointerEvent): void {
    const rect = this.domElement.getBoundingClientRect();
    this.pointerNdc.set(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
  }

  private onPointerDown = (event: PointerEvent): void => {
    if (!this.active) return;
    this.updatePointerNdc(event);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    const hit = this.raycaster.intersectObjects(this.scene.children, true).find(result => this.findDraggable(result.object));
    if (!hit) return;

    this.draggedObject = this.findDraggable(hit.object);
    if (this.draggedObject) {
      this.dragging = true;
      this.cityCamera.setEnabled(false);
    }
  };

  private onPointerMove = (event: PointerEvent): void => {
    if (!this.active || !this.dragging || !this.draggedObject) return;
    this.updatePointerNdc(event);
    this.raycaster.setFromCamera(this.pointerNdc, this.camera);
    if (this.raycaster.ray.intersectPlane(GROUND_PLANE, this.dragPoint)) {
      this.draggedObject.position.x = this.dragPoint.x;
      this.draggedObject.position.z = this.dragPoint.z;
    }
  };

  private onPointerUp = (): void => {
    this.stopDragging();
  };

  private stopDragging(): void {
    this.dragging = false;
    this.draggedObject = null;
    this.cityCamera.setEnabled(true);
  }

  private findDraggable(object: THREE.Object3D): THREE.Object3D | null {
    let current: THREE.Object3D | null = object;
    while (current) {
      if (current.userData.category === "prop") return current;
      current = current.parent;
    }
    return null;
  }

  update(): void {}

  isActive(): boolean {
    return this.active;
  }

  isDragging(): boolean {
    return this.dragging;
  }
}
