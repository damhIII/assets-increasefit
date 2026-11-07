"""Etapa 1: separa cada hoja en figuras (componentes conexas del alfa) y guarda bboxes en JSON."""
import json, sys
import numpy as np
from PIL import Image
from scipy import ndimage

ALFA_MIN = 16


def figuras(ruta, n_esperadas, rejilla=False):
    im = Image.open(ruta).convert("RGBA")
    a = np.array(im)[:, :, 3]
    mask = a > ALFA_MIN
    lab, n = ndimage.label(mask, structure=np.ones((3, 3)))
    if n == 0:
        return im, lab, []
    areas = ndimage.sum(mask, lab, range(1, n + 1))
    slices = ndimage.find_objects(lab)
    comps = [{"id": i + 1, "area": int(areas[i]), "sl": slices[i]} for i in range(n)]
    comps.sort(key=lambda c: -c["area"])
    grandes = comps[:n_esperadas]
    # una figura es grande si su area es >= 15 % de la mayor; si no, sobran
    grupos = [{"ids": [c["id"]], "bbox": [c["sl"][1].start, c["sl"][0].start, c["sl"][1].stop, c["sl"][0].stop]} for c in grandes]
    for c in comps[n_esperadas:]:
        if c["area"] < 30:
            continue
        x0, y0, x1, y1 = c["sl"][1].start, c["sl"][0].start, c["sl"][1].stop, c["sl"][0].stop
        def dist(g):
            gx0, gy0, gx1, gy1 = g["bbox"]
            dx = max(gx0 - x1, x0 - gx1, 0)
            dy = max(gy0 - y1, y0 - gy1, 0)
            return (dx * dx + dy * dy) ** 0.5
        g = min(grupos, key=dist)
        if dist(g) <= 140:
            g["ids"].append(c["id"])
            gb = g["bbox"]
            g["bbox"] = [min(gb[0], x0), min(gb[1], y0), max(gb[2], x1), max(gb[3], y1)]
    H = a.shape[0]
    if rejilla:
        grupos.sort(key=lambda g: (int((g["bbox"][1] + g["bbox"][3]) / 2 > H / 2), g["bbox"][0]))
    else:
        grupos.sort(key=lambda g: g["bbox"][0])
    areas_g = [int(sum(areas[i - 1] for i in g["ids"])) for g in grupos]
    return im, lab, [dict(g, area=ar) for g, ar in zip(grupos, areas_g)]


if __name__ == "__main__":
    cfg = json.load(open(sys.argv[1]))
    out = {}
    for hoja in cfg["hojas"]:
        _, _, gs = figuras(hoja["ruta"], len(hoja["sprites"]), hoja.get("rejilla", False))
        out[hoja["id"]] = [{"bbox": g["bbox"], "area": g["area"], "n_comp": len(g["ids"])} for g in gs]
        print(hoja["id"], [(g["bbox"], g["area"]) for g in gs])
    json.dump(out, open(sys.argv[2], "w"), indent=1)
