/*
  Hit-testing for the cursor glow.

  Kept out of the layout script and pure, because this is the part that is easy
  to get subtly wrong — coordinate space, scroll offsets, and which element wins
  when a card sits inside a section. It cannot be exercised in a browser that
  never composites, so it is unit-tested instead.

  All coordinates are page coordinates: viewport position plus scroll offset.
*/

export interface FieldBox {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function contains(box: FieldBox, x: number, y: number): boolean {
  return (
    x >= box.left && x <= box.left + box.width && y >= box.top && y <= box.top + box.height
  );
}

/*
  Smallest first, so a card lights up rather than the whole section behind it.
  Sorting once at measure time keeps the per-move work to a linear scan.
*/
export function byAreaAscending<T extends FieldBox>(boxes: T[]): T[] {
  return [...boxes].sort((a, b) => a.width * a.height - b.width * b.height);
}

/*
  The innermost box under the point, or null. Expects `boxes` already sorted by
  `byAreaAscending`; that ordering is what makes "innermost" true.
*/
export function pickField<T extends FieldBox>(boxes: T[], x: number, y: number): T | null {
  for (const box of boxes) {
    if (contains(box, x, y)) return box;
  }
  return null;
}
