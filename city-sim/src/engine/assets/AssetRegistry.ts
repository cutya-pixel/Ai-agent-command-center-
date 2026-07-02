import * as THREE from "three";
import type { AssetDefinition, AssetKind } from "../../data/assets";

export interface AssetMeshOverrides {
  color?: number;
  size?: [number, number, number];
}

function buildGeometry(kind: AssetKind, size: [number, number, number]): THREE.BufferGeometry {
  const [x, y, z] = size;
  switch (kind) {
    case "box":
      return new THREE.BoxGeometry(x, y, z);
    case "cylinder":
      return new THREE.CylinderGeometry(x / 2, x / 2, y, 12);
    case "cone":
      return new THREE.ConeGeometry(x / 2, y, 10);
    case "sphere":
      return new THREE.SphereGeometry(x / 2, 12, 12);
    case "plane":
      return new THREE.PlaneGeometry(x, y);
    default:
      throw new Error(`Unknown asset kind: ${kind}`);
  }
}

export class AssetRegistry {
  private readonly definitions = new Map<string, AssetDefinition>();
  private readonly geometryCache = new Map<string, THREE.BufferGeometry>();
  private readonly materialCache = new Map<string, THREE.Material>();

  constructor(definitions: AssetDefinition[]) {
    for (const definition of definitions) {
      this.definitions.set(definition.id, definition);
    }
  }

  get(id: string): AssetDefinition {
    const definition = this.definitions.get(id);
    if (!definition) throw new Error(`Unknown asset id: ${id}`);
    return definition;
  }

  count(): number {
    return this.definitions.size;
  }

  createMesh(id: string, overrides: AssetMeshOverrides = {}): THREE.Mesh {
    const definition = this.get(id);
    const size = overrides.size ?? definition.size;
    const color = overrides.color ?? definition.color;

    const geometryKey = `${id}:${size.join(",")}`;
    let geometry = this.geometryCache.get(geometryKey);
    if (!geometry) {
      geometry = buildGeometry(definition.kind, size);
      this.geometryCache.set(geometryKey, geometry);
    }

    const materialKey = `${id}:${color}`;
    let material = this.materialCache.get(materialKey);
    if (!material) {
      material = new THREE.MeshStandardMaterial({
        color,
        emissive: definition.emissive ?? 0x000000,
        emissiveIntensity: definition.emissiveIntensity ?? 0,
        roughness: definition.roughness ?? 0.8,
        metalness: definition.metalness ?? 0,
        side: definition.kind === "plane" ? THREE.DoubleSide : THREE.FrontSide
      });
      this.materialCache.set(materialKey, material);
    }

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    return mesh;
  }

  /** Meshes created with the same id+color share one cached material; use this to bulk-update it (e.g. window glow). */
  getSharedMaterial(id: string, overrides: AssetMeshOverrides = {}): THREE.MeshStandardMaterial | undefined {
    const definition = this.get(id);
    const color = overrides.color ?? definition.color;
    return this.materialCache.get(`${id}:${color}`) as THREE.MeshStandardMaterial | undefined;
  }
}
