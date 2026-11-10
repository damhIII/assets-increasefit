#!/usr/bin/env python3
"""Convierte la escaleta de Claude (escenas ancladas a palabras) en los datos de render con frames exactos.

Uso (normalmente lo llama preparar_video.py):
  python3 scripts/sincronizar.py briefs/<BASE>          # imprime el resumen de escenas con sus frames

Entrada: briefs/<BASE>/escaleta.json + subtitulos.json (scripts/alinear.py).
Salida: el dict que la plantilla lee como src/video.json (ver .claude/skills/increasefit-reel/referencias/escaleta.md).
Las anclas son índices de palabra (los [n] que imprime alinear.py). Escenas contiguas: cada una acaba donde empieza la siguiente.
Subtítulos: se limpian de signos de puntuación (solo palabras); el fin de frase o coma queda como bandera `corte` para agruparlos.
"""
import json, math, re, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
FPS, WIDTH, HEIGHT = 30, 1080, 1920


TONOS = ("alerta", "exito")


def palabra_subtitulo(w):
    """Palabra del guion → palabra para el subtítulo: sin signos de puntuación ni comillas (¿En → En, serio? → serio).
    Conserva tildes, ñ, guiones internos y la coma/punto decimal entre dígitos. Puede quedar vacía (p. ej. un "—" suelto)."""
    w = re.sub(r"(?<=\d)[.,](?=\d)", "\x00", str(w))
    w = re.sub(r"[^\w%\-\x00]", "", w).replace("_", "")
    w = re.sub(r"-{2,}", "-", w).strip("-").replace("\x00", ",")
    return w if re.search(r"\d", w) else w.replace("%", "")


def corta_aqui(w):
    """1 si la palabra cierra frase o lleva coma/pausa escrita: el subtítulo cambia de grupo después de ella."""
    return 1 if re.search(r"[.,;:?!…—]['\"»”)]*$", str(w)) else 0


def _leer(p):
    return json.loads(Path(p).read_text(encoding="utf-8"))


def catalogos():
    return {"paletas": _leer(RAIZ / "brand/paletas.json"), "mascota": _leer(RAIZ / "mascota/manifest.json"),
            "sonido": _leer(RAIZ / "sonido/manifest.json"), "fuentes": _leer(RAIZ / "brand/fuentes.json")["fuentes"]}


def cargar(dir_base):
    d = Path(dir_base)
    if not (d / "subtitulos.json").exists():
        import alinear
        (d / "subtitulos.json").write_text(json.dumps(alinear.construir(d), ensure_ascii=False, indent=1), encoding="utf-8")
    return _leer(d / "escaleta.json"), _leer(d / "subtitulos.json")


