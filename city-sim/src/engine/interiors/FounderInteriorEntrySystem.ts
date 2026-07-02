import * as THREE from "three";
import { BuildingEngine } from "../buildings/BuildingEngine";
import { CityCamera } from "../camera/CityCamera";
import { DoorSystem } from "../doors/DoorSystem";

export class FounderInteriorEntrySystem {
  private activeBuildingId: string | null = null;
  private readonly raycaster = new THREE.Raycaster();

  constructor(
    private readonly camera: THREE.PerspectiveCamera,
    private readonly domElement: HTMLElement,
    private readonly cityCamera: CityCamera,
    private readonly buildings: BuildingEngine,
    private readonly doors: DoorSystem
  ) {}

  enter(buildingId: string, _minute: number): void {
    if (this.activeBuildingId === buildingId) return;

    const interiorGroup = this.buildings.getInteriorGroup(buildingId);
    const anchors = this.buildings.getInteriorAnchors(buildingId);
    if (!interiorGroup || !anchors) return;

    if (this.activeBuildingId) {
      this.doors.close(this.activeBuildingId);
    }
    this.buildings.hideAllInteriors();

    this.doors.open(buildingId);
    interiorGroup.visible = true;

    this.cityCamera.setEnabled(false);
    this.camera.position.copy(anchors.cameraAnchor);
    this.camera.lookAt(anchors.lookAt);

    this.activeBuildingId = buildingId;
  }

  exit(): void {
    if (!this.activeBuildingId) return;
    this.doors.close(this.activeBuildingId);
    this.buildings.hideAllInteriors();
    this.cityCamera.setEnabled(true);
    this.activeBuildingId = null;
  }

  handlePointerDown(event: PointerEvent, _minute: number): boolean {
    if (!this.activeBuildingId) return false;

    const interiorGroup = this.buildings.getInteriorGroup(this.activeBuildingId);
    if (!interiorGroup) return false;

    const rect = this.domElement.getBoundingClientRect();
    const pointer = new THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1
    );
    this.raycaster.setFromCamera(pointer, this.camera);
    const hit = this.raycaster.intersectObject(interiorGroup, true).find(result => result.object.userData.category === "exit");
    if (!hit) return false;

    this.exit();
    return true;
  }

  getActiveBuildingId(): string | null {
    return this.activeBuildingId;
  }
}
