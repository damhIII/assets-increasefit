---
name: increasefit-reel
description: Construye y renderiza con Remotion un Reel vertical de IncreaseFit (gimnasio y fuerza, con la mascota ilustrada) a partir de un brief.json por planos y su locución, generados por el notebook de Colab. Úsala cuando pidan crear, renderizar o corregir un video o reel de IncreaseFit, o cuando haya un brief en briefs/.
---

# Reel IncreaseFit desde un brief

El notebook ya escribió y revisó el guion, eligió el gancho, generó la locución y calculó los tiempos. El guion llega **por planos**: cada plano es una frase de la voz con su sprite, texto en pantalla, clima, anotaciones y efectos de sonido. La plantilla ya convierte eso en un video completo. Tu trabajo es revisarlo como editor, pulir lo que no funcione y renderizar.

## 1. Localiza el material y valida
- Brief: `briefs/<BASE>/brief.json` (si dicen "el último", la carpeta más reciente) o un `brief.json` adjunto.
- `python3 scripts/validar_brief.py <brief>`. Si falla, para y dilo; no inventes tiempos ni ids.

## 2. Prepara el proyecto
`python3 scripts/preparar_video.py <brief> [--audio <wav>]` copia `plantilla/` a `videos/<BASE>/` con el brief, la mascota, el kit, el sonido, las fuentes y la locución. Luego `npm install`.

## 3. Lee las referencias que tocan (`referencias/`)
| Archivo | Cuándo |
|---|---|
| `brief.md` | siempre: qué significa cada campo |
| `marca.md` | siempre: colores, tipografía, tono visual, prohibiciones |
| `mascota.md` | siempre: sprites, encuadres, anclas, animación pose a pose |
| `layout_y_planos.md` | siempre: capas, zonas, anotaciones del kit, ritmo |
| `formatos.md` | la sección de `brief.formato` |
| `sonido.md` | al revisar o añadir efectos y música |
| `climas.md` | si algún plano no va en `hierro` |
| `tecnico.md` | al montar, revisar y renderizar |

## 4. Revisa los fotogramas antes de tocar nada
`python3 scripts/validar_brief.py <brief> --stills` imprime un fotograma por plano y el de la tarjeta resumen. Renderízalos con un solo bundle (ver `tecnico.md`) y míralos. Comprueba:
- La mascota cuenta lo mismo que la voz (error cuando habla del error, ejercicio bien hecho en el método) y no se corta ni flota.
- Nada vital fuera de Y 200–1580; nada pisa el texto en pantalla ni los subtítulos.
- Las anotaciones (etiqueta, tachado, círculo…) apuntan a la zona correcta y se leen.
- Las fuentes cargaron (Open Sans, JetBrains Mono, Kalam), no la serif del navegador.
- Las cifras de la ficha llevan "EJEMPLO ILUSTRATIVO"; los datos citados muestran su fuente.

## 5. Pule
- Para cambiar lo que pide un plano (otro sprite, otra anotación, otro encuadre), edita ese plano en `src/brief.json` del proyecto: la plantilla lo vuelve a componer.
- Para algo que la plantilla no hace (un gag concreto, un objeto que entra, una animación a medida), añade una capa en `src/escenas/extra.tsx` con la clave del plano (`p03`). Frame local al plano.
- Sincroniza los gags con la palabra exacta: `frameDePalabra(plano, "palabra")` en `src/marco/datos.ts`.
- `brief.notas_direccion`, si trae algo, manda sobre tu criterio (no sobre la marca).

## 6. Renderiza y entrega
`npx remotion render Video out/<base>.mp4 --codec=h264 --crf=18` (con `--browser-executable` si hace falta, ver `tecnico.md`). Entrega el MP4, una portada (`npx remotion still Video out/portada.png --frame=<frame del gancho con acción>`) y una línea por cada plano que hayas cambiado.
