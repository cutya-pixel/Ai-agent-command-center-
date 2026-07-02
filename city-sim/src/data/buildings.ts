export type DoorSide = "north" | "south" | "east" | "west";

export interface BuildingInteriorDefinition {
  floorColor: number;
  wallColor: number;
  furniture: string[];
}

export interface BuildingDefinition {
  id: string;
  name: string;
  agent: string;
  position: [number, number];
  footprint: [number, number];
  height: number;
  color: number;
  roofColor: number;
  windowCount: number;
  doorSide: DoorSide;
  interior: BuildingInteriorDefinition;
}

function facingCenterSide(x: number, z: number): DoorSide {
  if (Math.abs(x) >= Math.abs(z)) return x > 0 ? "west" : "east";
  return z > 0 ? "north" : "south";
}

interface AgentDefinition {
  id: string;
  name: string;
  agent: string;
  color: number;
  roofColor: number;
  furniture: string[];
}

const AGENT_RING: AgentDefinition[] = [
  { id: "print", name: "E-Commerce Bay", agent: "PRINT", color: 0xd9822b, roofColor: 0x8a4b12, furniture: ["desk", "chair", "plant"] },
  { id: "fl3x", name: "Music Studio", agent: "FL3X", color: 0x6f42c1, roofColor: 0x3d2266, furniture: ["desk", "chair", "sofa"] },
  { id: "design", name: "Design Studio", agent: "DESIGN", color: 0xe0559b, roofColor: 0x7a2a52, furniture: ["desk", "chair", "plant"] },
  { id: "build", name: "Construction Yard", agent: "BUILD", color: 0x4c8bf5, roofColor: 0x25467a, furniture: ["desk", "chair"] },
  { id: "terabyte", name: "Server Bay", agent: "TERABYTE", color: 0x2fb380, roofColor: 0x1a5c40, furniture: ["desk", "chair", "plant"] },
  { id: "coins", name: "Treasury Vault", agent: "COINS", color: 0xd4af37, roofColor: 0x7a5f10, furniture: ["desk", "chair", "rug"] },
  { id: "buff", name: "Security Bunker", agent: "BUFF", color: 0x5a5f66, roofColor: 0x2c2f33, furniture: ["desk", "chair"] }
];

const RING_RADIUS = 30;

const ringBuildings: BuildingDefinition[] = AGENT_RING.map((entry, index) => {
  const angle = (index / AGENT_RING.length) * Math.PI * 2 - Math.PI / 2;
  const x = Math.round(Math.cos(angle) * RING_RADIUS * 10) / 10;
  const z = Math.round(Math.sin(angle) * RING_RADIUS * 10) / 10;
  return {
    id: entry.id,
    name: entry.name,
    agent: entry.agent,
    position: [x, z],
    footprint: [10, 10],
    height: 8,
    color: entry.color,
    roofColor: entry.roofColor,
    windowCount: 4,
    doorSide: facingCenterSide(x, z),
    interior: {
      floorColor: 0x3c3f45,
      wallColor: entry.color,
      furniture: entry.furniture
    }
  };
});

const hubBuilding: BuildingDefinition = {
  id: "hub",
  name: "Central Command Hub",
  agent: "BLIFF",
  position: [0, 0],
  footprint: [16, 16],
  height: 12,
  color: 0xdba514,
  roofColor: 0x6e5209,
  windowCount: 6,
  doorSide: "south",
  interior: {
    floorColor: 0x3c3f45,
    wallColor: 0xdba514,
    furniture: ["desk", "chair", "rug", "plant"]
  }
};

const relaxBuilding: BuildingDefinition = {
  id: "relax",
  name: "Relaxation Lounge",
  agent: "ALL",
  position: [0, -34],
  footprint: [14, 10],
  height: 6,
  color: 0x2aa6a0,
  roofColor: 0x15514e,
  windowCount: 5,
  doorSide: "north",
  interior: {
    floorColor: 0x3c3f45,
    wallColor: 0x2aa6a0,
    furniture: ["sofa", "sofa", "plant", "rug"]
  }
};

export const buildings: BuildingDefinition[] = [hubBuilding, ...ringBuildings, relaxBuilding];
