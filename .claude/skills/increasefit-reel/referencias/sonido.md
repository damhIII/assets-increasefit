# Sonido

Todo en `sonido/` (catálogo en `sonido/manifest.json`, copiado a `src/sonido.json`).

- **Voz**: `brief.audio`, la única pista que no se toca: ni recortes ni cambios de velocidad.
- **Música**: `brief.musica` en bucle (`pulso_120` enérgico, `groove_92` para explicar, `tension_100` suspense). Ducking automático: `volumen_bajo_voz` (~0,12) mientras hay voz y `volumen_sin_voz` (~0,35) en los huecos y la cola; fundido final de 20 frames.
- **Efectos**: `brief.sfx` (id, frame global, volumen). Además la plantilla añade un `whoosh_corto` en cada cambio de bloque (con la cortinilla) si no hay ya un efecto pegado.

## Al añadir efectos
- En el frame de la palabra que lo motiva (`frameDePalabra`), 1-5 frames antes si es un whoosh.
- Como mucho un efecto cada ~1 s. El silencio también remata: no pongas efecto en todos los planos.
- Usa los ids del catálogo (categorías: transicion, aparicion, acierto, error, humor, enfasis, ambiente, gym) y su `volumen_sugerido`.
