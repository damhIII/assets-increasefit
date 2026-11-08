#!/usr/bin/env python3
"""Alinea el guion (texto) con las palabras de Whisper y deja los subtítulos con la ortografía del guion.

Uso:
  python3 scripts/alinear.py briefs/<BASE>            # escribe briefs/<BASE>/subtitulos.json e imprime el guion numerado
  python3 scripts/alinear.py briefs/<BASE> --quiet

Entrada (la deja el notebook): guion.txt, palabras.json ({"duracion_s", "palabras": [[palabra, ini_s, fin_s], ...]}).
Salida, subtitulos.json:
  {"version": 3, "base", "audio", "duracion_s",
   "palabras": [{"i": 0, "w": "Llevas", "ini": 0.12, "fin": 0.41, "frase": 0}, ...],   # i = índice para anclar escenas
   "frases":   [{"i": 0, "desde": 0, "hasta": 11, "ini": 0.12, "fin": 3.9, "texto": "..."}]}   # hasta = exclusivo
La impresión numerada marca las pausas de la voz (‖) para leer el ritmo de la locución.
"""
import difflib, json, re, sys, unicodedata
from pathlib import Path

PAUSA_S = 0.3


def sin_tildes(s):
    return unicodedata.normalize("NFD", str(s)).encode("ascii", "ignore").decode().lower()


def tok(w):
    return re.sub(r"[^a-z0-9]", "", sin_tildes(w))


def alinear(guion_palabras, whisper):
    """[palabra_guion] + [[w, ini, fin]] → [(ini, fin)] por palabra del guion.
    difflib casa las iguales; los tramos 'replace' (cifras que Whisper escribe con dígitos, etc.) se reparten;
    las que no casan se interpolan entre vecinas; varias del guion sobre una de Whisper se reparten su intervalo."""
    A, B = [tok(w) for w in guion_palabras], [tok(p[0]) for p in whisper]
    n = len(A)
    mapa = [None] * n
    for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, A, B, autojunk=False).get_opcodes():
        if tag == "equal":
            for k in range(i2 - i1):
                mapa[i1 + k] = j1 + k
        elif tag == "replace" and j2 > j1:
            for k in range(i2 - i1):
                mapa[i1 + k] = j1 + min(j2 - j1 - 1, k * (j2 - j1) // (i2 - i1))
    tiempos = [(whisper[m][1], whisper[m][2]) if m is not None else None for m in mapa]
    conocidos = [k for k, t in enumerate(tiempos) if t]
    if not conocidos:
        dur = whisper[-1][2] if whisper else 1.0
        tiempos = [(dur * k / n, dur * (k + 1) / n) for k in range(n)]
    else:
        for k in range(n):
            if tiempos[k]:
                continue
            a = max((c for c in conocidos if c < k), default=None)
            z = min((c for c in conocidos if c > k), default=None)
            span_a, span_z = (a if a is not None else -1), (z if z is not None else n)
            t0 = tiempos[a][1] if a is not None else 0.0
            t1 = tiempos[z][0] if z is not None else t0 + 0.35 * (span_z - span_a)
            hueco = span_z - span_a - 1
            tiempos[k] = (t0 + (t1 - t0) * (k - span_a - 1) / hueco, t0 + (t1 - t0) * (k - span_a) / hueco)
    k = 0
    while k < n:
        z = k
        while z + 1 < n and mapa[k] is not None and mapa[z + 1] == mapa[k]:
            z += 1
        if z > k:
            t0, t1 = tiempos[k]
            for j in range(k, z + 1):
                tiempos[j] = (t0 + (t1 - t0) * (j - k) / (z - k + 1), t0 + (t1 - t0) * (j - k + 1) / (z - k + 1))
        k = z + 1
    out, ultimo = [], 0.0
    for t0, t1 in tiempos:
        t0 = max(t0, ultimo)
        t1 = max(t1, t0 + 0.05)
        ultimo = t0
        out.append((round(t0, 2), round(t1, 2)))
    return out


def construir(dir_base):
    d = Path(dir_base)
    texto = (d / "guion.txt").read_text(encoding="utf-8")
    pj = json.loads((d / "palabras.json").read_text(encoding="utf-8"))
    palabras = texto.split()
    if not palabras:
        raise SystemExit("guion.txt está vacío")
    tiempos = alinear(palabras, pj["palabras"])
    lista, frases, f, desde = [], [], 0, 0
    for i, (w, (a, b)) in enumerate(zip(palabras, tiempos)):
        lista.append({"i": i, "w": w, "ini": a, "fin": b, "frase": f})
        if re.search(r"[.?!…]['\"»”)]*$", w) or i == len(palabras) - 1:
            frases.append({"i": f, "desde": desde, "hasta": i + 1, "ini": lista[desde]["ini"], "fin": b, "texto": " ".join(palabras[desde:i + 1])})
            f, desde = f + 1, i + 1
    return {"version": 3, "base": d.name, "audio": pj.get("audio", "locucion.wav"),
            "duracion_s": round(float(pj.get("duracion_s") or tiempos[-1][1]), 2), "palabras": lista, "frases": frases}


def imprimir(s):
    print(f"{s['base']} · voz {s['duracion_s']:.2f} s · {len(s['palabras'])} palabras · {len(s['frases'])} frases")
    P = s["palabras"]
    for fr in s["frases"]:
        trozos = []
        for i in range(fr["desde"], fr["hasta"]):
            trozos.append(f"[{i}]{P[i]['w']}")
            if i + 1 < len(P) and P[i + 1]["ini"] - P[i]["fin"] >= PAUSA_S:
                trozos.append(f"‖{P[i + 1]['ini'] - P[i]['fin']:.2f}s")
        print(f"\n{fr['ini']:6.2f}–{fr['fin']:6.2f} s  " + " ".join(trozos))


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    s = construir(sys.argv[1])
    (Path(sys.argv[1]) / "subtitulos.json").write_text(json.dumps(s, ensure_ascii=False, indent=1), encoding="utf-8")
    if "--quiet" not in sys.argv:
        imprimir(s)


if __name__ == "__main__":
    main()
