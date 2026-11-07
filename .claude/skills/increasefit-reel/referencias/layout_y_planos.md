# Layout, planos y kit

Rol: editor y motion designer de explainers de fitness. Ritmo de Reel: algo cambia cada 1,5–4 s (un plano por frase), cortes secos, rebote y golpe. Libertad creativa dentro de estas reglas.

## Capas (de atrás hacia delante), ya hechas en `src/Video.tsx`
1. **Fondo** (`marco/Fondo.tsx`): degradado y textura del clima del plano, brillo de tinte que deriva, viñeta.
2. **Planos**: una `<Sequence>` por plano con EXACTAMENTE `ini_f`–`fin_f` → `escenas/Plano.tsx` (mascota + anotaciones + `extra.tsx`). Cámara viva con punch-in en la primera palabra de `enfasis`.
3. **Cortinilla** de pincel (`kit/transiciones/trazo_pincel.svg`) en cada cambio de `bloque`.
4. **Tarjeta resumen** desde `tarjeta_resumen.ini_f` (la escena se funde debajo).
5. **Marco**: `Header` (isotipo + `serie_header`), `TextoPantalla`, `Subtitulos`, `BarraProgreso` (solo si `opciones.barra_progreso`).
6. **Sonido** (`marco/Sonido.tsx`): voz, música con ducking y efectos.

## Zonas (px sobre 1080x1920)
- Header Y≈212. Texto en pantalla Y≈300–520. Escena Y≈540–1340 (suelo en 1340). Subtítulos Y≈1390–1490.
- Nada vital por encima de Y=200 ni por debajo de Y=1580 (la interfaz de Instagram tapa esas franjas). Deja libre también la franja derecha a partir de X≈960 en Y>1300 (botones).

## Texto en pantalla (`pantalla.estilo`)
- `titular`: "línea 1 / línea 2" → línea 1 Open Sans 400 blanca + línea 2 Open Sans 800 cian (eco del logo). Sin "/" va una línea en 800.
- `nota`: a mano en Kalam, ligeramente girada.
- `capitulo`: "ERROR 1: agarre ancho" → tarjeta a pantalla completa con el rótulo grande translúcido; ese plano no muestra a la mascota.
- `ninguno`. El texto complementa a la voz, no la repite.

## Anotaciones (`overlays`, componentes en `componentes/kit.tsx`)
| tipo | campos | qué hace |
|---|---|---|
| etiqueta | texto, apunta | texto a mano con flecha curva que se dibuja hasta el ancla |
| tachado | texto | caja blanca que cae y se tacha en rojo |
| circulo | apunta | círculo de rotulador cian alrededor del ancla |
| check / cruz | – | marca verde / roja que cae con golpe junto a la cabeza |
| burbuja_pensamiento | sprite | nube con un sprite pequeño dentro |
| burbuja_dialogo | texto | bocadillo con texto a mano |
| dato | texto (cifra), detalle | cifra grande que cuenta + explicación + `fuente_en_pantalla` (la mascota pasa a la derecha) |
| lista | items | checklist que se marca a lo largo del plano (mascota a la derecha) |
| libreta / grafica | – | progresión ILUSTRATIVA de la ficha (mascota a la derecha) |
| rec | – | marco de cámara del celular con el punto rojo parpadeando |
| lineas_velocidad, enfoque | – | detrás de la mascota |
| impacto, sudor, destello | – | junto a la cabeza |

`visual.inserto` = cara en un círculo (reacción). `visual.sprite_b` = pantalla dividida ASÍ NO / ASÍ SÍ con cruz y check.

## Subtítulos
1-3 palabras a la vez desde `brief.subtitulos`; Open Sans 800, 64 px, mayúsculas. Palabra actual cian con pop; las de `enfasis` más grandes y se quedan en cian. Cápsula oscura con blur: no la quites.

## Cierre
No hay CTA. El último plano es el remate; al acabar la voz entra la tarjeta resumen (título + 2-4 líneas con check, logo) con la mascota haciendo el pulgar, y se queda los 3 s de cola para poder pausar y guardar.
