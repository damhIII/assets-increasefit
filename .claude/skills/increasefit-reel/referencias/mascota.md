# La mascota

Atleta ilustrado estilo cómic (piel hielo, contorno de tinta con trazo de pincel, cinta y muñequeras azules, short grafito), muy expresivo. Es el protagonista de todos los videos: comete los errores, los sufre y luego los hace bien. Catálogo completo en `mascota/manifest.json` y vista previa en `mascota/contactos.jpg`.

## Sprites (PNG con fondo transparente, `public/mascota/sprites/<id>.png`)
| Categoría | Ids | Uso |
|---|---|---|
| gesto | `gesto_*` (de pie, brazos cruzados, pensar, encoger hombros, señalar, pulgar, celebrar, sorpresa, facepalm, celular, dolor de hombro, agotado en el banco, espalda, caminar) | reacciones y actitud |
| plano_medio | `plano_explicando`, `plano_esceptico` | de la cintura arriba, más cerca |
| vestuario | `vest_bata_*` | modo ciencia (datos, estudios) |
| ejercicio | `<ejercicio>_f1`, `_f2` | se usan como `"ejercicio:<nombre>"`: la plantilla alterna las fases |
| error | `error_*` (con `correcto` en el manifiesto) | lo que NO se hace; anim `temblor` |
| cara | `cara_*` | insertos circulares de reacción |
| mano | `mano_*` | primer plano de una mano |

Ejercicios con fases: dominada, sentadilla, peso_muerto, curl, press_banca, press_militar, zancada, hip_thrust.

## Escala y anclas
- Un personaje de pie mide 900 px en el PNG en todos los sprites de cuerpo, así que se intercambian sin saltos de tamaño. `cara_*` y `mano_*` van a su tamaño.
- Las fases de un ejercicio comparten lienzo y ancla: alternarlas en la misma posición anima la repetición.
- `anclas` (px del sprite): `pies` (suelas), `cabeza` (cinta), `manos` (muñequeras visibles). Son automáticas y aproximadas; pueden faltar (`null` o lista vacía).
- `mira_a` indica hacia dónde mira; `espejo: true` lo invierte.

## En la escaleta y en la plantilla (`src/personaje/Sprite.tsx`)
- En la escaleta: `mascota: { sprite, anim, encuadre, posicion, espejo }`, `dividida: { no, si }` e `inserto: { cara, en }` (ver `escaleta.md`).
- `colocar(info, encuadre, posicion)` → posición y escala: `general` = cuerpo entero de ~800 px con los pies en Y=1340; `medio` = 1,55×, cabeza en Y≈720; `primer_plano` = 2,5×, cabeza en Y≈860.
- `ancla(colocacion, "cabeza" | "manos" | "pies" | "centro")` → punto en pantalla para colocar flechas, etiquetas y efectos.
- `<Mascota sprite anim colocacion />`: `pop` (rebote al entrar, con squash), `entrar` (desde un lado), `temblor`, `ejercicio` (alterna fases cada 13 frames con estela fantasma), `estatico`. Siempre respira (escala 1 ± 0,007).
- Si dos escenas seguidas tienen el mismo sprite, encuadre y posición, la segunda no repite la entrada (`continua`).

## Reglas
- La mascota es la única figura humana. Nunca fotos, personas reales ni personajes de otras cuentas.
- El humor sale de lo que le pasa; nunca se ridiculizan cuerpos.
- Para una pose que no existe, no la dibujes a mano: usa la más cercana y anótalo en la entrega. Las poses nuevas se generan con `mascota/personaje.json` → `generar_mas` y `scripts/mascota/`.
