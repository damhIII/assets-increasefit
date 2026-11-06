---
name: increasefit-reel
description: Construye y renderiza con Remotion un Reel vertical de IncreaseFit (gimnasio y fuerza, con la mascota Rep) a partir de un brief.json y su locución generados por el notebook de Colab. Úsala cuando pidan crear, renderizar o corregir un video o reel de IncreaseFit, o cuando haya un brief en briefs/.
---

# Reel IncreaseFit desde un brief

El notebook ya escribió y verificó el guion, generó la locución, calculó los tiempos y decidió qué hace Rep en cada bloque. Tu trabajo es la dirección de arte y la animación: convertir `brief.json` + audio en un MP4 con el humor y la claridad de la cuenta.

## 1. Localiza el material y valida
- Brief: `briefs/<BASE>/brief.json` (si dicen "el último", la carpeta más reciente) o un `brief.json` adjunto.
- `python3 scripts/validar_brief.py <brief>`. Si falla, para y dilo; no inventes rangos.

## 2. Prepara el proyecto
`python3 scripts/preparar_video.py <brief> [--audio <wav>]` copia `plantilla/` a `videos/<BASE>/` con el brief, las paletas, el audio, las fuentes y los assets. Luego `npm install`.
La plantilla ya renderiza un video completo y correcto con escenas por defecto: **no empieces de cero**. Tu valor está en las escenas.

## 3. Lee las referencias que tocan (`referencias/`)
| Archivo | Cuándo |
|---|---|
| `brief.md` | siempre: qué significa cada campo |
| `marca.md` | siempre: colores, tipografía, tono visual, prohibiciones |
| `rep.md` | siempre: cómo usar a Rep, sus movimientos, gestos y cómo añadir uno |
| `layout_y_bloques.md` | siempre: layout fijo, los 6 bloques, movimiento, subtítulos |
| `plantillas.md` | la sección de `brief.plantilla` |
| `climas.md` | si algún valor de `brief.climas` no es `hierro` |
| `tecnico.md` | al montar, revisar y renderizar |

## 4. Dirige cada escena
Edita `src/escenas/index.tsx` (o crea escenas propias) bloque a bloque. Para cada uno parte de `bloques[].visual` (`rep`, `gesto`, `idea`) y de lo que dice la voz en ese tramo (`texto`, `subtitulos`):
- `gancho` y `error` son donde vive el humor: haz que a Rep le pase algo (la barra que no sube, el sudor, el celular, el replay del fallo). Sincroniza el gag con la palabra que lo remata.
- `por_que` explica: mapa muscular, diagrama, dato con fuente. Claro antes que bonito.
- `metodo` enseña: los `pasos` se encienden en `pasos_f` y Rep hace la versión correcta.
- `resultado` mide progreso (kilos, repes, semanas) con la ficha: siempre "EJEMPLO ILUSTRATIVO".
`brief.notas_direccion` manda sobre tu criterio (no sobre la marca). Lo que no esté en el brief ni en las referencias, decídelo tú con la estética IncreaseFit.

## 5. Revisa como un editor
Ejecuta los stills que imprime `validar_brief.py --stills` (ver `tecnico.md`, un solo bundle) y mira cada imagen. Antes de renderizar, todo esto debe ser cierto:
- Nada vital fuera de Y 200–1580; nada pisa el titular ni los subtítulos.
- Las fuentes cargaron (Open Sans, no la serif del navegador).
- El cian solo marca el foco; en climas claros la línea 2 va como marcador y Rep es oscuro.
- Rep se recorta bien sobre el fondo, no flota (pies en el suelo, manos en la barra) y nunca se corta por los bordes.
- Las cifras de entreno llevan "EJEMPLO ILUSTRATIVO"; los datos con fuente muestran su fuente.
- Transiciones de clima en fundido. Duración = `brief.video.frames`.

## 6. Renderiza y entrega
`npx remotion render Video out/<base>.mp4 --codec=h264 --crf=18`. Entrega el MP4 y el proyecto en zip sin `node_modules`, con una línea por bloque de lo que hiciste (gag, Rep, clima).
