# myporto

Personal portfolio for Novaldo Putra Nugraha — information systems undergraduate
at UPN "Veteran" Yogyakarta. Bilingual, static, and built to load fast on a
phone, because that is where most people will open it.

Live at [novaldo.my.id](https://novaldo.my.id).

## Why Astro, and why no framework on the page

The site is almost entirely content with a single interactive element. Next.js
or any other React setup would ship a runtime and a router to every visitor
before a line of my own code ran. Astro ships **zero JavaScript by default**, so
JS is paid for only where it earns its place.

What that buys, measured on the production build:

| | |
|---|---|
| Home page | 16.7 KB gzipped, including inlined CSS |
| Eager JavaScript | 2.4 KB gzipped |
| WebGL scene | 129 KB gzipped, loaded lazily and conditionally |
| External requests | none — fonts, images and scripts are all self-hosted |
| With JavaScript off | fully readable, nothing hidden |

Every section animates through CSS scroll timelines (`animation-timeline:
view()`), not a motion library. Cross-document view transitions are a CSS
at-rule rather than a client-side router.

## The hero, in three tiers

The hero is a generated graph — clustered nodes with dense links inside a
module and sparse links between them, the shape of a database schema. It is
generated rather than drawn so that the same data can be rendered three
different ways, which cannot drift apart:

1. **No JavaScript** — an SVG rendered at build time. Always present.
2. **JavaScript, no GPU** — the same SVG, animated in place.
3. **WebGL** — three.js takes over with real depth, custom point shaders and
   cursor repulsion, then the SVG fades out.

Reduced motion does not drop a tier. The artwork stays; only the movement goes.

Camera framing is solved rather than guessed: `fitDistance()` derives the
distance that fits the graph in a given viewport, because a hard-coded distance
cropped the graph on phones.

## Honesty rules

A portfolio is a claim about someone. Two rules keep this one accurate:

- **Every fact traces to a source.** `src/consts.ts` holds personal data, and
  nothing goes in it that a real document does not support. Where a date was
  never recorded — the HIMASISFO work — the field is left empty rather than
  filled with a plausible guess.
- **Illustrations are labelled as illustrations.** Projects with a reachable
  deployment carry a real screenshot. Projects without one carry thematic
  photography rendered as a duotone, and the card says *"illustration, not a
  screenshot"* in both languages. Screenshots and illustrations live in separate
  schema fields so they can never be confused in a template.

## Structure

```
src/
├─ components/     UI, one concern each
├─ content.config.ts   Zod schemas — malformed content fails the build
├─ data/
│  ├─ work/{en,id}/    Project case studies, written in both languages
│  └─ experience/{en,id}/
├─ i18n/           UI strings and locale helpers
├─ layouts/        Base document, metadata, hreflang
├─ lib/            Pure logic, unit-tested
├─ pages/          `/` is English, `/id/` is Indonesian
└─ styles/
scripts/           Screenshot and photography fetchers
```

Everything in `src/lib/` is pure and covered by tests — the graph generator, the
camera fit, the diagram generator, and the cursor hit-testing. These are the
parts where a subtle mistake is invisible until it is embarrassing.

## Running it

Requires Node 22.12 or newer.

```bash
npm install
npm run dev
```

English at `localhost:4321`, Indonesian at `localhost:4321/id/`.

| Script | Purpose |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build — the honest measure of speed |
| `npm test` | 48 unit tests |
| `npm run check` | Astro and TypeScript diagnostics |
| `npm run capture` | Re-screenshot the deployed projects |
| `npm run photos` | Re-download illustrative photography |

`npm run dev` is not what performance should be judged on; it serves unbundled
sources. Use `npm run build` then `npm run preview`.

## Deployment

Static output with no adapter, so any static host serves it. `dist/` is the
whole site.

## Credits

Illustrative photography comes from Unsplash under the Unsplash Licence, with
sources recorded in [`src/assets/work/CREDITS.md`](src/assets/work/CREDITS.md).
Type is Geist, self-hosted.

## Licence

Code is free to learn from. The written content, CV and personal data are not
mine to license away — please do not reuse them as your own.
