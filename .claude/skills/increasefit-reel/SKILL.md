---
name: increasefit-reel
description: Dirige, construye y renderiza con Remotion un Reel vertical de IncreaseFit (gimnasio y fuerza, con la mascota ilustrada) a partir de un guion de texto y su locución (briefs/<BASE>/guion.txt, locucion.wav, palabras.json, tarjeta.json y, si la hubo, investigacion.json) que deja el notebook de Colab. Úsala cuando pidan crear, dirigir, renderizar o corregir un video o reel de IncreaseFit, o cuando haya una carpeta nueva en briefs/.
---

# Reel IncreaseFit: dirección, montaje y render

El notebook te da **el guion** (texto plano, sin ninguna indicación), **la locución**, **el tiempo de cada palabra** y, normalmente, **la investigación** con la que GPT escribió el guion (estudios con su URL) y **la propuesta de tarjeta final** (`tarjeta.json`). Todo lo demás es tuyo: qué se ve y cuándo se corta, qué hace la mascota, los iconos y marcas, cómo se pintan los subtítulos, los climas, la música, los efectos y la tarjeta final. No hay formatos ni estructuras predefinidas: diseña el video que mejor cuente **este** guion, dentro de la marca.

**Imagen primero, texto mínimo.** La voz ya dice las palabras y los subtítulos ya las escriben: tu trabajo es **reforzar con imágenes** lo que dice el guion (mascota, iconos, marcas del kit, fichas con cifras) y **pintar los subtítulos** para que se lean con ritmo. El texto en pantalla es la excepción, no la norma: la mayoría de las escenas van con `pantalla: ninguno` y el validador corta si te pasas del presupuesto.

## 1. Localiza el material
- `briefs/<BASE>/` con `guion.txt`, `locucion.wav`, `palabras.json`, `tarjeta.json` (la tarjeta final que propuso el guionista a partir del guion) e `investigacion.json` (opcional: los hallazgos de la búsqueda web del guionista). "El último" = la carpeta `AAAAMMDD-HHMM` más reciente.
- Si te adjuntan los archivos en el chat, crea `briefs/<BASE>/` con ellos (BASE = la que diga el prompt).

## 2. Lee la locución
`python3 scripts/alinear.py briefs/<BASE>` escribe `subtitulos.json` e imprime el guion numerado por frases, con el tiempo de cada frase y las pausas de la voz (`‖0.45s`). Los números `[n]` son las **anclas** de todo lo que diseñes. No oyes el audio: el ritmo está ahí. Las pausas largas son cortes naturales; la palabra que sigue a una micro-pausa suele ser el remate.

## 3. Lee la marca y mira el material
- Siempre: `editorial/marca.md`, `editorial/adn.md` y, en `referencias/`, `marca.md`, `mascota.md`, `layout.md`, `escaleta.md`.
- **Abre las imágenes** `mascota/contactos.jpg` (todas las poses), `props/contactos.jpg` (objetos en el estilo de la mascota), `kit/contactos.png` (anotaciones), `icons/contactos.png` (iconos) y `fondos/contactos.png` (patrones de fondo), y lee `lottie/manifest.json` (animaciones): diseña con lo que existe.
- Cuando toque: `climas.md`, `sonido.md`, `tecnico.md`.

## 4. Verifica las cifras del guion
Por cada estudio o estadística que diga la voz:
- Si está en `editorial/datos_verificados.json`, usa ese dato; su `corta` es la fuente que va en pantalla.
- Si no está, empieza por `investigacion.json`: el hallazgo trae `url`, `doi` y `cita_literal`. Ábrelo y compruébalo en la fuente original (PubMed, la revista o el DOI); GPT pudo equivocarse, así que no lo des por bueno sin leerlo. Si no está en ninguno de los dos, búscalo tú en la web, nunca en blogs.
- Si la cifra y su acotación se sostienen, añádelo a `datos_verificados.json` (con `url`, `cita_literal`, `verificado` = fecha y `anadido_por: "claude"`).
- Si no se sostiene o no lo encuentras: no pongas esa cifra ni una fuente en pantalla, y dilo en la entrega (la voz ya lo dice: el usuario decide si regraba).
- Cifras que no son de un estudio (kilos o repeticiones de ejemplo): siempre como **ejemplo ilustrativo**.

