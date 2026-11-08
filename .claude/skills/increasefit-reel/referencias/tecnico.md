# Construcción técnica (Remotion)

## Proyecto
- `python3 scripts/preparar_video.py briefs/<BASE>` → `videos/<BASE>/`: plantilla + `src/video.json` (escaleta sincronizada a frames), `src/paletas.json`, `src/mascota.json`, `src/sonido.json`, `src/escenas/custom/` (tus componentes + índice generado) y `public/` con `locucion.wav`, sprites, kit, sonido, fuentes, iconos, ui, texturas y logos. Se puede repetir: conserva `node_modules` y `out/`, pero rehace `src/`.
- `npm install` la primera vez. Remotion 4 + TypeScript. Composición `Video` con los frames exactos de `video.json`.
- Si el entorno no puede descargar Chrome Headless Shell, usa un Chrome local: `--browser-executable=/usr/bin/google-chrome` en la CLI, `npm run stills -- --browser=/usr/bin/google-chrome` o `Config.setBrowserExecutable` en `remotion.config.ts`. Con 2 CPU, no fuerces `--concurrency`.

## Estructura de la plantilla
- `src/marco/`: `datos.ts` (tipos, `datos`, `SPRITES`, `escenaEn`, `frameDePalabra`, constantes `IF`, `FUENTE`), `clima.ts` (`useClima`, `useClimaEscena`), `Fuentes.tsx`, `Fondo`, `Header`, `TextoPantalla`, `Subtitulos`, `BarraProgreso`, `Sonido`.
- `src/personaje/Sprite.tsx`: `colocar`, `ancla`, `fasesDe`, `<Mascota>`.
- `src/componentes/kit.tsx`: piezas animadas (ver `layout.md`).
- `src/escenas/Escena.tsx`: composición por defecto de cada escena y `Camara`. `src/escenas/custom/`: tus escenas a medida (vienen de `briefs/<BASE>/custom/`).

## Escenas a medida
```tsx
// briefs/<BASE>/custom/flecha_sube.tsx  (imports como si estuviera en src/escenas/custom/)
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { IF, frameDePalabra, type Escena } from "../../marco/datos";
import type { C } from "../../marco/clima";

const FlechaSube: React.FC<{ e: Escena; c: C }> = ({ e }) => {
  const f = useCurrentFrame();                              // local a la escena
  const golpe = frameDePalabra(31) - e.ini_f;                // la palabra [31] en frame local
  const y = interpolate(f, [golpe, golpe + 12], [1300, 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", left: 640, top: y, width: 80, height: 80, background: IF.cian }} />;
};
export default FlechaSube;
```

## Assets
- `kit/*.svg` blancos (`tintable` en `kit/manifest.json`) y `icons/*.svg`: con máscara CSS (`<Tinta>`, `<Icono>`), nunca con `<Img>`. El resto, con `<Img src={staticFile(...)} />`.
- Sprites: `staticFile("mascota/sprites/<id>.png")`.

## Reglas de código
- Determinismo total: prohibido `Math.random()` (usa `Math.sin`, índices o `random(seed)` de Remotion).
- Hooks solo dentro de componentes y en número fijo por render.
- Dentro de una `<Sequence>` el frame es local: `useClimaEscena(e)` para los colores.

## Revisión y render
1. `npm run tipos` (TypeScript) y `npm run stills`: un solo bundle, un PNG por escena y por la tarjeta en `out/stills/` + hoja de contactos `out/stills/hoja.jpg`. Para frames concretos: `npm run stills -- --frames=120,480`.
2. Mira las imágenes y corrige en `briefs/<BASE>/`: solapes, textos fuera de zona, fuentes, mascota cortada o flotando, anotaciones que no apuntan.
3. Render: `npx remotion render Video out/<BASE>.mp4 --codec=h264 --crf=18`.
4. Entrega el MP4 y la portada. Si el entorno no puede renderizar, entrega el proyecto en zip (sin `node_modules`) y el comando exacto.
