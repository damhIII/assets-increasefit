#!/usr/bin/env python3
"""Regenera las hojas de contactos que Claude mira antes de diseñar: icons/contactos.png y fondos/contactos.png.

Uso:
  python3 scripts/contactos.py            # las dos
  python3 scripts/contactos.py iconos     # solo icons/contactos.png
  python3 scripts/contactos.py fondos     # solo fondos/contactos.png

Necesita rsvg-convert (apt install librsvg2-bin) o cairosvg (pip install cairosvg) y Pillow.
Ejecútalo después de `scripts/iconos.py` o `scripts/fondos.py` para que la vista previa no se quede vieja.
"""
import io, json, re, shutil, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

RAIZ = Path(__file__).resolve().parent.parent
FONDO = (22, 22, 22)


def _svg_png(svg: str, w: int, h: int) -> Image.Image:
    """SVG (texto) → PNG RGBA de w×h. rsvg-convert si está; si no, cairosvg."""
    if shutil.which("rsvg-convert"):
        r = subprocess.run(["rsvg-convert", "-w", str(w), "-h", str(h), "-f", "png"], input=svg.encode(), capture_output=True)
        if r.returncode == 0:
            return Image.open(io.BytesIO(r.stdout)).convert("RGBA")
    try:
        import cairosvg
    except ImportError:
        raise SystemExit("Falta un rasterizador de SVG: apt install librsvg2-bin  (o pip install cairosvg)")
    return Image.open(io.BytesIO(cairosvg.svg2png(bytestring=svg.encode(), output_width=w, output_height=h))).convert("RGBA")


def _blanco(svg: str) -> str:
    """Iconos de trazo (currentColor) o de relleno (negro por defecto) → blanco."""
    svg = svg.replace("currentColor", "#FFFFFF")
    svg = re.sub(r'(fill|stroke)="#(000|000000|333|333333)"', r'\1="#FFFFFF"', svg)
    m = re.search(r"<svg\b[^>]*>", svg)
    if m and "fill=" not in m.group(0) and "stroke=" not in m.group(0):
        svg = svg[:m.start()] + '<svg fill="#FFFFFF"' + svg[m.start() + 4:]
    return svg


def _fuente(t):
    for f in ("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf"):
        if Path(f).exists():
            return ImageFont.truetype(f, t)
    return ImageFont.load_default()


def hoja(items, celda=(150, 176), lado=84, cols=12, salida=None):
    """items = [(nombre, imagen RGBA)] → hoja con el nombre debajo de cada miniatura."""
    filas = (len(items) + cols - 1) // cols
    W, H = cols * celda[0], filas * celda[1]
    im = Image.new("RGB", (W, H), FONDO)
    d = ImageDraw.Draw(im)
    fuente = _fuente(13)
    for i, (nombre, png) in enumerate(items):
        x0, y0 = (i % cols) * celda[0], (i // cols) * celda[1]
        png = png.copy()
        png.thumbnail((lado, lado) if png.width <= png.height * 1.2 else (celda[0] - 16, lado))
        im.paste(png, (x0 + (celda[0] - png.width) // 2, y0 + 18 + (lado - png.height) // 2), png)
        txt = nombre if len(nombre) <= 20 else nombre[:19] + "…"
        tw = d.textlength(txt, font=fuente)
        d.text((x0 + (celda[0] - tw) / 2, y0 + celda[1] - 40), txt, fill=(200, 200, 200), font=fuente)
    im.save(salida, optimize=True)
    print(f"{salida.relative_to(RAIZ)} · {len(items)} piezas")


def iconos():
    items = []
    for f in sorted((RAIZ / "icons").glob("*.svg")):
        items.append((f.stem, _svg_png(_blanco(f.read_text(encoding="utf-8")), 168, 168)))
    hoja(items, salida=RAIZ / "icons" / "contactos.png")


def fondos():
    man = json.loads((RAIZ / "fondos" / "manifest.json").read_text(encoding="utf-8"))
    items = []
    for x in man.get("fondos") or []:
        f = RAIZ / x["archivo"]
        if f.suffix != ".svg" or not f.exists():
            continue
        png = _svg_png(f.read_text(encoding="utf-8"), 216, 384)
        fondo = Image.new("RGBA", png.size, (40, 40, 40, 255))
        fondo.alpha_composite(png)
        items.append((x["id"], fondo))
    hoja(items, celda=(240, 440), lado=384, cols=6, salida=RAIZ / "fondos" / "contactos.png")


if __name__ == "__main__":
    que = sys.argv[1:] or ["iconos", "fondos"]
    if "iconos" in que:
        iconos()
    if "fondos" in que:
        fondos()
