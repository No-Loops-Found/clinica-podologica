# Panel de administración del blog: instrucciones para Claude Code

Copia este archivo y `docs/blog-schema.sql` en la raíz del proyecto del panel
(Vite + Vue 3) y pídele a Claude Code: «Lee panel-admin.md y prepara un plan».

---

## 1. Contexto

La **Clínica Podológica Patricia Mateos** (Moraleja, Cáceres) tiene su web en
`https://podologiapatriciamateos.com`. Está hecha con Astro y desplegada en
Vercel (plan Hobby). El blog de esa web **lee los artículos de una base de datos
Turso** en cada visita, así que publicar un artículo no exige volver a desplegar.

Este proyecto es el **panel donde la clínica escribe y publica esos artículos**:

- **Dirección:** `https://admin.podologiapatriciamateos.com`.
- **Despliegue:** un proyecto aparte en Vercel (Hobby), con repositorio privado.
- **Quién lo usa:** la propietaria (podóloga, sin perfil técnico) y, quizá, alguna
  otra profesional de la clínica. Una o pocas personas.
- **Qué tiene que ser:** sencillo, en español, cómodo y difícil de romper. Mejor
  pocas opciones claras que muchas.

Restricción importante: con Vercel Hobby y repo privado solo se despliegan los
commits del dueño de la cuenta. Por eso **el panel no puede depender de commits
ni de despliegues para publicar**: escribe directamente en Turso.

## 2. Arquitectura

```
Navegador (SPA Vue)  ──fetch──▶  /api/*  (una Vercel Function, Node.js)
                                   ├──▶ Turso «clinica-blog»   (tabla posts)       ◀── la web la lee (token de solo lectura)
                                   ├──▶ Turso «clinica-admin»  (usuarias, sesiones)
                                   └──▶ Vercel Blob            (imágenes, públicas) ◀── la web enlaza las URL
```

- **Regla de oro:** el navegador nunca habla con Turso ni ve ningún token. Todo
  pasa por `/api`, que vive en el mismo dominio que el panel, así que no hace
  falta CORS.
- **Dos bases de datos.** Usuarias y sesiones van en una base aparte
  (`clinica-admin`). Así el token de lectura que usa la web pública no da acceso
  a los hashes de contraseñas.
- **Una sola función para todo el API**, con un router pequeño (recomendado:
  Hono). Usa el runtime Node.js, no Edge: argon2 es nativo. Configura Hono con el
  adaptador para Vercel que indique su documentación actual.

## 3. Contrato con la web: no cambiarlo sin actualizar también la web

La web ya está hecha y lee los datos según estas reglas. Su código está en el
repo de la web, en `src/lib/blog.ts`.

### 3.1 Esquema

Usa exactamente `blog-schema.sql`, copiado del repo de la web:

```sql
CREATE TABLE IF NOT EXISTS posts (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  slug          TEXT    NOT NULL UNIQUE CHECK (slug GLOB '[a-z0-9]*' AND slug NOT GLOB '*[^a-z0-9-]*'),
  title         TEXT    NOT NULL,
  excerpt       TEXT    NOT NULL,
  body_html     TEXT    NOT NULL,
  cover_url     TEXT,
  cover_alt     TEXT,
  cover_width   INTEGER,
  cover_height  INTEGER,
  category      TEXT    NOT NULL CHECK (category IN ('podologia', 'nutricion', 'osteopatia', 'general')),
  author_key    TEXT    NOT NULL CHECK (author_key IN ('patricia', 'celia', 'tania', 'elena')),
  status        TEXT    NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  published_at  TEXT,
  created_at    TEXT    NOT NULL,
  updated_at    TEXT    NOT NULL,
  CHECK (status = 'draft' OR published_at IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS posts_publicados ON posts (status, published_at DESC);
CREATE INDEX IF NOT EXISTS posts_categoria ON posts (category, status, published_at DESC);
```

### 3.2 Reglas de los datos

- **Fechas.** Siempre `new Date().toISOString()`, en UTC y con milisegundos
  (`2026-10-16T09:30:00.000Z`). La web compara las fechas como texto, así que el
  formato tiene que ser idéntico en todas.
- **Qué se ve en la web.** Un artículo aparece si `status = 'published'` y
  `published_at <= ahora`. Si `published_at` es futura, queda **programado**.
  Al publicar sin fecha, pon `published_at = ahora`. Al despublicar, vuelve a
  `status = 'draft'` y conserva `published_at`.
- **`updated_at`** se actualiza en cada guardado. La web lo usa para el sitemap y
  para mostrar «Actualizado el…».
