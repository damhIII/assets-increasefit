"""Etapa 2b (tras procesar.py): une las bocas sobre UNA base para que la mascota hable sin que cambie la cara: alinea cada fuente con la base por la
zona de la nariz (búsqueda por SSD) y pega solo la región de la boca (o de los ojos) con una máscara elíptica difuminada.

Uso: python3 scripts/mascota/bocas.py mascota   (antes de manifiesto.py)
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

D = sys.argv[1] + "/sprites" if not sys.argv[1].endswith("sprites") else sys.argv[1]   # mascota/ (o su carpeta sprites/)
BASE = "plano_boca_reposo"
NARIZ = (232, 150, 300, 192)                     # caja (x0, y0, x1, y1) en la base: nariz y pómulos (no cambia al hablar)
BOCA = (212, 172, 302, 238)                      # región que se pega para las bocas
BOCA_ANCHA = (192, 166, 316, 240)               # O y U: tapa también los extremos de la sonrisa de la base
OJOS = (186, 96, 338, 172)                       # parpadeo: ojos y cejas (los ojos de la fuente están en otra posición)


def arr(n):
    return np.array(Image.open(f"{D}/{n}.png").convert("RGBA")).astype(np.float32)


def gris(a):
    return a[:, :, :3].mean(2) * (a[:, :, 3] / 255)


def desplazamiento(base, fuente, caja, r=34):
    x0, y0, x1, y1 = caja
    t = gris(base)[y0:y1, x0:x1]
    g = gris(fuente)
    mejor = (1e18, 0, 0)
    for dy in range(-r, r + 1):
        for dx in range(-r, r + 1):
            if y0 + dy < 0 or x0 + dx < 0 or y1 + dy > g.shape[0] or x1 + dx > g.shape[1]:
                continue
            e = ((g[y0 + dy:y1 + dy, x0 + dx:x1 + dx] - t) ** 2).mean()
            if e < mejor[0]:
                mejor = (e, dx, dy)
    return mejor[1], mejor[2]


def mascara(w, h, feather=5):
    m = Image.new("L", (w, h), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(m).ellipse([feather, feather, w - feather, h - feather], fill=255)
    return np.array(m.filter(ImageFilter.GaussianBlur(feather))).astype(np.float32) / 255


def pegar(base, fuente, region, dx, dy):
    x0, y0, x1, y1 = region
    out = base.copy()
    src = fuente[y0 + dy:y1 + dy, x0 + dx:x1 + dx]
    m = mascara(x1 - x0, y1 - y0)[:, :, None]
    out[y0:y1, x0:x1, :3] = src[:, :, :3] * m + base[y0:y1, x0:x1, :3] * (1 - m)
    return out


base = arr(BASE)
import os
for n, region in [("plano_boca_a", BOCA), ("plano_boca_e", BOCA), ("plano_boca_o", BOCA_ANCHA), ("plano_boca_u", BOCA_ANCHA), ("plano_ojos_cerrados", OJOS)]:
    if not os.path.exists(f"{D}/{n}.png"):
        continue
    f = arr(n)
    pad = 40                                       # margen para que la búsqueda no se salga
    fp = np.zeros((f.shape[0] + 2 * pad, f.shape[1] + 2 * pad, 4), np.float32); fp[pad:-pad, pad:-pad] = f
    bp = np.zeros_like(fp[:base.shape[0] + 2 * pad, :base.shape[1] + 2 * pad]); bp[pad:pad + base.shape[0], pad:pad + base.shape[1]] = base
    sh = lambda c: (c[0] + pad, c[1] + pad, c[2] + pad, c[3] + pad)
    dx, dy = desplazamiento(bp, fp, sh(NARIZ))
    out = pegar(bp, fp, sh(region), dx, dy)[pad:pad + base.shape[0], pad:pad + base.shape[1]]
    out[:, :, 3] = base[:, :, 3]
    destino = "plano_ojos_cerrados" if n == "plano_ojos_cerrados" else n
    Image.fromarray(np.clip(out, 0, 255).astype(np.uint8), "RGBA").save(f"{D}/{destino}.png", optimize=True)
    print(n, "desplazamiento", dx, dy)
