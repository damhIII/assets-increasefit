Cada video tiene aquí su carpeta `<BASE>/` (`AAAAMMDD-HHMM`).

Lo sube el notebook de Colab (`Crear_video_IncreaseFit_v9.ipynb`):
- `guion.txt`: el texto locutado, sin ninguna indicación.
- `locucion.wav`: la voz (Gemini TTS).
- `palabras.json`: duración de la voz y cada palabra con su inicio y fin (Whisper).
- `tarjeta.json`: la tarjeta final propuesta a partir del guion (tema, pregunta del gancho, veredicto, tono, pasos, fuente). Claude la revisa y la pasa a la escaleta.
- `imagenes/` (opcional): ilustraciones con licencia libre que bajó el notebook a partir de las "ideas visuales" del guionista (`manifest.json` con licencia y autor, `contactos.jpg`). Claude las revisa (sin personas) antes de usarlas.
- `investigacion.json`: lo que encontró el guionista en la web antes de escribir (tema, hallazgos con URL y cita literal, correcciones al seed). El hallazgo con `principal: true` es el protagonista: sus cifras y su `corta` (la fuente) son las que salen en pantalla, tal cual.

Lo genera Claude al dirigir el video, en su sesión (es local y no se sube al repo):
- `subtitulos.json`: el guion alineado con la voz (`scripts/alinear.py`).
- `escaleta.json`: las escenas ancladas a palabras (Claude la entrega en el chat junto al MP4, por si se quiere archivar).
- `custom/*.tsx`: escenas a medida, si las hay.
