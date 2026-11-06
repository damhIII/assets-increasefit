# Layout, bloques y movimiento

Rol: motion designer de explainers de fitness. Movimiento con rebote y golpe, ritmo de Reel, humor visual. Nada de diapositivas quietas ni fundidos lentos. Libertad creativa dentro de estas reglas.

## Capas (de atrás hacia delante) — ya hechas en la plantilla
1. **Fondo** (`marco/Fondo.tsx`): degradado `fondo_a` → `fondo_b` del clima, brillo de `tinte` que deriva, textura del clima (opacidad ≤ 0,12; en claros la cuadrícula al 90 %) y viñeta.
2. **Escena** del bloque (Y≈560–1330), una `<Sequence>` por bloque con EXACTAMENTE `ini_f`–`fin_f`.
3. **Marco** (siempre igual): `BarraProgreso`, `Header`, `Titular`, `Subtitulos`.

## Layout fijo (px sobre 1080x1920)
- **Barra de progreso**: 8 px cian en Y=0 con chispa que pulsa.
- **Header** Y≈240: isotipo (52 px de alto) + `serie_header` en Open Sans 700, 32 px, tracking 0,2 em, blanco al 85 %.
- **Titular** Y≈300–520, margen izquierdo 80: línea 1 Open Sans 400 ~74 px blanca, línea 2 Open Sans 800 ~96 px cian, en mayúsculas (se reduce si no cabe en 920 px). Entra desde abajo con spring y sale hacia arriba. El bloque CTA no lleva titular (tiene su tarjeta).
- **Escena**: Y≈560–1330. Suelo de Rep en Y≈1300.
- **Subtítulos**: Y≈1390–1490.
- Nada vital por encima de Y=200 (salvo la barra) ni por debajo de Y=1580.

## Los 6 bloques
1. **GANCHO** (2-4 s): una imagen que rompe la creencia al instante. Rep hace el ejercicio del tema; punch-in en la palabra clave. Si la plantilla es `mito_realidad`, cae el sello MITO.
2. **ERROR** (4-7 s): la comedia. Rep comete el error y lo sufre (gestos `sudor`, `esfuerzo`, `mareo`; celular en el descanso eterno; la barra que no baja). Chips rojos con los `errores` de la ficha, o la plantilla (`comparacion`, `replay`).
3. **POR_QUE** (5-8 s): el mecanismo. Mapa muscular sobre Rep con etiquetas (`Etiqueta` + `puntoDeRep`), diagrama simple (2-4 nodos con flechas que se dibujan) o el dato con fuente (`DatoConFuente`). Un poco más pausado, siempre con micro-movimiento.
4. **METODO** (8-14 s): los `pasos` como tarjetas que se encienden en `pasos_f` y quedan con check; Rep hace la versión correcta con los músculos encendidos. Cues sobre Rep si caben.
5. **RESULTADO** (3-5 s): progreso medible: gráfica que se dibuja (`Grafica`), KPI que cuenta rápido ("+2,5 KG", "+3 REPS"), Rep celebrando (`flex` + `brillo`). Siempre "EJEMPLO ILUSTRATIVO" si los números vienen de la ficha.
6. **CTA** (~3 s): siempre en clima base. "COMENTA" + la palabra en caja cian con texto grafito (Open Sans 800, latido `1 + sin(f/5)·0,05`), flechas animadas, logo IncreaseFit y Rep pequeño (`manos_cadera`, `senalar`). Si `cta_con_entrega` es false, no prometas nada a cambio.

## Dinamismo
- Cámara viva (`Camara` en escenas): flota `sin(f/12)·6 px`, rota ±0,4°; punch-in 1,00 → 1,06 con spring en frases clave.
- Nada aparece solo con opacidad: entra desde abajo, desde un lado o desde escala 0,3 con overshoot.
- Sincroniza los gags con la palabra exacta: busca su tiempo en `brief.subtitulos` (`Math.round(seg * fps) - bloque.ini_f` = frame local).

## Subtítulos (siempre estilo IncreaseFit)
1-3 palabras a la vez desde `brief.subtitulos`; Open Sans 800, 64 px, mayúsculas. Palabra actual cian con escala 1,18 y resplandor; pasadas blancas; futuras `#5E7180`. Cápsula `rgba(10,14,18,0.72)` con blur: garantiza la lectura en climas claros, no la quites.
