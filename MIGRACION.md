# Mapa de URLs

| WordPress (.es)                    | Nueva (.com)                      |
|------------------------------------|-----------------------------------|
| /                                  | /                                 |
| /inicio/                           | /  (301)                          |
| /sobre-nosotros/                   | /sobre-nosotros/                  |
| /servicios/                        | /servicios/                       |
| /podologia/                        | /podologia/                       |
| /nutricionista/                    | /nutricionista/                   |
| /osteopatia-y-quiromasaje/         | /osteopatia-y-quiromasaje/        |
| /contacto/                         | /contacto/                        |
| /pide-tu-cita/                     | /pide-tu-cita/                    |
| /aviso-legal/                      | /aviso-legal/                     |
| /politica-de-privacidad/           | /politica-de-privacidad/          |
| /politica-de-cookies/              | /politica-de-cookies/             |
| /declaracion-de-accesibilidad/     | /declaracion-de-accesibilidad/    |
| /personalizar-cookies/             | eliminada: ya no hay cookies      |

Los slugs se han mantenido idénticos a propósito, para que la redirección desde
el dominio antiguo sea una correspondencia directa de host.

## No portado

- **Formulario de cita.** Decisión pendiente con la clínica.
- **Página «Personalizar cookies».** La generaba el plugin Adapta RGPD. El sitio
  nuevo no usa cookies ni analítica, así que no tiene sentido mantenerla. Si más
  adelante se añade analítica, habrá que recuperar el banner.
- **GTranslate.** El WordPress tenía traducción automática. No se ha portado: la
  traducción automática de contenido sanitario es arriesgada y además generaba
  URLs duplicadas.
- **Imágenes de banco** (pedicure-*, beautiful-women-feet-*). Se han dejado
  fuera; conviene sustituirlas por fotos reales de la consulta.
