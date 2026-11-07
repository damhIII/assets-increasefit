"""Etapa 2: hojas -> sprites individuales normalizados + manifiesto.

- Recorta cada figura con su máscara (sin restos de las vecinas), limpia el alfa y deja un margen.
- Normaliza la escala: 1 personaje de pie = ALTURA_STD px (factor por hoja y, si hace falta, por figura).
- Alinea las fases (f1, f2) de cada ejercicio en un lienzo común: mismo tamaño y el ancla (pies o barra) en el mismo punto.
- Calcula anclajes: pies (suela), cabeza (cinta cian), manos (muñequeras cian), y los guarda en coordenadas del sprite.
"""
import json, os, sys
import numpy as np
from PIL import Image
from scipy import ndimage

sys.path.insert(0, os.path.dirname(__file__))
from segmentar import figuras

ALTURA_STD = 900          # px de un personaje de pie, de la coronilla a la suela
MARGEN = 12


def recortar(im, lab, grupo):
    a = np.array(im)
    m = np.isin(lab, grupo["ids"])
    m = ndimage.binary_dilation(m, iterations=3)
    x0, y0, x1, y1 = grupo["bbox"]
    x0, y0 = max(0, x0 - MARGEN), max(0, y0 - MARGEN)
    x1, y1 = min(a.shape[1], x1 + MARGEN), min(a.shape[0], y1 + MARGEN)
    sub = a[y0:y1, x0:x1].copy()
    sub[:, :, 3] = (sub[:, :, 3] * m[y0:y1, x0:x1]).astype(np.uint8)
    sub[sub[:, :, 3] < 6] = 0                       # ruido casi invisible fuera
    return Image.fromarray(sub, "RGBA")


def escalar(img, f):
    if abs(f - 1) < 1e-3:
        return img
    w, h = img.size
    return img.convert("RGBa").resize((max(1, round(w * f)), max(1, round(h * f))), Image.LANCZOS).convert("RGBA")


def recortar_alfa(img, margen=MARGEN):
    a = np.array(img)[:, :, 3]
    ys, xs = np.nonzero(a > 6)
    x0, y0, x1, y1 = xs.min(), ys.min(), xs.max() + 1, ys.max() + 1
    W, H = img.size
    return img.crop((max(0, x0 - margen), max(0, y0 - margen), min(W, x1 + margen), min(H, y1 + margen)))


def _hsv(arr):
    rgb = arr[:, :, :3].astype(float) / 255
    mx, mn = rgb.max(2), rgb.min(2)
    d = mx - mn
    sat = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    r, g, b = rgb[:, :, 0], rgb[:, :, 1], rgb[:, :, 2]
    hue = np.zeros_like(mx)
    k = d > 1e-6
    hr = k & (mx == r); hg = k & (mx == g) & ~hr; hb = k & ~hr & ~hg
    hue[hr] = ((g - b)[hr] / d[hr]) % 6
    hue[hg] = (b - r)[hg] / d[hg] + 2
    hue[hb] = (r - g)[hb] / d[hb] + 4
    return hue * 60, sat, mx


def ancla_pies(img):
    """Centro de las suelas blancas en la franja inferior; si no hay, centro de la franja inferior."""
    a = np.array(img)
    al = a[:, :, 3] > 128
    ys = np.nonzero(al.any(1))[0]
    y_bot = ys.max()
    y_top = ys.min()
    franja = max(6, int((y_bot - y_top) * 0.07))
    _, sat, val = _hsv(a)
    zona = np.zeros_like(al)
    zona[y_bot - franja:y_bot + 1] = True
    suela = al & zona & (val > 0.86) & (sat < 0.14)
    if suela.sum() > 30:
        yy, xx = np.nonzero(suela)
    else:
        yy, xx = np.nonzero(al & zona)
    return [int(round(xx.mean())), int(y_bot)]


def ancla_barra(img):
    """Barra de dominadas: fila superior del sprite (la barra) y su centro."""
    a = np.array(img)[:, :, 3] > 128
    ys = np.nonzero(a.any(1))[0]
    y_top = ys.min()
    banda = a[y_top:y_top + 12]
    xs = np.nonzero(banda.any(0))[0]
    return [int(round((xs.min() + xs.max()) / 2)), int(y_top)]


def ancla_banco_der(img):
    """Press de banca (cabeza a la derecha): pata derecha del banco = punto más a la derecha de la franja inferior."""
    a = np.array(img)[:, :, 3] > 128
    ys = np.nonzero(a.any(1))[0]
    y_bot, y_top = ys.max(), ys.min()
    franja = a[y_bot - max(6, int((y_bot - y_top) * 0.08)):y_bot + 1]
    x_der = int(np.nonzero(franja.any(0))[0].max())
    cols = a[:, max(0, x_der - 40):x_der + 1]
    return [x_der, int(np.nonzero(cols.any(1))[0].max())]


