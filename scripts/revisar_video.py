#!/usr/bin/env python3
"""Revisión automática del Reel antes de renderizar: lo mecánico, para no tener que mirarlo en imágenes.

Uso (lo llama `npm run revisar` en videos/<BASE>, después de renderizar los fotogramas):
  python3 scripts/revisar_video.py videos/<BASE>

Lee src/video.json y los fotogramas de out/revision/:
  revision/fNNNNN.png  modo revisión (fondo liso negro, o blanco en climas claros; sin subtítulos ni texto en pantalla;
                       decorativos apagados; cámara quieta): uno por segundo + el reposo de cada escena
  normal/fNNNNN.png    modo normal: uno cada 0,5 s
y comprueba:
  1. Zona segura: contenido en x < 120 o x > 960 (Y 260–1540) o en la columna de botones (x > 900, Y 1100–1540). Error.
     La tarjeta final se revisa con su diseño (x 120–960): no se mira la columna de botones, que roza por diseño.
  2. Solape: contenido en la franja de los subtítulos (Y 260–402, hasta Y 500 en las escenas con insignias de icono en los
     subtítulos) o en la del texto en pantalla (Y 1360–1540, en las escenas que lo llevan). Error.
  3. Momentos muertos: tramos de más de 2,5 s sin cambio apreciable en la zona de escena (Y 540–1340), sin contar la cola
     ni la tarjeta final. Aviso. "Cambio apreciable" = al menos 600 px² que cambian de verdad: la comparación tolera
     desplazamientos de hasta 8 px, así que la flotación de la cámara, la respiración de la mascota o un icono que flota no
     cuentan; una pieza que entra, un cambio de pose, un ejercicio en bucle, una cifra que cuenta o la boca que habla, sí.
Las fuentes las comprueba la plantilla al renderizar (marco/Fuentes.tsx: si no cargan, el render falla antes de llegar aquí)
y la mascota cortada o flotando, validar_render.py (sin renderizar).

Salida: una línea por problema («✗» error, «!» aviso), p. ej. `! escena gancho · 12,5–15,5 s · sin movimiento`, y el resumen
`revisar: N errores, M avisos`. Sale con 1 si hay errores. Solo si hay problemas deja en out/revision/marcados/ el fotograma de
cada uno con lo culpable en magenta.
"""
import json, re, shutil, sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw

MARGEN = 120                         # = MARGEN_LADOS de plantilla/src/marco/datos.ts
Y_ARRIBA, Y_ABAJO, Y_BOTONES, X_BOTONES = 260, 1540, 1100, 900
SUBS_Y, SUBS_ICONOS_Y = (260, 402), 500
TEXTO_Y = (1360, 1540)
ESCENA_Y = (540, 1340)
UMBRAL_OSCURO, UMBRAL_CLARO = 40, 100   # diferencia con el fondo (0-255) para contar un píxel como contenido: sobre blanco, más
                                        # alta, para que las sombras suaves (drop-shadow al 35 %) no cuenten
MIN_PIXELES = 60                     # menos que esto en una franja = ruido (antialias, el borde de una sombra)
MUERTO_S = 2.5                       # tramo sin cambio que se avisa (más de esto)
REDUCCION = 4                        # la zona de escena se compara en bloques de 4×4 px (quita el grano de las texturas)
TOLERANCIA = 2                       # bloques (= 8 px): un píxel no "cambia" si su valor está a esa distancia en el otro fotograma
UMBRAL_GRIS = 40                     # diferencia de gris (0-255) que cuenta como cambio
UMBRAL_AREA = 600                    # px² cambiados entre dos fotogramas seguidos (0,5 s) para que cuente como movimiento.
                                     # Calibrado con briefs/20261120-1433: escena quieta 0–300 px²; un icono que entra ≥ 1000


def seg(f, fps):
    return f"{f / fps:.1f}".replace(".", ",")


def rango(a, b, fps):
    return f"{seg(a, fps)} s" if a == b else f"{seg(a, fps)}–{seg(b, fps)} s"


def cargar(png):
    im = Image.open(png).convert("RGB")
    return im if im.size == (1080, 1920) else im.resize((1080, 1920))


