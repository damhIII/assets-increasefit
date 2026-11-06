// Subtítulos grandes (siempre estilo IncreaseFit): 1-3 palabras a la vez desde brief.subtitulos.
import React, { useMemo } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brief, FUENTE, IF } from "./datos";

type Palabra = [string, number, number];
function agrupar(subs: Palabra[]): Palabra[][] {
  const grupos: Palabra[][] = [];
  let g: Palabra[] = [];
  for (const w of subs) {
    const prev = g[g.length - 1];
    const corta = prev && /[.,:;?!]$/.test(prev[0]);
    const largo = g.reduce((n, x) => n + x[0].length, 0) + w[0].length;
    if (g.length && (g.length >= 3 || corta || largo > 16 || w[1] - prev[2] > 0.45)) { grupos.push(g); g = []; }
    g.push(w);
  }
  if (g.length) grupos.push(g);
  return grupos;
}

export const Subtitulos: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const grupos = useMemo(() => agrupar(brief.subtitulos), []);
  const i = grupos.findIndex((g, k) => t >= g[0][1] - 0.05 && (k === grupos.length - 1 || t < grupos[k + 1][0][1] - 0.05));
  if (i < 0) return null;
  const g = grupos[i];
  if (t > g[g.length - 1][2] + 0.8) return null;
  const entrada = spring({ fps, frame: f - Math.round(g[0][1] * fps), config: { damping: 15, stiffness: 220 } });
  return (
    <div style={{ position: "absolute", top: 1390, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ background: IF.capsula, backdropFilter: "blur(16px)", borderRadius: 28, padding: "14px 30px", display: "flex", gap: 30,
        transform: `scale(${0.9 + 0.1 * entrada})`, opacity: entrada, maxWidth: 980, flexWrap: "wrap", justifyContent: "center" }}>
        {g.map(([w, a, b], k) => {
          const actual = t >= a && t < b + 0.06;
          const pasada = t >= b + 0.06;
          const pop = actual ? spring({ fps, frame: f - Math.round(a * fps), config: { damping: 9, stiffness: 260 } }) : 0;
          return (
            <span key={k} style={{ fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 64, textTransform: "uppercase", lineHeight: 1.1,
              color: actual ? IF.cian : pasada ? IF.blanco : IF.subFutura, display: "inline-block", margin: actual ? "0 12px" : 0,
              transform: `scale(${actual ? 1 + 0.18 * pop : 1})`, textShadow: actual ? `0 0 24px ${IF.cian}99` : "none" }}>{w}</span>
          );
        })}
      </div>
    </div>
  );
};
