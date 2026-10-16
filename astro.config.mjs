import { defineConfig, envField } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';

const site = 'https://podologiapatriciamateos.com';

export default defineConfig({
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Todo se genera estático salvo el blog (prerender = false), que lee los
  // artículos de Turso en cada petición. Así publicar no exige desplegar.
  adapter: vercel(),
  env: {
    schema: {
      // Opcional para que, si falta, el blog muestre un aviso en vez de romper.
      TURSO_DATABASE_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURSO_AUTH_TOKEN: envField.string({ context: 'server', access: 'secret', optional: true }),
      // Compartido con el panel de administración para firmar las vistas previas.
      BLOG_PREVIEW_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
  integrations: [
    // Las páginas del blog no existen al compilar: van en su propio sitemap.
    sitemap({ customSitemaps: [`${site}/sitemap-blog.xml`] }),
  ],
  vite: { plugins: [tailwindcss()] },
});
