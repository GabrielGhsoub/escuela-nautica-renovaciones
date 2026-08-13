/* Renovación de títulos, request mode.
   Dani's own page already says what a renewal costs and what documents it
   needs. What it does not have is a way to start one: today it arrives as a
   WhatsApp message and he retypes it. This page collects the same request,
   complete, and hands it to him to confirm exactly as he does now.

   Deliberately NOT here:
   - No payment. He told us on 8 Aug "No cobramos con tarjeta". The card rail is
     built behind this but stays off until he says otherwise.
   - No document upload. Título caducado and certificado psicotécnico are
     sensitive (the psicotécnico is health data) and handling them properly
     needs storage, retention and deletion under a contract. The page tells the
     visitor what to have ready; the documents reach the school as they do now.
   - No DNI number. Their own requirement is a COPY of the DNI, which travels
     out of band anyway, so the typed number buys nothing and asks a Spanish
     visitor for a national ID before any relationship exists.

   Nothing here states a policy the school has not published: not how or when
   they confirm, not when payment happens, not how documents are handed over. */
import { useEffect, useRef, useState } from 'react'
import {
  documents, included, productLabel, productPrice, products, school, titulin,
} from './data/renovaciones.js'
import { caducidadOk, emailOk, nombreOk, telOk } from './validators.js'
import { formatCaducidad, formatTel } from './masks.js'
import { addRequest } from './store.js'
import Admin from './Admin.jsx'
import './app.css'

const STEPS = ['Qué necesitas', 'Tus datos', 'Enviar']

const FIELDS = [
  {
    key: 'nombre',
    label: 'Nombre y apellidos',
    hint: 'Como aparece en el título.',
    input: { name: 'nombre', autoComplete: 'name', autoCapitalize: 'words', enterKeyHint: 'go' },
    check: nombreOk,
    error: 'Escribe tu nombre y tus apellidos.',
  },
  {
    key: 'caducidad',
    label: 'Caducidad del título',
    hint: 'Lo pone en tu título. Si no lo tienes a mano, déjalo en blanco.',
    input: { name: 'caducidad', inputMode: 'numeric', placeholder: 'mm/aaaa', maxLength: 7, enterKeyHint: 'go' },
    mask: formatCaducidad,
    check: caducidadOk,
    error: 'Escríbelo como mm/aaaa, por ejemplo 05/2024.',
    optional: true,
  },
  {
    key: 'telefono',
    label: 'Teléfono',
    hint: 'Es donde te contestaremos.',
    input: { name: 'telefono', type: 'tel', inputMode: 'tel', autoComplete: 'tel', maxLength: 20, enterKeyHint: 'go' },
    mask: formatTel,
    check: telOk,
    error: 'Necesitamos un teléfono donde poder llamarte.',
  },
  {
    key: 'email',
    label: 'Correo electrónico',
    hint: '',
    input: { name: 'email', type: 'email', inputMode: 'email', autoComplete: 'email', enterKeyHint: 'go' },
    check: emailOk,
    error: 'Revisa el correo, parece que le falta algo (por ejemplo .com).',
  },
]

const BLANK = { nombre: '', telefono: '', email: '', caducidad: '' }

