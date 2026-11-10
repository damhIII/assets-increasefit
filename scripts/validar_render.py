#!/usr/bin/env python3
"""Comprueba la escaleta de un Reel contra los guardarraíles de marca y los catálogos del repo.

Uso:
  python3 scripts/validar_render.py briefs/<BASE>
  python3 scripts/validar_render.py briefs/<BASE> --stills     # además lista los fotogramas a revisar

No juzga lo creativo: solo que lo que se pide exista, que los tiempos cuadren y que se respeten las reglas fijas
(marco, sin CTA, cifras de estudios con su fuente verificada) y el PRESUPUESTO DE TEXTO: el video se cuenta con imágenes
y subtítulos; el texto en pantalla es la excepción (límites en LIMITES y PRESUPUESTO_TEXTO).
"""
import json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sincronizar as S
from alinear import sin_tildes

ESTILOS = {"titular", "nota", "capitulo", "ninguno"}
ANIMS = {"pop", "entrar", "temblor", "ejercicio", "estatico"}
ENCUADRES = {"general", "medio", "primer_plano"}
POSICIONES = {"centro", "izq", "der"}
APUNTA = {"cabeza", "manos", "pies", "centro"}
ANOTACIONES = {"etiqueta", "tachado", "circulo", "check", "cruz", "burbuja_pensamiento", "burbuja_dialogo", "dato", "lista",
               "rec", "lineas_velocidad", "impacto", "sudor", "destello", "enfoque", "libreta", "grafica", "icono", "ficha"}
TRANSICIONES = {"corte", "pincel"}
TONOS = {"foco", "alerta", "exito"}
# Texto en pantalla (sin contar subtítulos, fuentes, ASÍ NO/ASÍ SÍ ni la tarjeta resumen): palabras máximas por pieza…
LIMITES = {"pantalla": 4, "capitulo": 5, "etiqueta": 2, "tachado": 3, "burbuja_dialogo": 4, "dato": 2, "detalle": 5,
           "lista": 3, "ficha": 2, "libreta": 2}
PRESUPUESTO_TEXTO = 20          # …y palabras en pantalla en TODO el video
TEXTO_POR_ESCENA = 2            # piezas con texto por escena (lo normal es 0 o 1)
TARJETA_TITULO, TARJETA_LINEA, TARJETA_LINEAS = 5, 6, (2, 3)
CTA = ("comenta", "dale like", "like", "sigueme", "suscribete", "guardalo y", "comparte", "link en", "en la bio")


