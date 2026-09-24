import { PHONES } from '../consts';

/** Las tres especialidades de la clínica. Fuente única para inicio, servicios y cabecera. */
export const SERVICIOS = [
  {
    key: 'podologia',
    href: '/podologia/',
    titulo: 'Podología',
    tituloLargo: 'Podología',
    phone: PHONES[0],
    quien: 'Patricia Mateos y Celia Castellano',
    resumen: 'Durezas, callos, uñas encarnadas, hongos, plantillas personalizadas, estudio biomecánico de la pisada y cirugía podológica.',
    puntos: ['Podología general', 'Plantillas a medida', 'Estudio de la pisada', 'Cirugía ambulatoria'],
  },
  {
    key: 'nutricion',
    href: '/nutricionista/',
    titulo: 'Nutrición',
    tituloLargo: 'Nutrición y dietética',
    phone: PHONES[1],
    quien: 'Tania Zamarreño',
    resumen: 'Planes de alimentación adaptados a cada persona: sobrepeso, nutrición infantil, patologías digestivas, deporte, embarazo y lactancia.',
    puntos: ['Pérdida de peso', 'Nutrición infantil', 'Patologías digestivas', 'Presencial u online'],
  },
  {
    key: 'osteopatia',
    href: '/osteopatia-y-quiromasaje/',
    titulo: 'Osteopatía',
    tituloLargo: 'Osteopatía y quiromasaje',
    phone: PHONES[2],
    quien: 'Elena Pérez',
    resumen: 'Terapia manual para contracturas, sobrecargas, dolor de espalda y cuello, problemas posturales y recuperación de lesiones deportivas.',
    puntos: ['Contracturas', 'Dolor de espalda y cuello', 'Problemas posturales', 'Lesiones deportivas'],
  },
] as const;