export default function App() {
  /* #admin is the other side of the counter. Hash, not a router: one listener
     is all a two-view demo needs. */
  const [view, setView] = useState(() => (window.location.hash === '#admin' ? 'admin' : 'site'))
  useEffect(() => {
    const onHash = () => setView(window.location.hash === '#admin' ? 'admin' : 'site')
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const [step, setStep] = useState(0)
  /* Forward slides in from the right, back from the left, so motion agrees
     with the mental model of where each screen lives. */
  const [dir, setDir] = useState('fwd')
  const [picked, setPicked] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [showErrors, setShowErrors] = useState(false)
  const [sent, setSent] = useState(false)

  const product = products.find((p) => p.key === picked)
  const errors = Object.fromEntries(
    FIELDS.map((f) => [f.key, f.check(form[f.key]) ? '' : f.error]),
  )

  /* Each step unmounts the element that had focus, which drops it to <body>:
     a keyboard visitor is thrown back to the top of the document every time,
     and a screen reader announces nothing at all after "Enviar solicitud".
     Move focus to the new question instead. Not on first paint. */
  const ask = useRef(null)
  const inputs = useRef({})
  const painted = useRef(false)
  useEffect(() => {
    if (!painted.current) { painted.current = true; return }
    ask.current?.focus()
  }, [step, sent])

  /* step > 0 implies picked, today. One line so a future edit cannot turn that
     into a white screen. */
  useEffect(() => {
    if (step > 0 && !product) { setStep(0); setSent(false) }
  }, [step, product])

  function go(n) {
    setDir(n < step ? 'back' : 'fwd')
    setStep(n)
  }

  /* Reformatting a controlled input throws the caret to the end; counting
     digits left of the caret and re-seating it keeps mid-string edits sane. */
  function maskedChange(f) {
    return (e) => {
      const el = e.target
      if (!f.mask) { setForm((prev) => ({ ...prev, [f.key]: el.value })) ; return }
      const digitsLeft = el.value.slice(0, el.selectionStart ?? el.value.length).replace(/\D/g, '').length
      const next = f.mask(el.value)
      setForm((prev) => ({ ...prev, [f.key]: next }))
      requestAnimationFrame(() => {
        let pos = 0
        let seen = 0
        while (pos < next.length && seen < digitsLeft) {
          if (/\d/.test(next[pos])) seen += 1
          pos += 1
        }
        try { el.setSelectionRange(pos, pos) } catch { /* not all inputs allow it */ }
      })
    }
  }

  function submitDatos(e) {
    e.preventDefault()
    const bad = FIELDS.find((f) => errors[f.key])
    if (bad) {
      setShowErrors(true)
      inputs.current[bad.key]?.focus()
      return
    }
    go(2)
  }

  /* A fast double-tap on the send button must not file the request twice. */
  const filed = useRef(false)
  function send() {
    if (filed.current) return
    filed.current = true
    addRequest({
      nombre: form.nombre,
      telefono: form.telefono,
      email: form.email,
      caducidad: form.caducidad,
      tramite: productLabel(product),
      precio: productPrice(product),
    })
    setSent(true)
  }

  function restart() {
    filed.current = false
    setSent(false)
    setDir('back')
    setStep(0)
    setPicked(null)
    setForm(BLANK)
    setShowErrors(false)
  }

  if (view === 'admin') return <Admin />

  return (
    <div className="page">
      <header className="top">
        <div className="shell top__in">
          <div className="top__brand">
            <span className="top__mark" aria-hidden="true">⚓</span>
            <span>
              <strong>{school.name}</strong>
              <em>Renovación de títulos náuticos</em>
            </span>
          </div>
          <a className="top__phone" href={school.phoneHref} aria-label={`Llamar al ${school.phone}`}>
            {school.phone}
          </a>
        </div>
      </header>

      <main className="shell main">
        <section className="intro">
          <h1>Renueva tu título náutico</h1>
          <p className="intro__lede">
            Nos encargamos de todo el trámite con la administración. Dinos qué necesitas
            y nos ponemos en contacto contigo.
          </p>
          <p className="intro__included">{included}</p>
        </section>

        {sent ? (
          <section className="panel done" role="status">
            {/* First, not last: this is the moment someone would otherwise sit
                waiting for a call that is never coming. */}
            <p className="demo demo--lead">
              Demostración: no se ha enviado ningún mensaje real y la escuela no ha
              recibido nada.
            </p>
            <div className="done__tick" aria-hidden="true">✓</div>
            <h2 tabIndex={-1} ref={ask}>Así se vería la confirmación</h2>
            <p className="done__what">
              <strong>{productLabel(product)}</strong>{' · '}{productPrice(product)}
            </p>
            <p className="done__note">
              En la versión real, la escuela revisaría tu solicitud y se pondría en
              contacto contigo. No se paga nada en esta página.
            </p>
            <p className="done__echo">
              Te contestaríamos al <strong>{form.telefono}</strong> o a <strong>{form.email}</strong>.
            </p>
            <p className="done__admin">
              ¿Quieres ver cómo lo recibiría la escuela?{' '}
              <a href="#admin">Abre el panel de la escuela</a>: tu solicitud ya está ahí.
            </p>
            <div className="done__docs">
              <h3>Ten preparado</h3>
              <ul>{documents.map((d) => <li key={d}>{d}</li>)}</ul>
              <p className="done__docsnote">No los subas aquí.</p>
            </div>
            <div className="nav nav--done">
              <button type="button" className="btn btn--ghost" onClick={() => { filed.current = false; setSent(false); setDir('back'); setStep(1) }}>
                Corregir mis datos
              </button>
              <button type="button" className="btn btn--ghost" onClick={restart}>
                Hacer otra solicitud
              </button>
            </div>
          </section>
        ) : (
          <section className="panel">
            <ol className="steps" aria-label="Pasos">
              {STEPS.map((s, i) => (
                <li
                  key={s}
                  className={i === step ? 'is-now' : i < step ? 'is-done' : ''}
                  aria-current={i === step ? 'step' : undefined}
                >
                  <span aria-hidden="true">{i < step ? '✓' : i + 1}</span>{s}
                  {i < step && <span className="visually-hidden">completado</span>}
                </li>
              ))}
            </ol>

              {step === 0 && (
                <div key="a" className={`stp stp--${dir}`}>
                  <h2 className="ask" tabIndex={-1} ref={ask}>¿Qué título necesitas renovar?</h2>
                  <div className="prods">
                    {products.map((p) => (
                      <button
                        key={p.key} type="button"
                        className={`prod${picked === p.key ? ' is-on' : ''}`}
                        aria-pressed={picked === p.key}
                        onClick={() => { setPicked(p.key); go(1) }}
                      >
                        <strong>{p.title}</strong>
                        <em>{p.full}</em>
                        <span>{productPrice(p)}</span>
                      </button>
                    ))}
                  </div>
                  <div className="titulin">
                    <h3>{titulin.heading}</h3>
                    <p>{titulin.body}</p>
                    <ul className="titulin__scope">
                      {titulin.scope.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                    <a href={`mailto:${school.email}`}>{titulin.cta}</a>
                  </div>
                </div>
              )}

              {step === 1 && (
                <form key="b" className={`stp stp--${dir}`} noValidate onSubmit={submitDatos}>
                  <h2 className="ask" tabIndex={-1} ref={ask}>Tus datos</h2>
                  <div className="recap">
                    {productLabel(product)} · {productPrice(product)}
                  </div>
                  {FIELDS.map((f) => {
                    const bad = showErrors && Boolean(errors[f.key])
                    const describedBy = bad ? `err-${f.key}` : f.hint ? `hint-${f.key}` : undefined
                    return (
                      <label key={f.key} className={`f${bad ? ' f--bad' : ''}`}>
                        <span>
                          {f.label}
                          {f.optional && <em className="f__opt">opcional</em>}
                        </span>
                        <input
                          {...f.input}
                          ref={(el) => { inputs.current[f.key] = el }}
                          value={form[f.key]}
                          aria-invalid={bad || undefined}
                          aria-describedby={describedBy}
                          onChange={maskedChange(f)}
                        />
                        {bad
                          ? <span className="f__err" id={`err-${f.key}`}>{errors[f.key]}</span>
                          : f.hint && <span className="f__hint" id={`hint-${f.key}`}>{f.hint}</span>}
                      </label>
                    )
                  })}
                  <p className="privacidad">
                    Esta página es una demostración: no envía nada y lo que escribes
                    queda solo en tu navegador. En la versión real, {school.name} usaría
                    estos datos solo para contestarte sobre esta renovación
                    (<a href={school.privacyUrl}>política de privacidad</a>).
                  </p>
                  <div className="nav">
                    <button type="button" className="btn btn--ghost" onClick={() => go(0)}>Atrás</button>
                    <button type="submit" className="btn btn--primary">Continuar</button>
                  </div>
                </form>
              )}

              {step === 2 && (
                <div key="c" className={`stp stp--${dir}`}>
                  <h2 className="ask" tabIndex={-1} ref={ask}>Revisa y envía</h2>
                  <dl className="review">
                    <div><dt>Trámite</dt><dd>{productLabel(product)}</dd></div>
                    <div><dt>Precio</dt><dd>{productPrice(product)}</dd></div>
                    <div><dt>Nombre</dt><dd>{form.nombre}</dd></div>
                    {form.caducidad && <div><dt>Caduca</dt><dd>{form.caducidad}</dd></div>}
                    <div><dt>Teléfono</dt><dd>{form.telefono}</dd></div>
                    <div><dt>Correo</dt><dd>{form.email}</dd></div>
                  </dl>
                  <div className="docs">
                    <h3>Documentación que necesita la escuela</h3>
                    <ul>{documents.map((d) => <li key={d}>{d}</li>)}</ul>
                    <p className="docs__note">No hace falta subir nada aquí.</p>
                  </div>
                  <p className="nopay">No se paga nada en esta página.</p>
                  <div className="nav">
                    <button type="button" className="btn btn--ghost" onClick={() => go(1)}>Atrás</button>
                    <button type="button" className="btn btn--primary" onClick={send}>
                      Enviar solicitud
                    </button>
                  </div>
                </div>
              )}
          </section>
        )}
      </main>

      <footer className="foot">
        <div className="shell">
          <p>
            {school.name} · {school.place} · <a href={school.phoneHref}>{school.phone}</a> ·{' '}
            <a href={`mailto:${school.email}`}>{school.email}</a>
          </p>
          <p className="foot__demo">
            Página de demostración creada por Likwiid con los contenidos públicos de la
            escuela. No envía ni cobra nada ·{' '}
            <a href="#admin">panel de la escuela</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
