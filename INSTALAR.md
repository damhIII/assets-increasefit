# Puesta en marcha (una sola vez)

1. **GitHub**: crea el repo público `damhIII/assets-increasefit` y sube el contenido de esta carpeta (sin `_subir_a_Drive/`).
   ```bash
   git init && git add -A && git commit -m "Kit IncreaseFit" && git branch -M main
   git remote add origin https://github.com/damhIII/assets-increasefit.git && git push -u origin main
   ```
2. **Drive**: copia los 3 PNG de `_subir_a_Drive/IncreaseFit/assets/` a `MyDrive/IncreaseFit/assets/`. El notebook crea el resto (iconos, texturas, fuentes, paletas) la primera vez.
3. **Colab**: abre `Crear_video_IncreaseFit.ipynb`. Usa los mismos secretos que el de ZYPE: `OPENAI_API_KEY`, `GEMINI_API_KEY`, `GITHUB_TOKEN` (con permiso de escritura en el repo nuevo).
4. Ejecuta las celdas, copia el prompt final y pégalo en Claude Code: clonará el repo y seguirá la skill `increasefit-reel`.

Para ver a Rep: `cd plantilla && npm install && npm run hoja` (→ `out/hoja_rig.png`) o `npx remotion studio`.
