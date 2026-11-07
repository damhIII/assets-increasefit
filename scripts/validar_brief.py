#!/usr/bin/env python3
"""Comprueba un brief.json (v2, por planos) de IncreaseFit y, con --stills, imprime los fotogramas a revisar.

Uso:
  python3 scripts/validar_brief.py briefs/<BASE>/brief.json
  python3 scripts/validar_brief.py briefs/<BASE>/brief.json --stills
"""
import json, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
OVERLAYS = {"etiqueta", "tachado", "circulo", "check", "cruz", "burbuja_pensamiento", "burbuja_dialogo", "dato", "lista",
            "rec", "lineas_velocidad", "impacto", "sudor", "destello", "enfoque", "libreta", "grafica"}
ESTILOS = {"titular", "capitulo", "nota", "ninguno"}


def validar(b, base_dir=None):
    err, avisos = [], []
    paletas = json.loads((RAIZ / "brand" / "paletas.json").read_text(encoding="utf-8"))
    masc = json.loads((RAIZ / "mascota" / "manifest.json").read_text(encoding="utf-8"))
    son = json.loads((RAIZ / "sonido" / "manifest.json").read_text(encoding="utf-8"))
    sprites = {s["id"] for s in masc["sprites"]}
    ejercicios = set(masc["ejercicios"])
    sfx_ids = {s["id"] for s in son["sfx"]}
    musica = {m["id"] for m in son["musica"]}

    def sprite_ok(s):
        return s in sprites or (isinstance(s, str) and s.startswith("ejercicio:") and s[10:] in ejercicios)

    if b.get("version") != 2:
        err.append(f"versión de brief {b.get('version')}: esta plantilla espera la 2 (planos)")
    v = b.get("video", {})
    frames = v.get("frames")
    if (v.get("width"), v.get("height"), v.get("fps")) != (1080, 1920, 30):
        avisos.append(f"formato inesperado: {v.get('width')}x{v.get('height')} @ {v.get('fps')} fps")
    ps = b.get("planos", [])
    if not ps:
        err.append("no hay planos")
    for i, p in enumerate(ps):
        pid = p.get("id", f"#{i}")
        if p["fin_f"] <= p["ini_f"]:
            err.append(f"{pid}: rango vacío {p['ini_f']}–{p['fin_f']}")
        if i == 0 and p["ini_f"] != 0:
            err.append("el primer plano no empieza en 0")
        if i and p["ini_f"] != ps[i - 1]["fin_f"]:
            err.append(f"{pid}: no es contiguo con el anterior")
        if p.get("clima") not in paletas["climas"]:
            err.append(f"{pid}: clima desconocido {p.get('clima')}")
        if (p.get("pantalla") or {}).get("estilo") not in ESTILOS:
            err.append(f"{pid}: estilo de pantalla desconocido {(p.get('pantalla') or {}).get('estilo')}")
        vis = p.get("visual") or {}
        if not sprite_ok(vis.get("sprite")):
            err.append(f"{pid}: sprite desconocido {vis.get('sprite')}")
        for k in ("sprite_b", "inserto"):
            if vis.get(k) and not sprite_ok(vis[k]):
                err.append(f"{pid}: {k} desconocido {vis[k]}")
        for o in p.get("overlays", []):
            if o.get("tipo") not in OVERLAYS:
                err.append(f"{pid}: overlay desconocido {o.get('tipo')}")
            if o.get("tipo") == "burbuja_pensamiento" and o.get("sprite") and o["sprite"] not in sprites:
                err.append(f"{pid}: sprite de la burbuja desconocido {o['sprite']}")
    if ps and ps[-1]["fin_f"] != frames:
        err.append(f"el último plano acaba en {ps[-1]['fin_f']} y el video dura {frames} frames")
    for s in b.get("sfx", []):
        if s.get("id") not in sfx_ids:
            err.append(f"sfx desconocido {s.get('id')}")
        if not (0 <= s.get("frame", -1) < (frames or 0)):
            avisos.append(f"sfx {s.get('id')} fuera del video (frame {s.get('frame')})")
    if b.get("musica") and b["musica"] not in musica:
        err.append(f"música desconocida {b['musica']}")
    if b.get("fuente_en_pantalla") and not b.get("datos_citados"):
        err.append("hay fuente_en_pantalla pero no datos_citados")
    if not b.get("subtitulos"):
        err.append("el brief no trae 'subtitulos'")
    for f in b.get("fuentes", []):
        if f.get("css") and not (RAIZ / f["css"]).exists():
            err.append(f"falta la fuente {f['familia']}: {f['css']}")
    if base_dir is not None and b.get("audio") and not (base_dir / b["audio"]).exists():
        avisos.append(f"audio {b['audio']} no está junto al brief: búscalo entre los adjuntos del chat (preparar_video.py --audio)")
    return err, avisos


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    ruta = Path(sys.argv[1])
    b = json.loads(ruta.read_text(encoding="utf-8"))
    err, avisos = validar(b, ruta.parent)
    ps = b.get("planos", [])
    print(f"Brief {b.get('base')} · {b.get('video', {}).get('frames')} frames · formato {b.get('formato')} · {len(ps)} planos · música {b.get('musica')}")
    for a in avisos:
        print(f"  aviso: {a}")
    if err:
        print("ERRORES:\n - " + "\n - ".join(err))
        sys.exit(1)
    print("OK")
    if "--stills" in sys.argv:
        for p in ps:
            print(f"npx remotion still Video out/stills/{p['id']}.png --frame={min(p['fin_f'] - 1, p['ini_f'] + 18)}")
        tr = b.get("tarjeta_resumen")
        if tr:
            print(f"npx remotion still Video out/stills/resumen.png --frame={b['video']['frames'] - 5}")


if __name__ == "__main__":
    main()
