import { AssetRegistry } from "../assets/AssetRegistry";
import { BuildingEngine } from "../buildings/BuildingEngine";
import { BuildModeSystem } from "../buildMode/BuildModeSystem";
import { CitizenSystem } from "../citizens/CitizenSystem";
import { TimeSystem } from "../time/TimeSystem";

export class Dashboard {
  private lastSignature = "";

  constructor(private readonly root: HTMLElement) {}

  render(
    time: TimeSystem,
    citizens: CitizenSystem,
    buildings: BuildingEngine,
    activeBuildingId: string | null,
    buildMode: BuildModeSystem,
    assets: AssetRegistry
  ): void {
    const roster = citizens.getRoster();
    const activeBuilding = activeBuildingId ? buildings.getDefinition(activeBuildingId) : undefined;

    const signature = [time.getClockLabel(), time.getSpeed(), activeBuildingId, buildMode.isActive(), roster.map(c => c.status).join(",")].join(
      "|"
    );
    if (signature === this.lastSignature) return;
    this.lastSignature = signature;

    const citizenRows = roster
      .map(
        citizen => `
        <div class="citizen-row">
          <span>${citizen.name} <span class="citizen-status">(${citizen.role})</span></span>
          <span class="citizen-status">${citizen.status}</span>
        </div>`
      )
      .join("");

    this.root.innerHTML = `
      <h2>Mission Clock</h2>
      <div class="stat-row"><span>Time</span><span>${time.getClockLabel()}</span></div>
      <div class="stat-row"><span>Speed</span><span>${time.getSpeed()}x</span></div>
      <div class="stat-row"><span>View</span><span>${activeBuilding ? activeBuilding.name : "City"}</span></div>
      <div class="stat-row"><span>Build Mode</span><span>${buildMode.isActive() ? "ON (press B)" : "off (press B)"}</span></div>
      <div class="stat-row"><span>Buildings</span><span>${buildings.getBuildingCount()}</span></div>
      <div class="stat-row"><span>Assets</span><span>${assets.count()}</span></div>
      <h2>Agent Roster</h2>
      ${citizenRows}
    `;
  }
}
