# Plantillas visuales (`brief.plantilla`)

Las escenas por defecto ya implementan una versión base de `comparacion`, `replay`, `dato`, `progresion` y `mito_realidad`. Úsalas como punto de partida y mejóralas para el video concreto.

## estandar
Un bloque tras otro como en `layout_y_bloques.md`.

## mito_realidad
GANCHO: sello MITO (`ui/sello_mito.svg`, componente `Sello`) cae con golpe sobre la frase del mito. POR_QUE: el sello se tacha (`tachado`) y cae fuera de cuadro; entra REALIDAD (`ui/sello_realidad.svg`) con el dato o el mecanismo. RESULTADO: Rep con `check`.

## comparacion
Desde ERROR hasta RESULTADO, pantalla dividida (`ui/split_vs.svg` en x≈540): izquierda "ASÍ NO" (alerta, Rep con el movimiento de error, gesto `esfuerzo`), derecha "ASÍ SÍ" (éxito, Rep con el `correcto`, músculos encendidos). Mismo reloj en ambos lados; escala 120-130. No mezcles dos climas no base a la vez en pantalla.

## replay
ERROR: Rep hace la repetición mala a velocidad normal; se congela, aparece "REPLAY · 0,35×" y la repetición se repite en cámara lenta con `marcarArticulacion` en la articulación que falla (espalda en `cintura`, cadera en sentadilla a medias, etc.) y el músculo que sufre encendido. METODO: la versión correcta con un check verde por cue.

## dato
POR_QUE: la cifra protagonista gigante (cuenta con `interpolate`), el dato completo en `DatoConFuente` y la fuente corta en mono. RESULTADO: la cifra traducida a qué hacer en la próxima sesión (p. ej. "3 MIN DE DESCANSO" con un anillo `ui/anillo_descanso.svg` que se completa).

## progresion
METODO: `Libreta` que se rellena semana a semana con `progresion_ejemplo` (flechas ↑ en verde, "=" en rojo si se repite) mientras la barra de Rep suma discos (`discos`, `carga`). RESULTADO: `Grafica` de la progresión + KPI. Siempre "EJEMPLO ILUSTRATIVO".

## rutina
METODO y RESULTADO: una tarjeta de entreno que se construye fila a fila (ejercicio, series × reps, descanso, RIR desde `prescripcion`), con Rep demostrando cada ejercicio al aparecer su fila. Pensada para guardarla: legible en un fotograma pausado.
