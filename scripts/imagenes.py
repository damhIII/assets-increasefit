#!/usr/bin/env python3
"""Busca y descarga imágenes con licencia libre para explicar un tema (un órgano, un hueso, un diagrama, un objeto),
y las deja listas para la anotación `imagen` de la escaleta.

Fuentes (sin clave de API): Openverse (api.openverse.org, agrega Flickr, Wikimedia, museos…) y Wikimedia Commons.
Solo se aceptan licencias que permiten uso comercial Y modificación (el duotono modifica la imagen): CC0, dominio público,
CC BY y CC BY-SA. El crédito (autor · licencia) se pinta solo bajo la imagen.

REGLA DE MARCA: nada de personas. La mascota es la única figura humana. El filtro descarta resultados cuyo título o
etiquetas hablan de personas, pero NO es infalible: Claude abre imagenes/contactos.jpg, mira cada imagen y marca
"revisada": true (o la descarta). Mejor ilustraciones, diagramas y objetos que fotos.

Uso:
  python3 scripts/imagenes.py buscar "heart anatomy illustration"            # lista candidatos (no descarga)
  python3 scripts/imagenes.py descargar briefs/<BASE> "human heart diagram" "dumbbell" --n 3
        → briefs/<BASE>/imagenes/<id>.jpg + manifest.json + contactos.jpg
  python3 scripts/imagenes.py marcar briefs/<BASE> <id> revisada      # tras mirarla: sin personas ni marcas
  python3 scripts/imagenes.py marcar briefs/<BASE> <id> descartar     # la borra del manifiesto y del disco
Opciones: --tipo ilustracion (por defecto: ilustraciones y diagramas) | foto | todo · --fuente openverse | commons | todas
Busca en INGLÉS: hay muchas más imágenes etiquetadas.
Necesita internet sin restricciones (Colab sí; algunos entornos de Claude bloquean estos dominios: entonces las descarga el
notebook de guion en Colab, que lee las "ideas_visuales" del guionista).
"""
import argparse, io, json, re, sys, time, unicodedata, urllib.parse, urllib.request
from pathlib import Path

UA = "IncreaseFitReels/1.0 (https://github.com/damhIII/assets-increasefit; uso educativo)"
LICENCIAS_OK = ("cc0", "pdm", "by", "by-sa")
PERSONAS = ("person", "people", "man", "men", "woman", "women", "boy", "girl", "child", "children", "kid", "baby", "face", "portrait",
            "selfie", "athlete", "crowd", "bodybuilder", "player", "persona", "hombre", "mujer", "niño",
            "niña", "retrato", "gente", "cara")
MIN_LADO, MAX_LADO = 500, 1400


def _get(url, timeout=25):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read()


def _texto(html):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", str(html or ""))).strip()


def _slug(t, n=28):
    t = unicodedata.normalize("NFD", str(t)).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "_", t).strip("_")[:n] or "img"


def norm_licencia(s):
    """'CC BY-SA 4.0' | 'cc-by-sa-4.0' | 'by-sa' | 'Public domain' | 'CC0' → ('by-sa', '4.0'), ('pdm', ''), ('cc0', '')."""
    t = str(s or "").lower().strip()
    if not t:
        return "", ""
    if "cc0" in t or "cc-zero" in t:
        return "cc0", ""
    if t in ("pd", "pdm") or "public domain" in t or "dominio público" in t or t.startswith("pd-"):
        return "pdm", ""
    m = re.search(r"(?:cc[\s-]*)?(by(?:[\s-](?:nc|nd|sa))*)(?:[\s-]+(\d(?:\.\d)?))?", t)
    if not m:
        return t, ""
    return re.sub(r"\s+", "-", m.group(1)), m.group(2) or ""


def _con_personas(*textos):
    t = " " + " ".join(str(x or "") for x in textos).lower() + " "
    return any(re.search(rf"\b{re.escape(p)}s?\b", t) for p in PERSONAS)


# ── Openverse ────────────────────────────────────────────────────────────────
def url_openverse(q, tipo="ilustracion", n=20):
    p = {"q": q, "license": ",".join(LICENCIAS_OK), "page_size": min(20, n), "mature": "false"}
    if tipo == "ilustracion":
        p["category"] = "illustration,digitized_artwork"
    elif tipo == "foto":
        p["category"] = "photograph"
    return "https://api.openverse.org/v1/images/?" + urllib.parse.urlencode(p)


