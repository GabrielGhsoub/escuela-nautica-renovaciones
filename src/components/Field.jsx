/* One field component so every input behaves the same: floating label, a tick
   the moment it becomes valid, an error that slides in only after a submit
   attempt or a blur, and hint text that stays put so nothing jumps. */
import { forwardRef } from 'react'
import { AnimatePresence } from 'motion/react'
import * as m from 'motion/react-m'

const Field = forwardRef(function Field(
  { id, label, hint, optional, value, error, showError, valid, alwaysFloat, onChange, onBlur, children, ...rest },
  ref,
) {
  /* The phone control always displays a dial code even before our state holds
     anything, so the label has to float from the start or it prints over it. */
  const filled = alwaysFloat || String(value ?? '').length > 0
  const bad = showError && Boolean(error)
  /* The phone field renders a third-party input through `children`, so the aria
     wiring cannot live only on our own <input> branch: without this the screen
     reader announces "Teléfono, edit" and nothing else while the form refuses
     to advance. Hand the same attributes to whatever is rendered. */
  const aria = {
    'aria-invalid': bad || undefined,
    'aria-describedby': bad ? `err-${id}` : hint ? `hint-${id}` : undefined,
  }
  return (
    <div className={`fld${bad ? ' is-bad' : ''}${filled ? ' is-filled' : ''}`}>
      <div className="fld__box">
        {typeof children === 'function' ? children(aria) : children ?? (
          <input
            id={id}
            ref={ref}
            className="fld__input"
            value={value}
            placeholder=" "
            {...aria}
            onChange={onChange}
            onBlur={onBlur}
            {...rest}
          />
        )}
        <label className="fld__label" htmlFor={id}>
          {label}
          {optional && <span className="fld__opt"> opcional</span>}
        </label>
        <AnimatePresence>
          {valid && !bad && (
            <m.span
              className="fld__ok" aria-hidden="true"
              initial={{ opacity: 0, scale: .5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: .5 }}
              transition={{ type: 'spring', stiffness: 500, damping: 22 }}
            >
              ✓
            </m.span>
          )}
        </AnimatePresence>
      </div>
      <div className="fld__foot">
        <AnimatePresence initial={false}>
          {bad ? (
            <m.p
              key="err" id={`err-${id}`} className="fld__err"
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: .16 }}
            >
              {error}
            </m.p>
          ) : hint ? (
            <m.p
              key="hint" id={`hint-${id}`} className="fld__hint"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: .16 }}
            >
              {hint}
            </m.p>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
})

export default Field
