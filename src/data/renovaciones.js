/* Every word and number here was read off
   escuelanauticadevalencia.es/servicios-nauticos-valencia/renovacion/ and
   re-verified on 2026-08-13. Nothing invented, nothing rounded. */

export const school = {
  name: 'Escuela Náutica de Valencia',
  place: 'Marina Port Valencia',
  phone: '655 48 77 16',
  phoneHref: 'tel:+34655487716',
  email: 'info@escuelanauticadevalencia.es',
  privacyUrl: 'https://escuelanauticadevalencia.es/politica-de-privacidad/',
};

/* Prices are FIXED, confirmed by Dani in writing on 2026-08-14: "el 'desde' ya
   está corregido en la web. Es precio fijo." Re-verified on their live page the
   same day: every renewal now reads "tiene un coste de 99 €" with no "desde"
   anywhere, and the duplicate stays "el duplicado tiene un coste de 49 €". */
export const products = [
  { key: 'pnb', title: 'PNB', full: 'Patrón de Navegación Básica', price: 99, from: false, kind: 'renovacion' },
  { key: 'per', title: 'PER', full: 'Patrón de Embarcaciones de Recreo', price: 99, from: false, kind: 'renovacion' },
  { key: 'py', title: 'PY', full: 'Patrón de Yate', price: 99, from: false, kind: 'renovacion' },
  { key: 'cy', title: 'CY', full: 'Capitán de Yate', price: 99, from: false, kind: 'renovacion' },
  {
    key: 'duplicado',
    title: 'Duplicado',
    full: 'Licencia de Navegación, por extravío o deterioro',
    price: 49,
    from: false,
    kind: 'duplicado',
  },
];

export function productLabel(p) {
  return p.kind === 'duplicado' ? 'Duplicado de Licencia de Navegación' : `Renovación de ${p.title}`;
}

export function productPrice(p) {
  return p.from ? `desde ${p.price} €` : `${p.price} €`;
}

/* Their own explanation of the Titulín, kept because it is the single most
   common misunderstanding a visitor arrives with, and answering it before the
   form saves the school a phone call. The three "permite" lines are what a
   titulín holder actually needs in order to decide, and they publish all
   three, so leaving them out was an omission rather than restraint. */
export const titulin = {
  heading: '¿Vienes a renovar el "titulín"?',
  body:
    'El titulín ya no existe: se eliminó en 2014. Su equivalente actual es la Licencia de Navegación, que no tiene caducidad, es decir, no se renueva. Si en su día obtuviste el titulín, puedes adaptarlo haciendo 4 horas de prácticas con nosotros.',
  scope: [
    'Permite gobernar motos de agua de cualquier potencia.',
    'También permite llevar embarcaciones de hasta 6 metros de eslora y de día.',
    'Hasta 2 millas de la costa.',
  ],
  cta: 'Escríbenos y te lo explicamos',
};

/* "Necesitamos que nos hagas llegar", their list. Deliberately NOT collected
   through this page: the título and the psicotécnico are sensitive documents
   (the psicotécnico is health data) and handling them properly needs storage,
   retention and deletion under a contract. The page says what to have ready;
   the documents reach the school the way they do today. */
export const documents = [
  'Título caducado',
  'Certificado psicotécnico',
  'Copia del DNI en vigor',
];

export const included =
  'El precio incluye el pago de las tasas oficiales y toda la tramitación con la administración. En cuanto recibimos la nueva titulación, te la enviamos.';
