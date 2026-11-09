# Climas de escena

Un **clima** cambia el ambiente de color de una escena; el marco IncreaseFit no cambia nunca. Son los tres looks del feed de Instagram (más `acero` para orden y método). Valores en `brand/paletas.json` → `climas`; lo eliges tú en `escena.clima` según lo que pasa. Base: `negro`. Empieza y termina en base y usa 1–2 climas más en todo el video: si cambia en cada escena, deja de significar algo.

## Qué cambia con el clima
| Rol | Dónde |
|---|---|
| `fondo_a` → `fondo_b`, `tinte` | fondo de pantalla |
| `textura` | fondo, opacidad baja |
| `superficie` | tarjetas (capítulo, dato, libreta, resumen), fondo del inserto |
| `estructura` | bordes |
| `texto`, `texto_suave` | textos dentro de la escena |
| `foco` | el acento IncreaseFit: línea 2 del titular, barra de progreso, círculo, cifra del dato, gráfica, "GUÁRDALO" |

## Qué NO cambia nunca
Header, cápsula de subtítulos (siempre oscura, palabra actual en azul luz), alerta `#FF5A4E`, éxito `#3DD68C`, logos y los colores de la mascota. El acento siempre es el `foco` del clima: nunca un azul escrito a mano.

## Implementación (ya hecha)
`marco/clima.ts`: `climaEnFrame(frame)` funde los colores (incluido `foco`) con `interpolateColors` durante `transicion_frames` (12) centrados en el inicio de la escena. Dentro de una escena usa `useClimaEscena(e)`.

## Clima azul (`azul`, tipo `color`)
La tarjeta azul del feed: la frase que define el video, el gancho o el remate. Fondo `#2353F1`, todo el texto en blanco y el foco en blanco. **Solo texto: sin mascota** (la cinta azul se pierde contra el fondo) ni anotaciones de color. Úsalo una vez por video como mucho.

## Clima claro (`papel`)
La tarjeta blanca del feed y la pausa visual más fuerte. Header, texto y etiquetas pasan a tinta (`#111111`); la línea 2 del titular se vuelve marcador azul `#2353F1` con texto blanco; la cápsula de subtítulos sigue oscura. Ideal para el porqué, la ciencia o un dato.

## Personalidad
- **negro**: el gym de siempre, como las fotos oscuras del feed.
- **azul**: la idea clave, dicha a pantalla completa.
- **papel**: la pausa clara, la explicación, la ciencia.
- **acero**: orden y método.
