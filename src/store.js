/* The demo's "backend": sessionStorage. A submitted request lands here and the
   admin panel reads it back, so the visitor can see both sides of the counter
   without a single byte leaving their browser. Dies with the tab, which is
   exactly the retention policy a demo should have. */

const KEY = 'env-demo-solicitudes'

/* Plausible, clearly invented, marked "ejemplo" in the UI. They make the panel
   read like a Tuesday morning instead of an empty table. */
const SEEDS = [
  {
    id: 'seed-1', example: true, status: 'pendiente',
    nombre: 'Carlos Ferrer Blasco', tramite: 'Renovación de PER', precio: 'desde 99 €',
    telefono: '612 33 48 90', email: 'cferrer.ejemplo@gmail.com', caducidad: '09/2026',
    offsetDays: 0,
  },
  {
    id: 'seed-2', example: true, status: 'pendiente',
    nombre: 'María Sanchis Roig', tramite: 'Duplicado de Licencia de Navegación', precio: '49 €',
    telefono: '677 90 12 34', email: 'msanchis.ejemplo@hotmail.com', caducidad: '',
    offsetDays: 1,
  },
  {
    id: 'seed-3', example: true, status: 'confirmada',
    nombre: 'Jorge Aleixandre Pons', tramite: 'Renovación de Capitán de Yate', precio: 'desde 99 €',
    telefono: '699 21 87 65', email: 'jaleixandre.ejemplo@gmail.com', caducidad: '11/2025',
    offsetDays: 2,
  },
]

function seeded() {
  const day = 24 * 60 * 60 * 1000
  return SEEDS.map(({ offsetDays, ...s }) => ({ ...s, ts: Date.now() - offsetDays * day }))
}

export function loadRequests() {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* private mode: fall through to seeds */ }
  const list = seeded()
  saveRequests(list)
  return list
}

export function saveRequests(list) {
  try { sessionStorage.setItem(KEY, JSON.stringify(list)) } catch { /* private mode */ }
}

export function addRequest(req) {
  const list = loadRequests()
  list.unshift({
    id: 'r-' + Date.now().toString(36) + Math.floor(Math.random() * 1e4).toString(36),
    status: 'pendiente',
    mine: true,
    ts: Date.now(),
    ...req,
  })
  saveRequests(list)
}

export function setStatus(id, status) {
  const list = loadRequests().map((r) => (r.id === id ? { ...r, status } : r))
  saveRequests(list)
  return list
}
