import { describe, expect, it } from 'vitest';
import { computeFrame, generateGraph, pathFor, project, radiusFor } from './graph';

describe('generateGraph', () => {
  it('is deterministic, so the build-time SVG and the runtime frame agree', () => {
    expect(generateGraph()).toEqual(generateGraph());
  });

  it('produces one node per cluster slot and one hub per cluster', () => {
    const { nodes } = generateGraph({ clusters: 4, perCluster: 5 });
    expect(nodes).toHaveLength(20);
    expect(nodes.filter((n) => n.hub)).toHaveLength(4);
  });

  it('never emits an edge index outside the node list', () => {
    const { nodes, edges, spine } = generateGraph();
    for (const [a, b] of [...edges, ...spine]) {
      expect(a).toBeGreaterThanOrEqual(0);
      expect(b).toBeLessThan(nodes.length);
    }
  });

  it('connects every cluster to the next one through its hub', () => {
    const clusters = 6;
    const { spine, nodes } = generateGraph({ clusters, perCluster: 7 });
    /* Every spine endpoint must be a hub — modules talk hub to hub only. */
    for (const [a, b] of spine) {
      expect(nodes[a].hub).toBe(true);
      expect(nodes[b].hub).toBe(true);
    }
    expect(spine.length).toBe(clusters + 1);
  });
});

describe('project', () => {
  it('puts the origin at the centre of the viewport', () => {
    const p = project({ x: 0, y: 0, z: 0 }, 900, 620);
    expect(p.x).toBe(450);
    expect(p.y).toBe(310);
    expect(p.depth).toBe(1);
  });

  it('flips the y axis, because SVG y grows downward', () => {
    const above = project({ x: 0, y: 1, z: 0 }, 900, 620);
    expect(above.y).toBeLessThan(310);
  });

  it('scales nearer nodes larger than further ones', () => {
    const near = project({ x: 1, y: 0, z: 1 }, 900, 620);
    const far = project({ x: 1, y: 0, z: -1 }, 900, 620);
    expect(near.depth).toBeGreaterThan(far.depth);
  });
});

describe('computeFrame', () => {
  const { nodes } = generateGraph();
  const size = { width: 900, height: 620 };

  it('moves the graph between frames — this is the animation', () => {
    const a = computeFrame(nodes, { ...size, time: 0 });
    const b = computeFrame(nodes, { ...size, time: 4000 });
    expect(a).not.toEqual(b);
  });

  it('is stable for the same time, so a repaint never jitters', () => {
    expect(computeFrame(nodes, { ...size, time: 1234 })).toEqual(
      computeFrame(nodes, { ...size, time: 1234 }),
    );
  });

  it('leaves nodes untouched while the pointer is off-canvas', () => {
    const plain = computeFrame(nodes, { ...size, time: 0 });
    const far = computeFrame(nodes, { ...size, time: 0, pointerX: -9999, pointerY: -9999 });
    expect(far).toEqual(plain);
  });

  it('pushes a node away from the pointer, never toward it', () => {
    const plain = computeFrame(nodes, { ...size, time: 0 });
    const target = plain[0];
    /* Put the cursor just to the left of the node. */
    const pushed = computeFrame(nodes, {
      ...size,
      time: 0,
      pointerX: target.x - 20,
      pointerY: target.y,
    });

    expect(pushed[0].x).toBeGreaterThan(target.x);
  });

  it('pushes hardest at the centre of its reach and not at all outside it', () => {
    const plain = computeFrame(nodes, { ...size, time: 0 });
    const t = plain[0];

    const close = computeFrame(nodes, { ...size, time: 0, pointerX: t.x - 5, pointerY: t.y });
    const edge = computeFrame(nodes, { ...size, time: 0, pointerX: t.x - 149, pointerY: t.y });
    const outside = computeFrame(nodes, { ...size, time: 0, pointerX: t.x - 200, pointerY: t.y });

    expect(close[0].x - t.x).toBeGreaterThan(edge[0].x - t.x);
    expect(outside[0].x).toBeCloseTo(t.x, 6);
  });

  it('never displaces a node further than the push limit', () => {
    const plain = computeFrame(nodes, { ...size, time: 0 });
    const pushed = computeFrame(nodes, {
      ...size,
      time: 0,
      pointerX: plain[0].x,
      pointerY: plain[0].y - 1,
    });

    for (let i = 0; i < plain.length; i++) {
      const moved = Math.hypot(pushed[i].x - plain[i].x, pushed[i].y - plain[i].y);
      expect(moved).toBeLessThanOrEqual(34.0001);
    }
  });
});

describe('svg helpers', () => {
  it('emits one move-and-line pair per edge', () => {
    const { nodes, edges } = generateGraph();
    const points = computeFrame(nodes, { width: 900, height: 620, time: 0 });
    const d = pathFor(edges, points);
    expect(d.match(/M/g)).toHaveLength(edges.length);
    expect(d.match(/L/g)).toHaveLength(edges.length);
  });

  it('draws hubs larger than ordinary nodes at equal depth', () => {
    const { nodes } = generateGraph();
    const hub = nodes.find((n) => n.hub)!;
    const plain = nodes.find((n) => !n.hub)!;
    expect(radiusFor(hub, 1)).toBeGreaterThan(radiusFor(plain, 1));
  });
});
