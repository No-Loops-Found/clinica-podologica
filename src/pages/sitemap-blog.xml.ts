/** Sitemap de los artículos del blog. El índice (sitemap-index.xml) lo enlaza. */
import type { APIRoute } from 'astro';
import { listarPublicados } from '../lib/blog';
import { SITE } from '../consts';

export const prerender = false;

export const GET: APIRoute = async () => {
  let posts;
  try {
    posts = await listarPublicados();
  } catch (e) {
    console.error('[blog] No se pudo leer Turso:', e);
    // 503 y no 404: así Google vuelve a intentarlo en vez de olvidar el sitemap.
    return new Response(null, { status: 503, headers: { 'Retry-After': '300' } });
  }
  const urls = [
    { loc: `${SITE.domain}/blog/`, lastmod: posts[0]?.updatedAt },
    ...posts.map((p) => ({ loc: `${SITE.domain}/blog/${p.slug}/`, lastmod: p.updatedAt })),
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc>${u.lastmod ? `<lastmod>${u.lastmod.toISOString()}</lastmod>` : ''}</url>`).join('\n')}
</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
};
