#!/usr/bin/env python3
"""Prepara el proyecto Remotion de un video a partir de la plantilla.

Uso:
  python3 scripts/preparar_video.py briefs/<BASE>/brief.json [--audio ruta.wav] [--out videos/<BASE>]

Copia plantilla/ (sin node_modules ni out) a la carpeta de salida y deja dentro:
  src/brief.json, src/paletas.json, public/<audio>, public/fonts/css/*, public/{icons,ui,textures,logos}/, logos PNG.
Luego: cd <out> && npm install && npx remotion studio  (o render).
"""
import argparse, json, shutil, sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("brief")
    ap.add_argument("--audio", help="ruta del WAV si no está junto al brief (p. ej. adjunto en el chat)")
    ap.add_argument("--out", help="carpeta del proyecto (por defecto videos/<base>)")
    a = ap.parse_args()
    ruta = Path(a.brief).resolve()
    b = json.loads(ruta.read_text(encoding="utf-8"))
    out = Path(a.out).resolve() if a.out else RAIZ / "videos" / b["base"]
    if out.exists():
        shutil.rmtree(out / "src", ignore_errors=True)
    shutil.copytree(RAIZ / "plantilla", out, dirs_exist_ok=True, ignore=shutil.ignore_patterns("node_modules", "out", "*.log"))
    (out / "src" / "brief.json").write_text(json.dumps(b, ensure_ascii=False, indent=1), encoding="utf-8")
    shutil.copy2(RAIZ / "brand" / "paletas.json", out / "src" / "paletas.json")
    pub = out / "public"
    pub.mkdir(exist_ok=True)
    audio = Path(a.audio) if a.audio else ruta.parent / b.get("audio", "")
    if b.get("audio"):
        if audio.is_file():
            shutil.copy2(audio, pub / b["audio"])
        else:
            print(f"aviso: no encuentro el audio {audio}; búscalo entre los adjuntos y pásalo con --audio", file=sys.stderr)
    for carpeta in ("icons", "ui", "textures", "logos"):
        if (RAIZ / carpeta).is_dir():
            shutil.copytree(RAIZ / carpeta, pub / carpeta, dirs_exist_ok=True)
    for f in b.get("fuentes", []):
        if f.get("css") and (RAIZ / f["css"]).is_file():
            (pub / f["css"]).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(RAIZ / f["css"], pub / f["css"])
    for png in ("logo_increasefit.png", "logo_increasefit_oscuro.png", "isotipo.png"):
        if (RAIZ / png).is_file():
            shutil.copy2(RAIZ / png, pub / png)
    print(f"Proyecto listo en {out}\n  cd {out} && npm install && npx remotion studio")


if __name__ == "__main__":
    main()