def mascara_contenido(im):
    """Píxeles que no son fondo. El fondo de revisión es liso: se mide en las esquinas de arriba (ahí no se dibuja nada)."""
    a = np.asarray(im).astype(np.int16)
    esquinas = np.concatenate([a[:40, :40].reshape(-1, 3), a[:40, -40:].reshape(-1, 3)])
    fondo = np.median(esquinas, axis=0)
    umbral = UMBRAL_CLARO if fondo.mean() > 128 else UMBRAL_OSCURO
    return np.abs(a - fondo).max(axis=2) > umbral


def caja(m, x0, y0):
    ys, xs = np.nonzero(m)
    return [int(xs.min() + x0), int(ys.min() + y0), int(xs.max() + x0), int(ys.max() + y0)]


def frame_de(p):
    m = re.fullmatch(r"f(\d+)", p.stem)
    return int(m.group(1)) if m else None


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    proyecto = Path(sys.argv[1]).resolve()
    v = json.loads((proyecto / "src/video.json").read_text(encoding="utf-8"))
    fps = v["video"]["fps"]
    escenas = v["escenas"]
    tarjeta = v["tarjeta_resumen"]["ini_f"] if v.get("tarjeta_resumen") else None
    voz_fin = round(max([p[2] for p in v["subtitulos"]] or [v["video"]["voz_s"]]) * fps)
    fin_contenido = min(tarjeta if tarjeta is not None else 10 ** 9, voz_fin)
    out = proyecto / "out/revision"
    rev = sorted((p for p in (out / "revision").glob("f*.png") if frame_de(p) is not None), key=frame_de)
    nor = sorted((p for p in (out / "normal").glob("f*.png") if frame_de(p) is not None), key=frame_de)
    if not rev or not nor:
        raise SystemExit(f"No hay fotogramas en {out}: ejecuta `npm run revisar` en {proyecto}")

    def escena_en(f):
        return next((e for e in escenas if e["ini_f"] <= f < e["fin_f"]), escenas[-1])

    # Escenas donde cuelga una insignia de icono bajo los subtítulos: desde que se dice la palabra hasta que el grupo se va
    con_iconos = set()
    for p in v["subtitulos"]:
        if len(p) > 6 and p[6]:
            a, b = round((p[1] - 0.1) * fps), round((p[2] + 0.8) * fps)
            con_iconos |= {e["id"] for e in escenas if e["ini_f"] < b and e["fin_f"] > a}

    problemas = {}       # (gravedad, escena, tipo) → {frames, caja, peor: (pixeles, png, zona)}

    def anotar(grav, eid, tipo, f, zona, m, x0, y0, png):
        k = (grav, eid, tipo)
        c = caja(m, x0, y0)
        p = problemas.setdefault(k, {"frames": [], "caja": c, "peor": (0, None, None)})
        p["frames"].append(f)
        p["caja"] = [min(p["caja"][0], c[0]), min(p["caja"][1], c[1]), max(p["caja"][2], c[2]), max(p["caja"][3], c[3])]
        n = int(m.sum())
        if n > p["peor"][0]:
            p["peor"] = (n, png, zona)

    # ── 1 y 2: zona segura y solapes (fotogramas en modo revisión) ──
    for png in rev:
        f = frame_de(png)
        luz = mascara_contenido(cargar(png))
        es_tarjeta = tarjeta is not None and f >= tarjeta
        e = escena_en(f)
        eid = "tarjeta" if es_tarjeta else e["id"]
        zonas = [("error", "se sale por la izquierda", (0, Y_ARRIBA, MARGEN, Y_ABAJO)),
                 ("error", "se sale por la derecha", (1080 - MARGEN, Y_ARRIBA, 1080, Y_BOTONES))]
        if not es_tarjeta:
            zonas.append(("error", "entra en la columna de botones", (X_BOTONES, Y_BOTONES, 1080, Y_ABAJO)))
            alto_subs = SUBS_ICONOS_Y if e["id"] in con_iconos else SUBS_Y[1]
            zonas.append(("error", "pisa los subtítulos", (MARGEN, SUBS_Y[0], 1080 - MARGEN, alto_subs)))
            pant = e.get("pantalla") or {}
            if pant.get("texto") and pant.get("estilo", "ninguno") != "ninguno":
                zonas.append(("error", "pisa el texto en pantalla", (MARGEN, TEXTO_Y[0], X_BOTONES, TEXTO_Y[1])))
        for grav, tipo, (x0, y0, x1, y1) in zonas:
            m = luz[y0:y1, x0:x1]
            if int(m.sum()) >= MIN_PIXELES:
                anotar(grav, eid, tipo, f, (x0, y0, x1, y1), m, x0, y0, png)

    # ── 3: momentos muertos (fotogramas en modo normal, solo zona de escena, sin cola ni tarjeta) ──
    def reducida(png):
        im = cargar(png).convert("L").crop((0, ESCENA_Y[0], 1080, ESCENA_Y[1]))
        return np.asarray(im.resize((1080 // REDUCCION, (ESCENA_Y[1] - ESCENA_Y[0]) // REDUCCION), Image.BOX), dtype=np.int16)

    def lejos(a, b):
        """|b − a| tolerando desplazamientos de hasta TOLERANCIA bloques: el mínimo sobre los desplazamientos de a."""
        h, w, r = a.shape[0], a.shape[1], TOLERANCIA
        pad = np.pad(a, r, mode="edge")
        mejor = np.full(b.shape, 255, np.int16)
        for dy in range(-r, r + 1):
            for dx in range(-r, r + 1):
                mejor = np.minimum(mejor, np.abs(b - pad[r + dy:r + dy + h, r + dx:r + dx + w]))
        return mejor

    def area_cambiada(a, b):
        """px² que cambian de verdad entre dos fotogramas (lo que aparece y lo que desaparece)."""
        return int((np.maximum(lejos(a, b), lejos(b, a)) > UMBRAL_GRIS).sum()) * REDUCCION * REDUCCION

    muertos = []
    previo, inicio = None, None
    validos = [p for p in nor if frame_de(p) < fin_contenido]
    for png in validos:
        f, r = frame_de(png), reducida(png)
        if previo is not None:
            quieto = area_cambiada(previo[1], r) < UMBRAL_AREA
            if quieto and inicio is None:
                inicio = previo[0]
            if not quieto and inicio is not None:
                muertos.append((inicio, previo[0]))
                inicio = None
        previo = (f, r)
    if inicio is not None and previo is not None:
        muertos.append((inicio, previo[0]))
    lineas = []
    for a, b in muertos:
        if (b - a) / fps > MUERTO_S:
            ids = []
            for e in escenas:
                if e["ini_f"] <= b and e["fin_f"] > a and e["id"] not in ids:
                    ids.append(e["id"])
            lineas.append((a, "aviso", f"escena {' + '.join(ids)} · {rango(a, b, fps)} · sin movimiento"))

    # ── Informe ──
    marcados = out / "marcados"
    shutil.rmtree(marcados, ignore_errors=True)
    for (grav, eid, tipo), p in problemas.items():
        x0, y0, x1, y1 = p["caja"]
        nombre = "tarjeta final" if eid == "tarjeta" else f"escena {eid}"
        lineas.append((min(p["frames"]), grav, f"{nombre} · {rango(min(p['frames']), max(p['frames']), fps)} · {tipo} (x {x0}–{x1}, y {y0}–{y1})"))
        n, png, (zx0, zy0, zx1, zy1) = p["peor"]
        marcados.mkdir(parents=True, exist_ok=True)
        im = cargar(png)
        luz = mascara_contenido(im)
        arr = np.asarray(im).copy()
        sub = arr[zy0:zy1, zx0:zx1]
        sub[luz[zy0:zy1, zx0:zx1]] = (255, 0, 255)
        out_im = Image.fromarray(arr)
        d = ImageDraw.Draw(out_im, "RGBA")
        d.rectangle([zx0, zy0, zx1, zy1], fill=(255, 140, 0, 50))
        d.rectangle(p["caja"], outline=(255, 0, 255), width=6)
        out_im.save(marcados / f"{eid}_{re.sub(r'[^a-z]+', '_', tipo)}_{png.stem}.jpg", quality=85)

    errores = sum(1 for _, g, _ in lineas if g == "error")
    avisos = len(lineas) - errores
    for _, g, texto in sorted(lineas, key=lambda x: (x[0], x[1] != "error")):
        print(f"{'✗' if g == 'error' else '!'} {texto}")
    if problemas:
        print(f"  fotogramas marcados en {marcados.relative_to(proyecto)}/ (en magenta lo que molesta)")
    print(f"revisar: {errores} {'error' if errores == 1 else 'errores'}, {avisos} {'aviso' if avisos == 1 else 'avisos'}")
    sys.exit(1 if errores else 0)


if __name__ == "__main__":
    main()
