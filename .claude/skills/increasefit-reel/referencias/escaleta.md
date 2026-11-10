# escaleta.json (versión 4)

La escribes tú en `briefs/<BASE>/escaleta.json`. Describe las escenas ancladas a **palabras del guion** (los índices `[n]` que imprime `scripts/alinear.py`); `preparar_video.py` la valida, la convierte en frames (`src/video.json`) y la plantilla la dibuja. No escribas frames a mano salvo `desfase_f`.

```jsonc
{
  "version": 4,
  "serie_header": "PROGRESO REAL",      // 2-4 palabras junto al isotipo, arriba
  "musica": "groove_92",                // id de sonido/manifest.json: pulso_120 (enérgico) · groove_92 (explicar) · tension_100 (suspense) · null = sin música
  "cola_s": 3.0,                        // segundos tras la última palabra (la tarjeta resumen se queda para leerla)
  "opciones": { "barra_progreso": false },
  "subtitulos": {                       // cómo se pintan los subtítulos (ya salen SIN signos de puntuación, 1-3 palabras)
    "tonos": { "alerta": [41, 42], "exito": [88] },        // índices de palabra: rojo = el error o la trampa, verde = lo correcto (pocas)
    "iconos": [ { "en": 12, "icono": "brain" } ]           // insignia con icono que salta sobre esa palabra al decirla (3-6 por video)
  },
  "progresion": [                       // opcional: semanas ILUSTRATIVAS para las anotaciones libreta y grafica
    { "semana": 1, "kg": 60, "reps": 8 }, { "semana": 2, "kg": 60, "reps": 10 }
  ],
  "escenas": [
    {
      "id": "gancho",                   // único, minúsculas/números/_ (nombra la Sequence y los stills)
      "desde": 0,                       // índice de palabra donde empieza; la primera escena SIEMPRE 0; estrictamente creciente
      "desfase_f": -3,                  // opcional: adelanta (−) o retrasa (+) el corte unos frames respecto a esa palabra
      "transicion": "corte",            // corte (seco) | pincel (cortinilla de pincel + whoosh al entrar)
      "clima": "negro",                 // brand/paletas.json → climas: negro (base), azul, papel, acero
      "pantalla": { "texto": "¿Creatina / para el ánimo?", "estilo": "titular" },   // titular | nota | capitulo | ninguno (lo normal: ninguno)
      "enfasis": [6],                   // índices de palabra: subtítulo grande en azul + punch-in de cámara en la primera
      "mascota": { "sprite": "ejercicio:sentadilla", "anim": "pop", "encuadre": "general", "posicion": "centro", "espejo": false },
      "dividida": null,                 // { "no": "<sprite así no>", "si": "<sprite así sí>" } → pantalla dividida (sustituye a mascota)
      "inserto": { "cara": "cara_esceptico", "en": 13 },     // cara_* en un círculo (reacción)
      "anotaciones": [ { "tipo": "icono", "icono": "brain", "en": 3 }, { "tipo": "etiqueta", "texto": "otra vez", "apunta": "manos", "en": 6 } ],
      "sfx": [ { "id": "golpe_metal", "en": 6 } ],          // "volumen" opcional (por defecto el sugerido del catálogo)
      "componente": null,               // nombre de briefs/<BASE>/custom/<nombre>.tsx (se dibuja encima)
      "solo_componente": false          // true = solo el componente, sin la composición por defecto
    }
  ],
  "tarjeta_resumen": { "titulo": "Gánale a tu libreta", "lineas": ["Anota peso y reps", "+1 rep o +2,5 kg"] }   // título ≤5 palabras, 2-3 líneas ≤6; "desde" opcional
}
```

