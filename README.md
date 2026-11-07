# assets-increasefit

<<<<<<< HEAD
Mascota, kit gráfico, sonido y plantilla Remotion de los Reels de IncreaseFit. El notebook de Colab deja cada encargo en `briefs/<BASE>/` (brief por planos + locución) y Claude construye el video con la skill `.claude/skills/increasefit-reel/`. Instrucciones generales: `CLAUDE.md`.

- **mascota/**: sprites PNG del personaje (`manifest.json`, `personaje.json`, `contactos.jpg`).
- **kit/**: anotaciones dibujadas a mano y cortinilla de pincel (`manifest.json`, `contactos.png`).
- **sonido/**: efectos y música en bucle (`manifest.json`, licencias).
- **plantilla/**: proyecto Remotion · **scripts/**: preparar, validar y regenerar assets.
- **fonts/**, **icons/**, **textures/**, **ui/**, **brand/paletas.json** y logos.
=======
Assets, mascota (Rep) y plantilla Remotion de los Reels de IncreaseFit. Los assets se sincronizan desde Drive con el notebook de creación de videos: no los edites aquí a mano.

Instrucciones para Claude: `CLAUDE.md` y la skill `.claude/skills/increasefit-reel/`. Lista completa de archivos: `manifest.json`. Cada video: `briefs/<BASE>/`.

- **icons/**: Iconos de trazo (Lucide) con stroke=currentColor: colorear con máscara CSS (mask-image), no con <Img>.
- **logos/**: Logos de redes (blancos) solo para el CTA. Con máscara CSS para colorearlos.
- **ui/**: Piezas de interfaz IncreaseFit (colores fijos; teñir con scripts/tenir_svg.py en otros climas): sellos MITO/REALIDAD, VS, CTA, anillo de descanso, tarjeta de serie.
- **textures/**: Texturas de fondo (grano, suelo de goma, tiza, cuadrícula, viñeta, brillo cian). Usar con opacidad baja.
- **fonts/**: fonts/css/*.css: @font-face con los woff2 ya incrustados en base64 (listos para importar).
- **brand/**: brand/paletas.json: climas de escena (validar con scripts/validar_paletas.py).
>>>>>>> 258a6228b58b5015bf5f1a22a44c1ddab4b67f70
