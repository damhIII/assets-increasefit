#!/usr/bin/env python3
"""Tiñe SVGs de ui/ (que traen los colores IncreaseFit fijos) con los colores de un clima.

Uso:
  python3 scripts/tenir_svg.py --clima pizarra ui/tarjeta_serie.svg ui/anillo_descanso.svg --out <proyecto>/public/climas
  → <proyecto>/public/climas/pizarra/ui/tarjeta_serie.svg ...

El cian IncreaseFit (#1FB7DE), el rojo de alerta, el verde de éxito y el blanco NO se tocan: son constantes de marca.
"""
import argparse, json, re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent

# color IncreaseFit en el SVG original → rol del clima que lo sustituye
MAPA = {
    "#8FA6B5": "estructura",   # bordes, líneas, VS
    "#2A6F87": "acento",
    "#232D38": "superficie",   # tarjetas, anillos
    "#171E26": "fondo_a",
    "#0A0E12": "fondo_b",
    "#A3B4C0": "texto_suave",
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
