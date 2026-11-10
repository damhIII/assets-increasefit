# IncreaseFit v5: cambios en el repo `assets-increasefit`

Sube estos cambios a `main` **antes** de usar el notebook v5: el notebook lee de `editorial/` los archivos nuevos y para con un aviso si faltan.
Cada archivo de esta carpeta va en la misma ruta del repo (o aplica `cambios_repo.patch` con `git apply cambios_repo.patch`).

## AGREGAR (archivos nuevos)
| Archivo | Para qué |
|---|---|
| `editorial/estilo_guion.md` | Tu guía de estilo (gancho escéptico + mini-estudio + matiz + consejo práctico), adaptada a la marca y con el ejemplo de referencia. El guionista la recibe en `{{ESTILO}}`. |
| `editorial/prompt_investigacion.md` | Prompt del paso de búsqueda web: encontrar estudios y metaanálisis reales y devolverlos en JSON con URL, DOI y cita literal. |
| `scripts/iconos.py` | Claude añade cualquier icono de Lucide a `icons/` (`--buscar`, `--lista`). Así puede reforzar con imágenes sin limitarse a los 60 iconos actuales. |
| `icons/users.svg`, `icons/microscope.svg`, `icons/percent.svg`, `icons/shield-check.svg` | Iconos útiles para fichas de estudios (muestra, laboratorio, resultado, seguro). |

## REEMPLAZAR (archivos modificados)
| Archivo | Qué cambia |
|---|---|
| `editorial/prompt_guion.md` | Nuevo estilo; el seed es una bolsa de material (tema, ideas, frases "entre comillas" casi literales, estudios) que se une en un guion; usa la investigación web; 100-150 palabras; hasta 6 cifras distintas. |
| `editorial/marca.md` | La sección Voz pasa al registro informal-didáctico del nuevo estilo (mantiene el humor seco en dosis pequeñas). |
| `scripts/sincronizar.py` | Subtítulos **sin signos de puntuación** (¿En serio? → EN SERIO); el fin de frase o coma queda como bandera de corte; pasa tonos e iconos al render; filas de `ficha`. |
| `scripts/validar_render.py` | **Presupuesto de texto**: máx. 20 palabras en pantalla por video (sin contar subtítulos ni tarjeta), límites por pieza y máx. 2 piezas con texto por escena. Valida `icono`, `ficha` y el bloque `subtitulos`. Acepta escaletas v3 y v4. |
| `plantilla/src/marco/Subtitulos.tsx` | Subtítulos nuevos: karaoke con píldora de color que salta en la palabra que suena, énfasis más grande, tonos rojo/verde, insignia con icono sobre la palabra, cápsula más opaca (se lee también sobre blanco) y cambio de grupo sin parpadeo. |
| `plantilla/src/marco/datos.ts` | Tipos: subtítulos con corte, tono e icono; anotaciones `icono` y `ficha`. |
| `plantilla/src/componentes/kit.tsx` | Nuevas piezas `IconoPop` (icono en insignia que salta, con tono y tachado) y `FichaEstudio` (icono + cifra por fila, con fuente). |
| `plantilla/src/escenas/Escena.tsx` | Dibuja `icono` (junto a la mascota, apilado en el lado libre o en fila si no hay mascota, también en pantalla dividida) y `ficha`. |
| `.claude/skills/increasefit-reel/SKILL.md` | Imagen primero y texto mínimo; cómo traducir cada frase a una imagen; cómo pintar los subtítulos; verificar las cifras empezando por `investigacion.json`. |
| `.claude/skills/increasefit-reel/referencias/escaleta.md` | Formato v4: bloque `subtitulos` (tonos e iconos), anotaciones `icono` y `ficha`, tabla de límites de texto. |
| `.claude/skills/increasefit-reel/referencias/layout.md` | Subtítulos nuevos, "imagen antes que texto", piezas nuevas del kit. |
| `CLAUDE.md`, `README.md`, `briefs/LEEME.md` | Flujo v5 (investigación + `investigacion.json`) y reglas nuevas. |

## ELIMINAR
| Archivo | Por qué |
|---|---|
| `plantilla/src/escenas/Plano.tsx` | Resto del pipeline v2: nadie lo importa y es lo único que hace fallar `npm run tipos` (importa `brief`, `Overlay`, `./extra`, que ya no existen). |
| `ELIMINAR.txt` (opcional) | La lista de borrado anterior: esos archivos ya no están en el repo. |
| `Crear_video_IncreaseFit_v4.ipynb`, si lo guardas en el repo o en Drive | Lo sustituye el v5. |

`editorial/voz_tts.md` puede quedarse: el notebook ya no lo usa desde la v4 (CLAUDE.md lo indica).

## Comprobado
- Escaleta v4 de prueba sobre `briefs/20261109-1922`: valida y renderiza (stills con Remotion); una escaleta cargada de texto la frena el validador.
- Notebook en seco con un cliente OpenAI simulado: prompts sin marcadores sin rellenar, investigación parseada, URLs de las fuentes comprobadas, si la búsqueda web falla sigue sin ella, avisos nuevos.
