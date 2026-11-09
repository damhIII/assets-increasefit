# Layout, capas y kit

Rol: director y motion designer de explainers de fitness. Ritmo de Reel, cortes secos, rebote y golpe, humor visual. Libertad creativa dentro de estas reglas.

## Capas (de atrás hacia delante), ya hechas en `src/Video.tsx`
1. **Fondo** (`marco/Fondo.tsx`): degradado y textura del clima de la escena, brillo de tinte que deriva, viñeta.
2. **Escenas**: una `<Sequence>` por escena con EXACTAMENTE `ini_f`–`fin_f` → `escenas/Escena.tsx` (mascota + anotaciones + inserto) + tu componente a medida si lo hay. Cámara viva con punch-in en la primera palabra de `enfasis`.
3. **Cortinilla** de pincel (`kit/transiciones/trazo_pincel.svg`) en las escenas con `transicion: "pincel"`.
4. **Tarjeta resumen** desde su `ini_f` (la escena se funde debajo).
5. **Marco**: `Header` (isotipo + `serie_header`), `TextoPantalla`, `Subtitulos`, `BarraProgreso` (solo si `opciones.barra_progreso`).
6. **Sonido** (`marco/Sonido.tsx`): voz, música con ducking y efectos.

## Zonas (px sobre 1080x1920)
- Header Y≈212. Texto en pantalla Y≈300–520. Escena Y≈540–1340 (suelo en 1340). Subtítulos Y≈1390–1490.
- Nada vital por encima de Y=200 ni por debajo de Y=1580 (la interfaz de Instagram tapa esas franjas). Deja libre también la franja derecha a partir de X≈960 en Y>1300 (botones).

## Texto en pantalla (`pantalla.estilo`)
- `titular`: "línea 1 / línea 2" → línea 1 Open Sans 400 blanca + línea 2 Open Sans 800 en el foco del clima (eco del "FIT" del logo). Sin "/" va una línea en 800.
- `nota`: a mano en Kalam, ligeramente girada.
- `capitulo`: "RÓTULO: frase" → tarjeta a pantalla completa con el rótulo grande translúcido; esa escena no muestra a la mascota.
- `ninguno`. El texto complementa a la voz, no la repite. Si dos escenas seguidas llevan el mismo texto y estilo, se queda sin volver a entrar.

## Kit (`componentes/kit.tsx`)
Lo usa la composición por defecto y lo puedes usar en tus escenas a medida: `Etiqueta`, `CajaTachada`, `Circulo`, `Marca` (check/cruz), `BurbujaPensamiento`, `BurbujaDialogo`, `Inserto`, `Dato`, `Lista`, `Efecto` (lineas_velocidad, enfoque, impacto, sudor, destello, rec), `Capitulo`, `Libreta`, `Grafica`, `TarjetaResumen`, `CortinillaPincel`, `Tinta` (SVG blanco teñido), `Icono` (Lucide). La mascota: `Mascota`, `colocar`, `ancla`, `fasesDe` en `personaje/Sprite.tsx`. Más piezas SVG en `kit/` (`kit/manifest.json`, `kit/contactos.png`), `ui/`, `icons/` y `textures/`.

## Dinamismo
- Nada aparece solo con opacidad: entra desde abajo, desde un lado o desde escala pequeña con overshoot (`useEntrada`).
- Sincroniza los gags con la palabra exacta: en la escaleta con `en`; en código con `frameDePalabra(i)` (frame global) menos `e.ini_f` (frame local).
- Una escena de más de ~4 s necesita algo que se mueva dentro (anotaciones escalonadas, un inserto, un ejercicio en bucle).

## Subtítulos
1-3 palabras a la vez desde `datos.subtitulos` (ortografía del guion); Open Sans 800, 64 px, mayúsculas. Palabra actual en azul luz con pop; las de `enfasis` más grandes y se quedan en azul luz. Cápsula oscura con blur: no la quites.

## Cierre
No hay CTA. La última escena es el remate; al acabar la voz entra la tarjeta resumen (título + 2-4 líneas con check, logo) con la mascota haciendo el pulgar, y se queda la cola para poder pausar y guardar.
