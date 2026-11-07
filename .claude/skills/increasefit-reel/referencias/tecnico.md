# Construcción técnica (Remotion)

## Proyecto
- `python3 scripts/preparar_video.py briefs/<BASE>/brief.json` → `videos/<BASE>/` (plantilla + `src/brief.json`, `src/paletas.json`, `src/mascota.json`, `src/sonido.json` + `public/` con locución, sprites, kit, sonido, fuentes, iconos, texturas y logos). `npm install`.
- Remotion 4 + TypeScript. Composición `Video` con `brief.video.frames` exactos.
- Si el entorno no puede descargar Chrome Headless Shell, usa un Chrome local: `--browser-executable=/usr/bin/google-chrome` (o `Config.setBrowserExecutable` en `remotion.config.ts`). Con 2 CPU, no fuerces `--concurrency`.

## Estructura de la plantilla
- `src/marco/`: `datos.ts` (tipos, `brief`, `SPRITES`, `planoEn`, `frameDePalabra`, constantes `IF`, `FUENTE`), `clima.ts` (`useClima`, `useClimaPlano`), `Fuentes.tsx`, `Fondo`, `Header`, `TextoPantalla`, `Subtitulos`, `BarraProgreso`, `Sonido`.
- `src/personaje/Sprite.tsx`: `colocar`, `ancla`, `fasesDe`, `<Mascota>`.
- `src/componentes/kit.tsx`: `Etiqueta`, `CajaTachada`, `Circulo`, `Marca`, `BurbujaPensamiento`, `BurbujaDialogo`, `Inserto`, `Dato`, `Lista`, `Efecto`, `Capitulo`, `Libreta`, `Grafica`, `TarjetaResumen`, `CortinillaPincel`, `Tinta`, `Icono`.
- `src/escenas/Plano.tsx`: compone cada plano desde el brief. `src/escenas/extra.tsx`: tus capas a medida por plano.

## Assets
- `kit/*.svg` blancos (`tintable` en `kit/manifest.json`) y `icons/*.svg`: con máscara CSS (`<Tinta>`, `<Icono>`), nunca con `<Img>`. El resto, con `<Img src={staticFile(...)} />`.
- Sprites: `staticFile("mascota/sprites/<id>.png")`.

## Reglas de código
- Determinismo total: prohibido `Math.random()` (usa `Math.sin`, índices o `random(seed)` de Remotion).
- Hooks solo dentro de componentes y en número fijo por render.
- Dentro de una `<Sequence>` el frame es local: `useClimaPlano(plano)` para los colores.

## Revisión y render
1. `python3 scripts/validar_brief.py <brief> --stills` imprime los fotogramas a revisar. Renderizarlos con la CLI reempaqueta cada vez: usa un solo bundle con `@remotion/bundler` + `renderStill` en bucle (en serie).
2. Mira las imágenes y corrige: solapes, textos fuera de zona, fuentes, mascota cortada o flotando, anotaciones que no apuntan.
3. Render: `npx remotion render Video out/<base>.mp4 --codec=h264 --crf=18`.
4. Entrega el MP4 y la portada. Si el entorno no puede renderizar, entrega el proyecto en zip (sin `node_modules`) y el comando exacto.
