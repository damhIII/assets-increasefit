# escaleta.json (versión 3)

La escribes tú en `briefs/<BASE>/escaleta.json`. Describe las escenas ancladas a **palabras del guion** (los índices `[n]` que imprime `scripts/alinear.py`); `preparar_video.py` la valida, la convierte en frames (`src/video.json`) y la plantilla la dibuja. No escribas frames a mano salvo `desfase_f`.

```jsonc
{
  "version": 3,
  "serie_header": "PROGRESO REAL",      // 2-4 palabras junto al isotipo, arriba
  "musica": "groove_92",                // id de sonido/manifest.json: pulso_120 (enérgico) · groove_92 (explicar) · tension_100 (suspense) · null = sin música
  "cola_s": 3.0,                        // segundos tras la última palabra (la tarjeta resumen se queda para leerla)
  "opciones": { "barra_progreso": false },
  "progresion": [                       // opcional: semanas ILUSTRATIVAS para las anotaciones libreta y grafica
    { "semana": 1, "kg": 60, "reps": 8 }, { "semana": 2, "kg": 60, "reps": 10 }
  ],
  "escenas": [
    {
      "id": "gancho",                   // único, minúsculas/números/_ (nombra la Sequence y los stills)
      "desde": 0,                       // índice de palabra donde empieza; la primera escena SIEMPRE 0; estrictamente creciente
      "desfase_f": -3,                  // opcional: adelanta (−) o retrasa (+) el corte unos frames respecto a esa palabra
      "transicion": "corte",            // corte (seco) | pincel (cortinilla de pincel + whoosh al entrar)
      "clima": "hierro",                // brand/paletas.json → climas (por defecto hierro)
      "pantalla": { "texto": "6 meses / mismos kilos", "estilo": "titular" },   // titular | nota | capitulo | ninguno
      "enfasis": [6],                   // índices de palabra: subtítulo grande en cian + punch-in de cámara en la primera
      "mascota": { "sprite": "ejercicio:sentadilla", "anim": "pop", "encuadre": "general", "posicion": "centro", "espejo": false },
      "dividida": null,                 // { "no": "<sprite así no>", "si": "<sprite así sí>" } → pantalla dividida (sustituye a mascota)
      "inserto": { "cara": "cara_esceptico", "en": 13 },     // cara_* en un círculo (reacción)
      "anotaciones": [ { "tipo": "etiqueta", "texto": "60 kg. otra vez.", "apunta": "manos", "en": 6 } ],
      "sfx": [ { "id": "golpe_metal", "en": 6 } ],          // "volumen" opcional (por defecto el sugerido del catálogo)
      "componente": null,               // nombre de briefs/<BASE>/custom/<nombre>.tsx (se dibuja encima)
      "solo_componente": false          // true = solo el componente, sin la composición por defecto
    }
  ],
  "tarjeta_resumen": { "titulo": "Gánale a tu libreta", "lineas": ["Anota peso y reps", "+1 rep o +2,5 kg"] }   // "desde" opcional; por defecto al acabar la voz
}
```

## Reglas de lectura
- Cada escena dura desde su `desde` hasta el `desde` de la siguiente; la última hasta el final (la cola incluida, con la tarjeta encima).
- `en` (anotaciones, inserto, sfx) es el índice de la palabra en que aparece o suena. Sin `en`: al empezar la escena (+6 frames, escalonado). Los whoosh se adelantan 5 frames solos.
- `mascota.sprite`: id de `mascota/manifest.json` o `"ejercicio:<nombre>"` (alterna sus fases; `anim` pasa a `ejercicio`). Sin `mascota` ni `dividida`, la escena no tiene personaje (útil con `capitulo` o con un componente).
- Con una anotación de columna (`dato`, `lista`, `libreta`, `grafica`), la mascota se coloca sola a la derecha en encuadre general.
- `pantalla.estilo = "capitulo"` es una tarjeta a pantalla completa (`"RÓTULO: frase"`) y oculta la mascota de esa escena.
- Si dos escenas seguidas tienen el mismo sprite, encuadre y posición, la segunda no repite la entrada (continuidad).

## Anotaciones
| tipo | campos | notas |
|---|---|---|
| etiqueta | texto (≤3 palabras), apunta | a mano con flecha hasta cabeza / manos / pies / centro |
| tachado | texto (≤4 palabras) | caja blanca que se tacha en rojo |
| circulo | apunta | rotulador cian alrededor de la zona |
| check / cruz | – | marca verde / roja junto a la cabeza |
| burbuja_pensamiento | sprite | nube con un sprite dentro |
| burbuja_dialogo | texto (≤6 palabras) | lo que dice la mascota (no repite la voz) |
| dato | texto (la cifra), detalle, fuente \| ilustrativo | `fuente` = `corta` de `editorial/datos_verificados.json` (obligatoria si es de un estudio); si es un ejemplo, `"ilustrativo": true` |
| lista | items (2-5, ≤5 palabras) | checklist que se marca a lo largo de la escena |
| libreta | texto (título) | usa `progresion`; rotula EJEMPLO ILUSTRATIVO |
| grafica | – | usa `progresion`; rotula EJEMPLO ILUSTRATIVO |
| rec | – | marco de cámara del celular grabando |
| lineas_velocidad, enfoque | – | detrás de la mascota |
| impacto, sudor, destello | – | junto a la cabeza |

## Lo que comprueba el validador (`scripts/validar_render.py`)
Ids, anclas dentro del guion y crecientes, sprites/caras/climas/sfx/música existentes, componentes que existen, `dato` con fuente verificada o ilustrativo, `progresion` si hay libreta o gráfica, tarjeta con 2-5 líneas, nada que suene a CTA, escenas de al menos 8 frames. Avisa (sin bloquear) de las cifras en pantalla para que confirmes su origen y de escenas demasiado cortas o largas.
