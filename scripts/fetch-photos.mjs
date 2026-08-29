/*
  Downloads the thematic photography used as illustrative artwork for projects
  that have no reachable deployment to screenshot.

  Run with `npm run photos`.

  These are illustrations, never product shots. The site labels them as such,
  and they are stored locally so the published pages make no external requests.

  Every id below was downloaded and looked at before being committed here.
  Rejected along the way: "matrix" code rain for Archenym, which is the
  cheapest possible hacker cliche and does the project a disservice.
*/
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('../src/assets/work/', import.meta.url));

const photos = [
  {
    slug: 'shot-warehouse',
    id: 'photo-1553413077-190dd305871c',
    subject: 'Racked warehouse aisle',
    usedBy: 'warehouse',
  },
  {
    slug: 'shot-dealership',
    id: 'photo-1567818735868-e71b99932e29',
    subject: 'Vehicle seen from above on a forecourt',
    usedBy: 'dmis',
  },
  {
    slug: 'shot-network',
    id: 'photo-1451187580459-43490279c0fa',
    subject: 'City lights from orbit, reading as a linked network',
    usedBy: 'archenym',
  },
  {
    slug: 'shot-neon',
    id: 'photo-1542051841857-5f90071e7989',
    subject: 'Neon-lit Japanese street crossing at night',
    usedBy: 'carianime',
  },
];

/* Large enough for a full-bleed panel; Astro re-encodes and resizes at build. */
const PARAMS = 'w=1600&q=76&fm=jpg&fit=max';

await mkdir(OUT, { recursive: true });

const credits = [
  '# Photography credits',
  '',
  'Illustrative photography for projects with no reachable deployment.',
  'These are not screenshots of the projects, and the site says so on each card.',
  '',
  'Source: Unsplash, used under the Unsplash Licence, which permits this use',
  'without permission. Attribution is appreciated rather than required; the',
  'photographer names are not resolvable from the image ids alone, so the',
  'source URL is recorded instead.',
  '',
  'Re-download with `npm run photos`.',
  '',
];

for (const photo of photos) {
  const url = `https://images.unsplash.com/${photo.id}?${PARAMS}`;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const bytes = Buffer.from(await response.arrayBuffer());
    await writeFile(`${OUT}${photo.slug}.jpg`, bytes);

    console.log(`saved  ${photo.slug}.jpg  ${(bytes.length / 1024).toFixed(0)} KB`);
    credits.push(
      `- **${photo.slug}.jpg** — ${photo.subject}. Used by \`${photo.usedBy}\`.`,
      `  <https://images.unsplash.com/${photo.id}>`,
      '',
    );
  } catch (error) {
    console.log(`FAILED ${photo.slug}  ${String(error).split('\n')[0]}`);
  }
}

await writeFile(`${OUT}CREDITS.md`, credits.join('\n'));
console.log('wrote  CREDITS.md');
