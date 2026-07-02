import * as THREE from "three";

export class PathNetwork {
  private readonly nodes = new Map<string, THREE.Vector3>();
  private readonly edges = new Map<string, Set<string>>();

  addNode(id: string, position: THREE.Vector3): void {
    if (!this.nodes.has(id)) {
      this.nodes.set(id, position.clone());
      this.edges.set(id, new Set());
    }
  }

  hasNode(id: string): boolean {
    return this.nodes.has(id);
  }

  getNode(id: string): THREE.Vector3 | undefined {
    return this.nodes.get(id);
  }

  addEdge(a: string, b: string): void {
    if (!this.nodes.has(a) || !this.nodes.has(b)) return;
    this.edges.get(a)?.add(b);
    this.edges.get(b)?.add(a);
  }

  /** Breadth-first shortest hop path between two nodes, returned as world-space waypoints. */
  findPath(fromId: string, toId: string): THREE.Vector3[] {
    if (!this.nodes.has(fromId) || !this.nodes.has(toId)) return [];
    if (fromId === toId) return [this.nodes.get(fromId)!.clone()];

    const visited = new Set<string>([fromId]);
    const previous = new Map<string, string>();
    const queue: string[] = [fromId];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (current === toId) break;
      for (const neighbor of this.edges.get(current) ?? []) {
        if (visited.has(neighbor)) continue;
        visited.add(neighbor);
        previous.set(neighbor, current);
        queue.push(neighbor);
      }
    }

    if (!visited.has(toId)) return [];

    const path: string[] = [toId];
    let cursor = toId;
    while (cursor !== fromId) {
      const prev = previous.get(cursor);
      if (!prev) break;
      path.unshift(prev);
      cursor = prev;
    }

    return path.map(id => this.nodes.get(id)!.clone());
  }
}
