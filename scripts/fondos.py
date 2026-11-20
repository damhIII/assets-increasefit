#!/usr/bin/env python3
"""Genera patrones de fondo de iconos (fondos/patron_*.svg) en el mismo estilo que los existentes y los registra en
fondos/manifest.json. Blancos sobre transparente: la plantilla los tiñe con el color de texto del clima a baja opacidad.

Uso:
  python3 scripts/fondos.py                 # (re)genera todos los patrones de PATRONES que falten
  python3 scripts/fondos.py --forzar        # los regenera aunque existan
  python3 scripts/fondos.py --nuevo patron_x "Uso del patrón" icono1 icono2 ...   # uno a medida (iconos de icons/, 24×24)

Después: python3 scripts/contactos.py fondos (vista previa). Solo iconos de trazo de 24×24 (Lucide, Tabler `tb-`).
Determinista: la misma lista de iconos da siempre el mismo patrón.
"""
import json, random, re, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
MAN = RAIZ / "fondos" / "manifest.json"

# id → (uso, iconos). Pensados para el público de la cuenta: vida diaria, trabajo, salud y mente.
PATRONES = {
    "patron_oficina": ("Trabajo y oficina: laptop, maletín, silla, café, reloj. Pasar el día sentado, estrés del trabajo, poco tiempo.",
                       ["laptop", "briefcase", "armchair", "coffee", "clock-3", "monitor", "lamp-desk", "calendar-days", "smartphone", "tb-desk"]),
    "patron_salud": ("Salud general: corazón, pulso, estetoscopio, escudo, hoja. Beneficios para la salud, prevención, longevidad.",
                     ["heart-pulse", "stethoscope", "shield-plus", "activity", "heart", "leaf", "thermometer", "droplets", "tb-heartbeat", "sparkles"]),
    "patron_mente": ("Mente y ánimo: cerebro, caras, sol, nube con luna. Ansiedad, ánimo, estrés, memoria, motivación.",
                     ["brain", "smile", "sun", "cloud-moon", "brain-circuit", "laugh", "meh", "lightbulb", "tb-mood-smile", "sparkles"]),
    "patron_tiempo": ("Tiempo y constancia: calendario, reloj de arena, despertador, check. Hábitos, semanas, rachas, volver.",
                      ["calendar-check", "hourglass", "alarm-clock", "calendar-clock", "timer-reset", "repeat", "square-check-big", "clock-3", "tb-calendar-week", "infinity"]),
    "patron_vida": ("Vida diaria fuera del gym: casa, auto, bolsas, escaleras, mochila. Encajar el entreno en el día, actividad cotidiana.",
                    ["house", "car", "shopping-bag", "tb-stairs-up", "backpack", "bus", "footprints", "dog", "sunrise", "bed-double"]),
}


def _cuerpo(nombre):
    f = RAIZ / "icons" / f"{nombre}.svg"
    if not f.exists():
        raise SystemExit(f"Falta icons/{nombre}.svg (añádelo con: python3 scripts/iconos.py {nombre})")
    s = f.read_text(encoding="utf-8")
    if 'viewBox="0 0 24 24"' not in s:
        raise SystemExit(f"icons/{nombre}.svg no es un icono de trazo 24×24 (Lucide/Tabler): no sirve para patrones")
    cuerpo = re.sub(r"^.*?<svg[^>]*>|</svg>\s*$", "", s, flags=re.S).strip()
    cuerpo = re.sub(r'<path stroke="none" d="M0 0h24v24H0z" fill="none"\s*/>', "", cuerpo)   # el cuadro vacío de Tabler
    return cuerpo


def generar(pid, iconos):
    rnd = random.Random(pid)
    grupos, bolsa = [], []
    for fila in range(8):
        y0 = 130 + fila * 235
        xs = [140, 350, 550, 750, 1000] if fila % 2 == 0 else [30, 185, 425, 630, 865]
        for x in xs:
            if not bolsa:                                   # baraja la lista cada vez que se gasta: sin columnas repetidas
                bolsa = list(iconos)
                rnd.shuffle(bolsa)
            nombre = bolsa.pop()
            x1, y1 = x + rnd.uniform(-14, 14), y0 + rnd.uniform(-26, 26)
            grupos.append(f'<g transform="translate({x1:.1f} {y1:.1f}) rotate({rnd.uniform(-22, 22):.1f}) scale({rnd.uniform(3.3, 4.1):.3f}) translate(-12 -12)">'
                          f"{_cuerpo(nombre)}</g>")
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1920" fill="none" stroke="#FFFFFF" stroke-width="1.5" '
           'stroke-linecap="round" stroke-linejoin="round">' + "".join(grupos) + "</svg>\n")
    svg = svg.replace("currentColor", "#FFFFFF")
    (RAIZ / "fondos" / f"{pid}.svg").write_text(svg, encoding="utf-8")


def registrar(pid, uso):
    man = json.loads(MAN.read_text(encoding="utf-8"))
    man["fondos"] = [x for x in man.get("fondos") or [] if x["id"] != pid]
    man["fondos"].append({"id": pid, "archivo": f"fondos/{pid}.svg", "tipo": "iconos", "uso": uso})
    MAN.write_text(json.dumps(man, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def main():
    a = sys.argv[1:]
    if a[:1] == ["--nuevo"]:
        if len(a) < 4:
            raise SystemExit(__doc__)
        pid, uso, iconos = a[1], a[2], a[3:]
        generar(pid, iconos)
        registrar(pid, uso)
        print(f"✓ {pid}")
        return
    forzar = "--forzar" in a
    for pid, (uso, iconos) in PATRONES.items():
        if forzar or not (RAIZ / "fondos" / f"{pid}.svg").exists():
            generar(pid, iconos)
            registrar(pid, uso)
            print(f"✓ {pid}")
    print("Vista previa: python3 scripts/contactos.py fondos")


if __name__ == "__main__":
    main()
