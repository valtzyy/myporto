import { describe, expect, it } from 'vitest';
import { PerspectiveCamera, Vector3 } from 'three';
import { fitDistance, generateGraph, graphExtent } from './graph';

/*
  The scene itself needs a GPU, but the reason a WebGL hero usually shows up
  blank does not: the geometry sits outside the camera frustum. That is pure
  maths, so it can be checked here — and it caught a real crop on phones,
  where a hard-coded camera distance cut the graph off at the sides.

  FOV mirrors hero3d.ts. If that changes, this fails, which is the point.
*/
const FOV = 42;
const { nodes } = generateGraph();
const extent = graphExtent(nodes);

const VIEWPORTS = {
  'desktop 16:9': 16 / 9,
  'laptop 16:10': 16 / 10,
  'tablet portrait': 768 / 1024,
  'phone portrait': 390 / 844,
  'very tall phone': 360 / 900,
};

function project(aspect: number) {
  const camera = new PerspectiveCamera(FOV, aspect, 0.1, 100);
  camera.position.set(0, 0, fitDistance(nodes, aspect, FOV));
  camera.lookAt(0, 0, 0);
  camera.updateMatrixWorld(true);
  camera.updateProjectionMatrix();

  /* Rotation is around Y, so sampling the turn covers every angle it holds. */
  const points: Vector3[] = [];
  for (let i = 0; i < 12; i++) {
    const t = (i / 12) * Math.PI * 2;
    const cos = Math.cos(t);
    const sin = Math.sin(t);
    for (const n of nodes) {
      points.push(
        new Vector3(n.x * cos + n.z * sin, n.y, n.z * cos - n.x * sin).project(camera),
      );
    }
  }
  return points;
}

describe('hero camera framing', () => {
  for (const [name, aspect] of Object.entries(VIEWPORTS)) {
    it(`fits the whole graph on ${name}`, () => {
      for (const p of project(aspect)) {
        expect(Math.abs(p.x)).toBeLessThanOrEqual(1);
        expect(Math.abs(p.y)).toBeLessThanOrEqual(1);
        /* Inside the near and far planes, so nothing is clipped in depth. */
        expect(p.z).toBeGreaterThan(-1);
        expect(p.z).toBeLessThan(1);
      }
    });

    it(`fills the frame on ${name} rather than shrinking to a dot`, () => {
      const points = project(aspect);
      const xs = points.map((p) => p.x);
      const ys = points.map((p) => p.y);
      const spanX = Math.max(...xs) - Math.min(...xs);
      const spanY = Math.max(...ys) - Math.min(...ys);
      /* At least ~70% of one axis, so the graph is never a speck. */
      expect(Math.max(spanX, spanY)).toBeGreaterThan(1.4);
    });
  }

  it('stays centred, so the graph is never crowded against an edge', () => {
    const points = project(16 / 9);
    const xs = points.map((p) => p.x);
    const ys = points.map((p) => p.y);
    expect(Math.abs((Math.max(...xs) + Math.min(...xs)) / 2)).toBeLessThan(0.15);
    expect(Math.abs((Math.max(...ys) + Math.min(...ys)) / 2)).toBeLessThan(0.15);
  });

  it('pulls the camera further back as the viewport narrows', () => {
    const wide = fitDistance(nodes, 16 / 9, FOV);
    const narrow = fitDistance(nodes, 390 / 844, FOV);
    expect(narrow).toBeGreaterThan(wide);
  });

  it('measures width radially, because the graph turns', () => {
    /* The widest the graph ever gets is sqrt(x^2 + z^2), not max |x| — a node
       parked on the z axis swings out to the side half a turn later. */
    const maxAbsX = Math.max(...nodes.map((n) => Math.abs(n.x)));
    expect(extent.radial).toBeGreaterThanOrEqual(maxAbsX);
  });
});
