# Assets A y B (mascota y objetos) · para copiar en la raíz de assets-increasefit

1. Descomprime este zip en la raíz del repo, sobrescribiendo (las rutas ya vienen puestas).
2. Borra `lottie/dormir.json`: era un panda sobre un fondo blanco (personaje de otra estética; la mascota debe ser la única figura). Ya está quitado de `lottie/manifest.json`.
3. Commit y push.

## Qué entra
- `mascota/sprites/`: 36 sprites nuevos (poses por tema, correr, 3 errores, 7 fases intermedias `*_fm`, 5 bocas `plano_boca_*`) y 14 f1/f2 con el lienzo ampliado para compartirlo con su `_fm` (los píxeles son los originales).
- `mascota/hojas/hoja_13…26.png` (las hojas generadas), `manifest.json`, `contactos.jpg`, `_proceso.json`.
- `props/`: 31 objetos en el estilo de la mascota (`sprites/`, `hojas/`, `manifest.json`, `contactos.jpg`) y `scripts/props.py`.
- `scripts/mascota/`: `bocas.py` (nuevo), `procesar.py` (ancla «centro» para correr), `manifiesto.py`, `config.json`, `ajustes.json`.
- Plantilla: fases f1 → fm → f2 → fm, `anim: "hablar"` (la boca sigue a la voz) y anotación `prop`. Validador, preparar_video, sincronizar y documentación de Claude.

## Descartados (regenerar si los quieres)
- `remo_f1/fm/f2` (hoja_20): el torso de f1 vuelve a estar más erguido que en fm/f2.
- `sentadilla_fm` (hoja_21): de tres cuartos frontal; las fases existentes son de perfil.
- `plano_ojos_cerrados` (hoja_26): salió un guiño con un ojo a medio dibujar.
