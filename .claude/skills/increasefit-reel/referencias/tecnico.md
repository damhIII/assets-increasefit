# Construcción técnica (Remotion)

## Proyecto
- `python3 scripts/preparar_video.py briefs/<BASE>` → `videos/<BASE>/`: plantilla + `src/video.json` (escaleta sincronizada a frames), `src/paletas.json`, `src/mascota.json`, `src/sonido.json`, `src/escenas/custom/` (tus componentes + índice generado), `public/` con `locucion.wav`, sprites, kit, sonido, fuentes, iconos, ui, texturas y logos, y `out/logs/`. Se puede repetir: conserva `node_modules` y `out/`, pero rehace `src/`. Solo imprime avisos, errores y una línea final.
- `npm run instalar > out/logs/instalar.log 2>&1; tail -5 out/logs/instalar.log` la primera vez. Remotion 4 + TypeScript. Composición `Video` con los frames exactos de `video.json`.
- Si el entorno no puede descargar Chrome Headless Shell (error con `remotion.media`), usa un Chrome local: `export REMOTION_BROWSER=/usr/bin/google-chrome` antes de los comandos (lo leen `npm run render`, `revisar`, `stills` y `movimiento`). Con 2 CPU, no fuerces `--concurrency`.

## Estructura de la plantilla
- `src/marco/`: `datos.ts` (tipos, `datos`, `SPRITES`, `escenaEn`, `frameDePalabra`, constantes `IF`, `FUENTE`), `clima.ts` (`useClima`, `useClimaEscena`), `Fuentes.tsx`, `Fondo`, `TextoPantalla`, `Subtitulos`, `BarraProgreso`, `Sonido`.
- `src/personaje/Sprite.tsx`: `colocar`, `ancla`, `fasesDe`, `<Mascota>`.
- `src/componentes/kit.tsx`: piezas animadas (ver `layout.md`).
- `src/escenas/Escena.tsx`: composición por defecto de cada escena y `Camara`. `src/escenas/custom/`: tus escenas a medida (vienen de `briefs/<BASE>/custom/`).

## Escenas a medida
```tsx
// briefs/<BASE>/custom/flecha_sube.tsx  (imports como si estuviera en src/escenas/custom/)
import React from "react";
import { interpolate, useCurrentFrame } from "remotion";
import { IF, ZONA, frameDePalabra, type Escena } from "../../marco/datos";
import type { C } from "../../marco/clima";

const FlechaSube: React.FC<{ e: Escena; c: C }> = ({ e, c }) => {
  const f = useCurrentFrame();                              // local a la escena
  const golpe = frameDePalabra(31) - e.ini_f;                // la palabra [31] en frame local
  const y = interpolate(f, [golpe, golpe + 12], [1300, 1000], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return <div style={{ position: "absolute", left: ZONA.botones - 260, top: y, width: 80, height: 80, background: c.foco }} />   // el acento siempre del clima, nunca un azul a mano; x siempre desde ZONA
};
export default FlechaSube;
```

## Assets
- `kit/*.svg` blancos (`tintable` en `kit/manifest.json`) y `icons/*.svg`: con máscara CSS (`<Tinta>`, `<Icono>`), nunca con `<Img>`. El resto, con `<Img src={staticFile(...)} />`.
- Sprites: `staticFile("mascota/sprites/<id>.png")`.
- Modo revisión: `MODO_MARGENES` de `marco/revision.ts` es `true` en los fotogramas de revisión de `npm run revisar` (fondo liso, sin subtítulos ni texto en pantalla). En una escena a medida, si dibujas algo DECORATIVO que llega al borde (partículas, rayos, fondos), no lo pintes en ese modo: `if (MODO_MARGENES) return null;`.

## Reglas de código
- Determinismo total: prohibido `Math.random()` (usa `Math.sin`, índices o `random(seed)` de Remotion).
- Hooks solo dentro de componentes y en número fijo por render.
- Dentro de una `<Sequence>` el frame es local: `useClimaEscena(e)` para los colores.
- Zona segura: las x del contenido salen de `ZONA` (`ZONA.izq`, `ZONA.der`, `ZONA.botones`, `ZONA.ancho`, `ZONA.cx`) o de `encajarX(x, ancho)`; nada de `left: 30` o `left: 1000`. Ver `layout.md`.

## Revisión y render
Los comandos largos (instalar, render, stills) se ejecutan con su salida a `out/logs/<paso>.log` y muestras solo `tail -5`; abre el log entero solo si el comando falla.
1. `npm run -s tipos` (TypeScript: sin salida si todo está bien).
2. `npm run -s revisar`: un solo bundle y un solo navegador; renderiza los fotogramas de revisión (modo revisión cada 1 s + el reposo de cada escena; modo normal cada 0,5 s) y `scripts/revisar_video.py` imprime una línea por problema (zona segura, solape con subtítulos o texto en pantalla, momentos muertos de más de 2,5 s) y `revisar: N errores, M avisos`. Sale con error si hay errores; los fotogramas culpables, con lo que molesta en magenta, quedan en `out/revision/marcados/`. Si las fuentes no cargan, falla antes con un error claro. Corrige en `briefs/<BASE>/`, repite `preparar_video.py` y vuelve a revisar hasta que salga sin errores.
3. `npm run stills > out/logs/stills.log 2>&1; tail -5 out/logs/stills.log`: un PNG por escena y por la tarjeta en `out/stills/` + `hoja.jpg` y `hoja_zonas.jpg`, para juzgar lo creativo. Frames concretos: `npm run stills -- --frames=120,480`. Opcional, si dudas del ritmo: `npm run movimiento` (uno cada 0,5 s → `out/movimiento/hoja_movimiento.jpg`). Con `--verbose`, una línea por fotograma.
4. Render: `npm run render > out/logs/render.log 2>&1; tail -5 out/logs/render.log` → `out/video.mp4`.
5. Entrega el MP4 y `escaleta.json` en el chat. Si el entorno no puede renderizar, entrega el proyecto en zip (sin `node_modules`) y el comando exacto.
