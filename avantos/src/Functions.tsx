import type { Blueprint, Node, Edge } from "./interfaces";

export function getNodesByid(nodes: Node[]) {
  const ans: Record<string, Node> = {};
  nodes.forEach((node) => {
    ans[node.id] = node;
  });
  return ans;
}

export function createAdjlist(data: Blueprint) {
  const ans: Record<string, string[]> = {};
  const nodes_by_id = getNodesByid(data.nodes);

  data.edges.forEach((edge: Edge) => {
    const src = edge.source;
    const tgt = edge.target;

    if (ans[src]) {
      ans[src].push(tgt);
    } else {
      ans[src] = [tgt];
    }
  });

  return { adj: ans, nodesById: nodes_by_id };
}

export function createReverseAdj(adj: Record<string, string[]>) {
  const rev: Record<string, string[]> = {};

  for (const parent in adj) {
    for (const child of adj[parent]) {
      if (!rev[child]) rev[child] = [];
      rev[child].push(parent);
    }
  }

  return rev;
}

export function getRoots(
  targetId: string,
  adj: Record<string, string[]>
): string[] {
  const reverseAdj = createReverseAdj(adj);
  const result: string[] = [];
  const visited = new Set<string>();

  // start from unique direct parents
  const queue: string[] = [...new Set(reverseAdj[targetId] || [])];

  while (queue.length > 0) {
    const node = queue.shift()!;
    if (visited.has(node)) continue;

    visited.add(node);
    result.push(node);

    const parents = reverseAdj[node] || [];
    for (const p of parents) {
      if (!visited.has(p)) {
        queue.push(p);
      }
    }
  }

  return result;
}
