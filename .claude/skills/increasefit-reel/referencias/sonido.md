# Sonido

Todo en `sonido/` (catálogo en `sonido/manifest.json`, copiado a `src/sonido.json`).

- **Voz**: `locucion.wav`, la única pista que no se toca: ni recortes ni cambios de velocidad.
- **Música**: `escaleta.musica`. Bucles propios (`pulso_120` enérgico, `groove_92` para explicar, `tension_100` suspense) y pistas descargadas (`mx_*`, `bucle: false`, ya recortadas a ~75 s con fundido: mira su `uso` y `bpm` en el catálogo). Ducking automático: `volumen_bajo_voz` (~0,12) mientras hay voz y `volumen_sin_voz` (~0,35) en los huecos y la cola; fundido final de 20 frames.
- **Efectos**: `sfx` de cada escena (`id` + `en` = índice de la palabra; `volumen` opcional). Además la plantilla añade un `whoosh_corto` en cada escena con `transicion: "pincel"` si no hay ya un efecto pegado.

## Al añadir efectos
- En la palabra que lo motiva (`en`); los whoosh se adelantan 5 frames solos.
- Como mucho un efecto cada ~1 s. El silencio también remata: no pongas efecto en todas las escenas.
- Usa los ids del catálogo (categorías: transicion, aparicion, acierto, error, humor, enfasis, ambiente, gym) y su `volumen_sugerido`.
