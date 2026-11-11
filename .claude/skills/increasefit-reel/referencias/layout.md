# Layout, capas y kit

Rol: director y motion designer de explainers de fitness. Ritmo de Reel, cortes secos, rebote y golpe, humor visual. Libertad creativa dentro de estas reglas.

## Capas (de atrás hacia delante), ya hechas en `src/Video.tsx`
1. **Fondo** (`marco/Fondo.tsx`): degradado y textura del clima de la escena, brillo de tinte que deriva, patrón opcional de la escena (`escena.fondo`, de `fondos/`), viñeta.
2. **Escenas**: una `<Sequence>` por escena con EXACTAMENTE `ini_f`–`fin_f` → `escenas/Escena.tsx` (mascota + anotaciones + inserto) + tu componente a medida si lo hay. Cámara viva con punch-in en la primera palabra de `enfasis`.
3. **Cortinilla** de pincel (`kit/transiciones/trazo_pincel.svg`) en las escenas con `transicion: "pincel"`.
4. **Tarjeta resumen** desde su `ini_f` (la escena se funde debajo).
5. **Marco**: `Subtitulos` (arriba, fijos desde el frame 0), `TextoPantalla` (abajo), `BarraProgreso` (solo si `opciones.barra_progreso`).
6. **Sonido** (`marco/Sonido.tsx`): voz, música con ducking y efectos.

## Zonas (px sobre 1080x1920)
- Subtítulos Y≈214–317 desde el frame 0 (sin logo ni isotipo encima: el logo solo sale en la tarjeta final); las insignias de icono cuelgan debajo hasta Y≈427. Escena Y≈540–1340 (suelo en 1340). Texto en pantalla Y≈1390–1570 (x 80–940, con un velo oscuro detrás). Tarjeta final Y≈290–1450.
- **Nada fijo durante todo el video**: ni logos, ni títulos de serie, ni rótulos persistentes, ni etiquetas que se queden de escena en escena (tampoco en escenas a medida). Lo de arriba es solo de los subtítulos.
- Nada vital por encima de Y=200 ni por debajo de Y=1580 (la interfaz de Instagram tapa esas franjas). Deja libre también la franja derecha a partir de X≈960 en Y>1300 (botones).

## Texto en pantalla (`pantalla.estilo`)
- `titular`: "línea 1 / línea 2" → línea 1 Open Sans 400 blanca + línea 2 Open Sans 800 en el foco del clima (eco del "FIT" del logo). Sin "/" va una línea en 800. Se dibuja **abajo**, bajo los pies de la mascota.
- `nota`: a mano en Kalam, ligeramente girada, también abajo.
- `capitulo`: "RÓTULO: frase" → tarjeta a pantalla completa con el rótulo grande translúcido; esa escena no muestra a la mascota.
- `ninguno`: **el valor normal**. La voz y los subtítulos ya dicen las palabras; usa texto en pantalla solo para el concepto clave (una o dos veces por video) y nunca para repetir la voz. Si dos escenas seguidas llevan el mismo texto y estilo, se queda sin volver a entrar.

## Kit (`componentes/kit.tsx`)
Lo usa la composición por defecto y lo puedes usar en tus escenas a medida: `IconoPop` (icono en insignia que salta, con `tono` y `tachado`), `FichaEstudio` (filas icono + cifra), `colorTono`, `Etiqueta`, `CajaTachada`, `Circulo`, `Marca` (check/cruz), `BurbujaPensamiento`, `BurbujaDialogo`, `Inserto`, `Dato`, `Lista`, `Efecto` (lineas_velocidad, enfoque, impacto, sudor, destello, rec), `Capitulo`, `Libreta`, `Grafica`, `TarjetaResumen`, `CortinillaPincel`, `Tinta` (SVG blanco teñido), `Icono` (Lucide). En `componentes/extra.tsx`: `PropObjeto` (id de `props/manifest.json`, x, y, lado, suelo), `MapaMuscular` (vista, resaltar, tono) y `LottieAnim` (id de `lottie/manifest.json`, x, y, size, tono para las mono). La mascota: `Mascota`, `colocar`, `ancla`, `fasesDe` en `personaje/Sprite.tsx`. Más piezas SVG en `kit/` (`kit/manifest.json`, `kit/contactos.png`), `ui/`, `icons/` y `textures/`. ¿Falta un icono? Busca en Lucide, Tabler (`tb-`, gimnasio y deporte) y Healthicons (`hi-`, cuerpo y salud): `python3 scripts/iconos.py --buscar <palabra en inglés>` y `python3 scripts/iconos.py <nombre>`. Vista previa de los que ya hay: `icons/contactos.png`.

## Dinamismo
- Nada aparece solo con opacidad: entra desde abajo, desde un lado o desde escala pequeña con overshoot (`useEntrada`).
- Sincroniza los gags con la palabra exacta: en la escaleta con `en`; en código con `frameDePalabra(i)` (frame global) menos `e.ini_f` (frame local).
- Una escena de más de ~4 s necesita algo que se mueva dentro (anotaciones escalonadas, un inserto, un ejercicio en bucle).

## Imagen antes que texto
Cada idea del guion debería verse **sin leer nada**: la mascota haciéndolo, un icono que salta en la palabra, una ficha con cifras, un check o una cruz. Si una escena necesita una frase para entenderse, cambia la imagen, no añadas la frase.

## Subtítulos
`marco/Subtitulos.tsx`: **arriba** (Y≈214, desde el primer frame). 1-3 palabras a la vez desde `datos.subtitulos`, **solo palabras** (sin signos de puntuación: los quita `sincronizar.py` y otra vez el componente); el grupo cambia en cada fin de frase, coma o pausa. Open Sans 800, 64 px, mayúsculas, en una cápsula oscura con blur (no la quites). La palabra que suena se enciende sobre una píldora azul (#2353F1, texto blanco) que salta; las ya dichas quedan en blanco y las que vienen en gris. Las de `enfasis` son más grandes, giran un poco al sonar y se quedan en azul luz; las de `subtitulos.tonos` usan rojo (alerta) o verde (éxito) en vez de azul. Las de `subtitulos.iconos` llevan una insignia redonda con el icono que cuelga **debajo** de la cápsula (~90 px, hasta Y≈427) cuando se dicen: no pongas nada vital debajo de la cápsula en esas escenas.

## Cierre
No hay CTA en la voz. La última escena es el remate; al acabar la voz entra la tarjeta final (`TarjetaResumen`): GUÁRDALO + chip del tema → la pregunta del gancho → el veredicto (verde = sí, rojo = no, foco = matiz) → CÓMO APLICARLO con 2-3 pasos numerados → fuente; debajo, la mascota con el pulgar y el logo. Se queda la cola (`cola_s`, 4 s por defecto) para leerla y guardarla. Lee la tarjeta como la última escena del guion: tiene que sonar a la conclusión de **este** Reel, no a un resumen genérico.
