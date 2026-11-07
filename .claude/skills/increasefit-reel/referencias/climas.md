# Climas de escena

Un **clima** cambia el ambiente de color de un plano; el marco IncreaseFit no cambia nunca. Valores en `brand/paletas.json` → `climas`; cada plano trae el suyo en `plano.clima`, elegido por el guionista según lo que pasa (y con su motivo). Base: `hierro`. El gancho y el cierre van siempre en base, y el clima solo cambia al cambiar de bloque.

## Qué cambia con el clima
| Rol | Dónde |
|---|---|
| `fondo_a` → `fondo_b`, `tinte` | fondo de pantalla |
| `textura` | fondo, opacidad baja |
| `superficie` | tarjetas (capítulo, dato, libreta, resumen), fondo del inserto |
| `estructura` | bordes |
| `texto`, `texto_suave` | textos dentro de la escena |

## Qué NO cambia nunca
Header, cápsula de subtítulos, línea 2 del titular en cian, foco cian, alerta `#FF5A4E`, éxito `#3DD68C`, logos y los colores de la mascota.

## Implementación (ya hecha)
`marco/clima.ts`: `climaEnFrame(frame)` funde los colores con `interpolateColors` durante `transicion_frames` (12) centrados en el inicio del plano. Dentro de un plano usa `useClimaPlano(p)`.

## Climas claros (`libreta`)
La pausa visual más fuerte. Header, texto y etiquetas pasan a grafito; la línea 2 del titular se vuelve marcador cian con texto grafito; la cápsula de subtítulos sigue oscura.

## Personalidad
- **hierro**: el gym de siempre.
- **esfuerzo**: la serie que quema, el error que duele.
- **noche**: el scroll de las 2 am, el gym vacío.
- **pizarra**: la explicación con tiza.
- **libreta**: el cuaderno de entreno, la ciencia.
- **progreso**: los kilos que suben.
- **acero**: orden y método.
