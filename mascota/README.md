# Mascota IncreaseFit

Personaje ilustrado (concepto A, «Atleta de tinta») en sprites PNG con fondo transparente, listos para animar pose a pose en Remotion. Sustituye a Rep.

## Qué hay aquí
| Ruta | Qué es |
|---|---|
| `sprites/*.png` | 91 sprites recortados y normalizados (77 de cuerpo y planos medios, 8 caras, 6 manos) |
| `manifest.json` | Catálogo: categoría, vista, hacia dónde mira, emoción, ejercicio y fase, anclas y estado de cada sprite |
| `personaje.json` | Ficha del personaje: descripción canónica, paleta medida, prompt base para generar más poses y reglas |
| `contactos.jpg` | Hoja de contactos de todos los sprites |
| `referencias/` | Concepto elegido, hoja de modelo, expresiones y manos: se adjuntan siempre al generar poses nuevas |
| `hojas/` | Las hojas originales del generador (fuente de los sprites) |

## Cómo usar los sprites
- **Escala común:** un personaje de pie mide 900 px en todos los sprites de cuerpo, así que se pueden intercambiar sin reescalar. `cara_*` y `mano_*` son insertos y van a su propio tamaño.
- **Fases:** `<ejercicio>_f1`, `_fm` (intermedia) y `_f2` comparten tamaño de lienzo y ancla (pies, barra, banco o centro): alternarlas en la misma posición anima la repetición.
- **Hablar:** `plano_boca_reposo`, `_a`, `_e`, `_o`, `_u` son la misma cara con distinta boca (las bocas se pegan sobre la base con `scripts/mascota/bocas.py`).
- **Anclas** (`manifest.json` → `anclas`), en px del propio sprite: `pies` (centro de las suelas, para apoyarlo en el suelo), `cabeza` (la cinta) y `manos` (muñequeras visibles). Sirven para colocar flechas, etiquetas o bocadillos. Son automáticas y aproximadas; `null` = no detectada.
- **Mirar al otro lado:** `mira_a` dice hacia dónde mira; para invertirlo, `transform: scaleX(-1)`.
- Los sprites `error_*` llevan `correcto` con el ejercicio bien hecho para enseñar el contraste.

## Añadir poses nuevas
1. Genera una hoja de 3–4 poses con el `prompt_base` de `personaje.json`, fondo transparente y las tres imágenes de `referencias/` adjuntas.
2. Guárdala en `hojas/` y añádela a `scripts/mascota/config.json` con los nombres de sus sprites, en orden de izquierda a derecha. Pon en `ajustes.json` → `pph` la altura en px de un personaje de pie en esa hoja.
3. Añade cada sprite nuevo a la tabla `M` de `scripts/mascota/manifiesto.py` (categoría, vista, emoción, descripción).
4. Desde la raíz del repo:
   ```
   python3 scripts/mascota/procesar.py scripts/mascota/config.json scripts/mascota/ajustes.json mascota
   python3 scripts/mascota/bocas.py mascota
   python3 scripts/mascota/manifiesto.py mascota
   ```
5. Revisa `contactos.jpg` antes de subir. Las figuras que no valgan van a `ajustes.json` → `descartar` (con el motivo en `_notas_descartes`).

Nota: `procesar.py` vuelve a cortar todas las hojas; los sprites antiguos salen prácticamente idénticos (solo cambia ruido en píxeles casi transparentes), así que basta con subir los nuevos y los que cambian de lienzo.