def validar(dir_base):
    d = Path(dir_base)
    err, avisos = [], []
    for f in ("guion.txt", "palabras.json", "escaleta.json"):
        if not (d / f).exists():
            err.append(f"falta {f} en {d}")
    if err:
        return err, avisos
    if not (d / "locucion.wav").exists():
        avisos.append("no está locucion.wav junto al guion: pásalo con --audio a preparar_video.py")
    esc, sub = S.cargar(d)
    cat = S.catalogos()
    sprites = {s["id"]: s for s in cat["mascota"]["sprites"]}
    ejercicios = cat["mascota"]["ejercicios"]
    sfx_ids = {s["id"] for s in cat["sonido"]["sfx"]}
    musica = {m["id"] for m in cat["sonido"]["musica"]}
    climas = cat["paletas"]["climas"]
    dv = json.loads((S.RAIZ / "editorial/datos_verificados.json").read_text(encoding="utf-8"))["datos"]
    fuentes_ok = {x["corta"] for x in dv.values()} | {x["fuente"] for x in dv.values()}
    n = len(sub["palabras"])
    iconos = {f.stem for f in (S.RAIZ / "icons").glob("*.svg")}
    texto_total = []                          # (dónde, palabras) del texto en pantalla, para el presupuesto

    def palabras(t):
        return [w for w in re.split(r"[\s/]+", str(t).replace(":", " ")) if re.search(r"\w", w)]

    def limite(donde, clave, t):
        k = len(palabras(t))
        texto_total.append((donde, k))
        if k > LIMITES[clave]:
            err.append(f"{donde}: «{t}» tiene {k} palabras (máximo {LIMITES[clave]}): cuéntalo con la mascota, un icono o el subtítulo")

    def icono_ok(nombre, donde):
        if nombre not in iconos:
            err.append(f"{donde}: icono «{nombre}» no está en icons/ (añádelo con: python3 scripts/iconos.py {nombre})")

    def sprite_ok(s):
        return isinstance(s, str) and (s in sprites or (s.startswith("ejercicio:") and s[10:] in ejercicios))

    def idx_ok(i, donde):
        if not isinstance(i, int) or not 0 <= i < n:
            err.append(f"{donde}: índice de palabra {i!r} fuera de 0–{n - 1}")
            return False
        return True

    if esc.get("version") not in (3, 4):
        err.append(f"escaleta versión {esc.get('version')}: se espera 4")
    if esc.get("musica") and esc["musica"] not in musica:
        err.append(f"música desconocida {esc['musica']} (opciones: {', '.join(sorted(musica))})")
    if not str(esc.get("serie_header", "")).strip():
        avisos.append("sin serie_header: el header solo mostrará el isotipo")
    cola = esc.get("cola_s", 3.0)
    if not isinstance(cola, (int, float)) or not 0 <= cola <= 8:
        err.append(f"cola_s {cola!r}: entre 0 y 8 s")

    textos = []                               # (dónde, texto) para revisar CTA y cifras
    escenas = esc.get("escenas") or []
    if not escenas:
        err.append("la escaleta no tiene escenas")
    ids, anterior = set(), -1
    for k, e in enumerate(escenas):
        eid = e.get("id", f"#{k}")
        if eid in ids or not re.fullmatch(r"[a-z][a-z0-9_]*", str(eid)):
            err.append(f"{eid}: id repetido o inválido (minúsculas, números y _)")
        ids.add(eid)
        desde = e.get("desde")
        if k == 0 and desde != 0:
            err.append(f"{eid}: la primera escena empieza en la palabra 0")
        if idx_ok(desde, f"{eid}.desde"):
            if desde <= anterior:
                err.append(f"{eid}: 'desde' ({desde}) debe ser mayor que el de la escena anterior ({anterior})")
            anterior = desde
        if e.get("clima") and e["clima"] not in climas:
            err.append(f"{eid}: clima desconocido {e['clima']} (opciones: {', '.join(climas)})")
        if e.get("transicion", "corte") not in TRANSICIONES:
            err.append(f"{eid}: transición {e.get('transicion')} (corte | pincel)")
        pant = e.get("pantalla") or {}
        if pant.get("estilo", "ninguno") not in ESTILOS:
            err.append(f"{eid}: estilo de pantalla {pant.get('estilo')} ({' | '.join(sorted(ESTILOS))})")
        piezas_texto = 0
        if pant.get("texto") and pant.get("estilo", "ninguno") != "ninguno":
            textos.append((f"{eid}.pantalla", pant["texto"]))
            limite(f"{eid}.pantalla", "capitulo" if pant.get("estilo") == "capitulo" else "pantalla", pant["texto"])
            piezas_texto += 1
        for i in e.get("enfasis") or []:
            idx_ok(i, f"{eid}.enfasis")
        m = e.get("mascota")
        if m:
            if not sprite_ok(m.get("sprite")):
                err.append(f"{eid}: sprite desconocido {m.get('sprite')}")
            for campo, val in (("anim", ANIMS), ("encuadre", ENCUADRES), ("posicion", POSICIONES)):
                if campo in m and m[campo] not in val:
                    err.append(f"{eid}: mascota.{campo} {m[campo]} ({' | '.join(sorted(val))})")
        div = e.get("dividida")
        if div and any(o.get("tipo") != "icono" for o in e.get("anotaciones") or []):
            avisos.append(f"{eid}: con 'dividida' solo se dibujan las anotaciones de tipo icono (el resto se ignora)")
        if div:
            for lado in ("no", "si"):
                if not sprite_ok(div.get(lado)):
                    err.append(f"{eid}: dividida.{lado} desconocido {div.get(lado)}")
        ins = e.get("inserto")
        if ins:
            if ins.get("cara") not in sprites or sprites[ins["cara"]]["categoria"] != "cara":
                err.append(f"{eid}: inserto.cara {ins.get('cara')} no es una cara_*")
            if ins.get("en") is not None:
                idx_ok(ins["en"], f"{eid}.inserto.en")
        for j, o in enumerate(e.get("anotaciones") or []):
            t = o.get("tipo")
            donde = f"{eid}.anotaciones[{j}]"
            if t not in ANOTACIONES:
                err.append(f"{donde}: tipo {t} desconocido")
                continue
            if o.get("en") is not None:
                idx_ok(o["en"], f"{donde}.en")
            if o.get("apunta") and o["apunta"] not in APUNTA:
                err.append(f"{donde}: apunta {o['apunta']} ({' | '.join(sorted(APUNTA))})")
            if t == "burbuja_pensamiento" and o.get("sprite") not in sprites:
                err.append(f"{donde}: burbuja_pensamiento necesita un sprite del catálogo")
            if t in ("etiqueta", "tachado", "burbuja_dialogo") and not o.get("texto"):
                err.append(f"{donde}: {t} necesita texto")
            if t == "lista" and not 2 <= len(o.get("items") or []) <= 4:
                err.append(f"{donde}: lista de 2 a 4 items")
            if t in ("etiqueta", "tachado", "burbuja_dialogo", "libreta") and o.get("texto"):
                limite(donde, t, o["texto"])
            if t == "dato" and o.get("texto"):
                limite(donde, "dato", o["texto"])
            if o.get("detalle"):
                limite(f"{donde}.detalle", "detalle", o["detalle"])
            for it in o.get("items") or []:
                limite(donde, "lista", it)
            if t in ("etiqueta", "tachado", "burbuja_dialogo", "libreta", "dato", "lista", "ficha"):
                piezas_texto += 1
            if t == "icono":
                icono_ok(o.get("icono"), donde)
                if o.get("tono") and o["tono"] not in TONOS:
                    err.append(f"{donde}: tono {o['tono']} ({' | '.join(sorted(TONOS))})")
            if t == "ficha":
                filas = o.get("filas") or []
                if not 2 <= len(filas) <= 4:
                    err.append(f"{donde}: ficha de 2 a 4 filas")
                for r_i, r in enumerate(filas):
                    icono_ok(r.get("icono"), f"{donde}.filas[{r_i}]")
                    if not r.get("texto"):
                        err.append(f"{donde}.filas[{r_i}]: falta texto (la cifra corta)")
                    else:
                        limite(f"{donde}.filas[{r_i}]", "ficha", r["texto"])
                        textos.append((donde, str(r["texto"])))
                    if r.get("en") is not None:
                        idx_ok(r["en"], f"{donde}.filas[{r_i}].en")
                if o.get("fuente") and o["fuente"] not in fuentes_ok:
                    err.append(f"{donde}: la fuente «{o['fuente']}» no está en editorial/datos_verificados.json: verifícala y añádela antes de mostrarla")
                if not o.get("fuente") and not o.get("ilustrativo"):
                    err.append(f"{donde}: una ficha lleva su 'fuente' verificada, o 'ilustrativo': true si es un ejemplo")
            if t == "dato":
                if not o.get("texto"):
                    err.append(f"{donde}: dato necesita la cifra en 'texto'")
                if o.get("fuente") and o["fuente"] not in fuentes_ok:
                    err.append(f"{donde}: la fuente «{o['fuente']}» no está en editorial/datos_verificados.json: verifícala y añádela antes de mostrarla")
                if not o.get("fuente") and not o.get("ilustrativo"):
                    err.append(f"{donde}: un dato en pantalla lleva su 'fuente' verificada, o 'ilustrativo': true si es un ejemplo")
            if t in ("libreta", "grafica") and len(esc.get("progresion") or []) < 2:
                err.append(f"{donde}: {t} necesita 'progresion' en la escaleta (2-6 semanas con kg y reps)")
            for campo in ("texto", "detalle"):
                if o.get(campo):
                    textos.append((donde, str(o[campo])))
            for it in o.get("items") or []:
                textos.append((donde, str(it)))
        if piezas_texto > TEXTO_POR_ESCENA:
            err.append(f"{eid}: {piezas_texto} piezas con texto en una escena (máximo {TEXTO_POR_ESCENA}; lo normal es 0 o 1)")
        elif piezas_texto == TEXTO_POR_ESCENA:
            avisos.append(f"{eid}: 2 piezas con texto en la misma escena: ¿sobra una?")
        if e.get("componente"):
            if not (d / "custom" / f"{e['componente']}.tsx").exists():
                err.append(f"{eid}: falta custom/{e['componente']}.tsx")
        elif e.get("solo_componente"):
            err.append(f"{eid}: solo_componente sin componente")
        if not (m or div or e.get("componente") or pant.get("estilo") == "capitulo"):
            avisos.append(f"{eid}: escena sin mascota, sin dividida y sin componente")
        for s in e.get("sfx") or []:
            if s.get("id") not in sfx_ids:
                err.append(f"{eid}: sfx desconocido {s.get('id')}")
            if s.get("en") is not None:
                idx_ok(s["en"], f"{eid}.sfx")
    for p in esc.get("progresion") or []:
        if not (isinstance(p.get("kg"), (int, float)) and isinstance(p.get("reps"), int) and isinstance(p.get("semana"), int)):
            err.append("progresion: cada semana lleva semana (int), kg (número) y reps (int)")
            break
    st = esc.get("subtitulos") or {}
    for tono, idxs in (st.get("tonos") or {}).items():
        if tono not in ("alerta", "exito"):
            err.append(f"subtitulos.tonos: {tono} desconocido (alerta | exito)")
        for i in idxs or []:
            idx_ok(i, f"subtitulos.tonos.{tono}")
    marcadas = sum(len(v or []) for v in (st.get("tonos") or {}).values())
    if marcadas > max(4, n // 8):
        avisos.append(f"subtitulos: {marcadas} palabras con tono: si todo resalta, nada resalta")
    for j, x in enumerate(st.get("iconos") or []):
        idx_ok(x.get("en"), f"subtitulos.iconos[{j}].en")
        icono_ok(x.get("icono"), f"subtitulos.iconos[{j}]")
    if len(st.get("iconos") or []) > 8:
        avisos.append(f"subtitulos: {len(st['iconos'])} iconos en los subtítulos (lo razonable es 3-6)")
    total = sum(k for _, k in texto_total)
    if total > PRESUPUESTO_TEXTO:
        err.append(f"{total} palabras en pantalla en todo el video (máximo {PRESUPUESTO_TEXTO}, sin contar subtítulos ni tarjeta): "
                   "quita texto y cuéntalo con la mascota, iconos, marcas del kit o pintando el subtítulo · "
                   + ", ".join(f"{d}={k}" for d, k in texto_total if k))
    con_texto = sum(1 for e in escenas if (e.get("pantalla") or {}).get("texto") and (e.get("pantalla") or {}).get("estilo", "ninguno") != "ninguno")
    if escenas and con_texto > max(2, len(escenas) // 3):
        avisos.append(f"{con_texto} de {len(escenas)} escenas con texto en pantalla: la mayoría debería ir con 'ninguno'")
    tr = esc.get("tarjeta_resumen")
    if tr:
        if not tr.get("titulo") or not TARJETA_LINEAS[0] <= len(tr.get("lineas") or []) <= TARJETA_LINEAS[1]:
            err.append(f"tarjeta_resumen: título y {TARJETA_LINEAS[0]}-{TARJETA_LINEAS[1]} líneas")
        if len(palabras(tr.get("titulo", ""))) > TARJETA_TITULO:
            err.append(f"tarjeta_resumen: título de más de {TARJETA_TITULO} palabras")
        for x in tr.get("lineas") or []:
            if len(palabras(x)) > TARJETA_LINEA:
                err.append(f"tarjeta_resumen: «{x}» tiene más de {TARJETA_LINEA} palabras")
        textos += [("tarjeta", tr.get("titulo", ""))] + [("tarjeta", x) for x in tr.get("lineas") or []]
        if tr.get("desde") is not None:
            idx_ok(tr["desde"], "tarjeta_resumen.desde")
    else:
        avisos.append("sin tarjeta_resumen")
    cifras = []
    for donde, t in textos:
        tt = f" {sin_tildes(t)} "
        malas = [c for c in CTA if re.search(rf"\b{re.escape(c)}\b", tt)]
        if malas:
            err.append(f"{donde}: «{t}» suena a CTA ({', '.join(malas)}): la marca no pide nada")
        if re.search(r"\d", t):
            cifras.append(f"«{t}» ({donde})")
    if cifras:
        avisos.append("cifras en pantalla, confirma que salen del guion, de un dato verificado o van como ejemplo: " + "; ".join(cifras))
    if not err:
        v = S.sincronizar(d)
        fin_voz = v["tarjeta_resumen"]["ini_f"] if v["tarjeta_resumen"] else v["video"]["frames"]
        for e in v["escenas"]:
            dur = min(e["fin_f"], fin_voz) - e["ini_f"] if e is v["escenas"][-1] else e["fin_f"] - e["ini_f"]
            if dur < 8:
                err.append(f"{e['id']}: dura {dur} frames (mínimo 8): mueve su 'desde' o usa 'desfase_f'")
            elif dur < 20:
                avisos.append(f"{e['id']}: escena muy corta ({dur} frames)")
            elif dur > 150:
                avisos.append(f"{e['id']}: {dur / 30:.1f} s sin cambiar de escena: revisa que algo se mueva dentro")
    return err, avisos


def main():
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    d = Path(sys.argv[1])
    err, avisos = validar(d)
    for a in avisos:
        print(f"  aviso: {a}")
    if err:
        print("ERRORES:\n - " + "\n - ".join(err))
        sys.exit(1)
    v = S.sincronizar(d)
    print(f"OK · {v['base']} · {v['video']['frames']} frames · {len(v['escenas'])} escenas")
    if "--stills" in sys.argv:
        print("Fotogramas a revisar (en videos/<BASE>: npm run stills):")
        for e in v["escenas"]:
            print(f"  {e['id']}: frame {min(e['fin_f'] - 1, e['ini_f'] + 18)}")
        if v["tarjeta_resumen"]:
            print(f"  resumen: frame {v['video']['frames'] - 5}")


if __name__ == "__main__":
    main()
