/* Every word and number here was read off
   escuelanauticadevalencia.es/servicios-nauticos-valencia/renovacion/ on
   2026-08-12. Nothing invented, nothing rounded. */

export const school = {
  name: 'Escuela Náutica de Valencia',
  phone: '655 48 77 16',
  phoneHref: 'tel:+34655487716',
  email: 'info@escuelanauticadevalencia.es',
};

/* "Renovamos todos los títulos náuticos de recreo". All four renewals are 99 EUR
   and the duplicate is 49 EUR, exactly as published. */
export const products = [
  {
    key: 'pnb',
    title: 'PNB',
    full: 'Patrón de Navegación Básica',
    price: 99,
    kind: 'renovacion',
  },
  {
    key: 'per',
    title: 'PER',
    full: 'Patrón de Embarcaciones de Recreo',
    price: 99,
    kind: 'renovacion',
  },
  {
    key: 'py',
    title: 'Patrón de Yate',
    full: 'PY',
    price: 99,
    kind: 'renovacion',
  },
  {
    key: 'cy',
    title: 'Capitán de Yate',
    full: 'CY',
    price: 99,
    kind: 'renovacion',
  },
  {
    key: 'duplicado',
    title: 'Duplicado',
    full: 'Licencia de Navegación, por extravío o deterioro',
    price: 49,
    kind: 'duplicado',
  },
];

/* Their own explanation of the Titulín, kept because it is the single most
   common misunderstanding a visitor arrives with, and answering it before the
   form saves the school a phone call. Paraphrased tight, facts unchanged. */
export const titulin = {
  heading: '¿Vienes a renovar el "titulín"?',
  body:
    'El titulín ya no existe: se eliminó en 2014. Su equivalente actual es la Licencia de Navegación, que no caduca y por tanto no se renueva. Si en su día obtuviste el titulín, puedes adaptarlo haciendo 4 horas de prácticas con nosotros.',
  cta: 'Escríbenos y te lo explicamos',
};

/* "Necesitamos que nos hagas llegar", verbatim list. Deliberately NOT collected
   through this page: the título and the psicotécnico are sensitive documents and
   handling them properly needs storage, retention and a contract. The page tells
   you what to have ready and the school takes them the way it does today. */
export const documents = [
  'Título caducado',
  'Certificado psicotécnico',
  'Copia del DNI en vigor',
  'Correo electrónico',
];

export const included =
  'El precio incluye el pago de las tasas oficiales y toda la tramitación con la administración. En cuanto recibimos la nueva titulación, te la enviamos.';
