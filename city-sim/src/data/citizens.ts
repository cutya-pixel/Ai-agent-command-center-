export interface CitizenDefinition {
  id: string;
  name: string;
  role: string;
  color: number;
  homeBuildingId: string;
  /** Minute-of-day window (0-1439) during which the citizen steps outside for a break. */
  breakStart: number;
  breakEnd: number;
}

export const citizens: CitizenDefinition[] = [
  { id: "bliff", name: "Bliff", role: "Operations Commander", color: 0xdba514, homeBuildingId: "hub", breakStart: 450, breakEnd: 470 },
  { id: "print", name: "Print", role: "E-Commerce Specialist", color: 0xd9822b, homeBuildingId: "print", breakStart: 540, breakEnd: 560 },
  { id: "fl3x", name: "Fl3x", role: "Music Producer", color: 0x6f42c1, homeBuildingId: "fl3x", breakStart: 660, breakEnd: 680 },
  { id: "design", name: "Design", role: "Fiverr Designer", color: 0xe0559b, homeBuildingId: "design", breakStart: 780, breakEnd: 800 },
  { id: "build", name: "Build", role: "Architect", color: 0x4c8bf5, homeBuildingId: "build", breakStart: 870, breakEnd: 890 },
  { id: "terabyte", name: "Terabyte", role: "Systems Technician", color: 0x2fb380, homeBuildingId: "terabyte", breakStart: 960, breakEnd: 980 },
  { id: "coins", name: "Coins", role: "Treasurer", color: 0xd4af37, homeBuildingId: "coins", breakStart: 1050, breakEnd: 1070 },
  { id: "buff", name: "Buff", role: "Security Officer", color: 0x5a5f66, homeBuildingId: "buff", breakStart: 1140, breakEnd: 1160 }
];
