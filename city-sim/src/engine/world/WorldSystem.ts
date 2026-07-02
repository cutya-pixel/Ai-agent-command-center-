import * as THREE from "three";
import type { BuildingDefinition } from "../../data/buildings";
import { AssetRegistry } from "../assets/AssetRegistry";
import { LightingSystem } from "../lighting/LightingSystem";

export class WorldSystem {
  constructor(
    private readonly scene: THREE.Scene,
    private readonly assets: AssetRegistry,
    private readonly lighting: LightingSystem
  ) {}

  createFirstLivingBlock(buildingData: BuildingDefinition[]): void {
    void this.lighting;

    const ground = this.assets.createMesh("ground");
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    ground.userData.category = "ground";
    this.scene.add(ground);

    const roadNS = this.assets.createMesh("road");
    roadNS.rotation.x = -Math.PI / 2;
    roadNS.position.y = 0.01;
    roadNS.userData.category = "road";
    this.scene.add(roadNS);

    const roadEW = this.assets.createMesh("road");
    roadEW.rotation.x = -Math.PI / 2;
    roadEW.rotation.z = Math.PI / 2;
    roadEW.position.y = 0.01;
    roadEW.userData.category = "road";
    this.scene.add(roadEW);

    this.scatterProps(buildingData);
  }

  private scatterProps(buildingData: BuildingDefinition[]): void {
    const occupied = buildingData.map(building => ({
      x: building.position[0],
      z: building.position[1],
      radius: Math.max(building.footprint[0], building.footprint[1]) * 0.85
    }));

    const ringRadius = 46;
    const propCount = 16;
    for (let i = 0; i < propCount; i++) {
      const angle = (i / propCount) * Math.PI * 2;
      const x = Math.cos(angle) * ringRadius;
      const z = Math.sin(angle) * ringRadius;

      const blocked = occupied.some(o => Math.hypot(o.x - x, o.z - z) < o.radius + 3);
      if (blocked) continue;

      if (i % 3 === 0) {
        this.placeLamp(x, z);
      } else {
        this.placeTree(x, z);
      }
    }
  }

  private placeTree(x: number, z: number): void {
    const group = new THREE.Group();
    const trunk = this.assets.createMesh("tree-trunk");
    trunk.position.y = 1;
    const foliage = this.assets.createMesh("tree-foliage");
    foliage.position.y = 2.6;
    group.add(trunk, foliage);
    group.position.set(x, 0, z);
    group.userData.category = "prop";
    this.scene.add(group);
  }

  private placeLamp(x: number, z: number): void {
    const group = new THREE.Group();
    const post = this.assets.createMesh("lamp-post");
    post.position.y = 1.6;
    const bulb = this.assets.createMesh("lamp-bulb");
    bulb.position.y = 3.2;
    const light = new THREE.PointLight(0xfff2c2, 0.6, 14);
    light.position.y = 3.2;
    group.add(post, bulb, light);
    group.position.set(x, 0, z);
    group.userData.category = "prop";
    this.scene.add(group);
  }
}
