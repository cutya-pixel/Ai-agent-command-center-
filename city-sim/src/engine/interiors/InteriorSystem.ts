import * as THREE from "three";
import type { BuildingDefinition } from "../../data/buildings";
import { AssetRegistry } from "../assets/AssetRegistry";

export interface InteriorRoom {
  group: THREE.Group;
  cameraAnchor: THREE.Vector3;
  lookAt: THREE.Vector3;
}

const FURNITURE_OFFSETS: Array<[number, number]> = [
  [-1.5, -1.5],
  [1.5, -1.5],
  [-1.5, 1.5],
  [1.5, 1.5]
];

export class InteriorSystem {
  constructor(private readonly assets: AssetRegistry) {}

  createInterior(definition: BuildingDefinition): InteriorRoom {
    const [width, depth] = definition.footprint;
    const innerWidth = width - 1;
    const innerDepth = depth - 1;
    const wallHeight = Math.min(definition.height, 5);

    const group = new THREE.Group();

    const floor = this.assets.createMesh("floor-interior", { size: [innerWidth, innerDepth, 1], color: definition.interior.floorColor });
    floor.rotation.x = -Math.PI / 2;
    group.add(floor);

    const wallSpecs: Array<{ size: [number, number, number]; position: [number, number, number] }> = [
      { size: [innerWidth, wallHeight, 0.2], position: [0, wallHeight / 2, -innerDepth / 2] },
      { size: [innerWidth, wallHeight, 0.2], position: [0, wallHeight / 2, innerDepth / 2] },
      { size: [0.2, wallHeight, innerDepth], position: [-innerWidth / 2, wallHeight / 2, 0] },
      { size: [0.2, wallHeight, innerDepth], position: [innerWidth / 2, wallHeight / 2, 0] }
    ];
    for (const spec of wallSpecs) {
      const wall = this.assets.createMesh("wall-interior", { size: spec.size, color: definition.interior.wallColor });
      wall.position.set(...spec.position);
      group.add(wall);
    }

    definition.interior.furniture.forEach((pieceId, index) => {
      const offset = FURNITURE_OFFSETS[index % FURNITURE_OFFSETS.length];
      const clampedOffset: [number, number] = [
        THREE.MathUtils.clamp(offset[0], -innerWidth / 2 + 1, innerWidth / 2 - 1),
        THREE.MathUtils.clamp(offset[1], -innerDepth / 2 + 1, innerDepth / 2 - 1)
      ];
      const piece = this.assets.createMesh(pieceId);
      const pieceHeight = this.assets.get(pieceId).size[1];
      piece.position.set(clampedOffset[0], pieceId === "rug" ? 0.02 : pieceHeight / 2, clampedOffset[1]);
      if (pieceId === "rug") piece.rotation.x = -Math.PI / 2;
      group.add(piece);
    });

    const exitMarker = this.assets.createMesh("exit-marker");
    exitMarker.rotation.x = -Math.PI / 2;
    exitMarker.position.set(0, 0.03, innerDepth / 2 - 1);
    exitMarker.userData.category = "exit";
    group.add(exitMarker);

    const cameraAnchor = new THREE.Vector3(0, wallHeight * 0.7, innerDepth / 2 - 0.5);
    const lookAt = new THREE.Vector3(0, wallHeight * 0.4, -innerDepth / 2);

    return { group, cameraAnchor, lookAt };
  }
}
