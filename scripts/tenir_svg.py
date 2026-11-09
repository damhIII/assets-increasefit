#!/usr/bin/env python3
"""Tiñe SVGs de ui/ (que traen los colores IncreaseFit fijos) con los colores de un clima.

Uso:
  python3 scripts/tenir_svg.py --clima papel ui/tarjeta_serie.svg ui/anillo_descanso.svg --out <proyecto>/public/climas
  → <proyecto>/public/climas/papel/ui/tarjeta_serie.svg ...

Los SVG de ui/ vienen con los colores del clima base (negro); en él se usan tal cual.
El azul luz (#6A8CFF) es el comodín del foco: pasa a azul sobre blanco (papel) y a blanco sobre azul (azul).
El rojo de alerta, el verde de éxito y el blanco NO se tocan: son constantes de marca.
"""
import argparse, json, re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# color IncreaseFit en el SVG original → rol del clima que lo sustituye
# (valores del clima base "negro": si cambias "negro" en paletas.json, cambia también estas claves y los SVG de ui/)
MAPA = {
    "#6A8CFF": "foco",         # el acento IncreaseFit: VS, anillo, tarjeta activa
    "#A8A8A8": "estructura",   # bordes, líneas
    "#4C74FF": "acento",
    "#222222": "superficie",   # tarjetas, anillos
    "#161616": "fondo_a",
    "#050505": "fondo_b",
    "#A6A6A6": "texto_suave",
}


def tenir(svg: str, clima: dict) -> str:
    def sub(m):
        rol = MAPA.get(m.group(0).upper())
        return clima[rol] if rol else m.group(0)
    return re.sub(r"#[0-9A-Fa-f]{6}\b", sub, svg)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--clima", required=True)
    ap.add_argument("--out", default="public/climas")
    ap.add_argument("--paletas", default=str(RAIZ / "brand" / "paletas.json"))
    ap.add_argument("archivos", nargs="+", help="rutas relativas a la raíz del repo (ui/...)")
    a = ap.parse_args()
    climas = json.loads(Path(a.paletas).read_text(encoding="utf-8"))["climas"]
    if a.clima not in climas:
        raise SystemExit(f"Clima desconocido: {a.clima}. Disponibles: {', '.join(climas)}")
    for rel in a.archivos:
        dst = Path(a.out) / a.clima / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        dst.write_text(tenir((RAIZ / rel).read_text(encoding="utf-8"), climas[a.clima]), encoding="utf-8")
        print(f"{rel} → {dst}")


if __name__ == "__main__":
    main()
