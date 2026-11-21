#!/usr/bin/env python3
"""Comprueba la escaleta de un Reel contra los guardarraíles de marca y los catálogos del repo.

Uso:
  python3 scripts/validar_render.py briefs/<BASE>
  python3 scripts/validar_render.py briefs/<BASE> --stills     # además lista los fotogramas a revisar

No juzga lo creativo: solo que lo que se pide exista, que los tiempos cuadren y que se respeten las reglas fijas
(marco, sin CTA, fuentes que salen de los hallazgos de investigacion.json) y el PRESUPUESTO DE TEXTO: el video se cuenta
con imágenes y subtítulos; el texto en pantalla es la excepción (límites en LIMITES y PRESUPUESTO_TEXTO).
Además calcula, sin renderizar, si la cabeza o las manos de la mascota quedan fuera de la zona segura o si flota.
"""
import json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sincronizar as S
from alinear import sin_tildes

ESTILOS = {"titular", "nota", "capitulo", "ninguno"}
ANIMS = {"pop", "entrar", "temblor", "ejercicio", "estatico", "hablar", "saltar", "asentir", "celebrar"}
ENCUADRES = {"general", "medio", "primer_plano"}
POSICIONES = {"centro", "izq", "der"}
APUNTA = {"cabeza", "manos", "pies", "centro"}
ANOTACIONES = {"etiqueta", "tachado", "circulo", "check", "cruz", "burbuja_pensamiento", "burbuja_dialogo", "dato", "lista",
               "rec", "lineas_velocidad", "impacto", "sudor", "destello", "enfoque", "libreta", "grafica", "icono", "ficha",
               "musculos", "lottie", "prop", "pictograma", "barras", "anillo", "linea_tiempo", "estudio", "imagen"}
COLUMNA = {"dato", "lista", "libreta", "grafica", "ficha", "musculos", "pictograma", "barras", "anillo", "linea_tiempo", "estudio", "imagen"}
CAMARAS = {"viva", "quieta", "alejar", "sacudida"}
PARTICULAS = {"polvo", "chispas", "burbujas", "confeti_suave"}
MARCOS = {"polaroid", "celular", "circulo", "tarjeta"}
VISTAS = {"frente", "espalda"}
TRANSICIONES = {"corte", "pincel", "zoom", "deslizar", "barrido", "iris", "flash", "fundido"}
TONOS = {"foco", "alerta", "exito"}
# Texto en pantalla (sin contar subtítulos, fuentes, ASÍ NO/ASÍ SÍ ni la tarjeta resumen): palabras máximas por pieza…
LIMITES = {"pantalla": 4, "capitulo": 5, "etiqueta": 2, "tachado": 3, "burbuja_dialogo": 4, "dato": 2, "detalle": 5,
           "lista": 3, "ficha": 2, "libreta": 2, "barra": 2, "hito": 2, "muestra": 3, "duracion": 2, "pictograma": 4}
PRESUPUESTO_TEXTO = 20          # …y palabras en pantalla en TODO el video
TEXTO_POR_ESCENA = 2            # piezas con texto por escena (lo normal es 0 o 1)
# Tarjeta final: palabras máximas por campo y número de pasos
TARJETA = {"tema": 3, "pregunta": 8, "veredicto": 7, "paso": 6}
TARJETA_PASOS = (2, 3)
TARJETA_TITULO_ANTIGUO = 5      # formato antiguo (titulo + lineas)
CTA = ("comenta", "dale like", "like", "sigueme", "suscribete", "guardalo y", "comparte", "link en", "en la bio")
# Geometría de la mascota: la misma que colocar() de plantilla/src/personaje/Sprite.tsx y ZONA de plantilla/src/marco/datos.ts
SUELO, ESCENA_ARRIBA, IG_ABAJO = 1340, 540, 1540
ZONA_IZQ, ZONA_DER, ZONA_BOTONES, Y_BOTONES = 120, 960, 900, 1100
CX_POS = {"centro": 540, "izq": 320, "der": 730}
FLOTA_PX = 20                   # pies más de 20 px por encima del suelo en medio / primer plano = flota


