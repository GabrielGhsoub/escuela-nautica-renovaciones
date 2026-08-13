#!/usr/bin/env python3
"""Render the school's notification email from a request record.

The record is the exact object the page writes when someone presses "Enviar
solicitud" (see src/store.js). Rendering from that object rather than from
hand-written sample text is what makes the end-to-end test meaningful: if the
page ever changes a field, the email changes with it or this breaks loudly.
"""
import html
import json
import sys

REQUIRED = ("nombre", "telefono", "email", "tramite", "precio")

ROW = (
    '        <tr>\n'
    '          <td style="padding:9px 0;color:#6b6a63;border-bottom:1px solid #efece5;width:38%;">{label}</td>\n'
    '          <td style="padding:9px 0;border-bottom:1px solid #efece5;font-weight:600;">{value}</td>\n'
    '        </tr>\n'
)


def render(rec, received="hoy"):
    missing = [k for k in REQUIRED if not rec.get(k)]
    if missing:
        raise SystemExit(f"record is missing required fields: {', '.join(missing)}")

    e = lambda s: html.escape(str(s), quote=True)
    tel_digits = "".join(c for c in rec["telefono"] if c.isdigit() or c == "+")

    rows = [
        ROW.format(label="Nombre", value=e(rec["nombre"])),
        ROW.format(
            label="Tel&eacute;fono",
            value=f'<a href="tel:{e(tel_digits)}" style="color:#1e73be;text-decoration:none;">{e(rec["telefono"])}</a>',
        ),
        ROW.format(
            label="Correo",
            value=f'<a href="mailto:{e(rec["email"])}" style="color:#1e73be;text-decoration:none;">{e(rec["email"])}</a>',
        ),
    ]
    if rec.get("caducidad"):
        rows.append(ROW.format(label="Caducidad del t&iacute;tulo", value=e(rec["caducidad"])))
    rows.append(ROW.format(label="Recibida", value=e(received)))

    subject = f'Nueva solicitud: {rec["tramite"]} - {rec["nombre"]}'
    plain = (
        f'Nueva solicitud - {rec["tramite"]} ({rec["precio"]})\n\n'
        f'Nombre: {rec["nombre"]}\n'
        f'Telefono: {rec["telefono"]}\n'
        f'Correo: {rec["email"]}\n'
        + (f'Caducidad del titulo: {rec["caducidad"]}\n' if rec.get("caducidad") else "")
        + f"Recibida: {received}\n\n"
        "Documentacion que hay que pedirle: titulo caducado, certificado psicotecnico,\n"
        "copia del DNI en vigor. La solicitud no esta confirmada hasta que la escuela\n"
        "conteste. No se ha cobrado nada.\n"
    )

    body = f"""<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>{e(subject)}</title></head>
<body style="margin:0;padding:0;background:#f2f0ea;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#0e185f;border-radius:14px 14px 0 0;padding:18px 24px;">
      <p style="margin:0;color:#ffffff;font-size:16px;font-weight:700;">&#9875; Escuela N&aacute;utica de Valencia</p>
      <p style="margin:2px 0 0;color:#aebadf;font-size:12px;">Renovaci&oacute;n de t&iacute;tulos n&aacute;uticos &middot; solicitud recibida desde la web</p>
    </div>
    <div style="background:#ffffff;border:1px solid #e3e0d8;border-top:0;border-radius:0 0 14px 14px;padding:24px;">
      <p style="margin:0 0 4px;font-size:13px;color:#6b6a63;">Nueva solicitud</p>
      <p style="margin:0 0 18px;font-size:20px;font-weight:700;color:#0e185f;">{e(rec["tramite"])} &middot; {e(rec["precio"])}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;border-collapse:collapse;font-size:14px;color:#10131f;">
{''.join(rows)}      </table>
      <div style="margin:22px 0 6px;">
        <a href="tel:{e(tel_digits)}" style="display:inline-block;background:#1e73be;color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;padding:11px 20px;border-radius:999px;">Llamar</a>
        <a href="mailto:{e(rec["email"])}" style="display:inline-block;background:#ffffff;color:#0e185f;font-size:14px;font-weight:600;text-decoration:none;padding:10px 20px;border-radius:999px;border:1px solid #c9c5ba;margin-left:6px;">Responder por correo</a>
      </div>
      <p style="margin:18px 0 0;font-size:12px;color:#6b6a63;line-height:1.5;">
        Documentaci&oacute;n que hay que pedirle: t&iacute;tulo caducado, certificado psicot&eacute;cnico,
        copia del DNI en vigor. La solicitud no est&aacute; confirmada hasta que la escuela conteste.
      </p>
    </div>
    <p style="margin:14px 4px 0;font-size:11px;color:#8a877e;line-height:1.5;">
      Correo de demostraci&oacute;n preparado por Likwiid: as&iacute; llegar&iacute;a cada solicitud
      de la p&aacute;gina de renovaciones al buz&oacute;n de la escuela.
    </p>
  </div>
</body>
</html>
"""
    return subject, plain, body


if __name__ == "__main__":
    record = json.load(sys.stdin)
    subj, txt, htm = render(record, received=sys.argv[1] if len(sys.argv) > 1 else "hoy")
    print(json.dumps({"subject": subj, "plain": txt, "html": htm}))
