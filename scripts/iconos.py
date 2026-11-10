#!/usr/bin/env python3
"""Añade iconos de Lucide (ISC) a icons/ para reforzar el guion con imágenes en vez de texto.

Uso:
  python3 scripts/iconos.py brain syringe users        # copia los que falten a icons/
  python3 scripts/iconos.py --buscar sleep              # lista los nombres de Lucide que contienen "sleep"
  python3 scripts/iconos.py --lista                     # los que ya hay en icons/

Descarga el paquete lucide-static con `npm pack` (una vez por sesión, en /tmp) y copia los SVG tal cual
(stroke="currentColor": se colorean con máscara CSS, `<Icono>` o `<IconoPop>`). Catálogo visual: https://lucide.dev/icons
Después, `preparar_video.py` los copia a public/icons/ con el resto.
"""
import shutil, subprocess, sys, tarfile, tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "icons"
CACHE = Path(tempfile.gettempdir()) / "lucide-static"


def paquete():
    carpeta = CACHE / "package" / "icons"
    if carpeta.is_dir():
        return carpeta
    CACHE.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(["npm", "pack", "lucide-static", "--silent"], cwd=CACHE, capture_output=True, text=True)
    tgz = sorted(CACHE.glob("lucide-static-*.tgz"))
    if r.returncode or not tgz:
        raise SystemExit(f"No pude descargar lucide-static con npm: {(r.stderr or r.stdout).strip()}")
    with tarfile.open(tgz[-1]) as t:
        miembros = [m for m in t.getmembers() if m.name.startswith("package/icons/") and m.name.endswith(".svg") and ".." not in m.name]
        try:
            t.extractall(CACHE, members=miembros, filter="data")
        except TypeError:                       # Python < 3.12
            t.extractall(CACHE, members=miembros)
    return carpeta


def main():
    args = sys.argv[1:]
    if not args:
        raise SystemExit(__doc__)
    if args[0] == "--lista":
        print(" ".join(sorted(f.stem for f in DESTINO.glob("*.svg"))))
        return
    if args[0] == "--buscar":
        nombres = sorted(f.stem for f in paquete().glob("*.svg"))
        for q in args[1:]:
            print(f"{q}: " + (" ".join(n for n in nombres if q.lower() in n) or "(nada)"))
        return
    faltan = [n for n in args if not (DESTINO / f"{n}.svg").exists()]
    if not faltan:
        print("Ya están todos en icons/.")
        return
    origen = paquete()
    for n in faltan:
        f = origen / f"{n}.svg"
        if not f.is_file():
            print(f"  ✗ {n}: no existe en Lucide (prueba --buscar {n.split('-')[0]})")
            continue
        shutil.copy2(f, DESTINO / f.name)
        print(f"  ✓ icons/{f.name}")


if __name__ == "__main__":
    main()
