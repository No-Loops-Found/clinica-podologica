/**
 * Lectura de los artículos del blog desde Turso. La web solo lee: los escribe
 * el panel de administración (admin.podologiapatriciamateos.com). El esquema
 * compartido está en docs/blog-schema.sql.
 */
import { createClient, type Client, type Row } from '@libsql/client';
import { TURSO_DATABASE_URL, TURSO_AUTH_TOKEN, BLOG_PREVIEW_SECRET } from 'astro:env/server';
import sanitizeHtml from 'sanitize-html';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { PHONES, SITE } from '../consts';
import { EQUIPO } from '../data/equipo';

export type Categoria = 'podologia' | 'nutricion' | 'osteopatia' | 'general';

export type Post = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  /** Solo en las consultas de un artículo; ya saneado. */
  bodyHtml: string;
  cover: { url: string; alt: string; width: number; height: number } | null;
  category: Categoria;
  authorKey: string;
  status: 'draft' | 'published';
  publishedAt: Date | null;
  updatedAt: Date;
};

/** Cada categoría lleva a su especialidad y a su teléfono. «General» usa el de podología. */
export const CATEGORIAS: Record<Categoria, { label: string; href: string; icon: string; phone: (typeof PHONES)[number] }> = {
  podologia: { label: 'Podología', href: '/podologia/', icon: 'foot', phone: PHONES[0] },
  nutricion: { label: 'Nutrición', href: '/nutricionista/', icon: 'leaf', phone: PHONES[1] },
  osteopatia: { label: 'Osteopatía', href: '/osteopatia-y-quiromasaje/', icon: 'hand', phone: PHONES[2] },
  general: { label: 'La clínica', href: '/servicios/', icon: 'heart', phone: PHONES[0] },
};

/** Las páginas públicas del blog se cachean 5 minutos en Vercel: es lo que tarda en verse un cambio. */
export const CACHE_PUBLICO = 'public, max-age=0, s-maxage=300, stale-while-revalidate=86400';

let client: Client | undefined;
function db() {
  if (!TURSO_DATABASE_URL) throw new Error('Falta la variable de entorno TURSO_DATABASE_URL');
  return (client ??= createClient({ url: TURSO_DATABASE_URL, authToken: TURSO_AUTH_TOKEN }));
}

const COLS_LISTA = 'id, slug, title, excerpt, cover_url, cover_alt, cover_width, cover_height, category, author_key, status, published_at, updated_at';
const COLS = `${COLS_LISTA}, body_html`;
// Publicado y con fecha ya cumplida (las fechas futuras son artículos programados).
const VISIBLE = `status = 'published' AND published_at <= ?`;
const ahora = () => new Date().toISOString();

export async function listarPublicados(opts: { categoria?: Categoria; limite?: number } = {}): Promise<Post[]> {
  const { rows } = await db().execute({
    sql: `SELECT ${COLS_LISTA} FROM posts WHERE ${VISIBLE} ${opts.categoria ? 'AND category = ?' : ''}
          ORDER BY published_at DESC LIMIT ?`,
    args: [ahora(), ...(opts.categoria ? [opts.categoria] : []), opts.limite ?? 500],
  });
  return rows.map(aPost);
}

export async function obtenerPorSlug(slug: string): Promise<Post | null> {
  const { rows } = await db().execute({
    sql: `SELECT ${COLS} FROM posts WHERE slug = ? AND ${VISIBLE}`,
    args: [slug, ahora()],
  });
  return rows[0] ? aPost(rows[0]) : null;
}

/** Cualquier estado: para la vista previa firmada desde el panel. */
export async function obtenerPorId(id: number): Promise<Post | null> {
  const { rows } = await db().execute({ sql: `SELECT ${COLS} FROM posts WHERE id = ?`, args: [id] });
  return rows[0] ? aPost(rows[0]) : null;
}

/** Primero los de la misma categoría, luego los más recientes. */
export async function relacionados(post: Post, limite = 3): Promise<Post[]> {
  const { rows } = await db().execute({
    sql: `SELECT ${COLS_LISTA} FROM posts WHERE ${VISIBLE} AND id != ?
          ORDER BY (category = ?) DESC, published_at DESC LIMIT ?`,
    args: [ahora(), post.id, post.category, limite],
  });
  return rows.map(aPost);
}

function aPost(r: Row): Post {
  const coverUrl = r.cover_url as string | null;
  return {
    id: Number(r.id),
    slug: r.slug as string,
    title: r.title as string,
    excerpt: r.excerpt as string,
    bodyHtml: typeof r.body_html === 'string' ? sanear(r.body_html) : '',
    cover: coverUrl
      ? { url: coverUrl, alt: (r.cover_alt as string) ?? '', width: Number(r.cover_width) || 1600, height: Number(r.cover_height) || 1000 }
      : null,
    category: r.category as Categoria,
    authorKey: r.author_key as string,
    status: r.status as Post['status'],
    publishedAt: r.published_at ? new Date(r.published_at as string) : null,
    updatedAt: new Date(r.updated_at as string),
  };
}

/**
 * El panel ya sanea al guardar; aquí se vuelve a sanear por si acaso, porque
 * el HTML se inserta tal cual en la web. Misma lista que en el panel.
 */
function sanear(html: string) {
  return sanitizeHtml(html, {
    allowedTags: ['p', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'a', 'ul', 'ol', 'li', 'blockquote', 'br', 'hr', 'img', 'figure', 'figcaption'],
    allowedAttributes: { a: ['href', 'title', 'target', 'rel'], img: ['src', 'alt', 'width', 'height', 'loading', 'decoding'] },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedSchemesByTag: { img: ['https'] },
    allowProtocolRelative: false,
    // Imágenes solo desde https o rutas del propio sitio.
    exclusiveFilter: (f) => f.tag === 'img' && !/^(https:\/\/|\/[^/])/.test(f.attribs.src ?? ''),
    transformTags: {
      // El título del artículo ya es el h1.
      h1: 'h2',
      a: (tagName, attribs) => {
        const externo = /^https?:\/\//.test(attribs.href ?? '') && !attribs.href.startsWith(SITE.domain);
        return { tagName, attribs: externo ? { ...attribs, target: '_blank', rel: 'noopener' } : attribs };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: 'lazy', decoding: 'async' } }),
    },
  });
}

export const autora = (key: string) => EQUIPO.find((m) => m.key === key) ?? EQUIPO[0];

export const fecha = (d: Date) =>
  d.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Madrid' });

export const minutosLectura = (html: string) =>
  Math.max(1, Math.round(html.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length / 200));

/**
 * Vista previa de borradores. El panel firma `${id}.${exp}` con HMAC-SHA256 y
 * el secreto compartido BLOG_PREVIEW_SECRET; exp son segundos Unix.
 */
export function firmaValida(id: string, exp: string | null, sig: string | null) {
  if (!BLOG_PREVIEW_SECRET || !exp || !sig || !/^\d+$/.test(exp) || Number(exp) * 1000 < Date.now()) return false;
  const esperada = Buffer.from(createHmac('sha256', BLOG_PREVIEW_SECRET).update(`${id}.${exp}`).digest('hex'));
  const recibida = Buffer.from(sig);
  return esperada.length === recibida.length && timingSafeEqual(esperada, recibida);
}
