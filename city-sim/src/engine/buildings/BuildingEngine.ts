import * as THREE from "three";
import type { BuildingDefinition } from "../../data/buildings";
import { AssetRegistry } from "../assets/AssetRegistry";
import { DoorSystem, doorSideOffset } from "../doors/DoorSystem";
import { InteriorSystem, InteriorRoom } from "../interiors/InteriorSystem";

interface BuildingEntry {
  definition: BuildingDefinition;
  group: THREE.Group;
  interior: InteriorRoom;
  entryPoint: THREE.Vector3;
  exteriorViewpoint: THREE.Vector3;
}

const INTERIOR_STAGE_HEIGHT = 500;

export class BuildingEngine {
  private readonly entries = new Map<string, BuildingEntry>();

  constructor(
    private readonly scene: THREE.Scene,
    private readonly assets: AssetRegistry,
    private readonly doors: DoorSystem,
    private readonly interiors: InteriorSystem
  ) {}

  createBuildings(buildingData: BuildingDefinition[]): void {
    buildingData.forEach((definition, index) => {
      const group = this.buildExterior(definition);
      group.position.set(definition.position[0], 0, definition.position[1]);
      group.userData.category = "building";
      group.userData.buildingId = definition.id;
      this.scene.add(group);

      const doorGroup = this.doors.createDoor(definition.id, definition);
      group.add(doorGroup);

      const interior = this.interiors.createInterior(definition);
      interior.group.position.set(definition.position[0], INTERIOR_STAGE_HEIGHT + index * 40, definition.position[1]);
      interior.group.visible = false;
      this.scene.add(interior.group);

      const doorOffset = doorSideOffset(definition.doorSide, definition.footprint);
      const entryPoint = new THREE.Vector3(
        definition.position[0] + doorOffset.position[0] * 1.6,
        0,
        definition.position[1] + doorOffset.position[1] * 1.6
      );
      const exteriorViewpoint = new THREE.Vector3(
        definition.position[0] + doorOffset.position[0] * 3.5,
        definition.height * 0.8,
        definition.position[1] + doorOffset.position[1] * 3.5
      );

      this.entries.set(definition.id, { definition, group, interior, entryPoint, exteriorViewpoint });
    });
  }

  private buildExterior(definition: BuildingDefinition): THREE.Group {
    const group = new THREE.Group();
    const [width, depth] = definition.footprint;

    const walls = this.assets.createMesh("wall", { size: [width, definition.height, depth], color: definition.color });
    walls.position.y = definition.height / 2;
    group.add(walls);

    const roof = this.assets.createMesh("roof", { size: [width + 1, 1, depth + 1], color: definition.roofColor });
    roof.position.y = definition.height + 0.5;
    group.add(roof);

    for (let i = 0; i < definition.windowCount; i++) {
      const window = this.assets.createMesh("window");
      const side = i % 4;
      const along = (Math.floor(i / 4) + 1) * 1.6 - width / 2.4;
      const y = definition.height * 0.6;
      if (side === 0) {
        window.position.set(along, y, depth / 2 + 0.01);
      } else if (side === 1) {
        window.position.set(along, y, -depth / 2 - 0.01);
        window.rotation.y = Math.PI;
      } else if (side === 2) {
        window.position.set(width / 2 + 0.01, y, along);
        window.rotation.y = -Math.PI / 2;
      } else {
        window.position.set(-width / 2 - 0.01, y, along);
        window.rotation.y = Math.PI / 2;
      }
      window.userData.category = "window";
      group.add(window);
    }

    return group;
  }

  updateWindowGlow(minute: number): void {
    const lit = minute < 6 * 60 || minute > 18 * 60;
    const material = this.assets.getSharedMaterial("window");
    if (material) material.emissiveIntensity = lit ? 1 : 0;
  }

  getBuildingIds(): string[] {
    return Array.from(this.entries.keys());
  }

  getBuildingCount(): number {
    return this.entries.size;
  }

  getDefinition(buildingId: string): BuildingDefinition | undefined {
    return this.entries.get(buildingId)?.definition;
  }

  getInteriorGroup(buildingId: string): THREE.Group | undefined {
    return this.entries.get(buildingId)?.interior.group;
  }

  getInteriorAnchors(buildingId: string): { cameraAnchor: THREE.Vector3; lookAt: THREE.Vector3 } | undefined {
    const entry = this.entries.get(buildingId);
    if (!entry) return undefined;
    return {
      cameraAnchor: entry.interior.group.position.clone().add(entry.interior.cameraAnchor),
      lookAt: entry.interior.group.position.clone().add(entry.interior.lookAt)
    };
  }

  getEntryPoint(buildingId: string): THREE.Vector3 | undefined {
    return this.entries.get(buildingId)?.entryPoint.clone();
  }

  getExteriorViewpoint(buildingId: string): THREE.Vector3 | undefined {
    return this.entries.get(buildingId)?.exteriorViewpoint.clone();
  }

  hideAllInteriors(): void {
    for (const entry of this.entries.values()) entry.interior.group.visible = false;
  }
}
