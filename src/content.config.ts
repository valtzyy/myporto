import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

/*
  Schemas are strict on purpose. A missing date or an empty role fails the
  build instead of rendering a quietly broken panel in production.

  Entry ids come out as `<lang>/<slug>`, which is how locale is resolved.
*/

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/work' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      tagline: z.string(),
      /* Long-form case study, or a compact card in the grid. */
      format: z.enum(['case-study', 'card']),
      /* Lower sorts first. */
      order: z.number().int(),
      year: z.string(),
      role: z.string(),
      context: z.enum(['coursework', 'team', 'personal', 'competition']),
      stack: z.array(z.string()).min(1),
      repo: z.url().optional(),
      live: z.url().optional(),
      /* Set when a demo exists but is currently down, so the UI can say so
         rather than sending a recruiter to a 500 page. */
      liveStatus: z.enum(['up', 'down']).optional(),
      liveNote: z.string().optional(),
      /* Verified counts only, each traceable to the repository. */
      facts: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .max(4)
        .optional(),
      /* A real screenshot or brand asset. Projects with no reachable
         deployment have none and fall back to `backdrop`, then to artwork. */
      cover: image().optional(),
      coverAlt: z.string().optional(),
      /* Illustrative photography, deliberately kept in a separate field from
         `cover` so an illustration can never be mistaken for a screenshot in
         the template. Rendered as a duotone in the site palette. */
      backdrop: image().optional(),
      backdropAlt: z.string().optional(),
      backdropFocus: z.enum(['center', 'top', 'bottom']).default('center'),
      /* Screenshots fill the frame; brand marks need room around them. */
      coverFit: z.enum(['cover', 'contain']).default('cover'),
      coverTone: z.enum(['light', 'dark']).default('light'),
      gallery: z
        .array(z.object({ src: image(), alt: z.string() }))
        .max(3)
        .optional(),
    }),
});

const experience = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/data/experience' }),
  schema: z.object({
    role: z.string(),
    org: z.string(),
    orgNote: z.string().optional(),
    /* Optional because not every role in the source documents carries a date,
       and an invented one is worse than an absent one. */
    period: z.string().optional(),
    /* Drives the visual weight: technical roles lead, organisational follow. */
    kind: z.enum(['technical', 'organisational']),
    order: z.number().int(),
    highlights: z.array(z.string()).min(1),
  }),
});

export const collections = { work, experience };
