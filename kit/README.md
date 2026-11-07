# Kit gráfico IncreaseFit

Anotaciones dibujadas a mano para los Reels, en el estilo del video de referencia: flechas, círculo marcador, tachado, subrayado, check y cruz, caja de etiqueta, casillas de checklist, burbujas de diálogo y pensamiento, marco de inserto circular, líneas de velocidad, enfoque, impacto y temblor, destello, gotas de sudor, marco REC del celular y trazo de pincel para cortinillas (con la estética de la flecha del logo).

- Catálogo y uso de cada pieza: `manifest.json`. Vista previa: `contactos.png`.
- Blancos puros (`tintable: true`) → colorear con máscara CSS. El resto lleva sus colores (relleno blanco + tinta grafito).
- Texto de etiquetas y notas a mano: fuente **Kalam** (`fonts/css/kalam__400-700.css`, licencia OFL en `fonts/licencias/`).
- Regenerar: `cd scripts/kit && npm install && node kit.js ../../kit && python3 pincel.py ../../kit`.
