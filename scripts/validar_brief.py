#!/usr/bin/env python3
"""Comprueba un brief.json de IncreaseFit antes de construir el video y, con --stills, imprime los comandos de revisión.

Uso:
  python3 scripts/validar_brief.py briefs/<BASE>/brief.json
  python3 scripts/validar_brief.py briefs/<BASE>/brief.json --stills   # un fotograma por bloque + cambios de clima + momentos de Rep
"""
import json, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORDEN = ["gancho", "error", "por_que", "metodo", "resultado", "cta"]


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    ruta = Path(sys.argv[1])
    b = json.loads(ruta.read_text(encoding="utf-8"))
    err, avisos = [], []
    paletas = json.loads((RAIZ / "brand" / "paletas.json").read_text(encoding="utf-8"))
    rig = json.loads((RAIZ / "plantilla" / "src" / "rep" / "movimientos.json").read_text(encoding="utf-8"))
    base_clima = paletas["reglas_rotacion"]["clima_base"]

    if b.get("marca") != "increasefit":
        avisos.append(f"marca inesperada: {b.get('marca')}")
    v = b.get("video", {})
    frames = v.get("frames")
    if (v.get("width"), v.get("height"), v.get("fps")) != (1080, 1920, 30):
        avisos.append(f"formato inesperado: {v.get('width')}x{v.get('height')} @ {v.get('fps')} fps")
    bloques = b.get("bloques", [])
    ids = [x["id"] for x in bloques]
    if ids != ORDEN:
        err.append(f"bloques fuera de orden o incompletos: {ids}")
    for i, x in enumerate(bloques):
        if x["fin_f"] <= x["ini_f"]:
            err.append(f"{x['id']}: rango vacío {x['ini_f']}–{x['fin_f']}")
        if i == 0 and x["ini_f"] != 0:
            err.append("el primer bloque no empieza en 0")
        if i and x["ini_f"] != bloques[i - 1]["fin_f"]:
            err.append(f"{x['id']}: no es contiguo con {bloques[i - 1]['id']}")
        if len(x.get("titular", [])) != 2:
            err.append(f"{x['id']}: el titular debe tener 2 líneas")
        rep = (x.get("visual") or {}).get("rep")
        if rep not in rig["movimientos"]:
            err.append(f"{x['id']}: visual.rep desconocido para el rig: {rep}")
    if bloques and bloques[-1]["fin_f"] != frames:
        err.append(f"el último bloque acaba en {bloques[-1]['fin_f']} y el video dura {frames} frames")
    if bloques and b.get("cta") and b["cta"].lower() not in " ".join(bloques[-1]["titular"]).lower():
        avisos.append("la palabra CTA no está en el titular del bloque cta")
    for e in (b.get("ficha_tecnica") or {}).get("ejercicios", []):
        if e.get("movimiento") not in rig["movimientos"]:
            err.append(f"ficha_tecnica: movimiento desconocido {e.get('movimiento')}")
    for m in (b.get("ficha_tecnica") or {}).get("musculos", []):
        if m not in rig["musculos"]:
            avisos.append(f"ficha_tecnica: músculo sin mapa en el rig: {m}")
    if b.get("fuente_en_pantalla") and not b.get("datos_citados"):
        err.append("hay fuente_en_pantalla pero no datos_citados")

    climas = b.get("climas") or {}
    for bid, cid in climas.items():
        if cid not in paletas["climas"]:
            err.append(f"clima desconocido en {bid}: {cid}")
    for bid in paletas["reglas_rotacion"]["fijos_base"]:
        if climas.get(bid, base_clima) != base_clima:
            err.append(f"el bloque {bid} debe ir en clima {base_clima}")
    if not b.get("subtitulos"):
        avisos.append("el brief no trae 'subtitulos': genera los subtítulos desde bloques[].texto + palabras")

    base = ruta.parent
    audio = b.get("audio")
    if audio and not (base / audio).exists():
        avisos.append(f"audio {audio} no está junto al brief: búscalo entre los adjuntos del chat (preparar_video.py --audio)")
    for f in b.get("fuentes", []):
        if f.get("css") and not (RAIZ / f["css"]).exists():
            err.append(f"falta la fuente {f['familia']}: {f['css']}")
    for clave, archivo in (("increasefit", "logo_increasefit.png"), ("oscuro", "logo_increasefit_oscuro.png"), ("isotipo", "isotipo.png")):
        if (b.get("logos") or {}).get(clave) and not (RAIZ / archivo).exists():
            err.append(f"el brief espera {archivo} y no está en el repo")

    print(f"Brief {b.get('base')} · {frames} frames · plantilla {b.get('plantilla')} · "
          f"climas {', '.join(f'{k}={c}' for k, c in climas.items() if c != base_clima) or 'todo ' + base_clima} · "
          f"Rep {' → '.join(dict.fromkeys((x.get('visual') or {}).get('rep', '?') for x in bloques))}")
    for a in avisos:
        print(f"  aviso: {a}")
    if err:
        print("ERRORES:\n - " + "\n - ".join(err))
        sys.exit(1)
    print("OK")

    if "--stills" in sys.argv:
        marcas = []
        for x in bloques:
            marcas.append((x["id"], (x["ini_f"] + x["fin_f"]) // 2))
            marcas.append((f"{x['id']}_final", x["fin_f"] - 8))
        prev = None
        for x in bloques:
            c = climas.get(x["id"], base_clima)
            if prev is not None and c != prev:
                marcas.append((f"transicion_{x['id']}", x["ini_f"]))
            prev = c
        for nombre, f in marcas:
            print(f"npx remotion still Video out/stills/{nombre}.png --frame={f}")


if __name__ == "__main__":
    main()