## Reglas de lectura
- Cada escena dura desde su `desde` hasta el `desde` de la siguiente; la última hasta el final (la cola incluida, con la tarjeta encima).
- `en` (anotaciones, inserto, sfx) es el índice de la palabra en que aparece o suena. Sin `en`: al empezar la escena (+6 frames, escalonado). Los whoosh se adelantan 5 frames solos.
- `subtitulos`: el texto sale del guion sin signos de puntuación (`¿En serio?` → EN SERIO), agrupado en 1-3 palabras; cambia de grupo en cada fin de frase, coma o pausa de la voz. La palabra que suena se enciende sobre una píldora (azul, o el color de su tono); las de `enfasis` de cualquier escena son más grandes y se quedan en azul; las de `tonos` se quedan en rojo o verde. Un icono de `iconos` sale en una insignia redonda sobre su palabra.
- `mascota.sprite`: id de `mascota/manifest.json` o `"ejercicio:<nombre>"` (alterna sus fases; `anim` pasa a `ejercicio`). Sin `mascota` ni `dividida`, la escena no tiene personaje (útil con `capitulo` o con un componente).
- Con una anotación de columna (`dato`, `ficha`, `lista`, `libreta`, `grafica`), la mascota se coloca sola a la derecha en encuadre general.
- `pantalla.estilo = "capitulo"` es una tarjeta a pantalla completa (`"RÓTULO: frase"`) y oculta la mascota de esa escena.
- Si dos escenas seguidas tienen el mismo sprite, encuadre y posición, la segunda no repite la entrada (continuidad).

## Anotaciones
| tipo | campos | notas |
|---|---|---|
| etiqueta | texto (≤2 palabras), apunta | a mano con flecha hasta cabeza / manos / pies / centro |
| tachado | texto (≤3 palabras) | caja blanca que se tacha en rojo |
| circulo | apunta | rotulador en el foco del clima alrededor de la zona |
| check / cruz | – | marca verde / roja junto a la cabeza |
| burbuja_pensamiento | sprite | nube con un sprite dentro |
| burbuja_dialogo | texto (≤4 palabras) | lo que dice la mascota (no repite la voz) |
| icono | icono, tono?, tachado?, apunta? | icono de `icons/` en una insignia que salta y flota; `tono`: foco (por defecto) \| alerta \| exito; `tachado: true` lo tacha en rojo; con `apunta` va junto a esa zona de la mascota, si no, apilado en el lado libre; sin mascota, en fila centrada. **La forma preferida de reforzar una palabra** |
| ficha | filas (2-4: `{icono, texto ≤2 palabras, en}`), fuente \| ilustrativo | el método de un estudio con iconos: `{"icono":"users","texto":"100","en":9}`, `{"icono":"calendar","texto":"8 sem"}`, `{"icono":"pill","texto":"5 g"}`; cada fila entra en su palabra. Columna (mascota a la derecha) |
| dato | texto (la cifra, ≤2 palabras), detalle (≤5), fuente \| ilustrativo | `fuente` = `corta` de `editorial/datos_verificados.json` (obligatoria si es de un estudio); si es un ejemplo, `"ilustrativo": true` |
| lista | items (2-4, ≤3 palabras) | checklist que se marca a lo largo de la escena (cuenta mucho texto: mejor iconos) |
| libreta | texto (título) | usa `progresion`; rotula EJEMPLO ILUSTRATIVO |
| grafica | – | usa `progresion`; rotula EJEMPLO ILUSTRATIVO |
| rec | – | marco de cámara del celular grabando |
| lineas_velocidad, enfoque | – | detrás de la mascota |
| impacto, sudor, destello | – | junto a la cabeza |

## Lo que comprueba el validador (`scripts/validar_render.py`)
Ids, anclas dentro del guion y crecientes, sprites/caras/climas/sfx/música/iconos existentes, componentes que existen, `dato` y `ficha` con fuente verificada o ilustrativo, `progresion` si hay libreta o gráfica, nada que suene a CTA, escenas de al menos 8 frames y el **presupuesto de texto**:

| límite | valor |
|---|---|
| palabras en pantalla en todo el video (sin subtítulos, fuentes, ASÍ NO/SÍ ni tarjeta) | ≤ 20 |
| texto en pantalla (titular, nota) · capítulo | ≤ 4 · ≤ 5 palabras |
| etiqueta · fila de ficha · cifra del dato | ≤ 2 palabras |
| tachado · ítem de lista | ≤ 3 palabras |
| burbuja_dialogo · detalle del dato | ≤ 4 · ≤ 5 palabras |
| piezas con texto por escena | ≤ 2 (aviso con 2) |
| tarjeta resumen | título ≤ 5, 2-3 líneas ≤ 6 |

Avisa (sin bloquear) de las cifras en pantalla para que confirmes su origen, de demasiadas escenas con texto, de demasiados tonos o iconos en los subtítulos y de escenas demasiado cortas o largas. Las escaletas versión 3 siguen siendo válidas.
