# assets-increasefit

Repositorio de los Reels de **IncreaseFit**, una cuenta de salud y entrenamiento para personas normales con trabajos normales (público en `editorial/marca.md`): contenido editorial, mascota, recursos gráficos y sonoros y la plantilla Remotion que convierte la escaleta en el video.

## Cómo llega un encargo
1. El notebook de Colab `Crear_video_IncreaseFit_v10.ipynb` sortea un eje (`editorial/ejes.json`); GPT busca un estudio y escribe guion y tarjeta final (`editorial/prompt_reel.md`); una persona revisa el guion; Gemini locuta y Whisper saca el tiempo de cada palabra.
2. El notebook sube a `briefs/<BASE>/` (`AAAAMMDD-HHMM`) `guion.txt`, `locucion.wav`, `palabras.json`, `tarjeta.json` e `investigacion.json`.
3. Tú diseñas la escaleta y renderizas con la skill **increasefit-reel** (`.claude/skills/increasefit-reel/SKILL.md`); sus "Reglas fijas" son las reglas de esta etapa. Es de solo lectura: lo que generas (`subtitulos.json`, `escaleta.json`, `custom/`, `videos/`) es local a tu sesión y no se sube al repo; entregas en el chat.

## Estructura
- `.claude/skills/increasefit-reel/` la skill: pasos, reglas fijas y `referencias/`.
- `briefs/` una carpeta por video con lo que sube el notebook (`briefs/LEEME.md`).
- `editorial/` lo que lee el notebook: marca y público, ADN, estilo del guion, ejes y prompts.
- `plantilla/` proyecto Remotion; `scripts/preparar_video.py` lo copia a `videos/<BASE>/` (local).
- `scripts/` alinear, sincronizar, validar, preparar, revisar el video, iconos y regeneradores.
- `mascota/` sprites del personaje (`manifest.json`, `contactos.jpg`).
- `props/` objetos en el estilo de la mascota (`manifest.json`, `contactos.jpg`).
- `kit/` anotaciones dibujadas a mano y cortinilla de pincel.
- `icons/` Lucide, Tabler (`tb-`) y Healthicons (`hi-`); vista previa en `icons/contactos.png`.
- `lottie/` animaciones Lottie en colores de marca.
- `fondos/` patrones de fondo por escena.
- `anatomia/` mapa muscular.
- `ui/` y `textures/` SVG de apoyo.
- `sonido/` efectos y música.
- `brand/` climas (`paletas.json`) y fuentes; `fonts/` las fuentes incrustadas; logos PNG en la raíz.
