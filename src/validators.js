import { parsePhoneNumberFromString } from 'libphonenumber-js';

/* The school confirms every request by contacting the person. A request that
   carries "1" as a phone and "pepe@gmail" as an email is unreachable on both
   channels: the visitor believes they asked for a renewal, nobody can call
   them, and it reads as the school ignoring them. type="email" does not catch
   this - it accepts any address with no top-level domain, which is the single
   most common real typo. These are the loosest checks that still leave a way
   to answer. */

export const nombreOk = (v) => {
  const s = String(v).trim().replace(/\s+/g, ' ');
  return s.length >= 5 && s.includes(' ') && /^[\p{L}\p{M}'’.\- ]+$/u.test(s);
};

/* Delegated to libphonenumber-js so a French or German holder of a Spanish
   título is judged by their own country's numbering plan, not by a Spanish
   regex that happens to accept the right digit count. */
export const telOk = (v) => {
  const s = String(v).trim();
  if (!s) return false;
  try {
    const p = parsePhoneNumberFromString(s, 'ES');
    return Boolean(p && p.isValid());
  } catch { return false; }
};

const HTML5_EMAIL =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const emailOk = (v) => {
  const s = String(v).trim();
  return HTML5_EMAIL.test(s) && /\.[a-zA-Z]{2,}$/.test(s) && s.length <= 254;
};

/* Optional field, so blank is valid. Only a typed value has to be well formed. */
export const caducidadOk = (v) => {
  const s = String(v).trim();
  if (!s) return true;
  const m = s.match(/^(\d{1,2})\s*[/\-. ]\s*(\d{4})$/);
  if (!m) return false;
  const mes = Number(m[1]);
  const anio = Number(m[2]);
  const y = new Date().getFullYear();
  return mes >= 1 && mes <= 12 && anio >= y - 40 && anio <= y + 15;
};
