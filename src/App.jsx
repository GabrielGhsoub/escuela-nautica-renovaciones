/* Renovación de títulos, request mode.
   Dani's own page already says what a renewal costs and what documents it needs.
   What it does not have is a way to start one: today it arrives as a WhatsApp
   message and he retypes it. This page collects the same request, complete, and
   hands it to him to confirm exactly as he does now.

   Deliberately NOT here:
   - No payment. He told us on 8 Aug "No cobramos con tarjeta". The card rail is
     built behind this but stays off until he says otherwise.
   - No document upload. Título caducado and certificado psicotécnico are
     sensitive (the psicotécnico is health data) and handling them properly needs
     storage, retention and deletion under a contract. The page tells the visitor
     what to have ready; the documents reach the school the way they do today. */
import { useState } from 'react'
import { motion } from 'framer-motion'
import { documents, included, products, school, titulin } from './data/renovaciones.js'
import './app.css'

const STEPS = ['Qué necesitas', 'Tus datos', 'Enviar']

export default function App() {
  const [step, setStep] = useState(0)
  const [picked, setPicked] = useState(null)
  const [form, setForm] = useState({ nombre: '', dni: '', telefono: '', email: '', caducidad: '' })
  const [sent, setSent] = useState(false)

  const product = products.find((p) => p.key === picked)
  const ready = form.nombre.trim() && form.telefono.trim() && form.email.trim()

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
          <a className="top__phone" href={school.phoneHref}>{school.phone}</a>
        </div>
      </header>

      <main className="shell main">
        <section className="intro">
          <h1>Renueva tu título náutico</h1>
          <p className="intro__lede">
            Nos encargamos de todo el trámite con la administración. Dinos qué necesitas
            y te confirmamos por teléfono o por correo antes de empezar.
          </p>
          <p className="intro__included">{included}</p>
        </section>

        {sent ? (
          <motion.section className="panel done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="done__tick" aria-hidden="true">✓</div>
            <h2>Solicitud enviada</h2>
            <p className="done__what">
              <strong>{product.kind === 'duplicado' ? 'Duplicado' : `Renovación de ${product.title}`}</strong>
              {' · '}{product.price} €
            </p>
            <p className="done__note">
              La escuela lo revisa y te contesta para confirmar. No se ha cobrado nada:
              el pago se hace como siempre, cuando ellos te lo confirmen.
            </p>
            <div className="done__docs">
              <h3>Ten preparado</h3>
              <ul>{documents.map((d) => <li key={d}>{d}</li>)}</ul>
              <p className="done__docsnote">
                No los subas aquí. Te dirán cómo hacérselos llegar cuando confirmen.
              </p>
            </div>
            <p className="demo">Demostración: no se ha enviado ningún mensaje real.</p>
          </motion.section>
        ) : (
          <section className="panel">
            <ol className="steps" aria-label="Pasos">
              {STEPS.map((s, i) => (
                <li key={s} className={i === step ? 'is-now' : i < step ? 'is-done' : ''}>
                  <span>{i < step ? '✓' : i + 1}</span>{s}
                </li>
              ))}
            </ol>

              {step === 0 && (
                <motion.div key="a" initial={false} animate={{ opacity: 1, y: 0 }}>
                  <p className="ask">¿Qué título necesitas renovar?</p>
                  <div className="prods">
                    {products.map((p) => (
                      <button
                        key={p.key} type="button"
                        className={`prod${picked === p.key ? ' is-on' : ''}`}
                        onClick={() => { setPicked(p.key); setStep(1) }}
                      >
                        <strong>{p.title}</strong>
                        <em>{p.full}</em>
                        <span>{p.price} €</span>
                      </button>
                    ))}
                  </div>
                  <div className="titulin">
                    <h3>{titulin.heading}</h3>
                    <p>{titulin.body}</p>
                    <a href={`mailto:${school.email}`}>{titulin.cta}</a>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.form
                  key="b" initial={false} animate={{ opacity: 1, y: 0 }}
                  onSubmit={(e) => { e.preventDefault(); setStep(2) }}
                >
                  <p className="ask">Tus datos</p>
                  <div className="recap">
                    {product.kind === 'duplicado' ? 'Duplicado' : `Renovación de ${product.title}`} · {product.price} €
                  </div>
                  <label className="f"><span>Nombre y apellidos</span>
                    <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} /></label>
                  <div className="f2">
                    <label className="f"><span>DNI</span>
                      <input value={form.dni} onChange={(e) => setForm({ ...form, dni: e.target.value })} /></label>
                    <label className="f"><span>Caducidad del título</span>
                      <input placeholder="mm/aaaa" value={form.caducidad} onChange={(e) => setForm({ ...form, caducidad: e.target.value })} /></label>
                  </div>
                  <div className="f2">
                    <label className="f"><span>Teléfono</span>
                      <input required inputMode="tel" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></label>
                    <label className="f"><span>Correo electrónico</span>
                      <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
                  </div>
                  <div className="nav">
                    <button type="button" className="btn btn--ghost" onClick={() => setStep(0)}>Atrás</button>
                    <button type="submit" className="btn btn--primary" disabled={!ready}>Continuar</button>
                  </div>
                </motion.form>
              )}

              {step === 2 && (
                <motion.div key="c" initial={false} animate={{ opacity: 1, y: 0 }}>
                  <p className="ask">Revisa y envía</p>
                  <dl className="review">
                    <div><dt>Trámite</dt><dd>{product.kind === 'duplicado' ? 'Duplicado de Licencia de Navegación' : `Renovación de ${product.title}`}</dd></div>
                    <div><dt>Precio</dt><dd>{product.price} €</dd></div>
                    <div><dt>Nombre</dt><dd>{form.nombre}</dd></div>
                    {form.dni && <div><dt>DNI</dt><dd>{form.dni}</dd></div>}
                    {form.caducidad && <div><dt>Caduca</dt><dd>{form.caducidad}</dd></div>}
                    <div><dt>Contacto</dt><dd>{form.telefono} · {form.email}</dd></div>
                  </dl>
                  <div className="docs">
                    <h3>Después te pediremos</h3>
                    <ul>{documents.map((d) => <li key={d}>{d}</li>)}</ul>
                    <p className="docs__note">
                      No hace falta subir nada ahora. La escuela te dirá cómo hacérselos llegar.
                    </p>
                  </div>
                  <p className="nopay">
                    No se paga nada en esta página. La escuela confirma primero y el pago se
                    hace como siempre.
                  </p>
                  <div className="nav">
                    <button type="button" className="btn btn--ghost" onClick={() => setStep(1)}>Atrás</button>
                    <button type="button" className="btn btn--primary" onClick={() => setSent(true)}>Enviar solicitud</button>
                  </div>
                </motion.div>
              )}
          </section>
        )}
      </main>

      <footer className="foot">
        <div className="shell">
          <p>
            {school.name} · <a href={school.phoneHref}>{school.phone}</a> ·{' '}
            <a href={`mailto:${school.email}`}>{school.email}</a>
          </p>
          <p className="foot__demo">
            Página de demostración creada por Likwiid con los contenidos públicos de la
            escuela. No envía ni cobra nada.
          </p>
        </div>
      </footer>
    </div>
  )
}
