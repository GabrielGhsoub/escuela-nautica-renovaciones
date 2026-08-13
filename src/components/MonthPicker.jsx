/* A month picker, not a day picker. The field is "caducidad del título", which
   is printed on the card as mm/aaaa, so a day calendar would ask for a
   precision the document does not have and that the school does not want.
   Twelve months plus a year strip is two taps on a phone; a day grid is three
   and invites a wrong answer. Typing still works, and the mask still runs. */
import { useEffect, useMemo, useRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const MESES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']

export default function MonthPicker({ open, value, onPick, onClose, anchorId }) {
  const box = useRef(null)
  const now = new Date()
  const parsed = useMemo(() => {
    const m = /^(\d{2})\/(\d{4})$/.exec(value || '')
    return m ? { mes: Number(m[1]), anio: Number(m[2]) } : { mes: 0, anio: now.getFullYear() }
  }, [value, now])

  /* Years a real título can carry: renewals run five years, and people arrive
     with cards that expired a while ago as well as ones expiring soon. */
  const years = useMemo(() => {
    const start = now.getFullYear() - 6
    return Array.from({ length: 13 }, (_, i) => start + i)
  }, [now])

  const yearRef = useRef(parsed.anio)
  yearRef.current = parsed.anio

  useEffect(() => {
    if (!open) return undefined
    function onDown(e) {
      if (box.current && !box.current.contains(e.target) && e.target.id !== anchorId) onClose()
    }
    function onKey(e) { if (e.key === 'Escape') onClose() }
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
        <motion.div
          ref={box}
          className="mp"
          role="dialog"
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
                className={`mp__year${y === parsed.anio ? ' is-on' : ''}`}
                aria-pressed={y === parsed.anio}
                onClick={() => onPick(parsed.mes ? String(parsed.mes).padStart(2, '0') : '01', y)}
              >
                {y}
              </button>
            ))}
          </div>
          <div className="mp__months" role="group" aria-label="Mes">
            {MESES.map((m, i) => {
              const mm = String(i + 1).padStart(2, '0')
              const on = parsed.mes === i + 1
              return (
                <button
                  key={m} type="button"
                  className={`mp__month${on ? ' is-on' : ''}`}
                  aria-pressed={on}
                  onClick={() => { onPick(mm, parsed.anio); onClose() }}
                >
                  {m}
                </button>
              )
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
