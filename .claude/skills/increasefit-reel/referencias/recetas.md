# Recetas: qué pieza usar para cada momento del guion

La cuenta habla de **salud, beneficios del entrenamiento de fuerza y motivación** para gente con trabajo que va al gym por salud. Estas recetas traducen los momentos típicos de esos guiones a imágenes. Son un punto de partida, no una plantilla: mezcla, cambia y sorprende.

## El estudio (el corazón del Reel)
| Lo que dice la voz | Pieza | Notas |
|---|---|---|
| "Un metaanálisis de dos mil veinticinco…" / "un ensayo con trescientas personas" | `estudio` (ficha del paper) con la mascota en bata (`vest_bata_senalar`) | Una vez por video, cuando se presenta el estudio. `fuente` obligatoria (la `corta` del hallazgo) |
| El método: muestra, semanas, dosis | `ficha` (iconos + cifras cortas) | Si ya usaste `estudio` con muestra y duración, no repitas: pasa al resultado |
| "Un tercio menos de riesgo", "uno de cada cuatro" | `pictograma` (`total` 10/20/100, `cantidad`) | La forma más clara de contar riesgo o proporción. Riesgo relativo ≠ absoluto: si la voz dice "treinta por ciento menos", no pintes 30 de 100 encendidas como si fuera absoluto; usa `barras` (con / sin) o `anillo` |
| Dos grupos comparados ("los que entrenaban vs los que no") | `barras` con los valores reales | La barra del resultado bueno en `exito` o en el foco; la otra en gris (por defecto) |
| Un porcentaje solo ("veintisiete por ciento más visitas") | `anillo` | O `dato` (cuenta hasta la cifra) si quieres algo más seco |
| Duración o evolución ("en cuatro semanas", "a los seis meses") | `linea_tiempo` con 2-4 hitos anclados a sus palabras | Vertical junto a la mascota; horizontal y grande sin ella |
| Un órgano, un hueso, el cerebro, un diagrama | `prop` (`prop_corazon`, `prop_cerebro`, `prop_fibra_muscular`) o `musculos` | Si no hay prop, una escena a medida que lo dibuje en SVG en el estilo de la marca y lo anime (se construye por partes y se enciende la zona que nombra la voz) |
| Estudio observacional ("se asoció con…") | Piezas en tono `foco`, nunca `exito` | No celebres una asociación como si fuera causa; la mascota con `gesto_pensar` o `cara_pensativo` en el matiz |

## La vida del espectador
| Momento | Imagen |
|---|---|
| Trabajo, oficina, horas sentado | `fondo: patron_oficina`, iconos `laptop`, `armchair`, `briefcase`, `tb-desk`; la mascota con `gesto_celular`, `gesto_bostezo`, `gesto_agotado_banco` |
| Estrés, ánimo, ansiedad | `fondo: patron_mente`, iconos `brain`, `frown` → `smile`, `cloud-moon`, `sun`; `cara_*` en `inserto`; `particulas: burbujas` |
| Sueño | `fondo: patron_sueno`, `prop_cama`, `gesto_dormir`, `gesto_despertar`, lottie `ua_luna` |
| Poco tiempo, dosis mínima | `fondo: patron_tiempo`, `prop_cronometro`, `gesto_cronometro`, `linea_tiempo` con la semana, `anillo` |
| Envejecer, llegar fuerte a los sesenta | icono `tb-old` / `hi-elderly`, `linea_tiempo` ("hoy" → "a los 60"), `gesto_flexionar_mirar` |
| Constancia, volver al gym | `fondo: patron_tiempo`, `prop_calendario`, iconos `calendar-check`, `repeat`, `undo-2`; `transicion: deslizar` para "semana tras semana" |
| Vida diaria (escaleras, bolsas, auto) | `fondo: patron_vida`, iconos `tb-stairs-up`, `shopping-bag`, `car`, `house` |
| Motivación, el logro de ir | `anim: celebrar`, `particulas: chispas` o `confeti_suave`, lottie `confeti` como remate (una vez) |

## Ritmo y movimiento
- **Transiciones** (`transicion`): `corte` es lo normal (la mayoría). Usa las demás para marcar el cambio de bloque del guion, 2-4 por video:
  - `zoom` → entrar al estudio o a un dato ("mira esto").
  - `deslizar` → paso del tiempo, "siguiente", antes/después.
  - `barrido` → el giro del guion ("pero…"), cambio de clima.
  - `iris` → revelación desde el centro (el resultado).
  - `flash` → el golpe (la cifra que sorprende).
  - `fundido` → la pausa tranquila, el matiz.
  - `pincel` → la cortinilla de la marca (como siempre).
- **Cámara** (`camara`): `quieta` en escenas con fichas o barras que se tienen que leer; `alejar` en escenas largas y calmadas (el matiz); `sacudida` con `en` en la palabra que golpea; `viva` en el resto.
- **Mascota**: `saltar` (ganas, energía), `celebrar` (el logro, el resultado bueno), `asentir` (dar la razón, "así es"), además de las de siempre.
- **Partículas** (`particulas`) en 1-3 escenas, nunca en todas: `polvo` (ambiente del gimnasio), `chispas` (energía), `burbujas` (calma, mente), `confeti_suave` (cierre feliz).
- **Cortes a ritmo**: `"opciones": {"cortes_a_ritmo": true}` mueve cada corte ≤4 frames al golpe de música más cercano (sin tocar la voz).

## Lo que no hacer
- Dos piezas de columna en la misma escena (se pisan: el validador avisa).
- Texto de más: las etiquetas de barras, hitos, muestra y duración cuentan para las 20 palabras del video.
- Imágenes o fotos descargadas: todo es animación (mascota, props, iconos, lottie o SVG en una escena a medida).
- Transiciones vistosas en cada corte: cansan y le roban protagonismo a la idea.