def parse_openverse(data):
    out = []
    for r in data.get("results") or []:
        lic, ver = norm_licencia(r.get("license"))
        tags = [t.get("name", "") for t in r.get("tags") or [] if isinstance(t, dict)]
        out.append({"proveedor": f"openverse/{r.get('source') or r.get('provider') or ''}".rstrip("/"), "titulo": _texto(r.get("title")),
                    "autor": _texto(r.get("creator")), "licencia": lic, "licencia_version": r.get("license_version") or ver,
                    "licencia_url": r.get("license_url"), "fuente_url": r.get("foreign_landing_url"), "url": r.get("url"),
                    "ancho": r.get("width"), "alto": r.get("height"), "formato": str(r.get("filetype") or "").lower(),
                    "personas_texto": _con_personas(r.get("title"), " ".join(tags))})
    return out


# ── Wikimedia Commons ───────────────────────────────────────────────────────
def url_commons(q, n=20):
    p = {"action": "query", "format": "json", "generator": "search", "gsrsearch": f"{q} filetype:bitmap", "gsrnamespace": 6,
         "gsrlimit": min(30, n), "prop": "imageinfo", "iiprop": "url|size|mime|extmetadata", "iiurlwidth": MAX_LADO}
    return "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(p)


def parse_commons(data):
    out = []
    paginas = sorted((data.get("query") or {}).get("pages", {}).values(), key=lambda p: p.get("index", 0))
    for pg in paginas:
        ii = (pg.get("imageinfo") or [{}])[0]
        ext = ii.get("extmetadata") or {}
        val = lambda k: (ext.get(k) or {}).get("value", "")
        lic, ver = norm_licencia(val("License") or val("LicenseShortName"))
        titulo = re.sub(r"^File:|\.\w+$", "", pg.get("title", ""))
        out.append({"proveedor": "wikimedia_commons", "titulo": titulo, "autor": _texto(val("Artist"))[:80], "licencia": lic,
                    "licencia_version": ver, "licencia_url": val("LicenseUrl"), "fuente_url": ii.get("descriptionurl"),
                    "url": ii.get("thumburl") or ii.get("url"), "ancho": ii.get("width"), "alto": ii.get("height"),
                    "formato": str(ii.get("mime") or "").split("/")[-1],
                    "personas_texto": _con_personas(titulo, _texto(val("ImageDescription")), val("Categories"))})
    return out


def aceptable(c):
    """(ok, motivo) según licencia, tamaño, formato y el filtro de personas."""
    if c["licencia"] not in LICENCIAS_OK:
        return False, f"licencia {c['licencia'] or '?'}"
    if c["personas_texto"]:
        return False, "parece tener personas"
    if (c.get("ancho") or 0) and min(c["ancho"], c.get("alto") or 0) < MIN_LADO:
        return False, "demasiado pequeña"
    if c.get("formato") and c["formato"] not in ("jpg", "jpeg", "png", "webp"):
        return False, f"formato {c['formato']}"
    if not c.get("url"):
        return False, "sin url"
    return True, ""


def buscar(q, tipo="ilustracion", fuente="todas", n=20):
    cands = []
    if fuente in ("openverse", "todas"):
        try:
            cands += parse_openverse(json.loads(_get(url_openverse(q, tipo, n))))
        except Exception as e:
            print(f"  ⚠️ Openverse: {e}", file=sys.stderr)
    if fuente in ("commons", "todas") and tipo != "foto":
        try:
            cands += parse_commons(json.loads(_get(url_commons(q, n))))
        except Exception as e:
            print(f"  ⚠️ Commons: {e}", file=sys.stderr)
    return cands


def _manifest(d):
    f = d / "imagenes" / "manifest.json"
    return json.loads(f.read_text(encoding="utf-8")) if f.exists() else {
        "_nota": "Imágenes con licencia libre para este Reel (scripts/imagenes.py). Claude las mira en contactos.jpg y marca revisada=true "
                 "solo si NO salen personas ni marcas. En la escaleta: {\"tipo\": \"imagen\", \"imagen\": \"<id>\", \"marco\": \"polaroid\"}.",
        "imagenes": []}