def fuentes_de(d):
    """Fuentes que pueden ir en pantalla: el campo `corta` de los hallazgos de briefs/<BASE>/investigacion.json.
    None si el brief no tiene investigacion.json (entonces ninguna pieza puede llevar fuente)."""
    f = Path(d) / "investigacion.json"
    if not f.exists():
        return None
    inv = json.loads(f.read_text(encoding="utf-8"))
    return {str(h["corta"]).strip() for h in inv.get("hallazgos") or [] if isinstance(h, dict) and str(h.get("corta") or "").strip()}


def _encajar(x, w, lim=ZONA_DER):
    return (ZONA_IZQ + lim - w) / 2 if w > lim - ZONA_IZQ else min(max(x, ZONA_IZQ), lim - w)


def colocar(info, encuadre, posicion, espejo, k0, extra=1.0, cx=None):
    """Port de colocar() (Sprite.tsx) → (x, y, k) del sprite en pantalla."""
    w, h = info["tam"]
    cx = CX_POS.get(posicion, 540) if cx is None else cx
    ax = (lambda a: w - a[0]) if espejo else (lambda a: a[0])
    cab = info["anclas"].get("cabeza")
    if info["categoria"] in ("cara", "mano"):
        k = 1.25 * extra
        return _encajar(cx - w * k / 2, w * k), 930 - h * k / 2, k
    if info["categoria"] == "plano_medio":
        k = k0 * 1.2 * extra
        return _encajar(cx - w * k / 2, w * k), 1450 - h * k, k
    if encuadre == "medio" and cab:
        k = k0 * 1.55 * extra
        return cx - ax(cab) * k, 720 - cab[1] * k, k
    if encuadre == "primer_plano" and cab:
        k = k0 * 2.5 * extra
        return 540 - ax(cab) * k, 860 - cab[1] * k, k
    k = min(k0 * extra, (ZONA_DER - ZONA_IZQ) / w, (SUELO - ESCENA_ARRIBA) / h)
    pies = info["anclas"]["pies"]
    return _encajar(cx - ax(pies) * k, w * k), SUELO - pies[1] * k, k


