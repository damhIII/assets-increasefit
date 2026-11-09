// Header fijo: isotipo (la flecha) + la sección de la serie ("PROGRESO REAL"), centrado en Y≈240.
// En el clima azul el isotipo azul se perdería contra el fondo: se funde a su versión blanca.
import React from "react";
import { Img, interpolateColors, staticFile } from "remotion";
import { datos, FUENTE, IF } from "./datos";
import { useClima } from "./clima";

export const Header: React.FC = () => {
  const c = useClima();
  const color = interpolateColors(c.claridad, [0, 1], ["rgba(255,255,255,0.85)", "rgba(17,17,17,0.85)"]);
  return (
    <div style={{ position: "absolute", top: 212, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
      {datos.logos.isotipo ? (
        <div style={{ position: "relative", height: 52 }}>
          <Img src={staticFile("isotipo.png")} style={{ height: 52, display: "block", opacity: 1 - c.azulidad }} />
          {c.azulidad > 0 ? <Img src={staticFile("isotipo.png")} style={{ height: 52, position: "absolute", left: 0, top: 0, filter: "brightness(0) invert(1)", opacity: c.azulidad }} /> : null}
        </div>
      ) : (
        <div style={{ width: 16, height: 16, background: c.foco, borderRadius: 3 }} />
      )}
      <div style={{ fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 32, letterSpacing: "0.2em", color }}>{datos.serie_header}</div>
    </div>
  );
};
