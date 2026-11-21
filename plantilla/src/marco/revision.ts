// Modo revisión (lo activa `npm run revisar`, que pasa inputProps {revision: "margenes"} a una parte de los fotogramas).
// En ese modo el fondo es liso (negro, o blanco en climas claros), no se dibujan los subtítulos ni el texto en pantalla y se
// apaga lo decorativo que SÍ puede llegar al borde (patrones, partículas, viñeta, cortinillas, líneas de velocidad, confeti…);
// la cámara deja de flotar y no hace punch-in. Así, cualquier píxel de contenido fuera de x 120–960 (o x>900 bajo Y≈1100), en
// la franja de los subtítulos o en la del texto en pantalla está mal colocado: scripts/revisar_video.py lo detecta en los PNG.
// El aspecto del video renderizado no cambia: este modo solo existe en los fotogramas de revisión.
import { getInputProps } from "remotion";

const props = (() => {
  try {
    return (getInputProps() ?? {}) as { revision?: string };
  } catch {
    return {} as { revision?: string };
  }
})();
export const MODO_MARGENES = props.revision === "margenes";
