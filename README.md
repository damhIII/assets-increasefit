# assets-increasefit

Contenido editorial, mascota, kit gráfico, sonido y plantilla Remotion de los Reels de IncreaseFit, una cuenta de salud y entrenamiento para personas normales con trabajos normales (el público está definido una sola vez, en `editorial/marca.md`). Instrucciones para Claude: `CLAUDE.md`. Cambios de cada versión: `CHANGELOG.md`.

## El flujo
1. **Notebook de Colab** (`Crear_video_IncreaseFit_v9.ipynb`): sortea un eje de `editorial/ejes.json`; GPT, con búsqueda web, elige un estudio y escribe el guion y la tarjeta final en una sola llamada (`editorial/prompt_reel.md`); se revisa el guion; Gemini lo locuta y Whisper saca el tiempo de cada palabra. Sube todo a `briefs/<BASE>/` (ver `briefs/LEEME.md`).
2. **Revisión humana** del guion en el notebook (celda 2, si hay que retocarlo: la tarjeta se rehace con `editorial/prompt_tarjeta.md`).
3. **Claude** (skill `.claude/skills/increasefit-reel/`): diseña la escaleta y renderiza con Remotion. Usa las cifras y la fuente del hallazgo de `investigacion.json` tal cual, no sube nada al repo y entrega el MP4 y la escaleta en el chat.

## Comandos de la etapa de video
```bash
python3 scripts/alinear.py briefs/<BASE>          # guion numerado por frases (anclas de la escaleta)
python3 scripts/preparar_video.py briefs/<BASE>   # valida la escaleta y deja el proyecto en videos/<BASE>/
cd videos/<BASE>
npm run instalar      # la primera vez (npm install silencioso)
npm run tipos         # TypeScript
npm run revisar       # revisión automática: zona segura, solapes con subtítulos y texto, momentos muertos, fuentes
npm run stills        # un fotograma por escena + hoja.jpg y hoja_zonas.jpg (lo creativo)
npm run movimiento    # opcional: un fotograma cada 0,5 s
npm run render        # out/video.mp4
```
Sin descarga de Chrome Headless Shell: `export REMOTION_BROWSER=/usr/bin/google-chrome`.

## Qué se edita dónde
- **Cómo escribe el guionista**: `editorial/prompt_reel.md` (búsqueda, guion y tarjeta en una llamada), `editorial/prompt_tarjeta.md` (la tarjeta cuando se edita el guion), `editorial/estilo_guion.md`, `editorial/marca.md` (marca y público) y `editorial/adn.md`. El notebook los lee del repo en cada ejecución.
- **De qué se habla**: `editorial/ejes.json` (ejes del sorteo, con pistas y peso).
- **La voz**: en el notebook (`TTS_VOICE`, `ESTILO_VOZ`, `VELOCIDAD_VOZ`, `PAUSAS`).
- **Cómo dirige Claude**: `.claude/skills/increasefit-reel/SKILL.md` y sus `referencias/`.
- **Climas**: `brand/paletas.json`; después, `python3 scripts/validar_paletas.py`.
- **Mascota**: sprites nuevos con `scripts/mascota/` (`procesar.py` → `bocas.py` → `manifiesto.py`) y revisar `mascota/contactos.jpg`.
- **Iconos**: `python3 scripts/iconos.py --buscar <palabra>` y `python3 scripts/iconos.py <nombre>`.

## Carpetas
- **editorial/**: marca y público, ADN, estilo del guion, ejes del sorteo y los prompts del notebook (`prompt_reel.md`, `prompt_tarjeta.md`).
- **briefs/**: una carpeta `<BASE>/` (`AAAAMMDD-HHMM`) por video, con lo que sube el notebook.
- **mascota/**: sprites PNG del personaje (`manifest.json`, `personaje.json`, `contactos.jpg`).
- **props/**: objetos (pesas, banco, comida, cama, libreta, cerebro…) en el estilo de la mascota (`manifest.json`, `contactos.jpg`).
- **kit/**: anotaciones dibujadas a mano y cortinilla de pincel (`manifest.json`, `contactos.png`).
- **sonido/**: efectos y música en bucle (`manifest.json`, licencias).
- **plantilla/**: proyecto Remotion (piezas de datos: pictograma, barras, anillo, línea de tiempo, ficha del estudio; imágenes en marco; transiciones, cámara, partículas; modo revisión) · **scripts/**: alinear, sincronizar, validar, preparar, revisar el video, imágenes con licencia, golpes de música y regenerar recursos.
- **icons/**: Lucide, Tabler (`tb-`) y Healthicons (`hi-`): colorear con máscara CSS (`mask-image`), no con `<Img>`. `scripts/iconos.py` añade más.
- **anatomia/**: mapa muscular (react-native-body-highlighter, MIT) · **lottie/**: animaciones Lottie recoloreadas a la marca (LottieFiles, Lottie Simple License; useAnimations, MIT) · **fondos/**: patrones de fondo por escena en blanco (se tiñen con el clima).
- **ui/**: sellos MITO/REALIDAD, VS, anillo de descanso, tarjeta de serie (teñir con `scripts/tenir_svg.py` en otros climas).
- **textures/**: grano, suelo de goma, tiza, cuadrícula, viñeta, brillo azul `glow_azul.svg` (opacidad baja).
- **fonts/**: `fonts/css/*.css` con los woff2 incrustados en base64 · **brand/**: `paletas.json` (climas) y `fuentes.json`.
