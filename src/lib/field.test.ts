import { describe, expect, it } from 'vitest';
import { byAreaAscending, contains, pickField, type FieldBox } from './field';

const box = (left: number, top: number, width: number, height: number): FieldBox => ({
  left,
  top,
  width,
  height,
});

/* A section with a card inside it, the arrangement this exists to handle. */
const section = { ...box(0, 1000, 1200, 800), name: 'section' };
const card = { ...box(100, 1200, 400, 300), name: 'card' };
const sorted = byAreaAscending([section, card]);

describe('contains', () => {
  it('accepts a point inside', () => {
    expect(contains(section, 600, 1400)).toBe(true);
  });

  it('accepts the edges, so there is no dead seam between neighbours', () => {
    expect(contains(section, 0, 1000)).toBe(true);
    expect(contains(section, 1200, 1800)).toBe(true);
  });

  it('rejects points outside on every side', () => {
    expect(contains(section, -1, 1400)).toBe(false);
    expect(contains(section, 1201, 1400)).toBe(false);
    expect(contains(section, 600, 999)).toBe(false);
    expect(contains(section, 600, 1801)).toBe(false);
  });
});

describe('byAreaAscending', () => {
  it('puts the smaller box first, which is what makes innermost win', () => {
    expect(sorted[0].name).toBe('card');
  });

  it('does not mutate the array it was given', () => {
    const input = [section, card];
    byAreaAscending(input);
    expect(input[0].name).toBe('section');
  });
});

describe('pickField', () => {
  it('lights the card, not the section behind it', () => {
    expect(pickField(sorted, 200, 1300)?.name).toBe('card');
  });

  it('lights the section where the card is not', () => {
    expect(pickField(sorted, 900, 1300)?.name).toBe('section');
  });

  it('returns null in the gap between sections', () => {
    expect(pickField(sorted, 600, 500)).toBeNull();
  });

  it('works in page coordinates, so scrolling does not shift the target', () => {
    /* Cursor 300px down the viewport, page scrolled 900px: page y = 1200. */
    const pageY = 300 + 900;
    expect(pickField(sorted, 200, pageY)?.name).toBe('card');
  });

  it('ignores a zero-sized box rather than matching its corner', () => {
    const collapsed = { ...box(50, 50, 0, 0), name: 'collapsed' };
    const outer = { ...box(0, 0, 500, 500), name: 'outer' };
    /* Sorted ascending the collapsed box comes first; a point elsewhere in the
       outer box must still find the outer box. */
    expect(pickField(byAreaAscending([collapsed, outer]), 300, 300)?.name).toBe('outer');
  });
});
