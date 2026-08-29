import { describe, expect, it } from 'vitest';
import { generateGlyph, layoutGlyph } from './glyph';

describe('generateGlyph', () => {
  it('is stable for a given project, so the diagram does not change between builds', () => {
    expect(generateGlyph('Archenym')).toEqual(generateGlyph('Archenym'));
  });

  it('gives different projects different diagrams', () => {
    expect(generateGlyph('Archenym')).not.toEqual(generateGlyph('ReGuna'));
  });

  it('never overlaps two blocks on the same cell', () => {
    for (const name of ['Archenym', 'ReGuna', 'Vora Mobile', 'CariAnime', 'DompetKu']) {
      const { blocks } = generateGlyph(name, { density: 9 });
      const seen = new Set<string>();
      for (const b of blocks) {
        for (let i = 0; i < b.w; i++) {
          const key = `${b.x + i},${b.y}`;
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
      }
    }
  });

  it('keeps every block inside the grid', () => {
    const { blocks, cols, rows } = generateGlyph('Vora Mobile', { density: 9 });
    for (const b of blocks) {
      expect(b.x).toBeGreaterThanOrEqual(0);
      expect(b.x + b.w).toBeLessThanOrEqual(cols);
      expect(b.y).toBeLessThan(rows);
    }
  });

  it('always highlights at least one module, and never all of them', () => {
    const { blocks } = generateGlyph('Dealer Management Information System');
    const accents = blocks.filter((b) => b.accent).length;
    expect(accents).toBeGreaterThan(0);
    expect(accents).toBeLessThan(blocks.length);
  });

  it('links every block into the diagram, leaving nothing stranded', () => {
    const { blocks, links } = generateGlyph('ReGuna', { density: 8 });
    const connected = new Set<number>();
    for (const l of links) {
      connected.add(l.from);
      connected.add(l.to);
    }
    expect(connected.size).toBe(blocks.length);
  });

  it('terminates even when asked for more blocks than the grid holds', () => {
    const { blocks, cols, rows } = generateGlyph('dense', { cols: 3, rows: 2, density: 999 });
    expect(blocks.length).toBeGreaterThan(0);
    expect(blocks.length).toBeLessThanOrEqual(cols * rows);
  });
});

describe('layoutGlyph', () => {
  it('sizes the canvas to fit the grid exactly', () => {
    const glyph = generateGlyph('Archenym', { cols: 5, rows: 4 });
    const { width, height } = layoutGlyph(glyph, 46, 18);
    expect(width).toBe(5 * 46 + 4 * 18);
    expect(height).toBe(4 * 46 + 3 * 18);
  });

  it('keeps every drawn block within the canvas bounds', () => {
    const glyph = generateGlyph('ReGuna', { density: 9 });
    const { width, height, blocks } = layoutGlyph(glyph);
    for (const b of blocks) {
      expect(b.px + b.pw).toBeLessThanOrEqual(width);
      expect(b.py + b.ph).toBeLessThanOrEqual(height);
    }
  });

  it('emits one orthogonal connector per link', () => {
    const glyph = generateGlyph('Vora Mobile');
    const { paths } = layoutGlyph(glyph);
    expect(paths).toHaveLength(glyph.links.length);
    for (const d of paths) {
      /* Move, vertical, horizontal, vertical — schematic routing, no diagonals. */
      expect(d).toMatch(/^M[\d.-]+ [\d.-]+V[\d.-]+H[\d.-]+V[\d.-]+$/);
    }
  });
});
