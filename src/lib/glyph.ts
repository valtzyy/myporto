/*
  A generated diagram for each project.

  There are no screenshots of most of this work — one demo's database is held by
  someone else, another never had a public UI. Rather than leave the work
  section as unbroken prose, each project gets a module diagram derived from its
  own name and stack, so it is stable across builds and distinct per project
  without pretending to be a screenshot of anything.
*/

export interface GlyphBlock {
  x: number;
  y: number;
  w: number;
  h: number;
  accent: boolean;
  /* Rows of "fields", drawn as short rules — the shape of a table. */
  rows: number;
}

export interface GlyphLink {
  from: number;
  to: number;
}

export interface Glyph {
  blocks: GlyphBlock[];
  links: GlyphLink[];
  cols: number;
  rows: number;
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
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

export interface GlyphOptions {
  cols?: number;
  rows?: number;
  /* More stack entries means a denser diagram. */
  density?: number;
}

export function generateGlyph(
  key: string,
  { cols = 5, rows = 4, density = 7 }: GlyphOptions = {},
): Glyph {
  const rand = mulberry32(hash(key));
  const taken = new Set<string>();
  const blocks: GlyphBlock[] = [];

  const target = Math.max(4, Math.min(density, cols * rows - 4));

  let guard = 0;
  while (blocks.length < target && guard++ < 200) {
    const w = rand() > 0.62 ? 2 : 1;
    const x = Math.floor(rand() * (cols - w + 1));
    const y = Math.floor(rand() * rows);

    let clash = false;
    for (let i = 0; i < w; i++) {
      if (taken.has(`${x + i},${y}`)) clash = true;
    }
    if (clash) continue;

    for (let i = 0; i < w; i++) taken.add(`${x + i},${y}`);

    blocks.push({
      x,
      y,
      w,
      h: 1,
      accent: false,
      rows: 2 + Math.floor(rand() * 3),
    });
  }

  /* Sort so links read left to right and top to bottom, like a real diagram. */
  blocks.sort((a, b) => a.y - b.y || a.x - b.x);

  /* One or two accents — the module this project is actually about. */
  const accentCount = blocks.length > 5 ? 2 : 1;
  const accentIndices = new Set<number>();
  while (accentIndices.size < accentCount) {
    accentIndices.add(Math.floor(rand() * blocks.length));
  }
  for (const i of accentIndices) blocks[i].accent = true;

  /* Chain the blocks, then add a couple of cross links. */
  const links: GlyphLink[] = [];
  for (let i = 1; i < blocks.length; i++) {
    links.push({ from: i - 1, to: i });
  }
  for (let i = 0; i < 2 && blocks.length > 3; i++) {
    const from = Math.floor(rand() * blocks.length);
    const to = Math.floor(rand() * blocks.length);
    if (Math.abs(from - to) > 1) links.push({ from, to });
  }

  return { blocks, links, cols, rows };
}

export interface GlyphGeometry {
  width: number;
  height: number;
  blocks: (GlyphBlock & { px: number; py: number; pw: number; ph: number })[];
  paths: string[];
}

/* Turn the abstract grid into drawable coordinates. */
export function layoutGlyph(glyph: Glyph, cell = 46, gap = 18): GlyphGeometry {
  const width = glyph.cols * cell + (glyph.cols - 1) * gap;
  const height = glyph.rows * cell + (glyph.rows - 1) * gap;

  const blocks = glyph.blocks.map((b) => ({
    ...b,
    px: b.x * (cell + gap),
    py: b.y * (cell + gap),
    pw: b.w * cell + (b.w - 1) * gap,
    ph: b.h * cell,
  }));

  const paths = glyph.links.map(({ from, to }) => {
    const a = blocks[from];
    const b = blocks[to];
    const ax = a.px + a.pw / 2;
    const ay = a.py + a.ph / 2;
    const bx = b.px + b.pw / 2;
    const by = b.py + b.ph / 2;
    /* Orthogonal routing: across, then down. Schematic, not organic. */
    const midY = ay + (by - ay) / 2;
    return `M${ax} ${ay}V${midY}H${bx}V${by}`;
  });

  return { width, height, blocks, paths };
}
