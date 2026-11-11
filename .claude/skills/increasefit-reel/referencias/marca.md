# Marca IncreaseFit

Cuenta de contenido de gimnasio y fuerza para gente que ya entrena. Tono: **humor seco + ciencia explicada fácil** (voz y ADN completos en `editorial/marca.md` y `editorial/adn.md`). Estética: deportiva, limpia y con peso; ilustración de cómic con anotaciones a mano, como la pizarra de un entrenador. Animación con rebote y golpe, sin efectos baratos ni estética de "motivación de póster".

La paleta es la del feed de Instagram: tres looks y nada más. **Negro** neutro (la escena de gym), **azul eléctrico** de fondo con texto blanco (la idea clave) y **blanco** con detalles azules (la pausa clara).

| Rol | Color | En código |
|---|---|---|
| Negro (base, neutro, sin tinte azulado) | `#161616` → `#050505` | clima `negro`, `IF.grafito2` |
| **Azul IncreaseFit** (rellenos, fondo azul, "FIT" del logo, texto sobre blanco) | `#2353F1` | `IF.azul` |
| **Azul luz** (el azul cuando va como texto o trazo sobre negro) | `#6A8CFF` | `IF.azulLuz` |
| Hielo (brillos, notas a mano sobre negro) | `#DCE5FF` | `IF.hielo` |
| Blanco | `#FFFFFF` | `IF.blanco` |
| Tinta (texto sobre blanco) | `#111111` | `IF.tinta` |
| Alerta (error, "así no") | `#FF5A4E` | `IF.alerta` |
| Éxito (bien hecho, "así sí") | `#3DD68C` | `IF.exito` |

- **El foco lo da el clima** (`c.foco` de `useClima()`/`useClimaEscena(e)`): azul luz sobre negro, azul sobre blanco, blanco sobre azul. Úsalo siempre que una pieza tenga que destacar; no escribas un azul a mano.
- **`#2353F1` nunca como texto sobre negro**: su contraste es 3,4:1 y no se lee. Sobre negro, texto y trazos azules van en azul luz; el azul de marca, como relleno con texto blanco encima (como las tarjetas azules del feed).
- **Sin cian ni negros azulados.** Si un color no está en esta tabla o en `brand/paletas.json`, no va.

- **Tipografía**: Open Sans como el logo (línea 1 en 400, como "INCREASE"; línea 2 en 800 en el foco del clima, como el "FIT" azul). Números del gym y fuentes de datos en JetBrains Mono. Anotaciones a mano (etiquetas, notas, bocadillos) en Kalam.
- **Azul escaso**: línea 2 del titular, palabra actual del subtítulo, foco de cada escena, cinta de la mascota. Si todo es azul, nada lo es.
- **Logos**: durante el video no hay logo ni isotipo (la franja de arriba es de los subtítulos); `logo_increasefit.png` solo bajo la tarjeta final (`logo_increasefit_oscuro.png` en climas claros).
- **La flecha** del isotipo es el motivo gráfico: el trazo de pincel de las cortinillas (`kit/transiciones/trazo_pincel.svg`) es su eco.

## Contenido y honestidad
- Las cifras de entreno de ejemplo (kilos, repeticiones, progresión) son **ejemplo ilustrativo**: rotúlalas así.
- Los datos de estudios se muestran con su fuente corta verificada (`editorial/datos_verificados.json`), en JetBrains Mono, pequeña y legible.
- Sin CTA: el video no pide comentarios, likes ni follows; cierra con un remate y la tarjeta final para guardar (pregunta del gancho → veredicto → cómo aplicarlo).
- Nada de antes/después corporales, básculas como meta, comida "prohibida" ni cuerpos ridiculizados. El blanco del humor es el error, no la persona.

## Prohibido
- Personas reales, fotos, marcas de suplementos o equipamiento, logos de gimnasios.
- Imitar personajes o el estilo de otras cuentas: la mascota de IncreaseFit tiene su propia identidad.
- Colores o fuentes fuera de esta paleta en el marco.
