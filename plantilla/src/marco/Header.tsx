// Header fijo: SOLO el isotipo (la flecha), centrado arriba (Y≈200–258). Sin texto al lado: nada de títulos ni rótulos
// persistentes durante el video. Justo debajo van los subtítulos (marco/Subtitulos.tsx).
// En el clima azul el isotipo azul se perdería contra el fondo: se funde a su versión blanca.
import React from "react";
import { Img, staticFile } from "remotion";
import { datos } from "./datos";
import { useClima } from "./clima";

export const HEADER_TOP = 200, HEADER_ALTO = 58;

export const Header: React.FC = () => {
  const c = useClima();
  if (!datos.logos.isotipo) return null;
  return (
    <div style={{ position: "absolute", top: HEADER_TOP, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ position: "relative", height: HEADER_ALTO }}>
        <Img src={staticFile("isotipo.png")} style={{ height: HEADER_ALTO, display: "block", opacity: 1 - c.azulidad }} />
        {c.azulidad > 0 ? <Img src={staticFile("isotipo.png")} style={{ height: HEADER_ALTO, position: "absolute", left: 0, top: 0, filter: "brightness(0) invert(1)", opacity: c.azulidad }} /> : null}
      </div>
    </div>
  );
};
