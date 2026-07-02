export type AssetKind = "box" | "cylinder" | "cone" | "plane" | "sphere";

export interface AssetDefinition {
  id: string;
  kind: AssetKind;
  /** width/diameter, height, depth — interpreted per kind */
  size: [number, number, number];
  color: number;
  emissive?: number;
  emissiveIntensity?: number;
  roughness?: number;
  metalness?: number;
}

export const assetDefinitions: AssetDefinition[] = [
  { id: "ground", kind: "plane", size: [220, 220, 1], color: 0x2f6b3a, roughness: 1 },
  { id: "road", kind: "plane", size: [6, 220, 1], color: 0x30323a, roughness: 0.9 },
  { id: "wall", kind: "box", size: [1, 1, 1], color: 0xcccccc, roughness: 0.8 },
  { id: "roof", kind: "box", size: [1, 1, 1], color: 0x555555, roughness: 0.7 },
  { id: "window", kind: "plane", size: [1.1, 1.1, 1], color: 0x1b2636, emissive: 0xffdd88, emissiveIntensity: 0 },
  { id: "door-frame", kind: "box", size: [1.6, 2.4, 0.3], color: 0x3a2a1a, roughness: 0.9 },
  { id: "door-panel", kind: "box", size: [1.4, 2.2, 0.12], color: 0x8a5a2b, roughness: 0.6 },
  { id: "tree-trunk", kind: "cylinder", size: [0.4, 2, 0.4], color: 0x5b3a21, roughness: 1 },
  { id: "tree-foliage", kind: "cone", size: [1.8, 2.6, 1.8], color: 0x2d7a3f, roughness: 1 },
  { id: "lamp-post", kind: "cylinder", size: [0.15, 3.2, 0.15], color: 0x2a2c30, metalness: 0.6, roughness: 0.4 },
  { id: "lamp-bulb", kind: "sphere", size: [0.35, 0.35, 0.35], color: 0xfff2c2, emissive: 0xfff2c2, emissiveIntensity: 1 },
  { id: "floor-interior", kind: "plane", size: [1, 1, 1], color: 0x3c3f45, roughness: 0.9 },
  { id: "wall-interior", kind: "box", size: [1, 1, 0.2], color: 0xdadde3, roughness: 0.85 },
  { id: "desk", kind: "box", size: [1.6, 0.8, 0.8], color: 0x6b4a2b, roughness: 0.7 },
  { id: "chair", kind: "box", size: [0.6, 0.9, 0.6], color: 0x22242a, roughness: 0.6 },
  { id: "plant", kind: "sphere", size: [0.7, 0.7, 0.7], color: 0x2f8f4a, roughness: 1 },
  { id: "sofa", kind: "box", size: [2, 0.8, 0.9], color: 0x445a8f, roughness: 0.7 },
  { id: "rug", kind: "plane", size: [2.4, 1.6, 1], color: 0x8a2f3a, roughness: 1 },
  { id: "exit-marker", kind: "plane", size: [1.6, 1.6, 1], color: 0xffd166, emissive: 0xffd166, emissiveIntensity: 0.4 },
  { id: "citizen-body", kind: "cylinder", size: [0.5, 1.1, 0.5], color: 0xffffff, roughness: 0.7 },
  { id: "citizen-head", kind: "sphere", size: [0.4, 0.4, 0.4], color: 0xffd9b3, roughness: 0.6 }
];
