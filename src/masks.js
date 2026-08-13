/* Live input masks. Typing letters into a date field and watching them stick
   is exactly the kind of detail an owner notices in a demo. These format as
   the visitor types; the validators in validators.js stay the authority. */

/* Spanish numbers get the school's own grouping, 655 48 77 16. A leading +
   keeps international numbers working: +34 gets the same grouping, anything
   else is grouped in threes and left alone otherwise. */
export function formatTel(v) {
  const plus = v.trimStart().startsWith('+')
  let d = v.replace(/\D/g, '')
  if (plus) {
    if (d.startsWith('34')) {
      const rest = d.slice(2, 11)
      const parts = [rest.slice(0, 3), rest.slice(3, 5), rest.slice(5, 7), rest.slice(7, 9)].filter(Boolean)
      return '+34' + (parts.length ? ' ' + parts.join(' ') : '')
    }
    return '+' + d.slice(0, 15).replace(/(\d{3})(?=\d)/g, '$1 ')
  }
  d = d.slice(0, 9)
  return [d.slice(0, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(' ')
}

/* mm/aaaa as you type. "052024" becomes 05/2024, "5" becomes 05 because no
   month starts with a digit above 1, and a typed separator is respected so
   "1/2024" means January, not December. The slash is only emitted once year
   digits exist, which is what keeps backspace from fighting the mask. */
export function formatCaducidad(v) {
  const m = v.match(/^\s*(\d{1,2})\s*[/\-. ]\s*(\d{0,4})/)
  if (m) {
    const mm = m[1].length === 1 ? '0' + m[1] : m[1]
    return m[2] ? `${mm}/${m[2]}` : `${mm}/`
  }
  const d = v.replace(/\D/g, '').slice(0, 6)
  if (!d) return ''
  let mm
  let rest
  if (d[0] > '1') { mm = '0' + d[0]; rest = d.slice(1) }
  else if (d.length >= 2 && Number(d.slice(0, 2)) > 12) { mm = '0' + d[0]; rest = d.slice(1) }
  else { mm = d.slice(0, 2); rest = d.slice(2) }
  rest = rest.slice(0, 4)
  return rest ? `${mm}/${rest}` : mm
}
