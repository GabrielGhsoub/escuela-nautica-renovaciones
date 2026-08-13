/* A month picker, not a day picker. The field is "caducidad del título", which
   is printed on the card as mm/aaaa, so a day calendar would ask for a
   precision the document does not have and that the school does not want.
   Twelve months plus a year strip is two taps on a phone; a day grid is three
   and invites a wrong answer. Typing still works, and the mask still runs. */
import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function MonthPicker({ open, value, onPick, onClose, anchorId }) {
  const box = useRef(null)
  const now = new Date()
  const parsed = useMemo(() => {
    const m = /^(\d{2})\/(\d{4})$/.exec(value || '')
    return m ? { mes: Number(m[1]), anio: Number(m[2]), set: true } : { mes: 0, anio: now.getFullYear(), set: false }
  }, [value, now])

  const monthOk = (n) => n >= 1 && n <= 12

  /* Years a real título can carry: renewals run five years, and people arrive
     with cards that expired a while ago as well as ones expiring soon. */
  const years = useMemo(() => {
    const start = now.getFullYear() - 6
    return Array.from({ length: 13 }, (_, i) => start + i)
  }, [now])

  const safeYear = (y) => (years.includes(y) ? y : now.getFullYear())

  useEffect(() => {
    if (!open) return
    box.current?.querySelector('.mp__year.is-on')?.scrollIntoView({ inline: 'center', block: 'nearest' })
    box.current?.scrollIntoView({ block: 'nearest' })
  }, [open, parsed.anio])

  useEffect(() => {
    if (!open) return undefined
    function onDown(e) {
      if (box.current && !box.current.contains(e.target) && !e.target.closest?.(`#${anchorId}`)) onClose()
    }
    function onKey(e) { if (e.key === 'Escape') { onClose(); document.getElementById(anchorId)?.focus() } }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose, anchorId])

  return (
    <AnimatePresence>
      {open && (
        <m.div
          ref={box}
          className="mp"
          id="mp-caducidad"
          role="group"
          aria-label="Elegir mes y año de caducidad"
          initial={{ opacity: 0, y: -6, scale: .97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: .97 }}
          transition={{ duration: .16, ease: [.22, 1, .36, 1] }}
        >
          <div className="mp__years" role="group" aria-label="Año">
            {years.map((y) => (
              <button
                key={y} type="button"
                className={`mp__year${parsed.set && y === parsed.anio ? ' is-on' : ''}`}
                aria-pressed={parsed.set && y === parsed.anio}
                onClick={() => onPick(monthOk(parsed.mes) ? String(parsed.mes).padStart(2, '0') : '', y)}
              >
                {y}
              </button>
            ))}
          </div>
          <div
            className="mp__months" role="group" aria-label="Mes"
            onKeyDown={(e) => {
              const d = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: 4, ArrowUp: -4 }[e.key]
              if (!d) return
              e.preventDefault()
              const btns = [...e.currentTarget.querySelectorAll('.mp__month')]
              const at = btns.indexOf(document.activeElement)
              btns[Math.min(11, Math.max(0, (at < 0 ? 0 : at) + d))]?.focus()
            }}
          >
            {MESES.map((m, i) => {
              const mm = String(i + 1).padStart(2, '0')
              const on = parsed.mes === i + 1
              return (
                <button
                  key={m} type="button"
                  tabIndex={on || (!parsed.set && i === 0) ? 0 : -1}
                  className={`mp__month${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => { onPick(mm, safeYear(parsed.anio)); onClose(); document.getElementById(anchorId)?.focus() }}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </m.div>
      )}
    </AnimatePresence>
  )
}
