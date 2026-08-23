// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://nexbridge-it.com',
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    mdx(),
    // Emits xhtml:link alternates so Google understands the DE/EN pairing.
    sitemap({
      // Card routes are handouts behind printed NFC/QR codes, not landing
      // pages — noindex in the page head and absent here.
      filter: (page) => !/\/(karte|en\/card)(\/|$)/.test(new URL(page).pathname),
      i18n: {
        defaultLocale: 'de',
        locales: { de: 'de-DE', en: 'en' },
      },
    }),
  ],
});
