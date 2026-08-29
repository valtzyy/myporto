// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

// Static output only. No adapter: Vercel serves `dist/` natively, and the
// adapter pulled in a vulnerable path-to-regexp for routing we never use.
// https://astro.build/config
export default defineConfig({
  site: 'https://novaldo.my.id',
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'id'],
    routing: {
      // English stays at the root; Indonesian lives under /id/.
      prefixDefaultLocale: false,
    },
  },
  // No `prefetch` and no ClientRouter: both ship JavaScript to every page.
  // Cross-document view transitions are done in CSS instead (see global.css).
  build: {
    inlineStylesheets: 'always',
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