- **Slug.** Se genera del título: minúsculas, sin tildes ni eñes (ñ → n),
  palabras separadas por guiones y sin guiones repetidos ni en los extremos.
  Se puede editar mientras el artículo nunca se ha publicado. **En cuanto tiene
  `published_at`, no se puede cambiar**, porque rompería los enlaces que ya
  existan. Esto se aplica en el API, no solo en la interfaz. Si el slug ya
  existe, avisa y propone otro.
- **Categoría.** Decide qué teléfono y qué WhatsApp ofrece la web al final del
  artículo:

  | Valor | Etiqueta |
  |---|---|
  | `podologia` | Podología |
  | `nutricion` | Nutrición |
  | `osteopatia` | Osteopatía |
  | `general` | La clínica |

- **Autora.** Estas son las claves válidas. Las fichas completas (foto, rol,
  titulación) las pone la web.

  | Clave | Nombre | Rol |
  |---|---|---|
  | `patricia` | Patricia Mateos | podóloga |
  | `celia` | Celia Castellano | podóloga |
  | `tania` | Tania Zamarreño | dietista-nutricionista |
  | `elena` | Elena Pérez | quiromasajista y osteópata |

- **Portada.** `cover_url` es una URL `https://` pública de Vercel Blob.
  `cover_width` y `cover_height` son las dimensiones reales en píxeles, para
  evitar saltos al cargar. `cover_alt` es obligatorio si hay portada.
- **`excerpt`** (el resumen): entre 50 y 160 caracteres. Sale en el listado, en
  Google y al compartir el artículo.
- **`body_html`.** Es HTML del editor, **saneado en el servidor antes de
  guardar** con `sanitize-html` y la misma lista que usa la web:
  - etiquetas: `p h2 h3 h4 strong b em i u s a ul ol li blockquote br hr img figure figcaption`;
  - atributos: en `a`, `href` y `title`; en `img`, `src alt width height`;
  - protocolos: `http https mailto tel`; en imágenes, solo `https`;
  - sin `<h1>`: el título del artículo ya es el h1 de la página. El editor no
    debe ofrecerlo.

### 3.3 Vista previa firmada

La web tiene la ruta `/blog/vista-previa/<id>/?exp=<exp>&sig=<sig>`, que muestra
cualquier artículo, también borradores, exactamente como se verá publicado:

- `exp`: segundos Unix de caducidad. Usa ahora + 1 hora.
- `sig`: HMAC-SHA256 en hexadecimal (minúsculas) del texto `${id}.${exp}`, con
  el secreto compartido `BLOG_PREVIEW_SECRET`. Es el mismo valor en los dos
  proyectos.
- La URL la genera **el API** (`POST /api/posts/:id/preview` → `{ url }`). El
  secreto nunca llega al navegador.
- Vector de prueba: con el secreto `secreto-de-prueba`, `id = 42` y
  `exp = 2000000000`, la firma es
  `31f250e646b0ddeec2b449eb75a3c91e6a254a68d06d7a5c25e56ce4ec836d5a`.
  Hazle un test.

### 3.4 Lo que ya hace la web

- **Caché:** las páginas del blog se guardan 5 minutos en la caché de Vercel. Un
  artículo publicado o editado tarda hasta 5 minutos en verse, y el panel debe
  decirlo («Aparecerá en la web en unos minutos»).
- **Dirección pública:** `https://podologiapatriciamateos.com/blog/<slug>/`.
- **Además:** sitemap, datos estructurados para Google, ficha de la autora y
  botones de cita. El panel no tiene que hacer nada de eso.

## 4. Stack

- **Frontend:** Vite, Vue 3 (`<script setup>`, TypeScript) y Vue Router. Para el
  editor, TipTap (`@tiptap/vue-3`, `starter-kit`, `extension-link`,
  `extension-image`, `extension-placeholder` y `extension-character-count`).
- **API:** Hono, `@libsql/client`, `@vercel/blob`, `@node-rs/argon2`,
  `sanitize-html` y `zod` para validar las entradas.
- **Desarrollo local:** `vercel dev`, que levanta Vite y las funciones a la vez.
  Para compartir datos con la web en local, usa `turso dev` con un archivo de
  base de datos y apunta a él la variable `TURSO_DATABASE_URL` de los dos
  proyectos. Así lo que se guarda en el panel se ve en el `npm run dev` de la web.
- **Tests:** Vitest para el slug, el saneado, la firma de la vista previa y las
  reglas de publicación.

## 5. Seguridad

- **Base `clinica-admin`:**
  - `users`: `id`, `email` (único), `name`, `password_hash`, `created_at`.
  - `sessions`: `token_hash` (PK), `user_id`, `expires_at`, `created_at`.
  - `login_attempts`: `key`, `at`.
