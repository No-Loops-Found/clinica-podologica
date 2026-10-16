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
