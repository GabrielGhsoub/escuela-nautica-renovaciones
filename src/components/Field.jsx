/* One field component so every input behaves the same: floating label, a tick
   the moment it becomes valid, an error that slides in only after a submit
   attempt or a blur, and hint text that stays put so nothing jumps. */
import { forwardRef } from 'react'
import { AnimatePresence, motion } from 'motion/react'

const Field = forwardRef(function Field(
  { id, label, hint, optional, value, error, showError, valid, onChange, onBlur, children, ...rest },
  ref,
) {
  const filled = String(value ?? '').length > 0
  const bad = showError && Boolean(error)
  return (
    <div className={`fld${bad ? ' is-bad' : ''}${filled ? ' is-filled' : ''}`}>
      <div className="fld__box">
        {children ?? (
          <input
            id={id}
            ref={ref}
            className="fld__input"
            value={value}
            placeholder=" "
            aria-invalid={bad || undefined}
            aria-describedby={bad ? `err-${id}` : hint ? `hint-${id}` : undefined}
            onChange={onChange}
            onBlur={onBlur}
            {...rest}
          />
        )}
        <label className="fld__label" htmlFor={id}>
          {label}
          {optional && <span className="fld__opt">opcional</span>}
        </label>
        <AnimatePresence>
          {valid && !bad && (
            <motion.span
              className="fld__ok" aria-hidden="true"
              initial={{ opacity: 0, scale: .5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: .5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              ✓
            </motion.span>
          )}
        </AnimatePresence>
      </div>
      <div className="fld__foot">
        <AnimatePresence initial={false}>
          {bad ? (
            <motion.p
              key="err" id={`err-${id}`} className="fld__err"
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: .16 }}
            >
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              key="hint" id={`hint-${id}`} className="fld__hint"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: .16 }}
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
})

export default Field