- **Contraseñas:** hash argon2id.
- **No hay registro público.** Las usuarias se crean y su contraseña se
  restablece con un script local, `npm run usuaria -- crear <email>`, que pide la
  contraseña por consola.
- **Sesión:**
  - token aleatorio de 32 bytes en la cookie `__Host-sesion`, con `HttpOnly`,
    `Secure`, `SameSite=Strict`, `Path=/` y 30 días de duración;
  - en la base se guarda el SHA-256 del token, nunca el token;
  - cerrar sesión borra la fila.
- **Cookie limitada al subdominio:** el prefijo `__Host-` impide el atributo
  `Domain`, así que la cookie solo existe en `admin.`. Es importante: la política
  de cookies de la web dice que la web pública no usa cookies.
- **Límite de intentos:** máximo 5 fallos de login cada 15 minutos por email + IP.
  El mensaje de error es genérico («Email o contraseña incorrectos»).
- **CSRF:** además de `SameSite=Strict`, en todo lo que no sea GET comprueba que
  la cabecera `Origin` coincide con `ADMIN_ORIGIN`.
- **Validación en el servidor:** todas las entradas se validan con zod en el
  API, aunque la interfaz ya valide.
- **Fuera de Google:**
  - cabecera `X-Robots-Tag: noindex, nofollow` en todas las respuestas;
  - `robots.txt` con `Disallow: /`.
- **Cabeceras** (en `vercel.json`):
  - CSP: `default-src 'self'`, `img-src` con el dominio de Vercel Blob y `blob:`
    y `data:`, `frame-ancestors 'none'`. Ajusta `connect-src` a los dominios a
    los que sube `@vercel/blob`: compruébalo en la pestaña Red del navegador;
  - `Referrer-Policy` y `X-Content-Type-Options`.
- **Rutas de la SPA:** reescribe todas las que no empiecen por `/api` a
  `index.html`.

## 6. Imágenes

- **Almacén:** un Blob store de Vercel, público, creado en el proyecto del panel.
- **Subida directa desde el navegador** con `upload()` de `@vercel/blob/client` y
  un endpoint `handleUpload`. En `onBeforeGenerateToken`:
  - comprueba la sesión;
  - limita los tipos a `image/webp`, `image/jpeg` y `image/png`;
  - limita el tamaño a 3 MB;
  - guarda en la ruta `blog/` con sufijo aleatorio.
- **Antes de subir, redimensiona en el navegador** (canvas o `createImageBitmap`):
  - máximo 1600 px de ancho para la portada y 1200 px para las imágenes del texto;
  - formato WebP con calidad ~0,82;
  - guarda el ancho y el alto resultantes.
- **Texto alternativo:** obligatorio en la portada y pedido al insertar cada
  imagen en el texto. Las imágenes del texto se insertan como
  `<img src width height alt>`.
- **Limpieza:** al cambiar la portada o borrar un artículo, intenta borrar el
  blob antiguo. Si falla, no bloquees la operación.

## 7. Pantallas y experiencia de uso

Público: personas no técnicas. Interfaz en español y sin jerga:
- «Guardar borrador», «Publicar», «Programar», «Despublicar», nunca «status» ni «slug»;
- el slug se llama «Dirección del artículo» y se muestra como URL completa.

**Accesibilidad:**
- letra base de 17–18 px;
- botones grandes y foco visible;
- mensajes claros de éxito y de error;
- que funcione bien en tablet.

**Estilo**, el mismo que la web:
- colores `#0F3D44` (verde petróleo, botones), `#21717A` (marca), `#E4F1F2`
  (fondo suave), `#FCFBF7` (papel), `#16262A` (texto) y `#52656A` (texto
  secundario);
- tipografías Fraunces para títulos y Public Sans para texto, con Fontsource.

### Pantallas

1. **Acceso.** Email y contraseña.
2. **Artículos.**
   - Pestañas: Borradores, Publicados y Programados.
   - Cada fila muestra título, categoría, autora, fecha y estado.
   - Botón destacado «Nuevo artículo».
   - En los publicados, enlace «Ver en la web».
