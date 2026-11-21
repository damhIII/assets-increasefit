---
name: increasefit-reel
description: Dirige, construye y renderiza con Remotion un Reel vertical de IncreaseFit (salud y entrenamiento para gente con trabajo, con la mascota ilustrada) a partir de un guion de texto y su locución (briefs/<BASE>/guion.txt, locucion.wav, palabras.json, tarjeta.json y, si la hubo, investigacion.json) que deja el notebook de Colab. Úsala cuando pidan crear, dirigir, renderizar o corregir un video o reel de IncreaseFit, o cuando haya una carpeta nueva en briefs/.
---

# Reel IncreaseFit: dirección, montaje y render

El notebook te da **el guion** (texto plano, sin ninguna indicación), **la locución**, **el tiempo de cada palabra** y, normalmente, **la investigación** con la que GPT escribió el guion (estudios con su URL) y **la propuesta de tarjeta final** (`tarjeta.json`). Todo lo demás es tuyo: qué se ve y cuándo se corta, qué hace la mascota, los iconos y marcas, cómo se pintan los subtítulos, los climas, la música, los efectos y la tarjeta final. No hay formatos ni estructuras predefinidas: diseña el video que mejor cuente **este** guion, dentro de la marca.

**Imagen primero, texto mínimo.** La voz ya dice las palabras y los subtítulos ya las escriben: tu trabajo es **reforzar con imágenes** lo que dice el guion (mascota, iconos, marcas del kit, fichas con cifras) y **pintar los subtítulos** para que se lean con ritmo. El texto en pantalla es la excepción, no la norma: la mayoría de las escenas van con `pantalla: ninguno` y el validador corta si te pasas del presupuesto.

**Salidas cortas.** Los comandos largos (instalar, render, stills) se ejecutan con su salida a `out/logs/<paso>.log` y muestras solo `tail -5`; abre el log entero solo si el comando falla. Por ejemplo: `npm run render > out/logs/render.log 2>&1; tail -5 out/logs/render.log`.

## 1. Localiza el material
- `briefs/<BASE>/` con `guion.txt`, `locucion.wav`, `palabras.json`, `tarjeta.json` (la tarjeta final que propuso el guionista a partir del guion), `investigacion.json` (opcional: los hallazgos de la búsqueda web del guionista; el estudio protagonista lleva `principal: true`). "El último" = la carpeta `AAAAMMDD-HHMM` más reciente.
- Si te adjuntan los archivos en el chat, crea `briefs/<BASE>/` con ellos (BASE = la que diga el prompt).

## 2. Lee la locución
`python3 scripts/alinear.py briefs/<BASE>` escribe `subtitulos.json` e imprime el guion numerado por frases, con el tiempo de cada frase y las pausas de la voz (`‖0.45s`). Los números `[n]` son las **anclas** de todo lo que diseñes. No oyes el audio: el ritmo está ahí. Las pausas largas son cortes naturales; la palabra que sigue a una micro-pausa suele ser el remate.

## 3. Lee la marca visual y mira el material
- Siempre, en `referencias/`: `marca.md`, `mascota.md`, `layout.md`, `escaleta.md` y **`recetas.md`** (qué pieza usar para cada momento de un guion de salud: estudio, riesgo, comparación, tiempo, vida diaria).
- **Abre las imágenes** `mascota/contactos.jpg` (todas las poses), `props/contactos.jpg` (objetos en el estilo de la mascota), `kit/contactos.png` (anotaciones), `icons/contactos.png` (iconos) y `fondos/contactos.png` (patrones de fondo), y lee `lottie/manifest.json` (animaciones): diseña con lo que existe.
- Cuando toque: `climas.md`, `sonido.md`, `tecnico.md`.

## 4. Cifras y fuentes
Usa las del hallazgo con `principal: true` de `investigacion.json` (dato, muestra, duración, tipo, año, `corta`): la `corta` es la fuente que va en pantalla. No las verifiques ni las busques en la web. Las cifras que no salen de un estudio van como ejemplo ilustrativo.

