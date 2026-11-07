# assets-increasefit

Repositorio de los Reels de **IncreaseFit** (cuenta de gimnasio y entrenamiento de fuerza, nivel intermedio). Contiene la mascota ilustrada, el kit gráfico, el sonido, las paletas, las fuentes y una **plantilla Remotion** que convierte un brief por planos en el video.

## Cómo llega un encargo
El notebook de Colab (`Crear_video_IncreaseFit.ipynb`) elige el tema y el formato, investiga y verifica un dato, elige el gancho, escribe y revisa el guion por planos, genera la locución y deja un `brief.json` + el audio en `briefs/<BASE>/`. Para construir el video usa la skill **increasefit-reel** (`.claude/skills/increasefit-reel/SKILL.md`).

## Estructura
- `plantilla/` proyecto Remotion: marco (`src/marco/`), mascota (`src/personaje/`), kit animado (`src/componentes/kit.tsx`), escena por plano (`src/escenas/Plano.tsx`) y capas a medida (`src/escenas/extra.tsx`).
- `mascota/` sprites PNG de la mascota (catálogo `mascota/manifest.json`, ficha `mascota/personaje.json`, guía `mascota/README.md`). `scripts/mascota/` corta y normaliza hojas nuevas.
- `kit/` anotaciones dibujadas a mano (SVG) y la cortinilla de pincel. `scripts/kit/` las regenera.
- `sonido/` efectos y música en bucle (catálogo y licencias). `scripts/sonido/` la parte sintetizada.
- `icons/` Lucide (`currentColor`) → siempre con máscara CSS. `textures/`, `ui/` SVG de apoyo.
- `fonts/css/` `@font-face` con woff2 en base64 (Open Sans, JetBrains Mono, Kalam).
- `logo_increasefit.png`, `logo_increasefit_oscuro.png`, `isotipo.png`.
- `brand/paletas.json` climas de escena · `scripts/` preparar proyecto, validar brief, validar paletas, teñir SVG.
- `briefs/<BASE>/` brief + locución de cada video (los sube el notebook).

## Reglas que valen siempre
- El marco IncreaseFit (header, texto en pantalla, subtítulos, tarjeta resumen, logo) es fijo; solo cambia el clima de la escena.
- La mascota es la única figura humana: nunca personas reales, fotos ni personajes de otras cuentas o marcas.
- Sin CTA: los videos no piden comentarios, likes ni follows.
- Determinismo: nada de `Math.random()` en Remotion.

## Qué se edita dónde
Todo vive en este repo (ya no hay copia en Drive). Tras tocar `brand/paletas.json`, ejecuta `python3 scripts/validar_paletas.py`. Tras añadir sprites, regenera `mascota/manifest.json` con `scripts/mascota/` y revisa `mascota/contactos.jpg`.
