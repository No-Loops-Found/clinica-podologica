export type Miembro = {
  nombre: string;
  rol: string;
  foto?: string;
  alt?: string;
  titulacion: string[];
  bio: string;
  tel?: string;
  telDisplay?: string;
};

/** Textos tomados de la web actual, revisados y sin cambiar el fondo. */
export const EQUIPO: Miembro[] = [
  {
    nombre: 'Patricia Mateos',
    rol: 'Podóloga y directora de la clínica',
    foto: '/img/patricia.webp',
    alt: 'Patricia Mateos, podóloga y directora de la clínica',
    titulacion: [
      'Graduada en Podología por la Universidad de Extremadura (2012-2016)',
      'Tercer curso en la Universidad Complutense de Madrid, beca Séneca/SICUE (2015)',
      'Experto Universitario en Patología Ungueal, Universidad de Extremadura (2018)',
      'Directora de Radiodiagnóstico',
    ],
    bio: 'Siempre tuve claro que me dedicaría al mundo sanitario: de pequeña quería ser médico y, más adelante, enfermera. Pero tuve un problema en mis pies y la podología pasó a ser mi meta principal. Después de cuatro años de estudios, muchos cursos y más de tres trabajando en otras clínicas, llegó el momento de establecerme en un sitio fijo. De ahí nació esta clínica.',
    tel: '+34633939293',
    telDisplay: '633 939 293',
  },
  {
    nombre: 'Celia Castellano',
    rol: 'Podóloga',
    titulacion: ['Graduada en Podología por la Universidad de Extremadura (2019-2023)'],
    bio: 'Desde pequeña tuve claro que quería dedicarme a cuidar de la gente. Mi primer contacto con la podología fue acompañando a mi abuela a sus sesiones de quiropodia, y siempre me causó curiosidad. Lo que hizo que me interesara de verdad fue acudir yo misma a consulta: ahí descubrí lo amplio que es este mundo. Desde que terminé el grado en 2023 sigo en formación constante.',
    tel: '+34633939293',
    telDisplay: '633 939 293',
  },
  {
    nombre: 'Tania Zamarreño',
    rol: 'Dietista-nutricionista',
    titulacion: ['Dietista-nutricionista desde 2013', 'En consulta propia desde 2015'],
    bio: 'Apasionada de la alimentación, el deporte y la vida saludable. Trabajo con dietas adaptadas a personas con distintas situaciones y patologías, tanto de forma presencial como con pacientes online. Estoy especializada en sobrepeso y obesidad, alimentación infantil y patologías digestivas.',
    tel: '+34625640976',
    telDisplay: '625 640 976',
  },
  {
    nombre: 'Elena Pérez',
    rol: 'Quiromasajista y osteópata',
    foto: '/img/elena.jpg',
    alt: 'Elena Pérez, quiromasajista y osteópata',
    titulacion: [
      'Seis años de experiencia en quiromasaje y osteopatía',
      'Cursando la convalidación del título de Osteopatía Integral con la Universidad Europea del Atlántico',
    ],
    bio: 'Siempre me han apasionado las terapias manuales. Me formé en quiromasaje y más adelante conocí la osteopatía; hoy combino ambas técnicas en cada sesión. Trato a cada persona como un caso individual, según sus necesidades.',
    tel: '+34618475093',
    telDisplay: '618 475 093',
  },
];