def sincronizar(dir_base):
    esc, sub = cargar(dir_base)
    cat = catalogos()
    base_clima = cat["paletas"]["reglas_rotacion"]["clima_base"]
    sfx_cat = {s["id"]: s for s in cat["sonido"]["sfx"]}
    P = sub["palabras"]
    n = len(P)
    voz_s = float(sub["duracion_s"])
    cola_s = float(esc.get("cola_s", 3.0))
    total = math.ceil((voz_s + cola_s) * FPS)

    def frame(i, desfase=0):
        i = max(0, min(n - 1, int(i)))
        return max(0, min(total - 1, round(P[i]["ini"] * FPS) + int(desfase)))

    enfasis = set()
    escenas, sfx, cortinillas = [], [], []
    for k, e in enumerate(esc["escenas"]):
        ini = 0 if k == 0 else frame(e["desde"], e.get("desfase_f", 0))
        m = e.get("mascota")
        if m:
            sprite = m["sprite"]
            m = {"sprite": sprite, "anim": "ejercicio" if sprite.startswith("ejercicio:") else m.get("anim", "pop"),
                 "encuadre": m.get("encuadre", "general"), "posicion": m.get("posicion", "centro"), "espejo": bool(m.get("espejo", False))}
        anot = []
        for j, o in enumerate(e.get("anotaciones") or []):
            o = dict(o)
            o["en_f"] = frame(o.pop("en")) if o.get("en") is not None else None
            if o.get("filas"):                                  # ficha: cada fila con su propio momento
                o["filas"] = [{"icono": r.get("icono", ""), "texto": str(r.get("texto", "")),
                               "en_f": frame(r["en"]) if r.get("en") is not None else None} for r in o["filas"]]
            anot.append(o)
        ins = e.get("inserto")
        if ins:
            ins = {"cara": ins["cara"], "en_f": frame(ins["en"]) if ins.get("en") is not None else None}
        for i in e.get("enfasis") or []:
            enfasis.add(int(i))
        for s in e.get("sfx") or []:
            f = frame(s["en"]) - (5 if s["id"].startswith("whoosh") else 1) if s.get("en") is not None else None
            sfx.append({"id": s["id"], "frame": f, "volumen": float(s.get("volumen", sfx_cat[s["id"]]["volumen_sugerido"])), "_escena": k})
        trans = e.get("transicion", "corte")
        if trans == "pincel" and k > 0:
            cortinillas.append(ini)
        escenas.append({"id": e["id"], "ini_f": ini, "fin_f": None, "clima": e.get("clima") or base_clima, "transicion": trans,
                        "pantalla": {"texto": (e.get("pantalla") or {}).get("texto", ""), "estilo": (e.get("pantalla") or {}).get("estilo", "ninguno")},
                        "enfasis_f": sorted(frame(i) for i in (e.get("enfasis") or [])),
                        "mascota": m, "dividida": e.get("dividida"), "inserto": ins, "anotaciones": anot,
                        "componente": e.get("componente"), "solo_componente": bool(e.get("solo_componente", False))})
    for k, e in enumerate(escenas):
        e["fin_f"] = escenas[k + 1]["ini_f"] if k + 1 < len(escenas) else total
        for j, o in enumerate(e["anotaciones"]):
            if o["en_f"] is None:
                o["en_f"] = min(e["fin_f"] - 1, e["ini_f"] + 6 + j * 8)
            for r_i, r in enumerate(o.get("filas") or []):
                if r["en_f"] is None:
                    r["en_f"] = min(e["fin_f"] - 1, o["en_f"] + r_i * 12)
        if e["inserto"] and e["inserto"]["en_f"] is None:
            e["inserto"]["en_f"] = e["ini_f"] + 4
    for s in sfx:
        if s["frame"] is None:
            s["frame"] = escenas[s["_escena"]]["ini_f"] + 4
        s["frame"] = max(0, min(total - 1, s["frame"]))
        del s["_escena"]
    tr = esc.get("tarjeta_resumen")
    if tr:
        ini = frame(tr["desde"]) if tr.get("desde") is not None else min(total - 45, round(P[-1]["fin"] * FPS) + 4)
        tr = {"titulo": tr["titulo"], "lineas": tr["lineas"], "ini_f": ini}
    st = esc.get("subtitulos") or {}
    tono = {}
    for t in TONOS:
        for i in (st.get("tonos") or {}).get(t) or []:
            tono[int(i)] = t
    icono = {int(x["en"]): x["icono"] for x in st.get("iconos") or [] if x.get("en") is not None and x.get("icono")}
    logos = {k: (RAIZ / v).exists() for k, v in (("increasefit", "logo_increasefit.png"), ("oscuro", "logo_increasefit_oscuro.png"), ("isotipo", "isotipo.png"))}
    return {
        "version": 4, "base": sub["base"], "audio": "locucion.wav",
        "video": {"width": WIDTH, "height": HEIGHT, "fps": FPS, "frames": total, "voz_s": round(voz_s, 2), "cola_s": cola_s},
        "serie_header": str(esc.get("serie_header", "")).upper(), "musica": esc.get("musica"),
        "opciones": {"barra_progreso": bool((esc.get("opciones") or {}).get("barra_progreso", False))},
        "logos": logos, "fuentes": cat["fuentes"],
        "escenas": escenas, "cortinillas": cortinillas, "tarjeta_resumen": tr, "sfx": sorted(sfx, key=lambda s: s["frame"]),
        # [palabra sin puntuación, ini_s, fin_s, énfasis 0/1, corte 0/1, tono "" | alerta | exito, icono "" | id de icons/]
        "subtitulos": [[palabra_subtitulo(p["w"]), p["ini"], p["fin"], 1 if p["i"] in enfasis else 0, corta_aqui(p["w"]),
                        tono.get(p["i"], ""), icono.get(p["i"], "")] for p in P],
        "progresion": esc.get("progresion") or [],
    }


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    v = sincronizar(sys.argv[1])
    print(f"{v['base']} · {v['video']['frames']} frames ({v['video']['frames'] / FPS:.1f} s) · {len(v['escenas'])} escenas · música {v['musica']}")
    for e in v["escenas"]:
        quien = (e["mascota"] or {}).get("sprite") or ("dividida" if e["dividida"] else "—")
        print(f"  {e['id']:>6}  {e['ini_f']:5d}–{e['fin_f']:5d}  {(e['fin_f'] - e['ini_f']) / FPS:4.1f}s  {e['clima']:<9} {quien}")
    if v["tarjeta_resumen"]:
        print(f"  tarjeta resumen desde {v['tarjeta_resumen']['ini_f']}")


if __name__ == "__main__":
    main()
