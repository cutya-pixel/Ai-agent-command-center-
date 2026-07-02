import * as THREE from "three";
import type { BuildingDefinition, DoorSide } from "../../data/buildings";
import { AssetRegistry } from "../assets/AssetRegistry";

const OPEN_ANGLE = Math.PI / 2.2;
const SWING_SPEED = Math.PI; // radians per second
const AUTO_CLOSE_SECONDS = 3;

interface DoorEntry {
  pivot: THREE.Group;
  targetAngle: number;
  autoCloseTimer: number;
}

export function doorSideOffset(side: DoorSide, footprint: [number, number]): { position: [number, number]; rotationY: number } {
  const halfW = footprint[0] / 2;
  const halfD = footprint[1] / 2;
  switch (side) {
    case "north":
      return { position: [0, -halfD], rotationY: 0 };
    case "south":
      return { position: [0, halfD], rotationY: Math.PI };
    case "east":
      return { position: [halfW, 0], rotationY: -Math.PI / 2 };
    case "west":
      return { position: [-halfW, 0], rotationY: Math.PI / 2 };
  }
}

export class DoorSystem {
  private readonly doors = new Map<string, DoorEntry>();

  constructor(private readonly assets: AssetRegistry) {}

  createDoor(buildingId: string, definition: BuildingDefinition): THREE.Group {
    const { position, rotationY } = doorSideOffset(definition.doorSide, definition.footprint);

    const anchor = new THREE.Group();
    anchor.position.set(position[0], 0, position[1]);
    anchor.rotation.y = rotationY;

    const frame = this.assets.createMesh("door-frame");
    frame.position.y = 1.2;
    anchor.add(frame);

    const pivot = new THREE.Group();
    pivot.position.set(-0.7, 0, 0.16);
    anchor.add(pivot);

    const panel = this.assets.createMesh("door-panel");
    panel.position.set(0.7, 1.1, 0);
    panel.userData.category = "door";
    panel.userData.buildingId = buildingId;
    pivot.add(panel);

    anchor.userData.category = "door";
    anchor.userData.buildingId = buildingId;

    this.doors.set(buildingId, { pivot, targetAngle: 0, autoCloseTimer: 0 });
    return anchor;
  }

  open(buildingId: string): void {
    const door = this.doors.get(buildingId);
    if (!door) return;
    door.targetAngle = OPEN_ANGLE;
    door.autoCloseTimer = AUTO_CLOSE_SECONDS;
  }

  close(buildingId: string): void {
    const door = this.doors.get(buildingId);
    if (!door) return;
    door.targetAngle = 0;
  }

  update(_minute: number, deltaSeconds: number): void {
    for (const door of this.doors.values()) {
      if (door.targetAngle > 0) {
        door.autoCloseTimer -= deltaSeconds;
        if (door.autoCloseTimer <= 0) door.targetAngle = 0;
      }

      const current = door.pivot.rotation.y;
      const diff = door.targetAngle - current;
      if (Math.abs(diff) < 0.001) {
        door.pivot.rotation.y = door.targetAngle;
        continue;
      }
      const step = Math.sign(diff) * Math.min(Math.abs(diff), SWING_SPEED * deltaSeconds);
      door.pivot.rotation.y = current + step;
    }
  }
}