## 5. Diseña: escribe la escaleta
`briefs/<BASE>/escaleta.json` (formato completo en `referencias/escaleta.md`). Criterio, no plantilla:
- Lee el guion entero antes de empezar: dónde está el golpe inicial, el porqué, el giro y el remate.
- El primer frame ya tiene acción: nada de presentaciones.
- Ritmo de Reel: algo cambia cada 1,5–4 s. Corta en las pausas; una frase larga puede llevar 2–3 escenas y dos frases cortas pueden compartir una.
- La mascota vive lo que dice la voz: comete el error (`error_*`) cuando se habla del error, hace el ejercicio bien cuando se explica cómo, reacciona con gestos y caras.
- **Traduce cada frase a una imagen, no a un rótulo**:
  - el objeto protagonista de la frase (el bote de creatina, la báscula, la cama, el banco, el calendario) → `prop` (objeto dibujado en el estilo de la mascota) o la mascota usándolo (`gesto_creatina`, `gesto_dormir`, `gesto_libreta`…);
  - la mascota hablando a cámara (una frase directa al espectador, el gancho) → `plano_boca_reposo` con `anim: "hablar"`;
  - sustantivos concretos (creatina, cerebro, semanas, placebo) → `icono` (Lucide: `python3 scripts/iconos.py --buscar <palabra>` y luego `python3 scripts/iconos.py <nombre>` si falta);
  - el método de un estudio (muestra, duración, dosis) → `ficha` (icono + cifra corta por fila, cada fila en su palabra);
  - el resultado → `dato` (la cifra grande con su fuente);
  - qué músculo trabaja o duele → `musculos` (mapa muscular con ese músculo encendido);
  - un logro, una explosión de energía, el paso del tiempo → `lottie` (confeti, fuego, destellos, reloj de arena) como remate puntual;
  - comparaciones y grupos → `dividida`, dos sprites o check/cruz;
  - una advertencia o "esto no" → `icono` con `tachado`, `cruz`, `tachado` del kit o la mascota en `error_*`;
  - sorpresa, duda o ironía → `inserto` con una `cara_*`, gestos.
- **Presupuesto de texto** (lo comprueba el validador): como mucho 20 palabras en pantalla en todo el video, sin contar subtítulos ni tarjeta resumen; ≤4 palabras por texto en pantalla, ≤2 por etiqueta y por fila de ficha, y como mucho 2 piezas con texto por escena (lo normal es 0 o 1). El texto en pantalla solo para: la cifra de un estudio con su fuente, el concepto clave una vez (el gancho o el giro) y la tarjeta final. Nunca repite lo que dice la voz.
- **Pinta los subtítulos** (bloque `subtitulos` de la escaleta): ya salen sin signos de puntuación y en grupos de 1-3 palabras; tú decides `enfasis` (1–2 palabras por escena que de verdad pegan: más grandes y en azul), `tonos` (`alerta` en rojo para el error o la trampa, `exito` en verde para lo correcto; pocas) e `iconos` (una insignia que salta bajo la palabra al decirla: 3–6 en todo el video, en sustantivos concretos que no tengan ya un icono en la escena).
- Climas: empieza y termina en `negro`; 1–2 climas más según lo que pasa (`azul` solo para una frase clave sin mascota, `papel` para la pausa clara).
- Efectos de sonido en la palabra que los motiva, no en todas las escenas: el silencio también remata.
- **Tarjeta final** (lo que la gente guarda): es la conclusión de **este** Reel, no un resumen suelto. Parte de `tarjeta.json` y cópiala a `tarjeta_resumen` en la escaleta, retocándola si hace falta, con este hilo:
  - `pregunta`: la del gancho, resumida (≤8 palabras) y reconocible: quien vuelve a la tarjeta en una semana tiene que recordar de qué Reel es.
  - `veredicto`: la respuesta que da el guion a esa pregunta (≤7), con su matiz, y su `tono` (`si` | `no` | `matiz`).
  - `pasos`: 2-3 acciones (≤6 palabras, verbo en imperativo) sacadas del consejo práctico y del matiz que dice la voz. Nada que la voz no haya dicho.
  - `tema` (chip, ≤3) y, si el veredicto sale de un estudio verificado, `fuente` (su `corta`).
  - Cifras solo las que dice la voz y estén verificadas. Si una cifra de `tarjeta.json` no se sostiene, quítala.
