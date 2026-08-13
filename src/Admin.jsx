/* The other side of the counter. Dani's current admin panel is a WhatsApp
   thread he retypes; this shows requests arriving in a table he can confirm
   with one tap. Everything is simulated in the visitor's own browser and says
   so - the point is the workflow, not the plumbing. */
import { useEffect, useRef, useState } from 'react'
import { school } from './data/renovaciones.js'
import { loadRequests, setStatus } from './store.js'

const fmtDate = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })

export default function Admin() {
  const [rows, setRows] = useState(loadRequests)
  const heading = useRef(null)
  useEffect(() => { heading.current?.focus() }, [])

  const pendientes = rows.filter((r) => r.status === 'pendiente').length
  const confirmadas = rows.filter((r) => r.status === 'confirmada').length

  return (
    <div className="page adm">
      <header className="top">
        <div className="shell top__in">
          <div className="top__brand">
            <span className="top__mark" aria-hidden="true">⚓</span>
            <span>
              <strong>{school.name}</strong>
              <em>Panel de la escuela · demostración</em>
            </span>
          </div>
          <a className="top__phone" href="#">← Volver a la página</a>
        </div>
      </header>

      <main className="shell main">
        <section className="intro">
          <h1>Solicitudes de renovación</h1>
          <p className="intro__lede">
            Así llegarían las solicitudes en la versión real: cada una completa, sin
            retranscribir nada. En esta demostración todo queda en tu navegador.
          </p>
        </section>

        <div className="adm__stats" role="status">
          <div className="adm__stat">
            <strong>{pendientes}</strong>
            <span>pendientes</span>
          </div>
          <div className="adm__stat">
            <strong>{confirmadas}</strong>
            <span>confirmadas</span>
          </div>
          <div className="adm__stat">
            <strong>{rows.length}</strong>
            <span>esta semana</span>
          </div>
        </div>

        <section className="panel adm__panel">
          <h2 className="ask" tabIndex={-1} ref={heading}>Bandeja de solicitudes</h2>
          {rows.length === 0 && (
            <p className="adm__empty">Todavía no hay solicitudes. Envía una desde la página y aparecerá aquí.</p>
          )}
          <ul className="adm__list">
            {rows.map((r, i) => (
              <li key={r.id} className={`adm__row${r.mine ? ' is-mine' : ''}`} style={{ '--i': i }}>
                <div className="adm__who">
                  <strong>{r.nombre}</strong>
                  <span>{r.tramite} · {r.precio}</span>
                  <span className="adm__contact">
                    <a href={`tel:${r.telefono.replace(/\s/g, '')}`}>{r.telefono}</a>
                    {' · '}
                    <a href={`mailto:${r.email}`}>{r.email}</a>
                    {r.caducidad && ` · caduca ${r.caducidad}`}
                  </span>
                </div>
                <div className="adm__meta">
                  <time dateTime={new Date(r.ts).toISOString()}>{fmtDate.format(r.ts)}</time>
                  {r.mine && <span className="adm__tag adm__tag--mine">tuya</span>}
                  {r.example && <span className="adm__tag">ejemplo</span>}
                  <span className={`adm__chip adm__chip--${r.status}`}>{r.status}</span>
                  <button
                    type="button"
                    className="btn btn--ghost adm__act"
                    onClick={() => setRows(setStatus(r.id, r.status === 'pendiente' ? 'confirmada' : 'pendiente'))}
                  >
                    {r.status === 'pendiente' ? 'Confirmar' : 'Reabrir'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="adm__note">
            En la versión real, cada solicitud llegaría también por correo a{' '}
            <strong>{school.email}</strong>, y confirmar avisaría al cliente. Aquí nada
            sale de tu navegador.
          </p>
        </section>
      </main>

      <footer className="foot">
        <div className="shell">
          <p className="foot__demo">
            Panel de demostración creado por Likwiid. Datos de ejemplo, nada real.
          </p>
        </div>
      </footer>
    </div>
  )
}
