# Sonido IncreaseFit

- `sfx/` 38 efectos (WAV mono, pico a -1,5 dBFS): transiciones, apariciones, aciertos, errores, humor, énfasis, ambiente y sonidos de gimnasio.
- `musica/` 3 bucles sin costura de 8 compases (WAV estéreo, -16 LUFS): `pulso_120` (enérgico), `groove_92` (lo-fi para explicar), `tension_100` (suspense).
- `manifest.json`: categoría, duración, uso y volumen sugerido de cada sonido, y su fuente.

Licencias: 24 efectos vienen del paquete de Kenney (CC0, `licencias/Kenney-CC0.md`); el resto de efectos y la música están sintetizados para IncreaseFit (`scripts/sonido/synth.py`). Nada requiere atribución.

Reglas de uso: la voz manda. Música debajo de la voz a ~0,12 de volumen (ducking) y a ~0,35 en la cola final; un efecto como máximo cada ~1 s, siempre en el frame de la palabra que lo motiva.

Regenerar lo sintetizado: `python3 scripts/sonido/synth.py <carpeta>` y después normalizar como aquí: efectos a pico -1,5 dBFS (`ffmpeg -i x.wav -af volume=<ganancia>dB`) y música a `-af loudnorm=I=-16:TP=-1.5:LRA=9`, siempre en WAV para que los bucles no tengan huecos.
