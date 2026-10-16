-- Esquema de la base de datos del blog (Turso / libSQL).
--
-- Es el contrato entre la web (que solo lee) y el panel de administración
-- (que escribe). Si cambia, hay que actualizar los dos proyectos:
--   web:   src/lib/blog.ts
--   panel: su capa de acceso a datos
--
-- Fechas: texto ISO 8601 en UTC con milisegundos, tal como lo genera
-- `new Date().toISOString()` (p. ej. 2026-10-16T09:30:00.000Z). Todas con el
-- mismo formato, porque la web las compara como texto.

CREATE TABLE IF NOT EXISTS posts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  -- Dirección del artículo: /blog/<slug>/. Minúsculas, sin tildes, guiones.
  -- No debe cambiar una vez publicado: rompería los enlaces existentes.
  slug          TEXT    NOT NULL UNIQUE CHECK (slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*'),
  title         TEXT    NOT NULL,
  -- Resumen: se usa en el listado, en la meta description y al compartir. 50-160 caracteres.
  excerpt       TEXT    NOT NULL,
  -- HTML generado por el editor y saneado al guardar. Sin <h1>: el título ya lo es.
  body_html     TEXT    NOT NULL,
  -- Portada: URL https pública (Vercel Blob) con sus dimensiones en píxeles.
  cover_url     TEXT,
  cover_alt     TEXT,
  cover_width   INTEGER,
  cover_height  INTEGER,
  -- Especialidad del artículo: decide qué teléfono y WhatsApp se ofrecen al final.
  category      TEXT    NOT NULL CHECK (category IN ('podologia', 'nutricion', 'osteopatia', 'general')),
  -- Autora: clave de EQUIPO en la web (src/data/equipo.ts).
  author_key    TEXT    NOT NULL CHECK (author_key IN ('patricia', 'celia', 'tania', 'elena')),
  status        TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  -- Fecha de publicación. Si es futura, el artículo queda programado: la web
  -- no lo muestra hasta entonces aunque status sea 'published'.
  published_at  TEXT,
  created_at    TEXT    NOT NULL,
  updated_at    TEXT    NOT NULL,
  CHECK (status = 'draft' OR published_at IS NOT NULL)
);

CREATE INDEX IF NOT EXISTS posts_publicados ON posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_categoria ON posts (category, status, published_at DESC);
