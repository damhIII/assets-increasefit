# Imágenes con licencia libre

Para explicar algo que la mascota, los props y los iconos no pueden mostrar con detalle (un diagrama del corazón, una vértebra, una neurona, un objeto concreto), el Reel puede llevar una **imagen descargada con licencia libre**, siempre como **apoyo** puntual (0-2 por video).

## Reglas
- **Nunca personas** (ni fotos ni ilustraciones de personas reales): la mascota es la única figura humana. Tampoco marcas, logos ni capturas de productos.
- Solo licencias que permiten **uso comercial y modificación**: CC0, dominio público (PDM), CC BY y CC BY-SA. Nada de NC (no comercial) ni ND (sin derivadas: el duotono es una modificación). `validar_render.py` lo comprueba.
- El **crédito** (autor · licencia) se pinta solo bajo la imagen: no lo quites. Si el Reel lleva imágenes CC BY o BY-SA, añade también el crédito en la descripción del post (está en `imagenes/manifest.json`).
- Mejor **ilustraciones y diagramas** que fotos; en duotono (`duotono` es `true` por defecto) se integran con la marca.

## Flujo
1. Normalmente ya vienen: el notebook de guion descarga en `briefs/<BASE>/imagenes/` 2-3 imágenes por cada "idea visual" que propuso el guionista, con `manifest.json` y `contactos.jpg`.
2. Si faltan o no sirven y tu entorno tiene internet abierto:
   `python3 scripts/imagenes.py descargar briefs/<BASE> "human heart diagram" "spine illustration" --n 3`
   (busca en inglés; `--tipo foto` si necesitas una foto de un OBJETO). Si los dominios están bloqueados, sigue sin imágenes y dilo en la entrega.
3. **Abre `imagenes/contactos.jpg`** y cada imagen candidata. Si se ve bien y no sale ninguna persona ni marca:
   `python3 scripts/imagenes.py marcar briefs/<BASE> <id> revisada` · si no: `... <id> descartar`.
4. En la escaleta: `{"tipo": "imagen", "imagen": "<id>", "marco": "polaroid" | "celular" | "circulo" | "tarjeta", "en": n}` (opcional `"duotono": false`, `"escala": 0.6-1`).
   Con mascota va en la columna izquierda (la mascota pasa a la derecha); sin mascota, centrada y más grande.

## Cómo se dibuja (`componentes/imagen.tsx`)
El marco se queda **quieto dentro de la zona segura** (x 120–960) y el movimiento (zoom lento tipo Ken Burns) ocurre **dentro** del marco, recortado: la imagen nunca se acerca a los bordes del Reel. La polaroid va girada 2,5°: su caja girada también se encaja en la zona.
