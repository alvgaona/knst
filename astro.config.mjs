// @ts-check
import netlify from '@astrojs/netlify';
import solid from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'http://localhost:4321',
  output: 'server',
  adapter: netlify(),
  integrations: [
    solid({ devtools: true }),
    tailwind({ applyBaseStyles: false }),
  ],
});
