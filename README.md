# Clínica Podológica Patricia Mateos

Web en Astro 5 + Tailwind 4, pensada para desplegarse en Vercel.
Porta el contenido del WordPress anterior (tema Bricks) sin depender de él.
Todo es estático salvo el blog, que lee los artículos de Turso (ver «Blog»).

## Arrancar

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # genera dist/
npm run preview
```

Todas las páginas se generan como HTML estático, salvo las del blog. Para que
el blog funcione en local, crea la base de datos de ejemplo:

```bash
cp .env.example .env
npm run blog:db-local   # crea blog-local.db con artículos de prueba
```

## Desplegar en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel, «Add New → Project» e importa el repo.
3. Vercel detecta Astro solo. Framework Preset: Astro. No hace falta tocar nada más.
4. En Settings → Domains, añade `podologiapatriciamateos.com` y `www.` como
   redirección al dominio principal.

`vercel.json` ya incluye cabeceras de seguridad y las redirecciones de las URLs
antiguas.

## Estructura

```
src/
  consts.ts              Datos de la clínica, los tres teléfonos y la navegación
  data/servicios.ts      Las tres especialidades (fuente única para inicio y servicios)
  data/equipo.ts         Fichas del equipo
  data/faq.ts            Preguntas frecuentes (con schema FAQPage)
  styles/global.css      Tokens de diseño (@theme) y clases de componente (.btn, .card, .wrap…)
  layouts/Base.astro     Cabecera, pie, barra de llamada, metadatos y JSON-LD MedicalClinic
  components/
    Header.astro         Barra superior con dirección y teléfonos + navegación + menú móvil
    Footer.astro         Pie oscuro con teléfonos, secciones y logos de financiación
    CallBar.astro        Barra fija inferior en móvil; «Llamar» despliega los tres números
    Directorio.astro     Tarjetas de teléfono (layout grid o list, variante clara u oscura)
    Hero.astro           Cabecera de subpágina con tarjeta de cita de la especialidad
    CtaBand.astro        Banda final de llamada a la acción
    Titulo.astro         Encabezado de sección (antetítulo + título + entradilla)
    Faq.astro            Acordeón de preguntas
    Ficha.astro          Ficha completa de una profesional
    Especialista.astro   Tarjeta «te atiende» en las páginas de especialidad
    Avatar.astro         Foto o iniciales
    Icon.astro           Iconos SVG en línea (sin librerías)
    Legal.astro          Plantilla de páginas legales
    blog/                Página de artículo y tarjeta del listado
  lib/blog.ts            Lectura de artículos desde Turso, saneado del HTML y vista previa
  pages/                 Una página por ruta
  pages/blog/            Blog (renderizado en cada petición, no estático)
docs/
  blog-schema.sql        Esquema de la base de datos del blog (contrato con el panel)
  panel-admin.md         Instrucciones para construir el panel de administración
public/img/              Imágenes reales recuperadas del WordPress
```

## Blog

Los artículos viven en una base de datos Turso y se escriben desde un panel
aparte (`admin.podologiapatriciamateos.com`, otro proyecto). Así publicar no
exige commits ni despliegues, que en Vercel Hobby con repo privado solo puede
hacer el dueño de la cuenta.

- `/blog/`, `/blog/<slug>/` y `/sitemap-blog.xml` se renderizan en el servidor en
  cada petición (`prerender = false`) y Vercel las cachea 5 minutos. El resto del
  sitio sigue siendo estático.
- La web solo lee, con un token de **solo lectura**. El HTML de los artículos se
  vuelve a sanear al mostrarlo.
- `/blog/vista-previa/<id>/` muestra borradores con un enlace firmado y
  caducable que genera el panel (`BLOG_PREVIEW_SECRET`, igual en ambos).
- Las URLs de entradas del WordPress (`/blog/AAAA/MM/DD/slug`) redirigen a
  `/blog/slug/`: si se recrea un artículo antiguo con el mismo slug, recupera
  sus enlaces.

Variables de entorno en Vercel: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` y
`BLOG_PREVIEW_SECRET` (ver `.env.example`).

## Decisiones de diseño

- **Paleta a partir del logo real** (`#3FA3AE`) sobre fondos crema cálidos. El verde
  petróleo profundo se reserva para botones, la banda de cita y el pie. El aqua de
  marca solo se usa como acento o sobre fondo oscuro: no cumple contraste AA como
  texto sobre blanco.
- **Tipografía**: Fraunces variable (eje SOFT, con cursiva para acentos) en títulos y
  Public Sans en el cuerpo. Fuentes autoalojadas con Fontsource: no se llama a
  Google Fonts.
- **Texto base a 17px** y contraste alto: buena parte de las pacientes son
  personas mayores. Botones grandes, foco visible, menú móvil con texto «Menú».
- **Tres teléfonos como elemento estructural.** Cada especialidad tiene el suyo;
  aparecen en la barra superior, el menú móvil, la barra de llamada, la portada,
  cada página de especialidad, la banda final y el pie.
- **Fotos con forma de arco** y tarjetas con icono por especialidad (pie, hoja, mano)
  para dar identidad sin imágenes de banco.
- **Logos de financiación europea** en la franja más oscura del pie: los PNG son
  blancos sobre transparente y no se ven sobre fondo claro.
- **Sin cookies ni scripts de terceros.** No hay Google Maps incrustado ni
  analítica, así que de momento no hace falta banner de cookies.
- **Sin formulario de contacto.** Ver más abajo.

## Pendiente antes de publicar

1. **Textos legales.** Aviso legal, privacidad y cookies están como plantilla:
   el WordPress los generaba con un plugin y no venían en la copia. Hacen falta
   denominación fiscal, NIF, registro sanitario del centro y números de colegiada.
2. **Formulario de cita.** El WordPress recogía email, teléfono, servicio y
   franja horaria. No se ha portado a propósito: en una web sanitaria necesita
   base legal, consentimiento y un destino seguro. Decidir con la clínica.
3. **Fotos de Celia y Tania.** No estaban en la copia; ahora se muestran sus
   iniciales. Tampoco hay fotos reales de la consulta.
4. **Revisar la biografía de Tania.** En la web anterior terminaba con
   «Graduada en Podología por la Universidad de Extremadura (2019-2023)», que es
   la titulación de Celia. Aquí se ha retirado; confirmar cuál es la correcta.
5. **Logos de financiación europea.** Se han mantenido en el pie porque estaban
   en la web anterior y suelen ser obligatorios mientras dure el compromiso de la
   ayuda. Confirmar si siguen siendo exigibles.
6. **Datos de acceso** en la página de contacto: aparcamiento, escalones, rampa,
   parada de autobús.

## Cambio de dominio: .es → .com

La web anterior está en `podologiapatriciamateos.es` y esta se publica en `.com`.
Google los trata como sitios distintos, así que todo el posicionamiento actual se
pierde salvo que se hagan redirecciones 301 desde el dominio antiguo.

Lo que hay que hacer, en el hosting del `.es` (no se puede hacer desde aquí):

- Redirección 301 de cada URL del `.es` a su equivalente en `.com`.
- Mantener el `.es` activo y redirigiendo al menos un año.
- Dar de alta el cambio de dirección en Google Search Console.

Si es posible, lo más sencillo sería seguir usando el `.es` como dominio
principal y dejar el `.com` como redirección.