- **Arriba solo los subtítulos, nada fijo durante todo el video**: el video no lleva logo ni isotipo hasta la tarjeta final (los subtítulos están en su sitio desde el frame 0). No pongas títulos de serie, rótulos que se queden de escena en escena ni carteles permanentes (tampoco en escenas a medida).
- Si la composición por defecto no da para un gag o una idea, escribe una **escena a medida** (paso 6).

## 6. Escenas a medida
`briefs/<BASE>/custom/<nombre>.tsx` con `export default` un `React.FC<{ e: Escena; c: C }>`. En la escena: `"componente": "<nombre>"` (se dibuja encima de la composición por defecto) y `"solo_componente": true` si la sustituye. Escribe los imports como si el archivo estuviera en `src/escenas/custom/` (`../../marco/datos`, `../../componentes/kit`, `../../personaje/Sprite`). Frame local a la escena, determinismo total (ver `tecnico.md`).

## 7. Prepara, mira y corrige
1. `python3 scripts/preparar_video.py briefs/<BASE>` valida la escaleta (`scripts/validar_render.py`), la convierte en frames y deja el proyecto en `videos/<BASE>/`. Si hay errores, corrige y repite.
2. `cd videos/<BASE> && npm install` (la primera vez) → `npm run tipos` → `npm run stills` (un fotograma por escena + `out/stills/hoja.jpg` y `out/stills/hoja_zonas.jpg`, la misma hoja con la interfaz de Instagram en rojo).
3. **Mira la hoja** y abre los PNG que te hagan dudar. Comprueba:
   - La mascota cuenta lo mismo que la voz y no se corta ni flota.
   - En `hoja_zonas.jpg` nada vital cae en rojo: arriba (Y<260, nombre y foto de perfil), abajo (Y>1540, nombre, descripción y audio) ni la columna de botones (X>900 desde Y≈1100). Nada pisa los subtítulos (Y≈300–402, ni las insignias de icono que cuelgan debajo, hasta Y≈500) ni el texto en pantalla de abajo.
   - Arriba solo están los subtítulos, también en el gancho: ni logo, ni isotipo, ni títulos fijos, y nada de la escena choca con ellos.
   - La tarjeta final (still `resumen`): la pregunta se reconoce como la del gancho, el veredicto la contesta y los pasos se pueden hacer hoy.
   - Poco texto: si un fotograma se lee como una diapositiva, sobra texto. Los subtítulos, sin signos de puntuación y con su color.
   - Los iconos se entienden sin leer nada y no tapan a la mascota.
   - Las anotaciones apuntan donde deben y se leen.
   - Las fuentes cargaron (Open Sans, JetBrains Mono, Kalam), no la serif del navegador.
   - Datos con su fuente; cifras de ejemplo rotuladas como ilustrativas.
4. Corrige **siempre en `briefs/<BASE>/`** (escaleta y `custom/`) y repite 1–3: `preparar_video.py` rehace `src/`, así que lo que edites en `videos/<BASE>/src` se pierde.

## 8. Render y entrega
- `npx remotion render Video out/<BASE>.mp4 --codec=h264 --crf=18` y la portada: `npx remotion still Video out/portada.png --frame=<frame con acción del arranque>`.
- Entrega el MP4 y la portada con 3–5 líneas sobre las decisiones clave y el estado de las cifras (verificadas, añadidas a la biblioteca, corregidas respecto a `investigacion.json` o sin verificar).
- Si tienes permiso de escritura en el repo, sube `briefs/<BASE>/escaleta.json`, `custom/`, `subtitulos.json`, los iconos nuevos de `icons/` y, si cambió, `editorial/datos_verificados.json`. `videos/` no se sube.

## Reglas fijas
- El marco IncreaseFit es fijo: subtítulos arriba en Y≈300, bajo la interfaz de Instagram (sin logo encima), texto en pantalla abajo y tarjeta final con el logo. Dentro de las escenas, libertad (sin títulos persistentes).
- La mascota es la única figura humana: nunca personas reales, fotos ni personajes de otras cuentas o marcas.
- Sin CTA en la voz ni en las escenas: el video no pide comentarios, likes, follows ni compartir. La única invitación es el GUÁRDALO de la tarjeta final.
- La voz no se toca: ni recortes ni cambios de velocidad (el ritmo se ajusta en el notebook, antes de sacar los tiempos).