## 5. Diseña: escribe la escaleta
`briefs/<BASE>/escaleta.json` (formato completo en `referencias/escaleta.md`). Criterio, no plantilla:
- Lee el guion entero antes de empezar: dónde está el golpe inicial, el porqué, el giro y el remate.
- El primer frame ya tiene acción: nada de presentaciones.
- Ritmo de Reel: algo cambia cada 1,5–4 s. Corta en las pausas; una frase larga puede llevar 2–3 escenas y dos frases cortas pueden compartir una.
- La mascota vive lo que dice la voz: comete el error (`error_*`) cuando se habla del error, hace el ejercicio bien cuando se explica cómo, reacciona con gestos y caras.
- **Traduce cada frase a una imagen, no a un rótulo**:
  - el objeto protagonista de la frase (el bote de creatina, la báscula, la cama, el banco, el calendario) → `prop` (objeto dibujado en el estilo de la mascota) o la mascota usándolo (`gesto_creatina`, `gesto_dormir`, `gesto_libreta`…);
  - la mascota hablando a cámara (una frase directa al espectador, el gancho) → `plano_boca_reposo` con `anim: "hablar"`;
  - sustantivos concretos (creatina, cerebro, semanas, placebo) → `icono` (Lucide: `python3 scripts/iconos.py --buscar <palabra>` y luego `python3 scripts/iconos.py <nombre>` si falta; apunta los que añadas para la entrega);
  - el estudio que se presenta ("un metaanálisis de…") → `estudio` (la ficha del paper: tipo, año, muestra, duración, revista);
  - el método de un estudio (muestra, duración, dosis) → `ficha` (icono + cifra corta por fila, cada fila en su palabra);
  - el resultado → `dato` (la cifra grande con su fuente), `pictograma` (una proporción o un riesgo: "uno de cada cuatro"), `barras` (dos grupos comparados con sus valores reales) o `anillo` (un porcentaje);
  - el tiempo ("en cuatro semanas", "a los sesenta") → `linea_tiempo` (2-4 hitos, cada uno en su palabra);
  - un órgano, un hueso, un diagrama → `prop` (`prop_corazon`, `prop_cerebro`, `prop_fibra_muscular`) o `musculos`; si no existe, una escena a medida (paso 6) que lo dibuje en SVG y lo anime por partes;
  - qué músculo trabaja o duele → `musculos` (mapa muscular con ese músculo encendido);
  - un logro, una explosión de energía, el paso del tiempo → `lottie` (confeti, fuego, destellos, reloj de arena) como remate puntual;
  - comparaciones y grupos → `dividida`, dos sprites o check/cruz;
  - una advertencia o "esto no" → `icono` con `tachado`, `cruz`, `tachado` del kit o la mascota en `error_*`;
  - sorpresa, duda o ironía → `inserto` con una `cara_*`, gestos.
- **Presupuesto de texto** (lo comprueba el validador): como mucho 20 palabras en pantalla en todo el video, sin contar subtítulos ni tarjeta resumen; ≤4 palabras por texto en pantalla, ≤2 por etiqueta y por fila de ficha, y como mucho 2 piezas con texto por escena (lo normal es 0 o 1). El texto en pantalla solo para: la cifra de un estudio con su fuente, el concepto clave una vez (el gancho o el giro) y la tarjeta final. Nunca repite lo que dice la voz.
- **Pinta los subtítulos** (bloque `subtitulos` de la escaleta): ya salen sin signos de puntuación y en grupos de 1-3 palabras; tú decides `enfasis` (1–2 palabras por escena que de verdad pegan: más grandes y en azul), `tonos` (`alerta` en rojo para el error o la trampa, `exito` en verde para lo correcto; pocas) e `iconos` (una insignia que salta bajo la palabra al decirla: 3–6 en todo el video, en sustantivos concretos que no tengan ya un icono en la escena).
- Climas: empieza y termina en `negro`; 1–2 climas más según lo que pasa (`azul` solo para una frase clave sin mascota, `papel` para la pausa clara).
- **Movimiento** (detalles en `recetas.md`): `transicion` (corte casi siempre; 2-4 de `zoom`, `deslizar`, `barrido`, `iris`, `flash`, `fundido`, `pincel` para marcar los cambios de bloque), `camara` (`quieta` donde hay que leer, `alejar` en la pausa, `sacudida` con `en` en el golpe), anims nuevas de la mascota (`saltar`, `celebrar`, `asentir`), `particulas` en 1-3 escenas y `"opciones": {"cortes_a_ritmo": true}` para que los cortes caigan en el golpe de la música.
- Efectos de sonido en la palabra que los motiva, no en todas las escenas: el silencio también remata.
- **Tarjeta final** (lo que la gente guarda): es la conclusión de **este** Reel, no un resumen suelto. Parte de `tarjeta.json` y cópiala a `tarjeta_resumen` en la escaleta, retocándola si hace falta, con este hilo:
  - `pregunta`: la del gancho, resumida (≤8 palabras) y reconocible: quien vuelve a la tarjeta en una semana tiene que recordar de qué Reel es.
  - `veredicto`: la respuesta que da el guion a esa pregunta (≤7), con su matiz, y su `tono` (`si` | `no` | `matiz`).
  - `pasos`: 2-3 acciones (≤6 palabras, verbo en imperativo) sacadas del consejo práctico y del matiz que dice la voz. Nada que la voz no haya dicho.
  - `tema` (chip, ≤3) y, si el veredicto sale del estudio, `fuente` (la `corta` del hallazgo).
  - Cifras solo las que dice la voz. Si una cifra de `tarjeta.json` no la dice la voz, quítala.
- Si la composición por defecto no da para un gag o una idea, escribe una **escena a medida** (paso 6).

## 6. Escenas a medida
`briefs/<BASE>/custom/<nombre>.tsx` con `export default` un `React.FC<{ e: Escena; c: C }>`. Coloca todo con `ZONA` y `encajarX` de `../../marco/datos` (zona segura: ver `layout.md`), nunca con coordenadas pegadas al borde. En la escena: `"componente": "<nombre>"` (se dibuja encima de la composición por defecto) y `"solo_componente": true` si la sustituye. Escribe los imports como si el archivo estuviera en `src/escenas/custom/` (`../../marco/datos`, `../../componentes/kit`, `../../personaje/Sprite`). Frame local a la escena, determinismo total (ver `tecnico.md`).