3. **Editor**, con estos campos en orden:
   - **Título:** obligatorio, con contador; aviso suave a partir de 65 caracteres.
   - **Resumen:** obligatorio, con contador de 50 a 160.
   - **Especialidad** (categoría) y **Autora**: listas desplegables.
   - **Imagen de portada:** con su texto alternativo.
   - **Contenido:** editor TipTap. La barra tiene Párrafo, Subtítulo (h2),
     Apartado (h3), Negrita, Cursiva, Lista, Lista numerada, Cita, Enlace, Imagen
     y Deshacer/Rehacer. Sin h1, colores ni fuentes. Al pegar desde Word o desde
     webs, limpia los estilos.
   - **Dirección del artículo:** automática, editable solo antes de publicar.
   - **Fecha de publicación:** opcional, sirve para programar.
   - **Acciones:**
     - «Guardar borrador»;
     - «Vista previa», que guarda y abre la URL firmada en otra pestaña;
     - «Publicar» o «Programar», que confirma y avisa de que tarda unos minutos;
     - «Despublicar»;
     - «Eliminar», que pide confirmación y sugiere despublicar en su lugar.
   - **Cambios sin guardar:** aviso al salir de la página.
4. **Consejos.** Un panel lateral plegable con pistas breves para posicionar:
   - una idea por artículo;
   - el tema principal en el título;
   - subtítulos para ordenar;
   - un enlace a la página de la especialidad;
   - un resumen que invite a leer;
   - unas 600–1200 palabras.

## 8. API sugerido

| Método y ruta | Qué hace |
|---|---|
| `POST /api/login` · `POST /api/logout` · `GET /api/me` | Sesión |
| `GET /api/posts?estado=` | Listado, sin `body_html` |
| `GET /api/posts/:id` | Un artículo completo |
| `POST /api/posts` · `PUT /api/posts/:id` | Crear y guardar. Valida, sanea, aplica las reglas de 3.2 |
| `POST /api/posts/:id/publicar` · `/despublicar` | Cambiar el estado |
| `DELETE /api/posts/:id` | Borrar, e intentar borrar sus imágenes |
| `POST /api/posts/:id/preview` | Devuelve `{ url }` firmada |
| `POST /api/upload` | `handleUpload` de Vercel Blob |

## 9. Variables de entorno del panel

| Variable | Valor |
|---|---|
| `TURSO_BLOG_URL` / `TURSO_BLOG_TOKEN` | Base `clinica-blog`, token con escritura |
| `TURSO_ADMIN_URL` / `TURSO_ADMIN_TOKEN` | Base `clinica-admin` |
| `BLOB_READ_WRITE_TOKEN` | Lo crea Vercel al conectar el Blob store |
| `BLOG_PREVIEW_SECRET` | Igual que en la web (`openssl rand -hex 32`) |
| `SITE_URL` | `https://podologiapatriciamateos.com` |
| `ADMIN_ORIGIN` | `https://admin.podologiapatriciamateos.com` |

## 10. Puesta en marcha (pasos manuales)

1. **Crear las bases de datos en Turso**, en una región europea:
   `turso db create clinica-blog` y `turso db create clinica-admin`.
2. **Crear la tabla del blog:** `turso db shell clinica-blog < blog-schema.sql`.
   Las tablas de `clinica-admin`, con un script de migración del propio panel.
3. **Tokens:**
   - para el panel, `turso db tokens create clinica-blog` y
     `turso db tokens create clinica-admin`;
   - para la web, **solo lectura**: `turso db tokens create clinica-blog --read-only`.
4. **Vercel, proyecto del panel:**
   - repositorio del panel;
   - Blob store;
   - variables de entorno;
   - dominio `admin.podologiapatriciamateos.com` (registro CNAME en el DNS);
   - región de funciones en Europa (por ejemplo París o Fráncfort), cerca de Turso.
5. **Vercel, proyecto de la web:**
   - variables `TURSO_DATABASE_URL` (URL de `clinica-blog`), `TURSO_AUTH_TOKEN`
     (el de solo lectura) y `BLOG_PREVIEW_SECRET`;
   - región de funciones en Europa también.
6. **Crear la primera usuaria** con el script.

## 11. Cómo saber que está terminado

- [ ] Login, logout, límite de intentos y sesión caducada funcionan. Sin sesión,
      el API responde 401.
- [ ] Ciclo completo:
  - [ ] crear un borrador con portada e imágenes;
  - [ ] la vista previa muestra el artículo con el diseño de la web;
  - [ ] publicar;
  - [ ] en menos de 5 minutos aparece en `/blog/`, en su URL y en `/sitemap-blog.xml`.
- [ ] Programar con fecha futura no lo muestra en la web hasta esa fecha.
- [ ] La dirección no se puede cambiar tras publicar, ni llamando al API directamente.
- [ ] El HTML con `<script>`, `onerror` o `javascript:` se guarda saneado.
- [ ] El test de la firma con el vector de 3.3 pasa.
- [ ] Ningún token ni secreto aparece en el bundle del navegador (búscalo en `dist/`).
- [ ] El panel no aparece en Google: hay `noindex` y `robots.txt`.
