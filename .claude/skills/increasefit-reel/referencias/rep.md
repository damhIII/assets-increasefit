# Rep, la mascota

Figura sin cara de trazo grueso tipo pincel (eco de la flecha del logo), cuerpo en `cuerpo_rep` del clima, extremidades del lado lejano en `cuerpo_rep_lejano`, y una **cinta cian** en la cabeza cuyas colas ondean. Se ve siempre de perfil (mira a la derecha; `espejo` para mirar a la izquierda). No tiene cara: la emoción sale de la postura, el ritmo y los **gestos**.

## Uso
```tsx
import { Lienzo, RepClima } from "../componentes";
<Lienzo>
  <RepClima c={c} movimiento="sentadilla" t={frame / fps} x={540} y={1300} escala={170}
    musculos="auto" gesto="sudor" velocidad={1} />
</Lienzo>
```
- `x, y`: punto del suelo bajo Rep (px). `escala`: px por unidad (Rep mide ~3,7 u → 170 ≈ 630 px). En la zona de escena: 140–180; en pantalla dividida 120–130.
- `t`: segundos desde que empieza el movimiento (usa el frame local de la escena). `velocidad` 0,35 = replay lento. `reps` = se detiene tras N repeticiones.
- `musculos`: `"auto"` (los del movimiento), una lista de ids (`cuadriceps`, `isquios`, `gluteo`, `gemelos`, `pecho`, `abdomen`, `dorsal`, `lumbar`, `trapecio`, `hombro`, `biceps`, `triceps`, `antebrazo`) o nada. Laten con la fase concéntrica; `brilloMusculo` fija la intensidad.
- `gesto`: `sudor`, `pregunta`, `exclamacion`, `zzz`, `mareo`, `esfuerzo`, `check`, `cruz`, `brillo` (uno o varios).
- `marcarArticulacion`: círculos discontinuos de "telestrator" (`[{ art: "cintura" }]`) para señalar el fallo técnico.
- `discos` (cuántos discos lleva la barra) y `carga` ("62,5 kg" en el disco) para enseñar progresión.
- `pose`: sobrescribe ángulos sueltos para una pose a medida (ver abajo).
- `puntoDeRep(props, { musculo | articulacion })` devuelve el punto en pantalla para colocar etiquetas y flechas que siguen a Rep.
- Para varias figuras, varios `<RepClima>` dentro del mismo `<Lienzo>`.

## Movimientos (`plantilla/src/rep/movimientos.json`)
Ejercicios: `sentadilla`, `peso_muerto`, `remo`, `press_banca`, `dominada`, `press_militar`, `curl`, `zancada`, `hip_thrust`.
Errores (cada uno con su `correcto`): `sentadilla_media`, `peso_muerto_redondo`, `curl_ego`, `dominada_kipping`.
Gestos de cuerpo entero: `de_pie`, `caminar`, `sentado` (banco, agotado), `flex`, `celular`, `encoger_hombros`, `senalar`, `manos_cadera`.
Mira todos con `npm run hoja` → `out/hoja_rig.png`.

## Cómo está hecho (por si hay que añadir algo)
- Esqueleto 2D (`esqueleto.ts`): segmentos `torso_bajo`, `torso_alto`, `cuello`, `brazo`, `antebrazo`, `muslo`, `pierna`, `pie` (+ los mismos con `2` para el lado lejano). Ángulos **absolutos** en grados: 0 = delante, 90 = arriba, -90 = abajo.
- Cada movimiento tiene un **anclaje** (la articulación que no se mueve: `tobillo` de pie, `hombro` en dominadas o hip thrust, `cadera` en el banco), un `ciclo_s`, **claves** (`t` de 0 a 1 con una pose y una fase `excentrica` / `concentrica` / `pausa`) e **IK** opcional para manos y pies (objetivo en el mundo o relativo a una articulación, `pref` para elegir hacia dónde dobla el codo o la rodilla).
- `equipo`: `barra` (disco de perfil, radio 0,48 u = disco olímpico), `mancuerna`, `banco`, `barra_fija`, `celular`, `disco_suelo`.
- Para un movimiento nuevo: añade poses y claves al JSON, comprueba física básica (pies en el suelo, barra sobre el medio pie, disco apoyado a 0,48 u), mira la hoja de contactos y sube el cambio al repo (el notebook lee este catálogo, así que el guion podrá pedirlo).
