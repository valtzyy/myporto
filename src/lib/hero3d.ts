/*
  The WebGL hero. Loaded dynamically, only after the page has painted and only
  when the browser can actually run it — the build-time SVG holds the screen
  until this takes over, and keeps it if this never loads.

  Imports are named rather than `import * as THREE` so the bundler can drop the
  three-quarters of three.js this scene does not touch.
*/
import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  LineBasicMaterial,
  LineSegments,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { fitDistance, generateGraph, type GraphNode } from './graph';

const ACCENT = new Color('#f2703c');
const NODE = new Color('#c3c3cd');
const EDGE = new Color('#6a6a78');

/* Depth range used to fade geometry front-to-back, in world units. */
const NEAR_Z = -4.5;
const FAR_Z = 4.5;

/*
  `size` is in CSS pixels at the reference distance, so the WebGL tier can be
  given the same numbers as the SVG tier and land on screen the same size.
  gl_PointSize is in device pixels, hence the pixel-ratio multiply.
*/
const POINT_VERTEX = `
  attribute float size;
  attribute float alpha;
  uniform float uPixelRatio;
  uniform float uRefDist;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vColor = color;
    vAlpha = alpha;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = size * uPixelRatio * (uRefDist / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const POINT_FRAGMENT = `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float d = length(uv);
    if (d > 0.5) discard;
    /* Soft edge, plus a brighter core so hubs read as lit rather than flat. */
    float edge = smoothstep(0.5, 0.18, d);
    float core = smoothstep(0.34, 0.0, d) * 0.55;
    gl_FragColor = vec4(vColor, (edge + core) * vAlpha);
  }