def revisar_mascota(escenas, mascota, props):
    """Avisos (sin renderizar) de mascota cortada o flotando, con las anclas de mascota/manifest.json y la misma colocación
    que la composición por defecto (Escena.tsx): columna → general a la derecha ×0,82; objeto de suelo → izquierda ×0,92;
    dividida → dos paneles ×0,68. Las escenas a medida (solo_componente) y los capítulos no se revisan.
    · cortada: la cabeza o una mano visible quedan fuera de x 120–960 (x ≤ 900 bajo Y 1100) o por encima de Y 540
      (franja de subtítulos e insignias). En medio y primer plano, las manos por debajo de Y 1540 salen del cuadro por el
      encuadre y no se avisan.
    · flota: en medio o primer plano, los pies quedan visibles por encima del suelo (Y 1340)."""
    sprites = {s["id"]: s for s in mascota["sprites"]}
    ejercicios = mascota.get("ejercicios") or {}
    k0 = 800 / float(mascota.get("altura_personaje_px") or 900)     # personaje de pie = 800 px en encuadre general
    suelo_ids = {p["id"] for p in props if p.get("suelo")}
    avisos = []

    def fases(sp):
        if isinstance(sp, str) and sp.startswith("ejercicio:"):
            return [sprites[i] for i in (ejercicios.get(sp[10:]) or {}).get("fases", []) if i in sprites]
        return [sprites[sp]] if sp in sprites else []

    def fuera(x, y):
        lim = ZONA_BOTONES if y > Y_BOTONES else ZONA_DER
        if x < ZONA_IZQ or x > lim:
            return f"x {x:.0f} (zona x {ZONA_IZQ}–{lim})"
        if y < ESCENA_ARRIBA:
            return f"y {y:.0f} (pisa la franja de subtítulos, por encima de Y {ESCENA_ARRIBA})"
        return ""

    def revisar(eid, sp, encuadre, posicion, espejo, extra=1.0, cx=None):
        fs = fases(sp)
        if not fs:
            return
        x, y, k = colocar(fs[0], encuadre, posicion, espejo, k0, extra, cx)     # todas las fases comparten lienzo y ancla
        w = fs[0]["tam"][0]
        punto = lambda a: (x + ((w - a[0]) if espejo else a[0]) * k, y + a[1] * k)
        efectivo = encuadre if fs[0]["anclas"].get("cabeza") else "general"
        cuerpo = fs[0]["categoria"] not in ("cara", "mano", "plano_medio")
        vistos = set()
        for f in fs:
            A = f["anclas"]
            partes = ([("la cabeza", A["cabeza"])] if A.get("cabeza") else []) + [("una mano", m) for m in A.get("manos") or []]
            for nombre, a in partes:
                px, py = punto(a)
                if nombre == "una mano" and efectivo in ("medio", "primer_plano") and py >= IG_ABAJO:
                    continue
                motivo = fuera(px, py)
                if motivo and (nombre, motivo) not in vistos:
                    vistos.add((nombre, motivo))
                    avisos.append(f"{eid}: mascota cortada · {nombre} de {f['id']} queda en {motivo}: cambia posición o encuadre")
            if cuerpo and efectivo in ("medio", "primer_plano") and A.get("pies"):
                _, py = punto(A["pies"])
                if py < SUELO - FLOTA_PX and ("flota", f["id"]) not in vistos:
                    vistos.add(("flota", f["id"]))
                    avisos.append(f"{eid}: mascota flotando · los pies de {f['id']} quedan en y {py:.0f}, por encima del suelo "
                                  f"(Y {SUELO}): usa encuadre general")

    for k, e in enumerate(escenas):
        eid = e.get("id", f"#{k}")
        if e.get("solo_componente") or (e.get("pantalla") or {}).get("estilo") == "capitulo":
            continue
        div = e.get("dividida")
        if div:
            ancho_p = (ZONA_DER - ZONA_IZQ - 20) / 2
            revisar(eid, div.get("no"), "general", "izq", False, 0.68, ZONA_IZQ + ancho_p / 2)
            revisar(eid, div.get("si"), "general", "der", False, 0.68, ZONA_IZQ + ancho_p + 20 + ancho_p / 2)
            continue
        m = e.get("mascota")
        if not m:
            continue
        anots = e.get("anotaciones") or []
        columna = any(o.get("tipo") in COLUMNA for o in anots)
        prop_suelo = any(o.get("tipo") == "prop" and not o.get("apunta") and o.get("prop") in suelo_ids for o in anots)
        pos = m.get("posicion", "centro")
        if columna:
            pos = "der"
        elif prop_suelo and pos == "centro":
            pos = "izq"
        revisar(eid, m.get("sprite"), "general" if columna else m.get("encuadre", "general"), pos, bool(m.get("espejo")),
                0.82 if columna else 0.92 if prop_suelo else 1.0)
    return avisos


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
    fuentes_ok = fuentes_de(d)               # None = el brief no tiene investigacion.json
    n = len(sub["palabras"])
    iconos = {f.stem for f in (S.RAIZ / "icons").glob("*.svg")}
    musculos = set((cat["musculos"].get("musculos") or {}).keys())
    lotties = {l["id"] for l in cat["lottie"].get("animaciones") or []}
    fondos = {x["id"] for x in cat["fondos"].get("fondos") or []}
    props = {x["id"] for x in cat["props"].get("props") or []}
    imgs = S.imagenes_de(d)
    texto_total = []                          # (dónde, palabras) del texto en pantalla, para el presupuesto

    def palabras(t):
        return [w for w in re.split(r"[\s/]+", str(t).replace(":", " ")) if re.search(r"\w", w)]

    def limite(donde, clave, t):
        k = len(palabras(t))
        texto_total.append((donde, k))
        if k > LIMITES[clave]:
            err.append(f"{donde}: «{t}» tiene {k} palabras (máximo {LIMITES[clave]}): cuéntalo con la mascota, un icono o el subtítulo")

    def fuente_ok(donde, fuente):
        """La fuente en pantalla es la `corta` de un hallazgo de investigacion.json, tal cual: solo coherencia (que no se invente)."""
        if fuentes_ok is None:
            err.append(f"{donde}: «{fuente}» no puede ir como fuente porque el brief no tiene investigacion.json: "
                       "quítala y, si es un ejemplo, pon 'ilustrativo': true")
        elif fuente not in fuentes_ok:
            err.append(f"{donde}: la fuente «{fuente}» no es la `corta` de ningún hallazgo de investigacion.json "
                       f"({', '.join(sorted(fuentes_ok)) or 'no tiene hallazgos'}): usa esa, o quítala y pon 'ilustrativo': true")

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
    if str(esc.get("serie_header", "")).strip():
        avisos.append("serie_header ya no se usa (arriba solo van los subtítulos): se ignora, bórralo de la escaleta")
    if "isotipo" in (esc.get("opciones") or {}):
        avisos.append("opciones.isotipo ya no se usa (el video no lleva isotipo; el logo sale en la tarjeta final): se ignora, bórralo de la escaleta")
    if (esc.get("opciones") or {}).get("cortes_a_ritmo"):
        pista = next((x for x in cat["sonido"]["musica"] if x["id"] == esc.get("musica")), None)
        if not pista or not pista.get("bpm") or pista.get("fase_s") is None:
            avisos.append("opciones.cortes_a_ritmo: la música no tiene bpm y fase_s (python3 scripts/beats.py): los cortes no se moverán")
    cola = esc.get("cola_s", S.COLA_S)
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
        if e.get("fondo") and e["fondo"] not in fondos:
            err.append(f"{eid}: fondo desconocido {e['fondo']} (fondos/manifest.json: {', '.join(sorted(fondos)) or 'ninguno'})")
        if e.get("transicion", "corte") not in TRANSICIONES:
            err.append(f"{eid}: transición {e.get('transicion')} ({' | '.join(sorted(TRANSICIONES))})")
        cam = e.get("camara")
        if cam is not None:
            ct = cam if isinstance(cam, str) else (cam or {}).get("tipo", "viva")
            if ct not in CAMARAS:
                err.append(f"{eid}: camara {ct} ({' | '.join(sorted(CAMARAS))})")
            if isinstance(cam, dict) and cam.get("en") is not None:
                idx_ok(cam["en"], f"{eid}.camara.en")
        if e.get("particulas") and e["particulas"] not in PARTICULAS:
            err.append(f"{eid}: particulas {e['particulas']} ({' | '.join(sorted(PARTICULAS))})")
        columna = [o.get("tipo") for o in e.get("anotaciones") or [] if o.get("tipo") in COLUMNA]
        if len(columna) > 1:
            avisos.append(f"{eid}: {len(columna)} piezas de columna en la misma escena ({', '.join(columna)}): se pisan, reparte en dos escenas")
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
            if m.get("anim") == "hablar" and not str(m.get("sprite", "")).startswith("plano_boca"):
                err.append(f"{eid}: anim 'hablar' solo con sprite plano_boca_reposo (la boca sigue a la voz)")
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
            if t == "musculos":
                if not musculos:
                    err.append(f"{donde}: no hay mapa muscular en el repo (anatomia/musculos.json)")
                if o.get("vista", "frente") not in VISTAS:
                    err.append(f"{donde}: vista {o.get('vista')} (frente | espalda)")
                res = o.get("resaltar") or []
                if not 1 <= len(res) <= 4:
                    err.append(f"{donde}: resaltar de 1 a 4 músculos")
                for m_id in res:
                    if musculos and m_id not in musculos:
                        err.append(f"{donde}: músculo «{m_id}» desconocido ({', '.join(sorted(musculos))})")
                if o.get("tono") and o["tono"] not in TONOS:
                    err.append(f"{donde}: tono {o['tono']} ({' | '.join(sorted(TONOS))})")
            if t == "lottie":
                if o.get("lottie") not in lotties:
                    err.append(f"{donde}: lottie «{o.get('lottie')}» no está en lottie/manifest.json ({', '.join(sorted(lotties)) or 'ninguna'})")
                if o.get("tono") and o["tono"] not in TONOS | {"texto"}:
                    err.append(f"{donde}: tono {o['tono']} (foco | alerta | exito | texto; solo en las lottie mono)")
                if o.get("escala") is not None and not (isinstance(o["escala"], (int, float)) and 0.3 <= o["escala"] <= 2.5):
                    err.append(f"{donde}: escala entre 0.3 y 2.5")
            if t == "prop":
                if o.get("prop") not in props:
                    err.append(f"{donde}: prop «{o.get('prop')}» no está en props/manifest.json ({', '.join(sorted(props)) or 'ninguno'})")
                if o.get("escala") is not None and not (isinstance(o["escala"], (int, float)) and 0.3 <= o["escala"] <= 2.5):
                    err.append(f"{donde}: escala entre 0.3 y 2.5")
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
            # Piezas con cifras: `fuente` = la `corta` de un hallazgo de investigacion.json, o 'ilustrativo': true si es un ejemplo
            def fuente_o_ilustrativo(obligatoria=False):
                if o.get("fuente"):
                    fuente_ok(donde, o["fuente"])
                elif obligatoria:
                    err.append(f"{donde}: {t} lleva siempre su 'fuente' (la `corta` del hallazgo: es la ficha de un estudio real)")
                elif not o.get("ilustrativo"):
                    err.append(f"{donde}: {t} lleva su 'fuente' (la `corta` del hallazgo), o 'ilustrativo': true si es un ejemplo")
            if t == "ficha":
                fuente_o_ilustrativo()
            if t == "dato":
                if not o.get("texto"):
                    err.append(f"{donde}: dato necesita la cifra en 'texto'")
                fuente_o_ilustrativo()
            # ── v9: piezas de datos e imagen ──
            if t in ("pictograma", "barras", "anillo", "linea_tiempo", "estudio"):
                piezas_texto += 1
            if t == "pictograma":
                if o.get("total", 100) not in (10, 20, 50, 100):
                    err.append(f"{donde}: total {o.get('total')} (10 | 20 | 50 | 100)")
                cant = o.get("cantidad")
                if not isinstance(cant, int) or not 0 <= cant <= o.get("total", 100):
                    err.append(f"{donde}: cantidad (entero) entre 0 y total: cuántas figuras se encienden")
                if o.get("texto"):
                    limite(donde, "pictograma", o["texto"])      # «1 de cada 3» cabe
                if o.get("icono"):
                    icono_ok(o["icono"], donde)
                fuente_o_ilustrativo()
            if t == "barras":
                bs = o.get("barras") or []
                if not 2 <= len(bs) <= 4:
                    err.append(f"{donde}: barras de 2 a 4 grupos")
                for b_i, b in enumerate(bs):
                    if not isinstance(b.get("valor"), (int, float)):
                        err.append(f"{donde}.barras[{b_i}]: falta el valor (número)")
                    if not b.get("etiqueta"):
                        err.append(f"{donde}.barras[{b_i}]: falta la etiqueta (≤2 palabras: «con plan», «control»)")
                    else:
                        limite(f"{donde}.barras[{b_i}]", "barra", b["etiqueta"])
                        textos.append((donde, str(b["etiqueta"])))
                    if b.get("tono") and b["tono"] not in TONOS:
                        err.append(f"{donde}.barras[{b_i}]: tono {b['tono']} ({' | '.join(sorted(TONOS))})")
                    textos.append((donde, f"{b.get('valor')}{o.get('unidad') or ''}"))
                fuente_o_ilustrativo()
            if t == "anillo":
                if not isinstance(o.get("valor"), (int, float)) or not 0 <= o["valor"] <= 100:
                    err.append(f"{donde}: valor entre 0 y 100 (el porcentaje del anillo)")
                else:
                    textos.append((donde, f"{o['valor']}{o.get('unidad', '%')}"))
                if o.get("texto"):
                    limite(donde, "dato", o["texto"])
                fuente_o_ilustrativo()
            if t == "linea_tiempo":
                hs = o.get("hitos") or []
                if not 2 <= len(hs) <= 4:
                    err.append(f"{donde}: linea_tiempo de 2 a 4 hitos")
                for h_i, h in enumerate(hs):
                    if not h.get("texto"):
                        err.append(f"{donde}.hitos[{h_i}]: falta texto (≤2 palabras: «semana 1», «hoy»)")
                    else:
                        limite(f"{donde}.hitos[{h_i}]", "hito", h["texto"])
                        textos.append((donde, str(h["texto"])))
                    if h.get("icono"):
                        icono_ok(h["icono"], f"{donde}.hitos[{h_i}]")
                    if h.get("en") is not None:
                        idx_ok(h["en"], f"{donde}.hitos[{h_i}].en")
            if t == "estudio":
                es = o.get("estudio") or {}
                if not es.get("tipo"):
                    err.append(f"{donde}: estudio.tipo (Metaanálisis, Ensayo aleatorizado, Cohorte…)")
                elif len(palabras(es["tipo"])) > 3:
                    err.append(f"{donde}: estudio.tipo «{es['tipo']}» de más de 3 palabras")
                for campo in ("muestra", "duracion"):
                    if es.get(campo):
                        limite(f"{donde}.{campo}", campo, es[campo])
                        textos.append((donde, str(es[campo])))
                if es.get("revista") and len(palabras(es["revista"])) > 4:
                    err.append(f"{donde}: estudio.revista abreviada (≤4 palabras)")
                fuente_o_ilustrativo(obligatoria=True)
            if t == "imagen":
                info = imgs.get(o.get("imagen"))
                if not info:
                    err.append(f"{donde}: imagen «{o.get('imagen')}» no está en imagenes/manifest.json de este brief "
                               f"(descárgala con: python3 scripts/imagenes.py descargar briefs/<BASE> \"consulta\")"
                               + (f"; hay: {', '.join(sorted(imgs))}" if imgs else ""))
                else:
                    if str(info.get("licencia", "")).lower() not in S.LICENCIAS_OK:
                        err.append(f"{donde}: licencia «{info.get('licencia')}» no permitida (solo {', '.join(S.LICENCIAS_OK)}: uso comercial y modificación)")
                    if info.get("personas") is True:
                        err.append(f"{donde}: la imagen «{o['imagen']}» está marcada con personas: la mascota es la única figura humana")
                    if not (d / "imagenes" / str(info.get("archivo", ""))).is_file():
                        err.append(f"{donde}: falta el archivo imagenes/{info.get('archivo')}")
                    if info.get("revisada") is not True:
                        avisos.append(f"{donde}: imagen «{o['imagen']}» sin revisar: ábrela, comprueba que NO salen personas ni marcas y pon \"revisada\": true en imagenes/manifest.json")
                if o.get("marco", "polaroid") not in MARCOS:
                    err.append(f"{donde}: marco {o.get('marco')} ({' | '.join(sorted(MARCOS))})")
                if o.get("escala") is not None and not (isinstance(o["escala"], (int, float)) and 0.6 <= o["escala"] <= 1):
                    err.append(f"{donde}: escala de la imagen entre 0.6 y 1")
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
        if not (m or div or e.get("componente") or pant.get("estilo") == "capitulo" or columna):
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
    tr = S.tarjeta_de(esc, d)
    if tr:
        if esc.get("tarjeta_resumen") is None:
            avisos.append("tarjeta_resumen tomada de tarjeta.json (la propuso el notebook): revísala y cópiala a la escaleta si la retocas")
        if not tr["veredicto"]:
            err.append("tarjeta_resumen: falta el veredicto (la respuesta corta a la pregunta del gancho)")
        if not TARJETA_PASOS[0] <= len(tr["pasos"]) <= TARJETA_PASOS[1]:
            err.append(f"tarjeta_resumen: {TARJETA_PASOS[0]}-{TARJETA_PASOS[1]} pasos para aplicarlo (hay {len(tr['pasos'])})")
        if tr["_antigua"]:
            avisos.append("tarjeta_resumen en formato antiguo (titulo + lineas): usa tema, pregunta, veredicto, tono y pasos (referencias/escaleta.md)")
            if len(palabras(tr["veredicto"])) > TARJETA_TITULO_ANTIGUO:
                err.append(f"tarjeta_resumen: título de más de {TARJETA_TITULO_ANTIGUO} palabras")
        else:
            if not tr["pregunta"]:
                err.append("tarjeta_resumen: falta la pregunta (la del gancho, resumida): es lo que conecta la tarjeta con el Reel")
            elif not tr["pregunta"].endswith("?"):
                avisos.append(f"tarjeta_resumen: la pregunta «{tr['pregunta']}» debería ir entre signos de pregunta")
            if not tr["tono"]:
                avisos.append("tarjeta_resumen: sin tono (si | no | matiz): el veredicto irá en el color de foco")
            if not tr["tema"]:
                avisos.append("tarjeta_resumen: sin tema (1-3 palabras): el chip ayuda a reconocer el Reel al volver a la tarjeta")
            for campo in ("tema", "pregunta", "veredicto"):
                if len(palabras(tr[campo])) > TARJETA[campo]:
                    err.append(f"tarjeta_resumen.{campo}: «{tr[campo]}» tiene más de {TARJETA[campo]} palabras")
            # ¿La tarjeta retoma el gancho? (alguna palabra con contenido de pregunta/tema aparece en las 2 primeras frases)
            gancho = " ".join(re.split(r"(?<=[.!?…])\s+", (d / "guion.txt").read_text(encoding="utf-8").strip())[:2])
            raiz = lambda t: {w[:5] for w in re.findall(r"[a-z0-9ñ]+", sin_tildes(t)) if len(w) >= 5}
            if tr["pregunta"] and not raiz(tr["pregunta"] + " " + tr["tema"]) & raiz(gancho):
                avisos.append(f"tarjeta_resumen: la pregunta «{tr['pregunta']}» no retoma ninguna palabra del gancho: ¿se reconoce que es la conclusión de ESTE Reel?")
        for x in tr["pasos"]:
            if len(palabras(x)) > TARJETA["paso"]:
                err.append(f"tarjeta_resumen: el paso «{x}» tiene más de {TARJETA['paso']} palabras")
        if tr["fuente"]:
            fuente_ok("tarjeta_resumen", tr["fuente"])
        textos += [("tarjeta", tr[k]) for k in ("tema", "pregunta", "veredicto") if tr[k]] + [("tarjeta", x) for x in tr["pasos"]]
        if tr.get("desde") is not None:
            idx_ok(tr["desde"], "tarjeta_resumen.desde")
        if isinstance(cola, (int, float)) and cola < 3.5 and tr.get("desde") is None:
            avisos.append(f"cola_s {cola}: con la tarjeta nueva deja al menos 3.5-4 s para leerla")
    else:
        avisos.append("sin tarjeta_resumen (ni en la escaleta ni en tarjeta.json)")
    for donde, t in textos:
        tt = f" {sin_tildes(t)} "
        malas = [c for c in CTA if re.search(rf"\b{re.escape(c)}\b", tt)]
        if malas:
            err.append(f"{donde}: «{t}» suena a CTA ({', '.join(malas)}): la marca no pide nada")
    avisos += revisar_mascota(escenas, cat["mascota"], cat["props"].get("props") or [])
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
