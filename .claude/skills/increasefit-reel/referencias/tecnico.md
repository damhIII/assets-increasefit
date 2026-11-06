# Construcción técnica (Remotion)

## Proyecto
- `python3 scripts/preparar_video.py briefs/<BASE>/brief.json` → `videos/<BASE>/` (plantilla + brief + paletas + audio + fuentes + assets). `npm install`.
- Remotion 4 + TypeScript. Composición `Video` con `brief.video.frames` exactos (lo hace `Root.tsx`).
- `src/brief.json` es la única fuente de datos; léelo desde `marco/datos.ts`.
- Audio: la locución es la única pista. No la recortes, no la aceleres ni le añadas música.
- Si el entorno no puede descargar Chrome Headless Shell, usa un Chrome local: `--browser-executable=/usr/bin/google-chrome` (o `Config.setBrowserExecutable` en `remotion.config.ts`).

## Estructura de la plantilla
- `src/marco/`: `datos.ts` (brief, paletas, constantes `IF`, `FUENTE`), `clima.ts`, `Fuentes.tsx` (carga los CSS base64 con `delayRender`), `Fondo`, `BarraProgreso`, `Header`, `Titular`, `Subtitulos`.
- `src/rep/`: `esqueleto.ts` (FK + IK, puro), `movimientos.json` (catálogo), `Rep.tsx` (dibujo, músculos, equipo, gestos, `puntoDeRep`).
- `src/componentes/`: `Lienzo`, `RepClima`, `Suelo`, `Icono`, `Chip`, `Pasos`, `Libreta`, `Grafica`, `Sello`, `DatoConFuente`, `Etiqueta`, `useEntrada`.
- `src/escenas/index.tsx`: las 6 escenas por defecto y `ESCENAS`. Aquí trabajas.

## Assets
- `icons/*.svg` (Lucide) y `logos/*.svg`: **siempre con máscara CSS** (`<Icono nombre="timer" color={IF.cian} />`), nunca con `<Img>`.
- `ui/`, `textures/`: con `<Img src={staticFile(...)} />`.
- Si un asset no existe, dibújalo como SVG nativo con los colores del clima.

## Reglas de código
- Determinismo total: prohibido `Math.random()` (usa `Math.sin`, índices o `random(seed)` de Remotion).
- Hooks solo dentro de componentes y en número fijo por render.
- En escenas, `useClimaBloque(b)` y el frame local (`useCurrentFrame()` ya es local dentro de la `<Sequence>`).

## Revisión y render
1. `python3 scripts/validar_brief.py <brief> --stills` imprime los frames a revisar (mitad y final de cada bloque y transiciones de clima). Renderizar cada still con la CLI reempaqueta cada vez y lanzarlos en paralelo bloquea Chrome: usa un solo bundle con `@remotion/bundler` + `renderStill` en bucle (en serie) o `npx remotion still` uno detrás de otro.
2. Mira las imágenes y corrige: solapes, textos fuera de zona segura, fuentes, subtítulos, Rep flotando o cortado, contraste en climas claros.
3. Render: `npx remotion render Video out/<base>.mp4 --codec=h264 --crf=18`.
4. Entrega el MP4 y el proyecto en zip (sin `node_modules`). Si el entorno no puede renderizar, entrega el proyecto y el comando exacto.
