#!/usr/bin/env python3
"""Calcula dónde caen los golpes (beats) de cada pista de sonido/musica y lo guarda en sonido/manifest.json
(`fase_s` = segundo del primer golpe; con `bpm` da la rejilla entera). Con eso, `sincronizar.py` puede mover cada corte de
escena unos frames para que caiga en un golpe de la música (escaleta → "opciones": {"cortes_a_ritmo": true}).

Uso:
  python3 scripts/beats.py            # todas las pistas sin fase_s
  python3 scripts/beats.py --forzar   # todas
Necesita ffmpeg y numpy. Si una pista no trae `bpm`, lo estima (70-180 BPM).
"""
import json, subprocess, sys
from pathlib import Path
import numpy as np

RAIZ = Path(__file__).resolve().parent.parent
MAN = RAIZ / "sonido" / "manifest.json"
SR, HOP, N = 22050, 256, 1024


def envolvente(ruta, max_s=60):
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", str(ruta), "-t", str(max_s), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         capture_output=True, check=True).stdout
    x = np.frombuffer(pcm, dtype=np.float32)
    if len(x) < N * 4:
        raise ValueError("pista demasiado corta")
    marcos = np.lib.stride_tricks.sliding_window_view(x, N)[::HOP] * np.hanning(N)
    mag = np.log1p(np.abs(np.fft.rfft(marcos, axis=1)))
    flujo = np.maximum(0, np.diff(mag, axis=0)).sum(axis=1)       # flujo espectral: sube en cada ataque
    flujo -= np.convolve(flujo, np.ones(16) / 16, mode="same")     # quita la tendencia
    return np.maximum(0, flujo)


def estimar_bpm(env):
    fps = SR / HOP
    ac = np.correlate(env, env, mode="full")[len(env) - 1:]
    lags = np.arange(len(ac))
    bpm = 60 * fps / np.maximum(lags, 1)
    ok = (bpm >= 70) & (bpm <= 180)
    return float(bpm[ok][np.argmax(ac[ok])])


def fase(env, bpm):
    """Desfase (s) de la rejilla de golpes que más energía de ataque recoge."""
    fps = SR / HOP
    periodo = 60 * fps / bpm
    mejores = []
    for p in np.arange(0, periodo, 0.25):
        idx = np.round(np.arange(p, len(env) - 1, periodo)).astype(int)
        mejores.append((env[idx].mean(), p))
    _, p = max(mejores)
    return round(float(p / fps), 3)


def main():
    forzar = "--forzar" in sys.argv
    man = json.loads(MAN.read_text(encoding="utf-8"))
    for m in man.get("musica") or []:
        if m.get("fase_s") is not None and not forzar:
            continue
        ruta = RAIZ / "sonido" / m["archivo"]
        try:
            env = envolvente(ruta)
        except Exception as e:
            print(f"  ⚠️ {m['id']}: {e}")
            continue
        if not m.get("bpm"):
            m["bpm"] = round(estimar_bpm(env))
            m["bpm_estimado"] = True
        m["fase_s"] = fase(env, float(m["bpm"]))
        print(f"  {m['id']:<12} {m['bpm']:>5} BPM · primer golpe en {m['fase_s']:.3f} s")
    MAN.write_text(json.dumps(man, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")


if __name__ == "__main__":
    main()
