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
import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, LazyMotion, MotionConfig, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import { PhoneInput, defaultCountries, parseCountry } from 'react-international-phone'
import 'react-international-phone/style.css'
import {
  documents, included, productLabel, productPrice, products, school, titulin,
} from './data/renovaciones.js'
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import { caducidadOk, emailOk, nombreOk, telOk } from './validators.js'
import { formatCaducidad, prettyTel } from './masks.js'
import { upsertRequest } from './store.js'
import Field from './components/Field.jsx'
import MonthPicker from './components/MonthPicker.jsx'
import Admin from './Admin.jsx'
import './app.css'

const STEPS = ['Qué necesitas', 'Tus datos', 'Enviar']
const BLANK = { nombre: '', telefono: '', email: '', caducidad: '', telDisplay: '' }
const ORDER = ['nombre', 'caducidad', 'telefono', 'email']
const EASE = [0.22, 1, 0.36, 1]

const REGION_ES = (() => {
  try { return new Intl.DisplayNames(['es'], { type: 'region' }) } catch { return null }
})()
const COUNTRIES_ES = defaultCountries.map((c) => {
  const p = parseCountry(c)
  const name = REGION_ES?.of(p.iso2.toUpperCase())
  if (!name || name === p.iso2.toUpperCase()) return c
  const next = [...c]
  next[0] = name
  return next
})

/* The library's default flags are 218 PNGs fetched from a public CDN. This page
   tells the visitor their data stays in their browser, so opening a country list
   must not hand their IP to a third party. Each flag becomes an inline SVG data
   URI holding the country's own emoji: no network, no build step. */
const FLAGS_INLINE = defaultCountries.map((c) => {
  const iso2 = parseCountry(c).iso2
  const emoji = iso2.toUpperCase().replace(/./g, (ch) =>
    String.fromCodePoint(127397 + ch.charCodeAt(0)))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><text x="12" y="18" font-size="18" text-anchor="middle">${emoji}</text></svg>`
  return { iso2, src: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}` }
})

