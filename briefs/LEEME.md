Cada video tiene aquí su carpeta `<BASE>/` (`AAAAMMDD-HHMM`).

Lo sube el notebook de Colab:
- `guion.txt`: el texto locutado, sin ninguna indicación.
- `locucion.wav`: la voz (Gemini TTS).
- `palabras.json`: duración de la voz y cada palabra con su inicio y fin (Whisper).
- `tarjeta.json`: la tarjeta final propuesta a partir del guion (tema, pregunta del gancho, veredicto, tono, pasos, fuente). Claude la revisa y la pasa a la escaleta.
- `investigacion.json`: lo que encontró el guionista en la web antes de escribir (tema, hallazgos con URL y cita literal, correcciones al seed). Pendiente de verificar por Claude.

Lo añade Claude al dirigir el video:
- `subtitulos.json`: el guion alineado con la voz (`scripts/alinear.py`).
- `escaleta.json`: las escenas ancladas a palabras.
- `custom/*.tsx`: escenas a medida, si las hay.

Las carpetas con `brief.json` son del pipeline anterior (v2) y quedan como histórico.
