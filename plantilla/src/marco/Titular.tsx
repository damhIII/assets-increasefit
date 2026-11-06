// Titular de dos líneas por bloque, eco del logo: línea 1 Open Sans 400 blanca (INCREASE), línea 2 Open Sans 800 cian (FIT).
// Entra desde abajo con spring y sale rápido hacia arriba. En climas claros la línea 2 pasa a marcador cian con texto grafito.
import React from "react";
import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brief, FUENTE, IF } from "./datos";
import { useClima } from "./clima";

const ajustar = (txt: string, base: number, peso: number) => {
  // reduce el tamaño si la línea no cabe en 920 px (aprox. por ancho medio de glifo en mayúsculas)
  const factor = peso >= 800 ? 0.68 : 0.6;
  return Math.min(base, Math.floor(920 / Math.max(1, txt.length * factor)));
};

export const Titular: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = useClima();
  const b = brief.bloques.find((x) => f >= x.ini_f && f < x.fin_f) ?? brief.bloques[brief.bloques.length - 1];
  if (b.id === "cta") return null;           // el CTA tiene su propia tarjeta
  const local = f - b.ini_f;
  const salida = interpolate(f, [b.fin_f - 6, b.fin_f], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const linea = (i: number) => {
    const e = spring({ fps, frame: local - i * 4, config: { damping: 14, stiffness: 160 } });
    return { transform: `translateY(${(1 - e) * 70 - salida * 90}px)`, opacity: Math.min(e, 1 - salida) };
  };
  const [l1, l2] = b.titular.map((t) => t.toUpperCase());
  const s1 = ajustar(l1, 74, 400), s2 = ajustar(l2, 96, 800);
  const color1 = interpolateColors(c.claridad, [0, 1], [IF.blanco, "#11171D"]);
  const marcador = spring({ fps, frame: local - 8, config: { damping: 16, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", top: 300, left: 80, width: 920, fontFamily: FUENTE.titulos, lineHeight: 1.02 }}>
      <div style={{ fontWeight: 400, fontSize: s1, color: color1, letterSpacing: "-0.01em", ...linea(0) }}>{l1}</div>
      <div style={{ position: "relative", display: "inline-block", marginTop: 6, ...linea(1) }}>
        {c.claridad > 0.5 ? (
          <div style={{ position: "absolute", left: -10, right: -10, top: "12%", bottom: "6%", background: IF.cian, transformOrigin: "left center", transform: `scaleX(${marcador})` }} />
        ) : null}
        <span style={{ position: "relative", fontWeight: 800, fontSize: s2, color: c.claridad > 0.5 ? "#11171D" : IF.cian, letterSpacing: "-0.015em" }}>{l2}</span>
      </div>
    </div>
  );
};
