# assets-increasefit

Assets, mascota (Rep) y plantilla Remotion de los Reels de IncreaseFit. Los assets se sincronizan desde Drive con el notebook de creación de videos: no los edites aquí a mano.

Instrucciones para Claude: `CLAUDE.md` y la skill `.claude/skills/increasefit-reel/`. Lista completa de archivos: `manifest.json`. Cada video: `briefs/<BASE>/`.

- **icons/**: Iconos de trazo (Lucide) con stroke=currentColor: colorear con máscara CSS (mask-image), no con <Img>.
- **logos/**: Logos de redes (blancos) solo para el CTA. Con máscara CSS para colorearlos.
- **ui/**: Piezas de interfaz IncreaseFit (colores fijos; teñir con scripts/tenir_svg.py en otros climas): sellos MITO/REALIDAD, VS, CTA, anillo de descanso, tarjeta de serie.
- **textures/**: Texturas de fondo (grano, suelo de goma, tiza, cuadrícula, viñeta, brillo cian). Usar con opacidad baja.
- **fonts/**: fonts/css/*.css: @font-face con los woff2 ya incrustados en base64 (listos para importar).
- **brand/**: brand/paletas.json: climas de escena (validar con scripts/validar_paletas.py).
