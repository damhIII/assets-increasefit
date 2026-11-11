// Header: SOLO el isotipo (la flecha), centrado arriba (Y≈200–258), y SOLO al arranque. No se queda todo el video:
// ocupa pantalla sin aportar nada una vez que se ha visto. Sale en el primer corte de escena entre 1,5 y 3,5 s (o a los 3 s
// si no hay corte en ese tramo) y los subtítulos suben a su sitio (marco/Subtitulos.tsx). El logo completo vuelve en la
// tarjeta final. `opciones.isotipo` en la escaleta: "inicio" (por defecto) | "siempre" | "nunca".
// Sin texto al lado: nada de títulos ni rótulos persistentes durante el video.
// En el clima azul el isotipo azul se perdería contra el fondo: se funde a su versión blanca.
import React from "react";
import { Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { datos } from "./datos";
import { useClima } from "./clima";

export const HEADER_TOP = 200, HEADER_ALTO = 58;
const SALIDA_F = 8;                              // duración de la salida del isotipo

/** Frame GLOBAL en que el isotipo empieza a irse; null = se queda todo el video. */
export const salidaIsotipo = (): number | null => {
  const modo = datos.opciones?.isotipo ?? "inicio";
  if (!datos.logos.isotipo || modo === "nunca") return 0;
  if (modo === "siempre") return null;
  const fps = datos.video.fps;
  const corte = datos.escenas.map((e) => e.ini_f).find((f) => f >= 1.5 * fps && f <= 3.5 * fps);
  return corte !== undefined ? Math.max(0, corte - SALIDA_F / 2) : Math.round(3 * fps);
};

/** 1 = isotipo en pantalla, 0 = ya se fue. Lo usan el header y los subtítulos (que suben cuando se va). */
export const presenciaIsotipo = (f: number): number => {
  if (!datos.logos.isotipo || datos.opciones?.isotipo === "nunca") return 0;
  const s = salidaIsotipo();
  if (s === null) return 1;
  return interpolate(f, [s, s + SALIDA_F], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

export const Header: React.FC = () => {
  const c = useClima();
  const f = useCurrentFrame();
  const p = presenciaIsotipo(f);
  if (p <= 0) return null;
  return (
    <div style={{ position: "absolute", top: HEADER_TOP, left: 0, width: 1080, display: "flex", justifyContent: "center",
      opacity: p, transform: `translateY(${(1 - p) * -24}px) scale(${0.85 + 0.15 * p})` }}>
      <div style={{ position: "relative", height: HEADER_ALTO }}>
        <Img src={staticFile("isotipo.png")} style={{ height: HEADER_ALTO, display: "block", opacity: 1 - c.azulidad }} />
        {c.azulidad > 0 ? <Img src={staticFile("isotipo.png")} style={{ height: HEADER_ALTO, position: "absolute", left: 0, top: 0, filter: "brightness(0) invert(1)", opacity: c.azulidad }} /> : null}
      </div>
    </div>
  );
};
