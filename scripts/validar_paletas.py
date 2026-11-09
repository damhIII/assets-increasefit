#!/usr/bin/env python3
"""Valida brand/paletas.json: contrastes WCAG y que el foco de cada clima destaque.

Cada clima trae su `foco` (el color de acento IncreaseFit en ese clima):
  - oscuro → azul luz (#6A8CFF): el azul de marca #2353F1 no se lee como texto sobre negro.
  - claro  → azul de marca (#2353F1), usado como marcador detrás de texto blanco.
  - color  → blanco: el clima azul es la tarjeta azul del feed; el texto es grande y en negrita,
             así que basta con 4,5:1 (AAA para texto grande) en lugar de 7.

Uso: python3 scripts/validar_paletas.py [ruta]   (sale con código 1 si algo falla)
"""
import colorsys, json, sys
from pathlib import Path

RUTA = Path(sys.argv[1]) if len(sys.argv) > 1 else Path(__file__).resolve().parent.parent / "brand" / "paletas.json"
BLANCO = "#FFFFFF"


def lum(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contraste(a, b):
    la, lb = sorted((lum(a), lum(b)), reverse=True)
    return (la + 0.05) / (lb + 0.05)


def tono(hx):
    r, g, b = (int(hx[i:i + 2], 16) / 255 for i in (1, 3, 5))
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return h * 360, s


def dist_tono(hx, foco):
    """Distancia de tono (grados) entre un color y el foco. Grises, o un foco blanco, no compiten: 180."""
    h, s = tono(hx)
    hf, sf = tono(foco)
    if s < 0.25 or sf < 0.25 or foco.upper() == BLANCO:
        return 180.0
    d = abs(h - hf) % 360
    return min(d, 360 - d)


def main():
    data = json.loads(RUTA.read_text(encoding="utf-8"))
    base = data["reglas_rotacion"]["clima_base"]
    fallos, filas = [], []

    def chk(nombre, cond, detalle):
        filas.append(("OK " if cond else "XX ") + f"{nombre}: {detalle}")
        if not cond:
            fallos.append(f"{nombre}: {detalle}")

    if base not in data["climas"]:
        chk("clima_base", False, f"{base} no está en climas")

    for cid, c in data["climas"].items():
        if "foco" not in c:
            chk(f"{cid} foco", False, "falta la clave `foco`")
            continue
        tipo = c["tipo"]
        claro = tipo == "claro"
        minimo = 4.5 if tipo == "color" else 7
        for fondo in ("fondo_a", "fondo_b"):
            F = c[fondo]
            chk(f"{cid} texto/{fondo}", contraste(c["texto"], F) >= minimo, f"{contraste(c['texto'], F):.1f} ≥ {minimo}")
            chk(f"{cid} texto_suave/{fondo}", contraste(c["texto_suave"], F) >= 4.5, f"{contraste(c['texto_suave'], F):.1f} ≥ 4.5")
            chk(f"{cid} estructura/{fondo}", contraste(c["estructura"], F) >= 4.5, f"{contraste(c['estructura'], F):.1f} ≥ 4.5")
            ok_acento = contraste(c["acento"], F) >= 3 or contraste(c["texto"], c["acento"]) >= 4.5
            chk(f"{cid} acento/{fondo}", ok_acento, f"trazo {contraste(c['acento'], F):.1f} ≥ 3 o relleno {contraste(c['texto'], c['acento']):.1f} ≥ 4.5")
            # la mascota Rep tiene que recortarse bien sobre el fondo
            chk(f"{cid} cuerpo_rep/{fondo}", contraste(c["cuerpo_rep"], F) >= minimo, f"{contraste(c['cuerpo_rep'], F):.1f} ≥ {minimo}")
            chk(f"{cid} rep_lejano/{fondo}", contraste(c["cuerpo_rep_lejano"], F) >= 3, f"{contraste(c['cuerpo_rep_lejano'], F):.1f} ≥ 3")
            if not claro:  # en climas claros el foco es un marcador detrás de texto blanco
                chk(f"{cid} foco/{fondo}", contraste(c["foco"], F) >= 5.5, f"{contraste(c['foco'], F):.1f} ≥ 5.5")
        chk(f"{cid} superficie≠fondo", contraste(c["superficie"], c["fondo_a"]) >= 1.08, f"{contraste(c['superficie'], c['fondo_a']):.2f} ≥ 1.08")
        if cid != base:
            for k in ("estructura", "acento"):
                chk(f"{cid} {k} lejos del foco", dist_tono(c[k], c["foco"]) >= 22, f"{dist_tono(c[k], c['foco']):.0f}° ≥ 22°")
        if claro:
            chk(f"{cid} marcador", contraste(BLANCO, c["foco"]) >= 4.5, f"texto blanco sobre foco {contraste(BLANCO, c['foco']):.1f} ≥ 4.5")

    print("\n".join(filas))
    print(f"\n{len(filas) - len(fallos)}/{len(filas)} comprobaciones OK")
    if fallos:
        print("\nFALLOS:\n - " + "\n - ".join(fallos))
        sys.exit(1)


if __name__ == "__main__":
    main()
