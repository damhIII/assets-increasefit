# Climas de escena

Un **clima** cambia el ambiente de color de un bloque concreto; el **marco IncreaseFit** no cambia nunca. Valores en `brand/paletas.json` → `climas`; asignación en `brief.climas`. Base: `hierro`. GANCHO y CTA van siempre en base.

## Qué cambia con el clima
| Rol | Dónde |
|---|---|
| `fondo_a` → `fondo_b`, `tinte` | fondo de pantalla |
| `textura` | fondo, opacidad baja |
| `superficie` | tarjetas, chips, libreta, discos, banco |
| `estructura` | bordes, conectores, equipo, iconos no destacados |
| `acento` | rellenos secundarios |
| `texto`, `texto_suave` | textos dentro de la escena |
| `cuerpo_rep`, `cuerpo_rep_lejano` | Rep |

## Qué NO cambia nunca
Barra de progreso, header (salvo el color del texto en claros), cápsula de subtítulos, línea 2 del titular en cian, el foco cian, la cinta de Rep, alerta `#FF5A4E`, éxito `#3DD68C`, el bloque CTA y los logos.

## Implementación (ya hecha en la plantilla)
- `marco/clima.ts`: `climaEnFrame(frame)` funde todos los colores con `interpolateColors` durante `transicion_frames` (12) centrados en `ini_f`.
- **Dentro de una escena** el frame es local: usa `useClimaBloque(b)` (no `useClima()`), o leerás el clima de otro bloque.
- `coloresRep(c)` pasa el clima a Rep. Para SVG de `ui/` con colores fijos en otro clima: `python3 scripts/tenir_svg.py --clima <id> ui/... --out public/climas`.

## Climas claros (`libreta`)
La pausa visual más fuerte; solo en POR_QUE. Header y línea 1 pasan a grafito; la línea 2 se vuelve **marcador** (rectángulo cian que crece con `scaleX`, texto grafito); Rep pasa a cuerpo oscuro; la cápsula de subtítulos sigue oscura.

## Personalidad
- **hierro**: el gym de siempre.
- **esfuerzo** (ERROR): la serie que quema, el error que duele; rojos cálidos, grano.
- **noche** (ERROR, METODO): el scroll de las 2 am, el gym vacío; índigo.
- **pizarra** (POR_QUE, METODO): la explicación con tiza; verde pizarra, textura de tiza.
- **libreta** (POR_QUE): el cuaderno de entreno, la ciencia; papel con cuadrícula.
- **progreso** (RESULTADO): los kilos que suben; verde profundo.
- **acero** (METODO, RESULTADO): orden y método; grises fríos.
