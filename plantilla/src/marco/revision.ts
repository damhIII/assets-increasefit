// Modo revisión (lo activa `npm run margenes`, que pasa inputProps {revision: "margenes"} al render).
// En ese modo el fondo es negro liso y se apagan lo decorativo que SÍ puede llegar al borde (patrones, partículas, viñeta,
// cortinillas, líneas de velocidad, confeti…), la cámara deja de flotar y no hace punch-in. Así, cualquier píxel encendido
// fuera de x 120–960 (o x>900 bajo Y≈1100) es contenido mal colocado: scripts/revisar_margenes.py lo detecta en los PNG.
import { getInputProps } from "remotion";

const props = (() => {
  try {
    return (getInputProps() ?? {}) as { revision?: string };
  } catch {
    return {} as { revision?: string };
  }
})();
export const MODO_MARGENES = props.revision === "margenes";