/* Inline values, not variants: under LazyMotion the variant form silently never
   resolved, leaving the outgoing panel at opacity 1 and the incoming one at 0.
   The outgoing panel leaves the way the incoming one arrives, so the flow reads
   as one surface moving rather than three screens replacing each other. */

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
  const [dir, setDir] = useState('fwd')
  const [picked, setPicked] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [touched, setTouched] = useState({})
  const [showErrors, setShowErrors] = useState(false)
  const [sent, setSent] = useState(false)
  const [calOpen, setCalOpen] = useState(false)
  /* The panel is inert while it slides in: a double tap on a product card used
     to have its second click land on the incoming panel and drop focus to
     <body>, costing a screen-reader user the new step's announcement. */
  const [busy, setBusy] = useState(false)
  /* The library keeps its own ref to reposition the caret after re-masking and
     to refocus after a country pick. Passing ours through inputProps replaced
     it, so mid-number edits jumped to the end and picking a country lost focus. */
  const telRef = useRef(null)

  /* The library hardcodes aria-label="Country selector" in English. The option
     names localize through the `countries` prop, but the trigger does not, so
     it is the one string left announcing English on a lang="es" page. */
  const phoneBox = useRef(null)
  useEffect(() => {
    if (step !== 1) return
    const btn = phoneBox.current?.querySelector('.pi__flag')
    if (btn) btn.setAttribute('aria-label', 'Elegir país')
  }, [step])

  const product = products.find((p) => p.key === picked)

  const checks = useMemo(() => ({
    nombre: nombreOk(form.nombre),
    telefono: telOk(form.telefono),
    email: emailOk(form.email),
    caducidad: caducidadOk(form.caducidad),
  }), [form])

  const errors = {
    nombre: checks.nombre ? '' : 'Escribe tu nombre y tus apellidos.',
    telefono: checks.telefono ? '' : 'Necesitamos un teléfono donde poder llamarte.',
    email: checks.email ? '' : 'Revisa el correo, parece que le falta algo (por ejemplo .com).',
    caducidad: checks.caducidad ? '' : 'Escríbelo como mm/aaaa, por ejemplo 05/2026.',
  }
  /* Only the three required fields count. Caducidad's own hint tells people to
     leave it blank, so including it capped the honest path at 75%. */
  const REQUIRED = ['nombre', 'telefono', 'email']
  const filled = REQUIRED.filter((k) => checks[k]).length
  const progress = Math.round((filled / REQUIRED.length) * 100)

  const ask = useRef(null)
  const inputs = useRef({})
  const painted = useRef(false)
  useEffect(() => {
    if (!painted.current) { painted.current = true; return }
    ask.current?.focus()
  }, [step, sent])

  useEffect(() => {
    if (step > 0 && !product) { setStep(0); setSent(false) }
  }, [step, product])

  /* Submitting with Enter never fires a mousedown, so the picker's outside-click
     handler never ran and it reopened by itself on the way back. */
  useEffect(() => { if (step !== 1) setCalOpen(false) }, [step])

  /* Some password managers assign .value without firing an input event: the
     field looks filled, state is empty, and the next render blanks it. */
  useEffect(() => {
    if (step !== 1) return undefined
    const id = setTimeout(() => setForm((f) => {
      let changed = false
      const next = { ...f }
      for (const k of ['nombre', 'email']) {
        const el = inputs.current[k]
        if (el?.value && el.value !== f[k]) { next[k] = el.value; changed = true }
      }
      return changed ? next : f
    }), 400)
    return () => clearTimeout(id)
  }, [step])

  function go(n) {
    setDir(n < step ? 'back' : 'fwd')
    setStep(n)
    setBusy(true)
    setTimeout(() => setBusy(false), 280)
  }

  function submitDatos(e) {
    e.preventDefault()
    const bad = ORDER.find((k) => errors[k])
    if (bad) {
      setShowErrors(true)
      const el = bad === 'telefono' ? telRef.current : inputs.current[bad]
      el?.focus()
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' })
      return
    }
    go(2)
  }

  const filedRef = useRef(false)
  const filedIdRef = useRef(null)
  function send() {
    if (filedRef.current) return
    filedRef.current = true
    filedIdRef.current = upsertRequest(filedIdRef.current, {
      nombre: form.nombre,
      telefono: form.telDisplay || prettyTel(form.telefono),
      email: form.email,
      caducidad: form.caducidad,
      tramite: productLabel(product),
      precio: productPrice(product),
    })
    setSent(true)
  }

  function restart() {
    filedRef.current = false
    filedIdRef.current = null
    setSent(false)
    setDir('back')
    setStep(0)
    setPicked(null)
    setForm(BLANK)
    setTouched({})
    setShowErrors(false)
  }

  const blur = (k) => () => setTouched((t) => ({ ...t, [k]: true }))
  const showErr = (k) => showErrors || Boolean(touched[k])

  if (view === 'admin') return <Admin />

  return (
    <LazyMotion features={domAnimation} strict>
    <MotionConfig reducedMotion="user">
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

          <div className="swap">
          <AnimatePresence initial={false}>
            {sent ? (
              <m.section
                key="done" className="panel done"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <p className="demo demo--lead">
                  Demostración: no se ha enviado ningún mensaje real y la escuela no ha
                  recibido nada.
                </p>
                <m.div
                  className="done__tick" aria-hidden="true"
                  initial={{ scale: 0.3, rotate: -14, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 0.1 }}
                >
                  ✓
                </m.div>
                <h2 tabIndex={-1} ref={ask}>Así se vería la confirmación</h2>
                <p className="done__what">
                  <strong>{productLabel(product)}</strong>{' · '}{productPrice(product)}
                </p>
                <p className="done__note">
                  En la versión real, la escuela revisaría tu solicitud y se pondría en
                  contacto contigo. No se paga nada en esta página.
                </p>
                <p className="done__echo">
                  Te contestaríamos al <strong>{form.telDisplay || prettyTel(form.telefono)}</strong> o a <strong>{form.email}</strong>.
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
                  <button type="button" className="btn btn--ghost" onClick={() => { filedRef.current = false; setSent(false); setDir('back'); setStep(1) }}>
                    Corregir mis datos
                  </button>
                  <button type="button" className="btn btn--ghost" onClick={restart}>
                    Hacer otra solicitud
                  </button>
                </div>
              </m.section>
            ) : (
              <m.section
                key="flow" className="panel"
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
              >
                <ol className="steps" aria-label="Pasos">
                  {STEPS.map((s, i) => (
                    <li
                      key={s}
                      className={i === step ? 'is-now' : i < step ? 'is-done' : ''}
                      aria-current={i === step ? 'step' : undefined}
                    >
                      <m.span
                        aria-hidden="true"
                        animate={{ scale: i === step ? [0.6, 1] : 1 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 18 }}
                      >
                        {i < step ? '✓' : i + 1}
                      </m.span>
                      {s}
                      {i < step && <span className="visually-hidden">completado</span>}
                    </li>
                  ))}
                </ol>

                <div className="flow">
                    <div key={step} className={`stp stp--${dir}`} style={busy ? { pointerEvents: 'none' } : undefined}>
                    {step === 0 && (
                      <div>
                        <h2 className="ask" tabIndex={-1} ref={ask}>¿Qué título necesitas renovar?</h2>
                        <div className="prods">
                          {products.map((p, i) => (
                            <m.button
                              key={p.key} type="button"
                              className={`prod${picked === p.key ? ' is-on' : ''}`}
                              aria-pressed={picked === p.key}
                              onClick={() => { setPicked(p.key); go(1) }}
                              initial={{ opacity: 0, y: 12 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.045, duration: 0.34, ease: EASE }}
                              whileHover={{ y: -3 }}
                              whileTap={{ scale: 0.98 }}
                            >
                              <strong>{p.title}</strong>
                              <em>{p.full}</em>
                              <span>{productPrice(p)}</span>
                            </m.button>
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
                      <form noValidate onSubmit={submitDatos}>
                        <h2 className="ask" tabIndex={-1} ref={ask}>Tus datos</h2>
                        <div className="recap">
                          {productLabel(product)} · {productPrice(product)}
                        </div>

                        <div className="prog" aria-hidden="true">
                          <m.div
                            className="prog__bar"
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.4, ease: EASE }}
                          />
                        </div>

                        <Field
                          id="nombre" label="Nombre y apellidos" hint="Como aparece en el título."
                          ref={(el) => { inputs.current.nombre = el }}
                          value={form.nombre}
                          valid={checks.nombre}
                          error={errors.nombre} showError={showErr('nombre')}
                          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                          onBlur={blur('nombre')}
                          name="nombre" autoComplete="name" autoCapitalize="words" enterKeyHint="next"
                        />

                        <div className="fld__wrap">
                          <Field
                            id="caducidad" label="Caducidad del título" optional
                            hint="Lo pone en tu título. Si no lo tienes a mano, déjalo en blanco."
                            ref={(el) => { inputs.current.caducidad = el }}
                            value={form.caducidad}
                            valid={Boolean(form.caducidad) && checks.caducidad}
                            error={errors.caducidad} showError={showErr('caducidad')}
                            onChange={(e) => setForm({ ...form, caducidad: formatCaducidad(e.target.value) })}
                            onBlur={blur('caducidad')}
                            name="caducidad" inputMode="numeric" maxLength={7} enterKeyHint="next"
                          />
                          <button
                            type="button" className="fld__cal" id="cal-btn"
                            aria-label="Elegir mes y año en un calendario"
                            aria-haspopup="true" aria-controls="mp-caducidad"
                            aria-expanded={calOpen}
                            onClick={() => setCalOpen((o) => !o)}
                          >
                            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                              <rect x="3" y="5" width="18" height="16" rx="3" fill="none" stroke="currentColor" strokeWidth="1.7" />
                              <path d="M3 10h18M8 3v4M16 3v4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                            </svg>
                          </button>
                          <MonthPicker
                            open={calOpen} value={form.caducidad} anchorId="cal-btn"
                            onClose={() => setCalOpen(false)}
                            onPick={(mm, yyyy) => { setForm((f) => ({ ...f, caducidad: mm ? `${mm}/${yyyy}` : `/${yyyy}` })); setTouched((t) => ({ ...t, caducidad: true })) }}
                          />
                        </div>

                        <Field
                          id="telefono" label="Teléfono" hint="Es donde te contestaremos." alwaysFloat
                          value={form.telefono}
                          valid={checks.telefono}
                          error={errors.telefono} showError={showErr('telefono')}
                        >
                          {(aria) => (
                            <div ref={phoneBox} className="pi__host">
                            <PhoneInput
                              defaultCountry="es"
                              countries={COUNTRIES_ES}
                              flags={FLAGS_INLINE}
                              forceDialCode
                              inputRef={telRef}
                              value={form.telefono}
                              onChange={(v, meta) => setForm((f) => {
                                /* Changing country used to discard the digits already
                                   typed. Carry the subscriber number across. */
                                const bare = v.replace(/\D/g, '')
                                if (meta?.country && bare === meta.country.dialCode && f.telefono) {
                                  const prev = parsePhoneNumberFromString(f.telefono, 'ES')
                                  if (prev?.nationalNumber) {
                                    return { ...f, telefono: `+${meta.country.dialCode}${prev.nationalNumber}`, telDisplay: '' }
                                  }
                                }
                                return { ...f, telefono: v, telDisplay: meta?.inputValue || '' }
                              })}
                              onBlur={blur('telefono')}
                              inputProps={{
                                id: 'telefono', name: 'telefono', autoComplete: 'tel',
                                enterKeyHint: 'next', ...aria,
                                onPaste: (e) => {
                                  /* Pasting a number that already carries +34 turned the
                                     country code into subscriber digits. */
                                  const raw = e.clipboardData.getData('text')
                                  const parsed = parsePhoneNumberFromString(raw, 'ES')
                                  if (parsed) {
                                    e.preventDefault()
                                    setForm((f) => ({ ...f, telefono: parsed.number, telDisplay: parsed.formatInternational() }))
                                  }
                                },
                              }}
                              countrySelectorStyleProps={{
                                buttonClassName: 'pi__flag',
                                buttonContentWrapperClassName: 'pi__flagwrap',
                              }}
                              inputClassName="fld__input pi__input"
                              className="pi"
                            />
                            </div>
                          )}
                        </Field>

                        <Field
                          id="email" label="Correo electrónico"
                          ref={(el) => { inputs.current.email = el }}
                          value={form.email}
                          valid={checks.email}
                          error={errors.email} showError={showErr('email')}
                          onChange={(e) => setForm({ ...form, email: e.target.value })}
                          onBlur={blur('email')}
                          name="email" type="email" inputMode="email" autoComplete="email" enterKeyHint="go"
                        />

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
                      <div>
                        <h2 className="ask" tabIndex={-1} ref={ask}>Revisa y envía</h2>
                        <dl className="review">
                          {[
                            ['Trámite', productLabel(product)],
                            ['Precio', productPrice(product)],
                            ['Nombre', form.nombre],
                            ...(form.caducidad ? [['Caduca', form.caducidad]] : []),
                            ['Teléfono', form.telDisplay || prettyTel(form.telefono)],
                            ['Correo', form.email],
                          ].map(([k, v], i) => (
                            <m.div
                              key={k}
                              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.04, duration: 0.3, ease: EASE }}
                            >
                              <dt>{k}</dt><dd>{v}</dd>
                            </m.div>
                          ))}
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
                    </div>
                </div>
              </m.section>
            )}
          </AnimatePresence>
          </div>
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
    </MotionConfig>
    </LazyMotion>
  )
}