def anclas_cian(img, erguido=True):
    """Cinta (cabeza) y muñequeras (manos) a partir de las manchas cian.
    - Muñequera: mancha cian rodeada sobre todo de piel (mano y antebrazo).
    - Franja del short: rodeada de tela oscura -> se descarta.
    - Cinta: en sprites erguidos, la mancha más grande del 35 % superior que no sea muñequera."""
    a = np.array(img)
    hue, sat, val = _hsv(a)
    opaco = a[:, :, 3] > 128
    cian = opaco & (hue > 182) & (hue < 206) & (sat > 0.45) & (val > 0.45)
    cian = ndimage.binary_opening(cian, iterations=1)
    piel = opaco & (val > 0.65) & (sat < 0.25) & ~cian
    lab, n = ndimage.label(cian)
    if n == 0:
        return None, []
    ys = np.nonzero(opaco.any(1))[0]
    y0, H = ys.min(), ys.max() - ys.min()
    comps = []
    for i, sl in enumerate(ndimage.find_objects(lab), 1):
        m = lab == i
        area = int(m[sl].sum())
        anillo = ndimage.binary_dilation(m, iterations=22) & ~ndimage.binary_dilation(m, iterations=10) & opaco  # más allá del contorno de tinta
        f_piel = piel[anillo].mean() if anillo.any() else 0
        cy, cx = ndimage.center_of_mass(m)
        comps.append({"area": area, "piel": float(f_piel), "c": [int(round(cx)), int(round(cy))], "alto_rel": (cy - y0) / max(1, H)})
    mayor = max(c["area"] for c in comps)
    comps = [c for c in comps if c["area"] > 0.04 * mayor]
    cabeza = None
    if erguido:
        arriba = [c for c in comps if c["alto_rel"] < 0.35 and c["piel"] <= 0.4]
        if arriba:
            cabeza = max(arriba, key=lambda c: c["area"])
    resto = [c for c in comps if c is not cabeza and c["piel"] > 0.4]
    if cabeza is not None:
        resto = [c for c in resto if c["area"] < 0.9 * cabeza["area"]]
    manos = sorted(resto, key=lambda c: -c["area"])[:2]
    return (cabeza["c"] if cabeza else None), [m["c"] for m in manos]


def main(cfg_path, ajustes_path, salida):
    cfg = json.load(open(cfg_path))
    aj = json.load(open(ajustes_path))
    os.makedirs(f"{salida}/sprites", exist_ok=True)
    sprites = {}
    for hoja in cfg["hojas"]:
        im, lab, gs = figuras(hoja["ruta"], len(hoja["sprites"]), hoja.get("rejilla", False))
        assert len(gs) == len(hoja["sprites"]), hoja["id"]
        pph = aj["pph"].get(hoja["id"])            # px por altura de personaje en esa hoja (None = no normalizar)
        for nombre, g in zip(hoja["sprites"], gs):
            img = recortar(im, lab, g)
            f = (ALTURA_STD / pph) if pph else 1.0
            f *= aj["factor_figura"].get(nombre, 1.0)
            sprites[nombre] = {"img": escalar(img, f), "hoja": hoja["id"], "bbox_hoja": g["bbox"], "escala": round(f, 4)}

    for n in aj.get("descartar", []):           # sprites con defectos: se cortan pero no se guardan
        sprites.pop(n, None)

    # Fases: mismo lienzo y misma ancla
    for ej, tipo in aj["fases"].items():
        nombres = sorted(n for n in sprites if n.startswith(ej + "_f"))
        imgs = [recortar_alfa(sprites[n]["img"]) for n in nombres]
        fn = {"barra": ancla_barra, "pies": ancla_pies, "banco_der": ancla_banco_der}[tipo]
        anc = [fn(i) for i in imgs]
        izq = max(a[0] for a in anc); arr = max(a[1] for a in anc)
        der = max(i.size[0] - a[0] for i, a in zip(imgs, anc)); abj = max(i.size[1] - a[1] for i, a in zip(imgs, anc))
        W, H = izq + der, arr + abj
        for n, i, a in zip(nombres, imgs, anc):
            lienzo = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            lienzo.alpha_composite(i, (izq - a[0], arr - a[1]))
            sprites[n]["img"] = lienzo
            sprites[n]["fase_de"] = ej
            sprites[n]["ancla_fase"] = {"tipo": tipo, "punto": [izq, arr]}

    for n, s in sprites.items():
        if "fase_de" not in s:
            s["img"] = recortar_alfa(s["img"])
        img = s["img"]
        s["img"].save(f"{salida}/sprites/{n}.png", optimize=True)
        cab, manos = anclas_cian(img, erguido=n not in aj.get("tumbados", []))
        s["anclas"] = {"pies": ancla_pies(img), "cabeza": cab, "manos": manos}
        s["tam"] = list(img.size)
        del s["img"]
    json.dump(sprites, open(f"{salida}/_proceso.json", "w"), ensure_ascii=False, indent=1)
    print(f"{len(sprites)} sprites -> {salida}/sprites")


if __name__ == "__main__":
    main(*sys.argv[1:4])
