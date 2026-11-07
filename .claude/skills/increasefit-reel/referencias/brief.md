# brief.json (versión 2, por planos)

Lo deja el notebook en `briefs/<BASE>/` junto a la locución. `preparar_video.py` lo copia a `src/brief.json` y `src/marco/datos.ts` lo tipa (`brief`, `planoEn(frame)`, `frameDePalabra(plano, palabra)`, `climaDe(id)`). **No copies números a mano.**

```jsonc
{
  "version": 2, "marca": "increasefit", "base": "05_pov_1107-1259", "audio": "05_pov_1107-1259_locucion.wav",
  "video": { "width": 1080, "height": 1920, "fps": 30, "frames": 1464, "voz_s": 45.8, "cola_s": 3.0 },
  "serie_header": "ENTRENA MEJOR",            // junto al isotipo, arriba
  "formato": "pov",                           // n_errores | mito_realidad | pov | esto_vs_esto | checklist | ciencia_20s | progresion → formatos.md
  "musica": "groove_92",                      // id de sonido/manifest.json (bucle bajo la voz)
  "tema": { "id": 5, "titulo": "Descanso entre series", "tesis": "..." },
  "aprendizaje": "la única idea que se lleva el espectador",
  "gancho": { "texto": "...", "tipo": "numero", "alternativas": ["..."] },
  "fuente_en_pantalla": "Schoenfeld et al. 2016",   // si el guion cita un dato
  "datos_citados": [{ "dato": "...", "fuente": "...", "corta": "...", "url": "..." }],
  "notas_direccion": "",
  "logos": { "increasefit": true, "oscuro": true, "isotipo": true },
  "fuentes": [{ "rol": "titulos|mono|mano", "familia": "...", "css": "fonts/css/...", "stack": "...", "pesos": [400, 700] }],
  "ficha_tecnica": { "ejercicios": [{ "sprite": "ejercicio:sentadilla", "nombre": "...", "rol": "principal" }],
                     "prescripcion": {}, "cues": [], "errores": [], "progresion_ejemplo": [{ "semana": 1, "kg": 60, "reps": 8 }], "vocabulario": [] },
  "opciones": { "barra_progreso": false },
  "planos": [{
    "id": "p01", "bloque": "gancho",          // bloque: agrupa planos; al cambiar de bloque hay cortinilla de pincel + whoosh
    "ini_f": 0, "fin_f": 148, "ini_s": 0.0, "fin_s": 4.93,   // contiguos y exactos
    "voz": "la frase que suena", "palabras": [0, 11],
    "pantalla": { "texto": "POV: tu descanso", "estilo": "nota" },   // titular ("línea 1 / línea 2") | nota | capitulo | ninguno
    "enfasis": ["scroll"],                    // palabras de la voz: subtítulo grande + punch-in de cámara
    "clima": "hierro",
    "visual": { "sprite": "gesto_celular", "anim": "pop", "encuadre": "general", "posicion": "centro", "espejo": false,
                "sprite_b": null, "inserto": null },
    "overlays": [{ "tipo": "rec", "palabra": "descanso", "palabra_f": 13 }]   // palabra_f = frame GLOBAL en que aparece
  }],
  "tarjeta_resumen": { "titulo": "...", "lineas": ["..."], "ini_f": 1376 },   // aparece al acabar la voz
  "sfx": [{ "id": "notificacion", "frame": 126, "volumen": 0.5 }],          // frames GLOBALES
  "subtitulos": [["Tu", 0.12, 0.33], ...],   // palabras del GUION con tiempos de la voz → subtítulos
  "palabras": [["Tu", 0.12, 0.33], ...]      // salida cruda de Whisper (referencia)
}
```

## Reglas de lectura
- `visual.sprite` es un id de `mascota/manifest.json` o `"ejercicio:<nombre>"` (alterna sus fases). `inserto` es una `cara_*`. `sprite_b` activa la pantalla dividida ASÍ NO / ASÍ SÍ.
- Overlays y sus campos: ver `layout_y_planos.md`. Si un overlay no trae `palabra_f`, aparece 6 frames después del inicio del plano.
- Subtítulos desde `subtitulos`, nunca desde `palabras`.
