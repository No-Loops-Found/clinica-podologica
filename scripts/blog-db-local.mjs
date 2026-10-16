// Crea una base de datos local del blog con artículos de ejemplo, para
// desarrollar sin tocar Turso. Uso:
//   npm run blog:db-local
// y en .env:  TURSO_DATABASE_URL=file:blog-local.db
import { createClient } from '@libsql/client';
import { readFileSync, rmSync } from 'node:fs';

const FILE = 'blog-local.db';
rmSync(FILE, { force: true });
const db = createClient({ url: `file:${FILE}` });
await db.executeMultiple(readFileSync('docs/blog-schema.sql', 'utf8'));

const dias = (n) => new Date(Date.now() + n * 864e5).toISOString();

const cuerpo = `
<p>Este es un <strong>artículo de ejemplo</strong> para probar el blog en local. El texto real lo escribirá la clínica desde el panel.</p>
<h2>Un apartado con subtítulo</h2>
<p>Los párrafos usan el mismo tamaño de letra que el resto de la web. Aquí hay <a href="/podologia/">un enlace interno</a> y <a href="https://www.aepd.es">otro externo</a>.</p>
<ul><li>Primer punto de una lista</li><li>Segundo punto, algo más largo para ver cómo se parte la línea en móvil</li></ul>
<h3>Un subapartado</h3>
<blockquote><p>Una cita destacada para ver su estilo.</p></blockquote>
<figure><img src="/img/elena.jpg" alt="Imagen de ejemplo dentro del artículo" width="615" height="554"><figcaption>Pie de foto de ejemplo.</figcaption></figure>
<ol><li>Paso uno</li><li>Paso dos</li></ol>
<p>Contenido que el saneado debe eliminar:<script>alert('xss')</script> <img src="x" onerror="alert('xss')"> <a href="javascript:alert('xss')">enlace malicioso</a>.</p>
<h1>Un h1 dentro del cuerpo, que debe convertirse en h2</h1>
<p>Fin del artículo de ejemplo.</p>`;

const posts = [
  { slug: 'una-encarnada-cuando-ir-al-podologo', title: 'Uña encarnada: cuándo ir al podólogo', excerpt: 'Artículo de ejemplo. Cómo reconocer una uña encarnada, qué no hacer en casa y cuándo conviene pedir cita.', category: 'podologia', author_key: 'patricia', status: 'published', published_at: dias(-3), cover: ['/img/patricia.webp', 'Patricia Mateos en la consulta', 821, 821] },
  { slug: 'desayunos-saludables-para-ninos', title: 'Ideas de desayunos saludables para niños', excerpt: 'Artículo de ejemplo sin portada, para ver cómo queda la tarjeta y la página cuando no hay imagen.', category: 'nutricion', author_key: 'tania', status: 'published', published_at: dias(-10), cover: null },
  { slug: 'dolor-de-espalda-y-postura', title: 'Dolor de espalda y postura en el trabajo', excerpt: 'Artículo de ejemplo de osteopatía con portada, para probar la categoría y la autora.', category: 'osteopatia', author_key: 'elena', status: 'published', published_at: dias(-20), cover: ['/img/elena.jpg', 'Elena Pérez, osteópata', 615, 554] },
  { slug: 'borrador-no-visible', title: 'Borrador que no debe verse', excerpt: 'Este artículo está en borrador: no debe aparecer en el listado ni en el sitemap.', category: 'general', author_key: 'patricia', status: 'draft', published_at: null, cover: null },
  { slug: 'programado-no-visible', title: 'Artículo programado para dentro de una semana', excerpt: 'Publicado pero con fecha futura: no debe aparecer hasta esa fecha.', category: 'podologia', author_key: 'celia', status: 'published', published_at: dias(7), cover: null },
];

for (const p of posts) {
  const [cover_url, cover_alt, cover_width, cover_height] = p.cover ?? [null, null, null, null];
  await db.execute({
    sql: `INSERT INTO posts (slug, title, excerpt, body_html, cover_url, cover_alt, cover_width, cover_height,
            category, author_key, status, published_at, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [p.slug, p.title, p.excerpt, cuerpo, cover_url, cover_alt, cover_width, cover_height,
      p.category, p.author_key, p.status, p.published_at, dias(-30), dias(-1)],
  });
}
console.log(`${FILE} creada con ${posts.length} artículos (3 visibles, 1 borrador, 1 programado).`);