def _guardar(d, man):
    (d / "imagenes").mkdir(parents=True, exist_ok=True)
    (d / "imagenes" / "manifest.json").write_text(json.dumps(man, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


def hoja_contactos(d):
    from PIL import Image, ImageDraw
    man = _manifest(d)
    items = [x for x in man["imagenes"] if (d / "imagenes" / x["archivo"]).exists()]
    if not items:
        return
    cols = min(4, len(items))
    filas = (len(items) + cols - 1) // cols
    hoja = Image.new("RGB", (cols * 300, filas * 340), (20, 20, 20))
    dr = ImageDraw.Draw(hoja)
    for i, x in enumerate(items):
        im = Image.open(d / "imagenes" / x["archivo"]).convert("RGB")
        im.thumbnail((290, 280))
        X, Y = (i % cols) * 300, (i // cols) * 340
        hoja.paste(im, (X + (300 - im.width) // 2, Y + 6))
        estado = "✓" if x.get("revisada") else "?"
        dr.text((X + 8, Y + 292), f"{estado} {x['id']}", fill=(255, 255, 255))
        dr.text((X + 8, Y + 312), f"{x['licencia']} · {x['proveedor'][:28]}", fill=(170, 170, 170))
    hoja.save(d / "imagenes" / "contactos.jpg", quality=85)


def descargar(d, consultas, n=3, tipo="ilustracion", fuente="todas"):
    from PIL import Image
    d = Path(d)
    (d / "imagenes").mkdir(parents=True, exist_ok=True)
    man = _manifest(d)
    vistas = {x.get("fuente_url") for x in man["imagenes"]}
    nuevas = []
    for q in consultas:
        ok = 0
        for c in buscar(q, tipo, fuente):
            if ok >= n:
                break
            bien, motivo = aceptable(c)
            if not bien or c["fuente_url"] in vistas:
                continue
            try:
                im = Image.open(io.BytesIO(_get(c["url"], timeout=40)))
                im = im.convert("RGB")
            except Exception as e:
                print(f"  ⚠️ no pude bajar {c['url']}: {e}", file=sys.stderr)
                continue
            if min(im.size) < MIN_LADO:
                continue
            im.thumbnail((MAX_LADO, MAX_LADO))
            base = f"{_slug(q)}_{ok + 1}"
            ids = {x["id"] for x in man["imagenes"]}
            k = 1
            while base in ids:
                k += 1
                base = f"{_slug(q)}_{ok + k}"
            archivo = f"{base}.jpg"
            im.save(d / "imagenes" / archivo, quality=88)
            info = {"id": base, "archivo": archivo, "consulta": q, "titulo": c["titulo"], "autor": c["autor"], "licencia": c["licencia"],
                    "licencia_version": c["licencia_version"], "licencia_url": c["licencia_url"], "fuente_url": c["fuente_url"],
                    "proveedor": c["proveedor"], "ancho": im.width, "alto": im.height, "revisada": False, "personas": None}
            man["imagenes"].append(info)
            vistas.add(c["fuente_url"])
            nuevas.append(info)
            ok += 1
            time.sleep(0.4)
        print(f"  «{q}»: {ok} imagen(es)")
    _guardar(d, man)
    hoja_contactos(d)
    return nuevas


def marcar(d, ident, estado):
    d = Path(d)
    man = _manifest(d)
    x = next((x for x in man["imagenes"] if x["id"] == ident), None)
    if not x:
        raise SystemExit(f"No hay imagen «{ident}» en {d}/imagenes/manifest.json")
    if estado == "descartar":
        (d / "imagenes" / x["archivo"]).unlink(missing_ok=True)
        man["imagenes"].remove(x)
    elif estado == "revisada":
        x.update({"revisada": True, "personas": False})
    elif estado == "personas":
        x.update({"revisada": True, "personas": True})
    _guardar(d, man)
    hoja_contactos(d)
    print(f"{ident}: {estado}")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("accion", choices=["buscar", "descargar", "marcar"])
    ap.add_argument("args", nargs="+")
    ap.add_argument("--n", type=int, default=3)
    ap.add_argument("--tipo", choices=["ilustracion", "foto", "todo"], default="ilustracion")
    ap.add_argument("--fuente", choices=["openverse", "commons", "todas"], default="todas")
    a = ap.parse_args()
    if a.accion == "buscar":
        for c in buscar(" ".join(a.args), a.tipo, a.fuente):
            bien, motivo = aceptable(c)
            print(f"{'✓' if bien else '✗'} {c['licencia']:<6} {c.get('ancho')}×{c.get('alto')}  {c['titulo'][:60]}  ({c['proveedor']})"
                  + (f"  ← {motivo}" if motivo else ""))
    elif a.accion == "descargar":
        if len(a.args) < 2:
            raise SystemExit("descargar briefs/<BASE> \"consulta\" [\"otra consulta\" ...]")
        nuevas = descargar(a.args[0], a.args[1:], a.n, a.tipo, a.fuente)
        print(f"{len(nuevas)} imagen(es) nuevas en {a.args[0]}/imagenes/ · mira contactos.jpg y marca las buenas: "
              f"python3 scripts/imagenes.py marcar {a.args[0]} <id> revisada")
    else:
        if len(a.args) != 3 or a.args[2] not in ("revisada", "personas", "descartar"):
            raise SystemExit("marcar briefs/<BASE> <id> revisada|personas|descartar")
        marcar(*a.args)


if __name__ == "__main__":
    main()
