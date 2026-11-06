# assets-increasefit

Repositorio de los Reels de **IncreaseFit** (cuenta de gimnasio y entrenamiento de fuerza, nivel intermedio). Contiene los assets, las paletas, la mascota **Rep** (rig articulado) y una **plantilla Remotion** con el marco de la marca ya hecho.

## Cómo llega un encargo
El notebook de Colab (`Crear_video_IncreaseFit.ipynb`) escribe el guion, genera la locución y deja un `brief.json` (en `briefs/<BASE>/` o adjunto en el chat). Para construir el video usa la skill **increasefit-reel** (`.claude/skills/increasefit-reel/SKILL.md`).

## Estructura
- `plantilla/` proyecto Remotion: marco fijo (`src/marco/`), Rep (`src/rep/`), piezas (`src/componentes/`), escenas por defecto (`src/escenas/`).
- `plantilla/src/rep/movimientos.json` catálogo de movimientos de Rep (el notebook lo lee para que el guion solo pida lo que Rep sabe hacer).
- `icons/` Lucide (`currentColor`) · `logos/` redes (monocromos) → siempre con máscara CSS.
- `ui/`, `textures/` SVG con los colores IncreaseFit → teñir con `scripts/tenir_svg.py` si hace falta.
- `fonts/css/` `@font-face` con woff2 en base64 (Open Sans, JetBrains Mono).
- `logo_increasefit.png` (fondos oscuros), `logo_increasefit_oscuro.png` (fondos claros), `isotipo.png` (la flecha).
- `brand/paletas.json` climas de escena · `scripts/` preparar proyecto, validadores, teñido.
- `briefs/<BASE>/` brief + locución de cada video (los sube el notebook).

## Reglas que valen siempre
- El marco IncreaseFit (barra de progreso, header, titular, subtítulos, CTA, logo) es fijo; solo cambia el clima de la escena.
- Rep es la única figura humana: nunca personas reales, fotos ni personajes de otras cuentas o marcas.
- Determinismo: nada de `Math.random()` en Remotion.

## Qué se edita dónde
- Los assets, `brand/paletas.json`, `manifest.json` y `README.md` llegan desde Drive con el notebook: si los cambias aquí, el siguiente sync los sobrescribe. Cámbialos en Drive.
- `CLAUDE.md`, `.claude/`, `plantilla/` y `scripts/` viven solo aquí: edítalos en GitHub.
- Tras tocar `brand/paletas.json`, ejecuta `python3 scripts/validar_paletas.py`. Tras tocar el rig, `npm run hoja` en `plantilla/` y mira `out/hoja_rig.png`.