`;

function depthAlpha(z: number, min: number, max: number): number {
  const t = (z - NEAR_Z) / (FAR_Z - NEAR_Z);
  return min + Math.max(0, Math.min(1, t)) * (max - min);
}

export interface Hero3D {
  destroy(): void;
}

export interface Hero3DOptions {
  /* When false the scene is still built and drawn — once, holding still.
     Reduced motion should remove movement, not remove the artwork. */
  motion?: boolean;
}

export function mountHero3D(
  container: HTMLElement,
  { motion = true }: Hero3DOptions = {},
): Hero3D | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }

  const { nodes, edges, spine } = generateGraph();

  const scene = new Scene();
  const camera = new PerspectiveCamera(42, 1, 0.1, 100);
  camera.position.set(0, 0, 9.4);

  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  renderer.domElement.style.width = '100%';
  renderer.domElement.style.height = '100%';
  renderer.domElement.style.display = 'block';

  /* ---- points -------------------------------------------------------- */

  const count = nodes.length;
  const pointPos = new Float32Array(count * 3);
  const pointColor = new Float32Array(count * 3);
  const pointSize = new Float32Array(count);
  const pointAlpha = new Float32Array(count);

  nodes.forEach((n, i) => {
    const c = n.hub ? ACCENT : NODE;
    pointColor[i * 3] = c.r;
    pointColor[i * 3 + 1] = c.g;
    pointColor[i * 3 + 2] = c.b;
    pointSize[i] = n.hub ? 9.5 : 5;
  });

  const pointGeo = new BufferGeometry();
  pointGeo.setAttribute('position', new BufferAttribute(pointPos, 3));
  pointGeo.setAttribute('color', new BufferAttribute(pointColor, 3));
  pointGeo.setAttribute('size', new BufferAttribute(pointSize, 1));
  pointGeo.setAttribute('alpha', new BufferAttribute(pointAlpha, 1));

  const pointMat = new ShaderMaterial({
    uniforms: {
      uPixelRatio: { value: 1 },
      uRefDist: { value: 10 },
    },
    vertexShader: POINT_VERTEX,
    fragmentShader: POINT_FRAGMENT,
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
    vertexColors: true,
  });

  scene.add(new Points(pointGeo, pointMat));

  /* ---- lines --------------------------------------------------------- */

  function makeLines(pairs: [number, number][], color: Color, opacity: number) {
    const pos = new Float32Array(pairs.length * 6);
    const col = new Float32Array(pairs.length * 6);
    const geo = new BufferGeometry();
    geo.setAttribute('position', new BufferAttribute(pos, 3));
    geo.setAttribute('color', new BufferAttribute(col, 3));
    const mat = new LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
    });
    const mesh = new LineSegments(geo, mat);
    scene.add(mesh);
    return { pos, col, geo, color };
  }

  const edgeLines = makeLines(edges, EDGE, 0.95);
  const spineLines = makeLines(spine, ACCENT, 0.8);

  /* ---- interaction --------------------------------------------------- */

  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;
  /* Off-canvas until the pointer actually arrives. */
  let hasPointer = false;

  /* World units. Roughly a fifth of the graph's width, so a cursor nudges a
     cluster rather than shoving the whole structure. */
  const REACH = 1.9;
  const PUSH = 0.52;

  const onPointerMove = (event: PointerEvent) => {
    const rect = container.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    targetX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    targetY = ((event.clientY - rect.top) / rect.height) * 2 - 1;
    hasPointer = true;
  };

  window.addEventListener('pointermove', onPointerMove, { passive: true });

  /* ---- sizing -------------------------------------------------------- */

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.75));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    /* Derived, not guessed: a fixed distance cropped the graph on phones. */
    camera.position.z = fitDistance(nodes, camera.aspect, camera.fov);
    camera.updateProjectionMatrix();

    pointMat.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    pointMat.uniforms.uRefDist.value = camera.position.z;
  };

  const observer = new ResizeObserver(() => {
    resize();
    if (!motion) renderer.render(scene, camera);
  });
  observer.observe(container);
  resize();

  /* ---- frame --------------------------------------------------------- */

  const world = nodes.map(() => ({ x: 0, y: 0, z: 0 }));

  function place(n: GraphNode, cos: number, sin: number) {
    return {
      x: n.x * cos + n.z * sin,
      y: n.y,
      z: n.z * cos - n.x * sin,
    };
  }

  let raf = 0;
  let running = false;
  let start = 0;

  const render = (time: number) => {
    if (!start) start = time;
    /* A still scene still needs an interesting angle, so freeze part-turned. */
    const t = motion ? (time - start) * 0.00007 : 0.9;
    const cos = Math.cos(t);
    const sin = Math.sin(t);

    /* Ease the pointer so the parallax glides instead of snapping. */
    if (motion) {
      pointerX += (targetX - pointerX) * 0.045;
      pointerY += (targetY - pointerY) * 0.045;
    }

    /* The pointer projected onto the z = 0 plane, in world units. */
    const visibleHeight = 2 * Math.tan((camera.fov * Math.PI) / 360) * camera.position.z;
    const visibleWidth = visibleHeight * camera.aspect;
    const wx = hasPointer ? (pointerX * visibleWidth) / 2 : -9999;
    const wy = hasPointer ? (-pointerY * visibleHeight) / 2 : -9999;

    for (let i = 0; i < count; i++) {
      const p = place(nodes[i], cos, sin);
      /* A slow vertical breath, offset per node so the cloud is never rigid. */
      if (motion) p.y += Math.sin(t * 3.1 + i * 0.7) * 0.045;

      const dx = p.x - wx;
      const dy = p.y - wy;
      const dist = Math.hypot(dx, dy);
      if (dist < REACH && dist > 0.0001) {
        const force = (1 - dist / REACH) * PUSH;
        p.x += (dx / dist) * force;
        p.y += (dy / dist) * force;
      }

      world[i] = p;
      pointPos[i * 3] = p.x;
      pointPos[i * 3 + 1] = p.y;
      pointPos[i * 3 + 2] = p.z;
      pointAlpha[i] = depthAlpha(p.z, nodes[i].hub ? 0.5 : 0.22, 1);
    }

    pointGeo.attributes.position.needsUpdate = true;
    pointGeo.attributes.alpha.needsUpdate = true;

    const writeLines = (
      pairs: [number, number][],
      target: { pos: Float32Array; col: Float32Array; geo: BufferGeometry; color: Color },
      lo: number,
      hi: number,
    ) => {
      for (let e = 0; e < pairs.length; e++) {
        const [a, b] = pairs[e];
        const pa = world[a];
        const pb = world[b];
        target.pos.set([pa.x, pa.y, pa.z, pb.x, pb.y, pb.z], e * 6);

        const fa = depthAlpha(pa.z, lo, hi);
        const fb = depthAlpha(pb.z, lo, hi);
        target.col.set(
          [
            target.color.r * fa,
            target.color.g * fa,
            target.color.b * fa,
            target.color.r * fb,
            target.color.g * fb,
            target.color.b * fb,
          ],
          e * 6,
        );
      }
      target.geo.attributes.position.needsUpdate = true;
      target.geo.attributes.color.needsUpdate = true;
    };

    writeLines(edges, edgeLines, 0.35, 1.6);
    writeLines(spine, spineLines, 0.4, 1.5);

    camera.position.x = pointerX * 0.55;
    camera.position.y = -pointerY * 0.38;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    if (running && motion) raf = requestAnimationFrame(render);
  };

  const play = () => {
    if (running || document.hidden) return;
    running = true;
    raf = requestAnimationFrame(render);
  };

  const pause = () => {
    running = false;
    cancelAnimationFrame(raf);
  };

  let onScreen = true;
  const visibility = () => (document.hidden ? pause() : onScreen && play());
  document.addEventListener('visibilitychange', visibility);

  const inView = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      onScreen = entry.isIntersecting;
      onScreen ? play() : pause();
    }
  });
  inView.observe(container);

  play();

  return {
    destroy() {
      pause();
      observer.disconnect();
      inView.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('visibilitychange', visibility);
      pointGeo.dispose();
      pointMat.dispose();
      edgeLines.geo.dispose();
      spineLines.geo.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
