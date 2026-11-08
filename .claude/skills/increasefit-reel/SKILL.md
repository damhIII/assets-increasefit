---
name: increasefit-reel
description: Dirige, construye y renderiza con Remotion un Reel vertical de IncreaseFit (gimnasio y fuerza, con la mascota ilustrada) a partir de un guion de texto y su locución (briefs/<BASE>/guion.txt, locucion.wav, palabras.json) que deja el notebook de Colab. Úsala cuando pidan crear, dirigir, renderizar o corregir un video o reel de IncreaseFit, o cuando haya una carpeta nueva en briefs/.
---

# Reel IncreaseFit: dirección, montaje y render

El notebook te da solo tres cosas: **el guion** (texto plano, sin ninguna indicación), **la locución** y **el tiempo de cada palabra**. Todo lo demás es tuyo: qué se ve y cuándo se corta, qué hace la mascota, qué texto aparece en pantalla, los climas, la música, los efectos y la tarjeta final. No hay formatos ni estructuras predefinidas: diseña el video que mejor cuente **este** guion, dentro de la marca.

## 1. Localiza el material
- `briefs/<BASE>/` con `guion.txt`, `locucion.wav` y `palabras.json`. "El último" = la carpeta `AAAAMMDD-HHMM` más reciente.
- Si te adjuntan los archivos en el chat, crea `briefs/<BASE>/` con ellos (BASE = la que diga el prompt).

## 2. Lee la locución
`python3 scripts/alinear.py briefs/<BASE>` escribe `subtitulos.json` e imprime el guion numerado por frases, con el tiempo de cada frase y las pausas de la voz (`‖0.45s`). Los números `[n]` son las **anclas** de todo lo que diseñes. No oyes el audio: el ritmo está ahí. Las pausas largas son cortes naturales; la palabra que sigue a una micro-pausa suele ser el remate.

## 3. Lee la marca y mira el material
- Siempre: `editorial/marca.md`, `editorial/adn.md` y, en `referencias/`, `marca.md`, `mascota.md`, `layout.md`, `escaleta.md`.
- **Abre las imágenes** `mascota/contactos.jpg` (todas las poses) y `kit/contactos.png` (anotaciones): diseña con lo que existe.
- Cuando toque: `climas.md`, `sonido.md`, `tecnico.md`.

## 4. Verifica las cifras del guion
Por cada estudio o estadística que diga la voz:
- Si está en `editorial/datos_verificados.json`, usa ese dato; su `corta` es la fuente que va en pantalla.
- Si no está: búscalo en la web y lee el abstract en la fuente original (PubMed, la revista o el DOI), no en blogs. Si la cifra y su acotación se sostienen, añádelo a `datos_verificados.json` (con `url`, `cita_literal`, `verificado` = fecha y `anadido_por: "claude"`).
- Si no se sostiene o no lo encuentras: no pongas esa cifra ni una fuente en pantalla, y dilo en la entrega (la voz ya lo dice: el usuario decide si regraba).
- Cifras que no son de un estudio (kilos o repeticiones de ejemplo): siempre como **ejemplo ilustrativo**.

## 5. Diseña: escribe la escaleta
`briefs/<BASE>/escaleta.json` (formato completo en `referencias/escaleta.md`). Criterio, no plantilla:
- Lee el guion entero antes de empezar: dónde está el golpe inicial, el porqué, el giro y el remate.
- El primer frame ya tiene acción: nada de presentaciones.
- Ritmo de Reel: algo cambia cada 1,5–4 s. Corta en las pausas; una frase larga puede llevar 2–3 escenas y dos frases cortas pueden compartir una.
- La mascota vive lo que dice la voz: comete el error (`error_*`) cuando se habla del error, hace el ejercicio bien cuando se explica cómo, reacciona con gestos y caras.
- El texto en pantalla complementa o remata lo que se oye; no lo repite (≤5 palabras, como mucho 1 palabra en común con la voz de ese momento).
- Énfasis: 1–2 palabras por escena que de verdad pegan.
- Climas: empieza y termina en `hierro`; 1–3 climas más según lo que pasa.
- Efectos de sonido en la palabra que los motiva, no en todas las escenas: el silencio también remata.
- Tarjeta resumen: lo que hay que hacer, para guardar (título ≤6 palabras + 2–4 líneas ≤7 palabras).
- Si la composición por defecto no da para un gag o una idea, escribe una **escena a medida** (paso 6).

## 6. Escenas a medida
`briefs/<BASE>/custom/<nombre>.tsx` con `export default` un `React.FC<{ e: Escena; c: C }>`. En la escena: `"componente": "<nombre>"` (se dibuja encima de la composición por defecto) y `"solo_componente": true` si la sustituye. Escribe los imports como si el archivo estuviera en `src/escenas/custom/` (`../../marco/datos`, `../../componentes/kit`, `../../personaje/Sprite`). Frame local a la escena, determinismo total (ver `tecnico.md`).

## 7. Prepara, mira y corrige
1. `python3 scripts/preparar_video.py briefs/<BASE>` valida la escaleta (`scripts/validar_render.py`), la convierte en frames y deja el proyecto en `videos/<BASE>/`. Si hay errores, corrige y repite.
2. `cd videos/<BASE> && npm install` (la primera vez) → `npm run tipos` → `npm run stills` (un fotograma por escena + `out/stills/hoja.jpg`).
3. **Mira la hoja** y abre los PNG que te hagan dudar. Comprueba:
   - La mascota cuenta lo mismo que la voz y no se corta ni flota.
   - Nada vital fuera de Y 200–1580 ni en la franja de botones de Instagram (X>960, Y>1300); nada pisa el texto en pantalla ni los subtítulos.
   - Las anotaciones apuntan donde deben y se leen.
   - Las fuentes cargaron (Open Sans, JetBrains Mono, Kalam), no la serif del navegador.
   - Datos con su fuente; cifras de ejemplo rotuladas como ilustrativas.
4. Corrige **siempre en `briefs/<BASE>/`** (escaleta y `custom/`) y repite 1–3: `preparar_video.py` rehace `src/`, así que lo que edites en `videos/<BASE>/src` se pierde.

## 8. Render y entrega
- `npx remotion render Video out/<BASE>.mp4 --codec=h264 --crf=18` y la portada: `npx remotion still Video out/portada.png --frame=<frame con acción del arranque>`.
- Entrega el MP4 y la portada con 3–5 líneas sobre las decisiones clave y el estado de las cifras (verificadas, añadidas a la biblioteca o sin verificar).
- Si tienes permiso de escritura en el repo, sube `briefs/<BASE>/escaleta.json`, `custom/`, `subtitulos.json` y, si cambió, `editorial/datos_verificados.json`. `videos/` no se sube.

## Reglas fijas
- El marco IncreaseFit (header, texto en pantalla, subtítulos, tarjeta resumen, logo) es fijo; dentro de las escenas, libertad.
- La mascota es la única figura humana: nunca personas reales, fotos ni personajes de otras cuentas o marcas.
- Sin CTA: el video no pide comentarios, likes, follows ni compartir.
- La voz no se toca: ni recortes ni cambios de velocidad.