## 7. Prepara, revisa y corrige
1. `python3 scripts/preparar_video.py briefs/<BASE>` valida la escaleta (`scripts/validar_render.py`: catálogos, fuentes, presupuesto de texto y mascota cortada o flotando), la convierte en frames y deja el proyecto en `videos/<BASE>/`. Solo imprime avisos, errores y una línea final. Si hay errores, corrige y repite.
2. En `videos/<BASE>`: la primera vez `npm run instalar > out/logs/instalar.log 2>&1; tail -5 out/logs/instalar.log`; luego `npm run -s tipos` (TypeScript; sin salida si todo está bien). Si no se puede descargar Chrome, `export REMOTION_BROWSER=/usr/bin/google-chrome` (ver `tecnico.md`).
3. `npm run -s revisar` (su salida ya es corta: no la mandes a un log). Comprueba solo, sin que mires nada: la zona segura, que nada pise los subtítulos (ni sus insignias) ni el texto en pantalla, los momentos muertos (más de 2,5 s sin cambio) y que las fuentes cargaron (si no, falla el render). Imprime una línea por problema (`✗ escena dato · 4,0–6,0 s · pisa los subtítulos (x …, y …)`) y `revisar: N errores, M avisos`; los fotogramas culpables quedan en `out/revision/marcados/`. Corrige **siempre en `briefs/<BASE>/`** (escaleta y `custom/`), repite el paso 1 y vuelve a revisar hasta que salga sin errores (los avisos, resuélvelos o explica en la entrega por qué se quedan). Lo que edites en `videos/<BASE>/src` se pierde: `preparar_video.py` lo rehace.
4. Solo entonces, `npm run stills > out/logs/stills.log 2>&1; tail -5 out/logs/stills.log` y **una mirada** a `out/stills/hoja.jpg` y `out/stills/hoja_zonas.jpg` para lo creativo:
   - La mascota cuenta lo mismo que la voz.
   - Los iconos se entienden sin leer nada y no tapan a la mascota; las anotaciones apuntan donde deben.
   - Nada se lee como una diapositiva: si un fotograma necesita leerse, sobra texto.
   - La tarjeta final (still `resumen`) contesta al gancho: la pregunta se reconoce, el veredicto la contesta y los pasos se pueden hacer hoy.

   Abre un PNG suelto solo si la hoja te hace dudar. Si dudas del ritmo, `npm run movimiento` (opcional) deja un fotograma cada 0,5 s en `out/movimiento/hoja_movimiento.jpg`.

## 8. Render y entrega
- `npm run render > out/logs/render.log 2>&1; tail -5 out/logs/render.log` → `out/video.mp4`.
- Entrega en el chat el MP4 y `briefs/<BASE>/escaleta.json` como archivo adjunto (para que la persona lo archive si quiere), con 3–5 líneas sobre las decisiones clave y la lista de iconos que añadió `scripts/iconos.py` (son locales y se pierden con la sesión).
- No subas nada al repositorio (ni cambios de git ni archivos) y no pidas credenciales: esta etapa es de solo lectura. Lo que generas (`subtitulos.json`, `escaleta.json`, `custom/`, `videos/`, iconos nuevos) vive solo en tu sesión.

## Reglas fijas
Son las únicas reglas de la etapa de video; `CLAUDE.md` y las referencias no añaden otras.
- El marco IncreaseFit es fijo: subtítulos arriba (Y≈300, bajo la interfaz de Instagram, sin logo encima), texto en pantalla abajo y tarjeta final con el logo. Dentro de las escenas, libertad, pero nada fijo durante todo el video: ni logo, ni isotipo, ni títulos o rótulos persistentes (tampoco en escenas a medida).
- Zona segura: nada importante a menos de 120 px de los lados (x 120–960; x ≤ 900 bajo Y≈1100). Explicada completa en `referencias/layout.md`; la comprueba `npm run revisar`.
- La mascota es la única figura humana: nunca personas reales, fotos de personas ni personajes de otras cuentas o marcas.
- Solo animación: nada de imágenes ni fotos descargadas. Todo lo que se ve sale del repo (mascota, props, iconos, kit, lottie, fondos) o se dibuja en SVG en una escena a medida.
- Sin CTA en la voz ni en las escenas: el video no pide comentarios, likes, follows ni compartir. La única invitación es el GUÁRDALO de la tarjeta final.
- Cifras de estudios en pantalla solo con su fuente (la `corta` de un hallazgo de `investigacion.json`, tal cual); las de ejemplo, rotuladas como ilustrativas.
- La voz no se toca: ni recortes ni cambios de velocidad (el ritmo se ajusta en el notebook, antes de sacar los tiempos).
- Determinismo: nada de `Math.random()` en Remotion.
- Solo lectura: no subas nada al repo; entregas en el chat.
