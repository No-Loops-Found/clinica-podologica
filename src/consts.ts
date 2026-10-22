export const SITE = {
  name: 'Clínica Podológica Patricia Mateos',
  shortName: 'Patricia Mateos',
  domain: 'https://podologiapatriciamateos.com',
  email: 'podologiapatriciamateos@gmail.com',
  street: 'Calle Jardines, 44 bajo',
  postal: '10840',
  city: 'Moraleja',
  province: 'Cáceres',
  region: 'Extremadura',
  country: 'ES',
};

export type IconName = 'foot' | 'leaf' | 'hand';

/**
 * Cada especialidad tiene su propio número. Es un dato real de la clínica
 * y el elemento que estructura la navegación del sitio.
 */
export const PHONES: {
  key: 'podologia' | 'nutricion' | 'osteopatia';
  area: string;
  who: string;
  display: string;
  tel: string;
  icon: IconName;
  href: string;
}[] = [
  { key: 'podologia',  area: 'Podología',  who: 'Patricia y Celia', display: '633 939 293', tel: '+34633939293', icon: 'foot', href: '/podologia/' },
  { key: 'nutricion',  area: 'Nutrición',  who: 'Tania',            display: '625 640 976', tel: '+34625640976', icon: 'leaf', href: '/nutricionista/' },
  { key: 'osteopatia', area: 'Osteopatía', who: 'Elena',            display: '618 475 093', tel: '+34618475093', icon: 'hand', href: '/osteopatia-y-quiromasaje/' },
];

/** Los tres números tienen WhatsApp. El enlace abre el chat con el mensaje de cita ya escrito. */
export const waLink = (p: (typeof PHONES)[number]) =>
  `https://wa.me/${p.tel.replace('+', '')}?text=${encodeURIComponent(
    `Hola, me gustaría pedir cita de ${p.area.toLowerCase()}.`
  )}`;

/**
 * Datos de los textos legales. Lo que va entre corchetes está pendiente:
 * se resalta en la web y Legal.astro muestra un aviso mientras quede alguno.
 */
export const LEGAL = {
  titular: 'Patricia Mateos Luis',
  nif: '28979067X',
  registroSanitario: '10104830',
  actualizado: '22 de octubre de 2026',
  // Solo si la titular es una sociedad (S.L., etc.): datos de inscripción en el Registro Mercantil.
  registroMercantil: null as string | null,
  // Delegado de protección de datos: solo si la clínica está obligada (art. 34 LOPDGDD). null = no hay.
  dpd: null as string | null,
};

/**
 * Profesiones sanitarias reguladas (LSSI art. 10.1.f). Osteopatía y quiromasaje no lo son.
 * La ley solo obliga con la titular. Una ficha con algún dato entre corchetes no se publica:
 * aparece sola en el aviso legal en cuanto se completa. Faltan Celia y Tania.
 */
export const COLEGIADAS = [
  { nombre: 'Patricia Mateos', profesion: 'Podóloga', titulo: 'Graduada en Podología por la Universidad de Extremadura', colegio: 'Colegio Oficial de Podólogos de Extremadura (COPOEX)', numero: '838100366' },
  { nombre: 'Celia Castellano', profesion: 'Podóloga', titulo: 'Graduada en Podología por la Universidad de Extremadura', colegio: 'Colegio Oficial de Podólogos de Extremadura (COPOEX)', numero: '[Nº de colegiada]' },
  { nombre: 'Tania Zamarreño', profesion: 'Dietista-nutricionista', titulo: '[Titulación universitaria]', colegio: '[Colegio profesional]', numero: '[Nº de colegiada]' },
];

/**
 * Seguros con los que trabaja la consulta de podología. La adhesión al convenio de
 * las mutualidades es personal: en el listado de MUGEJU (2S 2026) figura Patricia.
 */
export const SEGUROS = {
  aseguradoras: ['Asisa', 'Caser', 'Grupo HNA'],
  mutualidades: ['MUFACE', 'ISFAS', 'MUGEJU'],
};

export const pendiente = (v: string | null) => v?.startsWith('[') ?? false;

export const NAV = [
  { href: '/podologia/', label: 'Podología' },
  { href: '/nutricionista/', label: 'Nutrición' },
  { href: '/osteopatia-y-quiromasaje/', label: 'Osteopatía' },
  { href: '/sobre-nosotros/', label: 'Equipo' },
  { href: '/contacto/', label: 'Contacto' },
];

export const MAPS_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${SITE.street}, ${SITE.postal} ${SITE.city}, ${SITE.province}`
)}`;
