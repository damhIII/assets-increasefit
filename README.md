# assets-increasefit

Contenido editorial, mascota, kit gráfico, sonido y plantilla Remotion de los Reels de IncreaseFit. El notebook de Colab deja en `briefs/<BASE>/` la investigación (búsqueda web), el guion (texto), la propuesta de tarjeta final, la locución y el tiempo de cada palabra; Claude diseña las escenas y construye el video con la skill `.claude/skills/increasefit-reel/`. Instrucciones generales: `CLAUDE.md`.

- **editorial/**: marca y voz, ADN, estilo del guion, temas, datos verificados, prompts del investigador, del guionista y de la tarjeta final.
- **mascota/**: sprites PNG del personaje (`manifest.json`, `personaje.json`, `contactos.jpg`).
- **kit/**: anotaciones dibujadas a mano y cortinilla de pincel (`manifest.json`, `contactos.png`).
- **sonido/**: efectos y música en bucle (`manifest.json`, licencias).
- **plantilla/**: proyecto Remotion · **scripts/**: alinear, sincronizar, validar, preparar y regenerar assets.
- **icons/**: Lucide, Tabler (`tb-`) y Healthicons (`hi-`): colorear con máscara CSS (`mask-image`), no con `<Img>`. `scripts/iconos.py` añade más.
- **anatomia/**: mapa muscular (react-native-body-highlighter, MIT) · **lottie/**: animaciones Lottie recoloreadas a la marca (LottieFiles, Lottie Simple License; useAnimations, MIT) · **fondos/**: patrones de fondo por escena en blanco (se tiñen con el clima).
- **ui/**: sellos MITO/REALIDAD, VS, anillo de descanso, tarjeta de serie (teñir con `scripts/tenir_svg.py` en otros climas).
- **textures/**: grano, suelo de goma, tiza, cuadrícula, viñeta, brillo azul `glow_azul.svg` (opacidad baja).
- **fonts/**: `fonts/css/*.css` con los woff2 incrustados en base64 · **brand/**: `paletas.json` (climas) y `fuentes.json`.
