#!/usr/bin/env python3
"""Prepara (o actualiza) el proyecto Remotion de un Reel a partir de su carpeta en briefs/.

Uso:
  python3 scripts/preparar_video.py briefs/<BASE> [--audio ruta.wav] [--out videos/<BASE>]

1. Alinea el guion con la voz si falta subtitulos.json (scripts/alinear.py).
2. Valida la escaleta (scripts/validar_render.py): si hay errores, para.
3. Sincroniza: anclas de palabra → frames (scripts/sincronizar.py).
4. Copia plantilla/ a videos/<BASE>/ (conserva node_modules y out/) y deja dentro:
   src/video.json, src/paletas.json, src/mascota.json, src/sonido.json,
   src/escenas/custom/ (los .tsx de briefs/<BASE>/custom/ + su índice),
   public/locucion.wav, sprites, kit, sonido, fuentes, iconos, ui, texturas y logos.
Se puede repetir tantas veces como haga falta: lo que escribe Claude vive en briefs/<BASE>/ (escaleta.json y custom/).
Luego: cd videos/<BASE> && npm install (la primera vez) && npm run stills / npx remotion render ...
"""
import argparse, json, re, shutil, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import sincronizar as S
import validar_render as V

RAIZ = S.RAIZ


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("base", help="carpeta briefs/<BASE> con guion.txt, palabras.json, locucion.wav y escaleta.json")
    ap.add_argument("--audio", help="ruta del WAV si no está en la carpeta (p. ej. adjunto en el chat)")
    ap.add_argument("--out", help="carpeta del proyecto (por defecto videos/<BASE>)")
    a = ap.parse_args()
    d = Path(a.base).resolve()
    err, avisos = V.validar(d)
    for x in avisos:
        print(f"  aviso: {x}")
    if err:
        print("ERRORES (corrige la escaleta y vuelve a ejecutar):\n - " + "\n - ".join(err))
        sys.exit(1)
    video = S.sincronizar(d)
    out = Path(a.out).resolve() if a.out else RAIZ / "videos" / d.name
    shutil.rmtree(out / "src", ignore_errors=True)
    shutil.copytree(RAIZ / "plantilla", out, dirs_exist_ok=True, ignore=shutil.ignore_patterns("node_modules", "out", "*.log"))
    src, pub = out / "src", out / "public"
    pub.mkdir(exist_ok=True)
    (src / "video.json").write_text(json.dumps(video, ensure_ascii=False, indent=1), encoding="utf-8")
    shutil.copy2(RAIZ / "brand" / "paletas.json", src / "paletas.json")
    shutil.copy2(RAIZ / "mascota" / "manifest.json", src / "mascota.json")
    shutil.copy2(RAIZ / "sonido" / "manifest.json", src / "sonido.json")

    # escenas a medida: briefs/<BASE>/custom/<nombre>.tsx → src/escenas/custom/ + índice generado
    custom = src / "escenas" / "custom"
    custom.mkdir(parents=True, exist_ok=True)
    nombres = []
    for f in sorted((d / "custom").glob("*.tsx")) if (d / "custom").is_dir() else []:
        if not re.fullmatch(r"[a-z][a-z0-9_]*", f.stem):
            print(f"  aviso: custom/{f.name} ignorado (nombre en minúsculas, números y _)")
            continue
        shutil.copy2(f, custom / f.name)
        nombres.append(f.stem)
    indice = ["// Generado por scripts/preparar_video.py desde briefs/<BASE>/custom/. No lo edites aquí.",
              'import type React from "react";', 'import type { Escena } from "../../marco/datos";', 'import type { C } from "../../marco/clima";']
    indice += [f'import C_{n} from "./{n}";' for n in nombres]
    indice.append("export const CUSTOM: Record<string, React.FC<{ e: Escena; c: C }>> = {" + ", ".join(f"{n}: C_{n}" for n in nombres) + "};")
    (custom / "index.ts").write_text("\n".join(indice) + "\n", encoding="utf-8")

    audio = Path(a.audio) if a.audio else d / "locucion.wav"
    if audio.is_file():
        shutil.copy2(audio, pub / "locucion.wav")
    else:
        print(f"aviso: no encuentro el audio {audio}; búscalo entre los adjuntos y pásalo con --audio", file=sys.stderr)
    copias = {"mascota/sprites": "mascota/sprites", "kit": "kit", "sonido/sfx": "sonido/sfx", "sonido/musica": "sonido/musica",
              "icons": "icons", "ui": "ui", "textures": "textures"}
    for origen, destino in copias.items():
        if (RAIZ / origen).is_dir():
            shutil.copytree(RAIZ / origen, pub / destino, dirs_exist_ok=True)
    for f in video["fuentes"]:
        if f.get("css") and (RAIZ / f["css"]).is_file():
            (pub / f["css"]).parent.mkdir(parents=True, exist_ok=True)
            shutil.copy2(RAIZ / f["css"], pub / f["css"])
    for png in ("logo_increasefit.png", "logo_increasefit_oscuro.png", "isotipo.png"):
        if (RAIZ / png).is_file():
            shutil.copy2(RAIZ / png, pub / png)
    print(f"Proyecto listo en {out} · {video['video']['frames']} frames · {len(video['escenas'])} escenas · {len(nombres)} componentes a medida")
    print(f"  cd {out} && npm install && npm run stills")


if __name__ == "__main__":
    main()
