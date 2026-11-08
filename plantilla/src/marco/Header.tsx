// Header fijo: isotipo (la flecha) + la sección de la serie ("PROGRESO REAL"), centrado en Y≈240.
import React from "react";
import { Img, interpolateColors, staticFile } from "remotion";
import { datos, FUENTE, IF } from "./datos";
import { useClima } from "./clima";

export const Header: React.FC = () => {
  const c = useClima();
  const color = interpolateColors(c.claridad, [0, 1], ["rgba(255,255,255,0.85)", "rgba(17,23,29,0.85)"]);
  return (
    <div style={{ position: "absolute", top: 212, left: 0, width: 1080, display: "flex", justifyContent: "center", alignItems: "center", gap: 18 }}>
      {datos.logos.isotipo ? (
        <Img src={staticFile("isotipo.png")} style={{ height: 52 }} />
      ) : (
        <div style={{ width: 16, height: 16, background: IF.cian, borderRadius: 3 }} />
      )}
      <div style={{ fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 32, letterSpacing: "0.2em", color }}>{datos.serie_header}</div>
    </div>
  );
};
