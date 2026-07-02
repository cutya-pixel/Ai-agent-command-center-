import * as THREE from "three";
import type { CitizenDefinition } from "../../data/citizens";
import { BuildingEngine } from "../buildings/BuildingEngine";
import { DoorSystem } from "../doors/DoorSystem";
import { PathNetwork } from "../navigation/PathNetwork";

type CitizenState = "inside" | "walking-out" | "outside" | "walking-in";

interface CitizenRecord {
  definition: CitizenDefinition;
  mesh: THREE.Group;
  doorNodeId: string;
  state: CitizenState;
  path: THREE.Vector3[];
  pathIndex: number;
  wanderTarget: THREE.Vector3;
  wanderTimer: number;
}

export interface CitizenStatus {
  id: string;
  name: string;
  role: string;
  status: string;
}

const PLAZA_NODE = "plaza";
const PLAZA_POSITION = new THREE.Vector3(0, 0, -20);
const MOVE_SPEED = 3;
const WANDER_RADIUS = 6;
const ARRIVE_EPSILON = 0.15;

const STATE_LABEL: Record<CitizenState, string> = {
  inside: "Working",
  "walking-out": "Heading Out",
  outside: "On Break",
  "walking-in": "Heading In"
};

function isWithinBreak(minute: number, start: number, end: number): boolean {
  return minute >= start && minute < end;
}

export class CitizenSystem {
  private readonly records: CitizenRecord[] = [];

  constructor(
    private readonly scene: THREE.Scene,
    private readonly buildings: BuildingEngine,
    private readonly doors: DoorSystem,
    private readonly paths: PathNetwork
  ) {
    this.paths.addNode(PLAZA_NODE, PLAZA_POSITION);
  }

  createCitizens(citizenData: CitizenDefinition[]): void {
    for (const definition of citizenData) {
      const doorPosition = this.buildings.getEntryPoint(definition.homeBuildingId);
      if (!doorPosition) continue;

      const doorNodeId = `${definition.homeBuildingId}-door`;
      this.paths.addNode(doorNodeId, doorPosition);
      this.paths.addEdge(doorNodeId, PLAZA_NODE);

      const mesh = this.buildCitizenMesh(definition);
      mesh.position.copy(doorPosition);
      mesh.visible = false;
      this.scene.add(mesh);

      this.records.push({
        definition,
        mesh,
        doorNodeId,
        state: "inside",
        path: [],
        pathIndex: 0,
        wanderTarget: PLAZA_POSITION.clone(),
        wanderTimer: 0
      });
    }
  }

  private buildCitizenMesh(definition: CitizenDefinition): THREE.Group {
    const group = new THREE.Group();

    const bodyMaterial = new THREE.MeshStandardMaterial({ color: definition.color, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 1.1, 10), bodyMaterial);
    body.position.y = 0.55;
    body.castShadow = true;

    const headMaterial = new THREE.MeshStandardMaterial({ color: 0xffd9b3, roughness: 0.6 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), headMaterial);
    head.position.y = 1.3;
    head.castShadow = true;

    group.add(body, head);
    group.userData.category = "citizen";
    group.userData.citizenId = definition.id;
    return group;
  }

  update(minute: number, deltaSeconds: number): void {
    for (const record of this.records) {
      const onBreak = isWithinBreak(minute, record.definition.breakStart, record.definition.breakEnd);
      switch (record.state) {
        case "inside":
          if (onBreak) this.beginWalkOut(record);
          break;
        case "walking-out":
          if (this.advanceAlongPath(record, deltaSeconds)) {
            record.state = "outside";
            this.doors.close(record.definition.homeBuildingId);
          }
          break;
        case "outside":
          if (!onBreak) {
            this.beginWalkIn(record);
          } else {
            this.wander(record, deltaSeconds);
          }
          break;
        case "walking-in":
          if (this.advanceAlongPath(record, deltaSeconds)) {
            record.state = "inside";
            record.mesh.visible = false;
            this.doors.close(record.definition.homeBuildingId);
          }
          break;
      }
    }
  }

  private beginWalkOut(record: CitizenRecord): void {
    record.path = this.paths.findPath(record.doorNodeId, PLAZA_NODE);
    record.pathIndex = 1;
    record.mesh.visible = true;
    this.doors.open(record.definition.homeBuildingId);
    record.state = "walking-out";
  }

  private beginWalkIn(record: CitizenRecord): void {
    record.path = this.paths.findPath(PLAZA_NODE, record.doorNodeId);
    record.pathIndex = 1;
    this.doors.open(record.definition.homeBuildingId);
    record.state = "walking-in";
  }

  private advanceAlongPath(record: CitizenRecord, deltaSeconds: number): boolean {
    if (record.pathIndex >= record.path.length) return true;
    const target = record.path[record.pathIndex];
    const arrived = this.moveToward(record.mesh, target, deltaSeconds);
    if (arrived) {
      record.pathIndex += 1;
      if (record.pathIndex >= record.path.length) return true;
    }
    return false;
  }

  private wander(record: CitizenRecord, deltaSeconds: number): void {
    record.wanderTimer -= deltaSeconds;
    if (record.wanderTimer <= 0) {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * WANDER_RADIUS;
      record.wanderTarget = PLAZA_POSITION.clone().add(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
      record.wanderTimer = 2 + Math.random() * 2;
    }
    this.moveToward(record.mesh, record.wanderTarget, deltaSeconds, MOVE_SPEED * 0.5);
  }

  private moveToward(mesh: THREE.Object3D, target: THREE.Vector3, deltaSeconds: number, speed = MOVE_SPEED): boolean {
    const current = mesh.position;
    const flatTarget = new THREE.Vector3(target.x, current.y, target.z);
    const distance = current.distanceTo(flatTarget);
    if (distance < ARRIVE_EPSILON) return true;

    const step = Math.min(distance, speed * deltaSeconds);
    const direction = flatTarget.clone().sub(current).normalize();
    current.addScaledVector(direction, step);

    const lookTarget = current.clone().add(direction);
    mesh.lookAt(lookTarget.x, current.y, lookTarget.z);

    return distance - step < ARRIVE_EPSILON;
  }

  getRoster(): CitizenStatus[] {
    return this.records.map(record => ({
      id: record.definition.id,
      name: record.definition.name,
      role: record.definition.role,
      status: STATE_LABEL[record.state]
    }));
  }
}
