# assets-increasefit

Repositorio de los Reels de **IncreaseFit** (cuenta de gimnasio y entrenamiento de fuerza, nivel intermedio). Contiene el contenido editorial, la mascota ilustrada, el kit gráfico, el sonido, las paletas, las fuentes y una **plantilla Remotion** que convierte la escaleta de escenas en el video.

## Cómo llega un encargo
El notebook de Colab (`Crear_video_IncreaseFit_v3.ipynb`) hace solo tres cosas: escribe el **guion** (una llamada a GPT, solo texto), lo **locuta** (Gemini TTS) y saca el **tiempo de cada palabra** (Whisper). Deja `guion.txt`, `locucion.wav` y `palabras.json` en `briefs/<BASE>/` (BASE = `AAAAMMDD-HHMM`).

Todo lo demás lo haces tú con la skill **increasefit-reel** (`.claude/skills/increasefit-reel/SKILL.md`): verificar las cifras, diseñar las escenas (`briefs/<BASE>/escaleta.json` y escenas a medida en `briefs/<BASE>/custom/`), montar, revisar y renderizar.

## Estructura
- `editorial/` voz y marca (`marca.md`), ADN (`adn.md`), temas de inspiración, **datos verificados** (biblioteca que comparten GPT y Claude), el prompt del guionista (`prompt_guion.md`) y el perfil de locución (`voz_tts.md`).
- `plantilla/` proyecto Remotion: marco (`src/marco/`), mascota (`src/personaje/`), kit animado (`src/componentes/kit.tsx`), composición por escena (`src/escenas/Escena.tsx`) y escenas a medida (`src/escenas/custom/`, generado).
- `scripts/` `alinear.py` (guion ↔ voz), `sincronizar.py` (escaleta → frames), `validar_render.py`, `preparar_video.py`, `validar_paletas.py`, `tenir_svg.py`, y los regeneradores de mascota, kit y sonido.
- `mascota/` sprites PNG (catálogo `mascota/manifest.json`, ficha `mascota/personaje.json`, hoja `mascota/contactos.jpg`). `scripts/mascota/` corta y normaliza hojas nuevas.
- `kit/` anotaciones dibujadas a mano (SVG) y la cortinilla de pincel. `sonido/` efectos y música en bucle. `icons/` Lucide (`currentColor`, siempre con máscara CSS). `textures/`, `ui/` SVG de apoyo.
- `brand/paletas.json` climas de escena · `brand/fuentes.json` fuentes · `fonts/css/` `@font-face` con woff2 en base64 · logos PNG en la raíz.
- `briefs/<BASE>/` guion, locución y tiempos (los sube el notebook) + tu escaleta y escenas a medida. `videos/` proyectos de render locales (no se suben).

## Reglas que valen siempre
- El marco IncreaseFit (header, texto en pantalla, subtítulos, tarjeta resumen, logo) es fijo; dentro de las escenas, libertad creativa.
- La mascota es la única figura humana: nunca personas reales, fotos ni personajes de otras cuentas o marcas.
- Sin CTA: los videos no piden comentarios, likes ni follows.
- Cifras de estudios en pantalla solo con su fuente verificada en `editorial/datos_verificados.json`; las de ejemplo, rotuladas como ilustrativas.
- Determinismo: nada de `Math.random()` en Remotion.

## Qué se edita dónde
Todo vive en este repo. Tras tocar `brand/paletas.json`, ejecuta `python3 scripts/validar_paletas.py`. Tras añadir sprites, regenera `mascota/manifest.json` con `scripts/mascota/` y revisa `mascota/contactos.jpg`. Para cambiar cómo escribe o suena el guion, edita `editorial/prompt_guion.md` o `editorial/voz_tts.md` (el notebook los lee de aquí).
