#!/usr/bin/env python3
"""Añade iconos a icons/ para reforzar el guion con imágenes en vez de texto. Tres colecciones:

  · Lucide (ISC)            nombre tal cual        → icons/brain.svg
  · Tabler outline (MIT)    prefijo tb-            → icons/tb-barbell.svg      (gimnasio, deporte, comida: barbell, treadmill, stretching…)
  · Healthicons (CC0)       prefijo hi-            → icons/hi-lungs.svg        (cuerpo, salud, nutrición: lungs, heart-organ, weights…)

Uso:
  python3 scripts/iconos.py brain tb-barbell hi-lungs   # copia los que falten a icons/
  python3 scripts/iconos.py --buscar sleep              # busca en las tres colecciones (devuelve los nombres con su prefijo)
  python3 scripts/iconos.py --lista                     # los que ya hay en icons/

Descarga los paquetes con `npm pack` (una vez por sesión, en /tmp) y copia los SVG tal cual. Todos se colorean con máscara CSS
(`<Icono>`, `<IconoPop>`): da igual que sean de trazo (Lucide, Tabler) o de relleno (Healthicons).
Catálogos visuales: https://lucide.dev/icons · https://tabler.io/icons · https://healthicons.org
Después, `preparar_video.py` los copia a public/icons/ con el resto.
"""
import subprocess, sys, tarfile, tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DESTINO = RAIZ / "icons"
CACHE = Path(tempfile.gettempdir()) / "iconos-increasefit"
# prefijo → (paquete npm, carpeta de SVG dentro del paquete, ¿subcarpetas por categoría?)
FUENTES = {"": ("lucide-static", "package/icons", False), "tb-": ("@tabler/icons", "package/icons/outline", False),
           "hi-": ("healthicons", "package/public/icons/svg/outline", True)}


def paquete(prefijo):
    npm, sub, _ = FUENTES[prefijo]
    nombre = npm.replace("@", "").replace("/", "-")
    base = CACHE / nombre
    carpeta = base / sub
    if carpeta.is_dir():
        return carpeta
    base.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(["npm", "pack", npm, "--silent"], cwd=base, capture_output=True, text=True)
    tgz = sorted(base.glob("*.tgz"))
    if r.returncode or not tgz:
        raise SystemExit(f"No pude descargar {npm} con npm: {(r.stderr or r.stdout).strip()}")
    with tarfile.open(tgz[-1]) as t:
        miembros = [m for m in t.getmembers() if m.name.startswith(sub + "/") and m.name.endswith(".svg") and ".." not in m.name]
        try:
            t.extractall(base, members=miembros, filter="data")
        except TypeError:                       # Python < 3.12
            t.extractall(base, members=miembros)
    return carpeta


def catalogo(prefijo):
    """{nombre con prefijo: ruta del SVG}"""
    carpeta = paquete(prefijo)
    recursivo = FUENTES[prefijo][2]
    archivos = carpeta.rglob("*.svg") if recursivo else carpeta.glob("*.svg")
    return {f"{prefijo}{f.stem}": f for f in sorted(archivos)}


def fuente_de(nombre):
    for p in ("tb-", "hi-"):
        if nombre.startswith(p):
            return p
    return ""


def main():
    args = sys.argv[1:]
    if not args:
        raise SystemExit(__doc__)
    if args[0] == "--lista":
        print(" ".join(sorted(f.stem for f in DESTINO.glob("*.svg"))))
        return
    if args[0] == "--buscar":
        cats = {p: catalogo(p) for p in FUENTES}
        for q in args[1:]:
            for p, cat in cats.items():
                hallados = [n for n in cat if q.lower() in n[len(p):]]
                etiqueta = {"": "lucide", "tb-": "tabler", "hi-": "health"}[p]
                print(f"{q} · {etiqueta}: " + (" ".join(hallados[:60]) or "(nada)"))
        return
    faltan = [n for n in args if not (DESTINO / f"{n}.svg").exists()]
    if not faltan:
        print("Ya están todos en icons/.")
        return
    cats = {}
    for n in faltan:
        p = fuente_de(n)
        cats.setdefault(p, catalogo(p))
        f = cats[p].get(n)
        if not f:
            print(f"  ✗ {n}: no existe (prueba --buscar {n[len(p):].split('-')[0]})")
            continue
        (DESTINO / f"{n}.svg").write_bytes(f.read_bytes())
        print(f"  ✓ {n}")


if __name__ == "__main__":
    main()
