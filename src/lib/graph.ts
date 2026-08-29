/*
  The hero graph is an abstraction of a database schema: clustered tables with
  dense links inside a module and sparse links between modules. It is generated
  rather than authored so the same data can be rendered twice — as build-time
  SVG for everyone, and as a WebGL canvas for browsers that can afford it.

  Deterministic by seed, so both renders agree exactly.
*/

export interface GraphNode {
  x: number;
  y: number;
  z: number;
  /* Index of the module this node belongs to. */
  cluster: number;
  /* Hub nodes are drawn larger — the tables everything else references. */
  hub: boolean;
}

export interface Graph {
  nodes: GraphNode[];
  edges: [number, number][];
  /* The highlighted path: the chain of hubs, drawn in the accent colour. */
  spine: [number, number][];
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface GraphOptions {
  seed?: number;
  clusters?: number;
  perCluster?: number;
  radius?: number;
}

export function generateGraph({
  seed = 20240,
  clusters = 6,
  perCluster = 7,
  radius = 3.2,
}: GraphOptions = {}): Graph {
  const rand = mulberry32(seed);
  const nodes: GraphNode[] = [];
  const hubs: number[] = [];

  for (let c = 0; c < clusters; c++) {
    /* Cluster centres sit on a ring, tilted so the shape reads as depth
       rather than as a flat wheel. */
    const angle = (c / clusters) * Math.PI * 2 + rand() * 0.35;
    const cx = Math.cos(angle) * radius;
    const cy = Math.sin(angle) * radius * 0.62;
    const cz = (rand() - 0.5) * 2.4;

    for (let i = 0; i < perCluster; i++) {
      const hub = i === 0;
      const spread = hub ? 0 : 1.05;
      nodes.push({
        x: cx + (rand() - 0.5) * spread * 2,
        y: cy + (rand() - 0.5) * spread * 1.6,
        z: cz + (rand() - 0.5) * spread * 2,
        cluster: c,
        hub,
      });
      if (hub) hubs.push(nodes.length - 1);
    }
  }

  const edges: [number, number][] = [];

  /* Inside a module: every node links to its hub, plus a few sibling links. */
  for (let c = 0; c < clusters; c++) {
    const start = c * perCluster;
    const hub = start;

    for (let i = 1; i < perCluster; i++) {
      edges.push([hub, start + i]);
    }

    for (let i = 1; i < perCluster; i++) {
      if (rand() > 0.55) {
        const other = start + 1 + Math.floor(rand() * (perCluster - 1));
        if (other !== start + i) edges.push([start + i, other]);
      }
    }
  }

  /* Between modules: only hubs talk to each other, and only to neighbours. */
  const spine: [number, number][] = [];
  for (let c = 0; c < clusters; c++) {
    const a = hubs[c];
    const b = hubs[(c + 1) % clusters];
    spine.push([a, b]);
  }

  /* One cross-cutting link, the way an audit or user table cuts across a
     schema. Never adjacent, so it visibly crosses the ring. */
  spine.push([hubs[0], hubs[Math.floor(clusters / 2)]]);

  return { nodes, edges, spine };
}

/*
  Flatten to 2D for the SVG fallback. Mild perspective so depth survives the
  projection without needing a camera.
*/
export function project(
  node: Pick<GraphNode, 'x' | 'y' | 'z'>,
  width: number,
  height: number,
  scale = 52,
): { x: number; y: number; depth: number } {
  const perspective = 1 + node.z * 0.11;
  return {
    x: width / 2 + node.x * scale * perspective,
    y: height / 2 - node.y * scale * perspective,
    depth: perspective,
  };
}

export interface Projected {
  x: number;
  y: number;
  depth: number;
}

export interface FrameOptions {
  width: number;
  height: number;
  /* Milliseconds. */
  time: number;
  /* Cursor in the same coordinate space as the output. Off-canvas by default. */
  pointerX?: number;
  pointerY?: number;
  reach?: number;
  push?: number;
}

/*
  One frame of the hero animation: rotate around Y, project, then let the cursor
  push nearby nodes outward. Pure, so it can be tested without a browser — which
  matters here, because the animation is invisible to anything that reports
  prefers-reduced-motion.
*/
export function computeFrame(
  nodes: GraphNode[],
  {
    width,
    height,
    time,
    pointerX = -9999,
    pointerY = -9999,
    reach = 150,
    push = 34,
  }: FrameOptions,
): Projected[] {
  const t = time * 0.00006;
  const cos = Math.cos(t);
  const sin = Math.sin(t);

  return nodes.map((n) => {
    const p = project(
      { x: n.x * cos + n.z * sin, y: n.y, z: n.z * cos - n.x * sin },
      width,
      height,
    );

    const dx = p.x - pointerX;
    const dy = p.y - pointerY;
    const dist = Math.hypot(dx, dy);

    if (dist < reach && dist > 0.001) {
      const force = (1 - dist / reach) * push;
      return { x: p.x + (dx / dist) * force, y: p.y + (dy / dist) * force, depth: p.depth };
    }

    return p;
  });
}

export function radiusFor(node: GraphNode, depth: number): number {
  return (node.hub ? 4.5 : 2.4) * depth;
}

export function pathFor(pairs: [number, number][], points: Projected[]): string {
  let d = '';
  for (const [a, b] of pairs) {
    d += `M${points[a].x.toFixed(1)} ${points[a].y.toFixed(1)}L${points[b].x.toFixed(1)} ${points[b].y.toFixed(1)}`;
  }
  return d;
}

/*
  How much room the graph needs. Because it turns around Y, its horizontal
  extent at any moment is the radial distance in the XZ plane — the widest it
  ever gets is the largest sqrt(x^2 + z^2), not the largest x.
*/
export function graphExtent(nodes: GraphNode[]): { radial: number; vertical: number } {
  let radial = 0;
  let vertical = 0;
  for (const n of nodes) {
    radial = Math.max(radial, Math.hypot(n.x, n.z));
    vertical = Math.max(vertical, Math.abs(n.y));
  }
  return { radial, vertical };
}

/*
  The camera distance that fits the graph in a viewport of this shape.

  Solved rather than guessed. A node projects to x = x / ((d - z) * tanH), so
  keeping it on screen requires d >= z + |x| / tanH — and the same for y. The
  depth term matters: a node nearer the camera looks bigger, which is what a
  flat "extent / tan(fov/2)" estimate misses, and what cropped the graph on
  wide viewports. Sampling the rotation covers every pose it holds.
*/
export function fitDistance(
  nodes: GraphNode[],
  aspect: number,
  fovDegrees: number,
  margin = 1.08,
  samples = 32,
): number {
  const vFov = (fovDegrees * Math.PI) / 180;
  const tanV = Math.tan(vFov / 2);
  const tanH = tanV * aspect;

  let needed = 0;
  for (let s = 0; s < samples; s++) {
    const t = (s / samples) * Math.PI * 2;
    const cos = Math.cos(t);
    const sin = Math.sin(t);

    for (const n of nodes) {
      const x = n.x * cos + n.z * sin;
      const z = n.z * cos - n.x * sin;
      needed = Math.max(needed, z + Math.abs(x) / tanH, z + Math.abs(n.y) / tanV);
    }
  }

  return needed * margin;
}
