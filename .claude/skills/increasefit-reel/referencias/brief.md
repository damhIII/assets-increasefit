# brief.json — lo que manda el notebook de Colab

Todo lo que varía de un video a otro llega aquí; lo fijo (marca, layout, Rep, técnica) está en las otras referencias. `preparar_video.py` lo deja en `src/brief.json` y `src/marco/datos.ts` lo tipa y lo exporta (`brief`, `bloque(id)`, `climaDe(id)`). **No copies números a mano.**

```jsonc
{
  "version": 1, "marca": "increasefit",
  "base": "01-1_progreso_1106-1206",          // nombre base de los archivos (tema-variante_cta_fecha)
  "audio": "01-1_progreso_1106-1206_locucion.wav",
  "video": { "width": 1080, "height": 1920, "fps": 30, "frames": 1721, "voz_s": 55.8, "cola_s": 1.5 },
  "serie_header": "PROGRESO REAL",            // sección fija del header (junto al isotipo)
  "cta": "PROGRESO", "cta_con_entrega": false, // true = el usuario sí envía algo a quien comenta
  "plantilla": "progresion",                  // estandar | mito_realidad | comparacion | replay | dato | progresion | rutina → plantillas.md
  "logos": { "increasefit": true, "oscuro": true, "isotipo": true },  // false = PNG ausente: wordmark de texto
  "tema": { "id": 1, "variante": 1, "titulo": "...", "tesis": "...", "gancho": "...", "metodo": "...", "movimiento": "sentadilla" },
  "fuente_en_pantalla": "",                   // fuente corta si el guion cita un dato
  "datos_citados": [{ "dato": "...", "fuente": "...", "corta": "..." }],   // solo datos verificados del catálogo
  "notas_direccion": "",                      // indicación del usuario para este video: manda sobre tu criterio
  "climas": { "gancho": "hierro", "error": "esfuerzo", "por_que": "libreta", "metodo": "hierro", "resultado": "progreso", "cta": "hierro" },
  "fuentes": [{ "rol": "titulos", "familia": "Open Sans", "css": "fonts/css/open_sans__400-600-700-800.css", "stack": "\"Open Sans\", sans-serif" },
              { "rol": "mono", "familia": "JetBrains Mono", "css": "fonts/css/jetbrains_mono__500-700.css", "stack": "\"JetBrains Mono\", monospace" }],
  "ficha_tecnica": {
    "ejercicios": [{ "movimiento": "sentadilla", "nombre": "sentadilla con barra", "rol": "principal" }],  // rol: principal | error | apoyo
    "musculos": ["cuadriceps", "gluteo"],     // ids del mapa muscular de Rep
    "prescripcion": { "series": "3-4", "reps": "6-10", "rir": "1-2", "descanso": "2-3 min", "frecuencia": "2 veces por semana" },
    "cues": ["..."], "errores": ["..."],
    "progresion_ejemplo": [{ "semana": 1, "kg": 60, "reps": 8 }, ...],   // ILUSTRATIVA: rotúlala siempre así
    "vocabulario": ["..."]
  },
  "bloques": [
    { "id": "gancho", "ini_f": 0, "fin_f": 211, "ini_s": 0.0, "fin_s": 7.02,
      "titular": ["línea 1", "línea 2"], "texto": "lo que se locuta", "palabras": [0, 15],
      "visual": { "rep": "sentadilla", "gesto": "", "idea": "el gag o la escena en una frase" } },
    { "id": "metodo", "...": "...", "pasos": ["Anota cada serie", "..."], "pasos_f": [954, null, 1189, 1227] }
  ],
  "subtitulos": [["Llevas", 0.15, 0.59], ...],   // palabras del GUION con tiempos de la voz → subtítulos
  "palabras": [["Llevas", 0.15, 0.59], ...]      // salida cruda de Whisper (referencia)
}
```

## Reglas de lectura
- Los rangos `ini_f`–`fin_f` son exactos y contiguos; `video.frames` es la duración.
- `pasos_f` es orientativo; si un valor es `null`, la escena por defecto lo reparte (y mantiene el orden).
- `visual.rep` y `ficha_tecnica.ejercicios[].movimiento` son ids de `plantilla/src/rep/movimientos.json` (los valida `validar_brief.py`). `visual.idea` es una propuesta: mejórala si se te ocurre un gag mejor que cuente lo mismo.
- Subtítulos desde `subtitulos`, nunca desde `palabras`.
