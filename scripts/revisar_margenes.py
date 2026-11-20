#!/usr/bin/env python3
"""Revisa la ZONA SEGURA en fotogramas renderizados en modo revisión (`npm run margenes` en videos/<BASE>).

En ese modo el fondo es negro liso y lo decorativo (patrones, partículas, viñeta, cortinillas, confeti…) está apagado, así que
cualquier píxel encendido fuera de la zona es CONTENIDO mal colocado:
  · x < 120 o x > 960 entre Y 260 y 1540 (Instagram recorta los lados en los teléfonos alargados)
  · x > 900 entre Y 1100 y 1540 (columna de botones: me gusta, comentar, compartir…)

Uso:
  python3 scripts/revisar_margenes.py videos/<BASE>/out/margenes       # carpeta con los PNG
Sale con código 1 si algún fotograma se sale; deja <png>_marcado.jpg con los píxeles culpables en magenta y
hoja_margenes.jpg con todos los fotogramas y las franjas prohibidas.
La tarjeta final (fotogramas tarjeta_*) se revisa según su especificación (x 120–960): si entra en la columna de botones
solo se AVISA, porque su diseño actual la lleva hasta x 960 (ver referencias/layout.md).
Límite conocido: en climas claros (papel) la tinta negra no se distingue del fondo negro de revisión: esos se miran a ojo.
"""
import json, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

MARGEN = 120                   # = MARGEN_LADOS de plantilla/src/marco/datos.ts
Y_ARRIBA, Y_ABAJO, Y_BOTONES, X_BOTONES = 260, 1540, 1100, 900
UMBRAL_LUZ = 40                # 0-255: por encima, el píxel está "encendido"
MIN_PIXELES = 60               # menos que esto en una franja = ruido (antialias de un borde, una sombra)


def zonas():
    return {"izquierda": (0, Y_ARRIBA, MARGEN, Y_ABAJO), "derecha": (1080 - MARGEN, Y_ARRIBA, 1080, Y_BOTONES),
            "botones": (X_BOTONES, Y_BOTONES, 1080, Y_ABAJO)}


def revisar(png: Path):
    im = Image.open(png).convert("RGB")
    if im.size != (1080, 1920):
        im = im.resize((1080, 1920))
    a = np.asarray(im).astype(np.int16)
    luz = a.max(axis=2) > UMBRAL_LUZ
    fallos = {}
    for nombre, (x0, y0, x1, y1) in zonas().items():
        m = luz[y0:y1, x0:x1]
        n = int(m.sum())
        if n >= MIN_PIXELES:
            ys, xs = np.nonzero(m)
            fallos[nombre] = {"pixeles": n, "caja": [int(xs.min() + x0), int(ys.min() + y0), int(xs.max() + x0), int(ys.max() + y0)]}
    return im, luz, fallos


def marcar(im, luz, fallos, salida):
    out = im.copy()
    d = ImageDraw.Draw(out, "RGBA")
    for x0, y0, x1, y1 in zonas().values():
        d.rectangle([x0, y0, x1, y1], fill=(255, 140, 0, 50))
    arr = np.asarray(out).copy()
    for x0, y0, x1, y1 in zonas().values():
        sub = luz[y0:y1, x0:x1]
        arr[y0:y1, x0:x1][sub] = (255, 0, 255)
    out = Image.fromarray(arr)
    d = ImageDraw.Draw(out)
    for f in fallos.values():
        d.rectangle(f["caja"], outline=(255, 0, 255), width=6)
    out.save(salida, quality=85)
    return out


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    carpeta = Path(sys.argv[1])
    pngs = sorted(p for p in carpeta.glob("*.png"))
    if not pngs:
        raise SystemExit(f"No hay PNG en {carpeta}")
    informe, miniaturas, malos = {}, [], 0
    avisos_tarjeta = 0
    for p in pngs:
        im, luz, fallos = revisar(p)
        if p.stem.startswith("tarjeta_") and "botones" in fallos:
            avisos_tarjeta += 1
            fallos.pop("botones")
        if fallos:
            malos += 1
            vista = marcar(im, luz, fallos, p.with_name(p.stem + "_marcado.jpg"))
            informe[p.stem] = fallos
            print(f"  ✗ {p.stem}: " + " · ".join(f"{z} {f['pixeles']} px en x {f['caja'][0]}–{f['caja'][2]}, y {f['caja'][1]}–{f['caja'][3]}" for z, f in fallos.items()))
        else:
            vista = im
        miniaturas.append((p.stem, vista.resize((216, 384)), bool(fallos)))
    cols = min(8, len(miniaturas))
    filas = (len(miniaturas) + cols - 1) // cols
    hoja = Image.new("RGB", (cols * 216, filas * 384), (0, 0, 0))
    d = ImageDraw.Draw(hoja, "RGBA")
    for i, (nombre, mini, mal) in enumerate(miniaturas):
        x, y = (i % cols) * 216, (i // cols) * 384
        hoja.paste(mini, (x, y))
        k = 216 / 1080
        for x0, y0, x1, y1 in zonas().values():
            d.rectangle([x + x0 * k, y + y0 * k, x + x1 * k, y + y1 * k], fill=(255, 140, 0, 60))
        d.rectangle([x, y, x + 215, y + 383], outline=(255, 0, 255) if mal else (40, 40, 40), width=4 if mal else 1)
        d.text((x + 6, y + 4), nombre, fill=(255, 255, 255))
    hoja.save(carpeta / "hoja_margenes.jpg", quality=85)
    (carpeta / "margenes.json").write_text(json.dumps(informe, ensure_ascii=False, indent=1), encoding="utf-8")
    if avisos_tarjeta:
        print(f"  aviso: la tarjeta final entra en la columna de botones (x>900 bajo Y 1100) en {avisos_tarjeta} fotograma(s): "
              "es su diseño actual (x 120–960); si molesta, acórtala (menos pasos o texto) para que acabe por encima de Y 1100")
    if malos:
        print(f"✗ {malos} de {len(pngs)} fotogramas con contenido fuera de la zona segura: mira *_marcado.jpg y hoja_margenes.jpg, "
              "y recoloca con ZONA / encajarX (o mueve la pieza a otra escena). No achiques el margen.")
        sys.exit(1)
    print(f"✓ {len(pngs)} fotogramas dentro de la zona segura (x 120–960; x ≤ 900 bajo Y 1100) · hoja: {carpeta / 'hoja_margenes.jpg'}")


if __name__ == "__main__":
    main()
