// Partículas ambientales (v9): capa DECORATIVA detrás de la escena (polvo, chispas, burbujas, confeti suave).
// Es de las pocas cosas que pueden llegar al borde (como el fondo). Deterministas: random(seed) de Remotion.
// Se apagan en el modo revisión de márgenes.
import React from "react";
import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { IF } from "./datos";
import type { C } from "./clima";
import { MODO_MARGENES } from "./revision";

export type TipoParticulas = "polvo" | "chispas" | "burbujas" | "confeti_suave";

export const Particulas: React.FC<{ tipo: TipoParticulas; c: C; semilla: string }> = ({ tipo, c, semilla }) => {
  const f = useCurrentFrame();
  if (MODO_MARGENES) return null;
  const n = tipo === "polvo" ? 34 : tipo === "confeti_suave" ? 26 : 22;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: n }, (_, i) => {
        const r = (k: string) => random(`${semilla}-${tipo}-${i}-${k}`);
        const x0 = r("x") * 1080, y0 = r("y") * 1920, v = 0.4 + r("v") * 1.1, fase = r("f") * Math.PI * 2;
        if (tipo === "polvo") {
          const y = (((y0 - f * v * 0.6) % 1920) + 1920) % 1920;
          const lado = 3 + r("s") * 6;
          return <div key={i} style={{ position: "absolute", left: x0 + Math.sin(f / 40 + fase) * 30, top: y, width: lado, height: lado, borderRadius: "50%",
            background: c.texto, opacity: 0.12 + 0.22 * r("o") }} />;
        }
        if (tipo === "chispas") {
          const ciclo = 70 + r("c") * 60;
          const t = ((f + r("t") * ciclo) % ciclo) / ciclo;
          const lado = 6 + r("s") * 10;
          return <div key={i} style={{ position: "absolute", left: x0 + Math.sin(t * 6 + fase) * 20, top: 1500 - t * (700 + r("h") * 700), width: lado, height: lado,
            background: i % 3 ? c.foco : IF.blanco, transform: `rotate(45deg) scale(${1 - t})`, opacity: (1 - t) * 0.8, boxShadow: `0 0 12px ${c.foco}` }} />;
        }
        if (tipo === "burbujas") {
          const y = (((y0 - f * v * 1.4) % 2100) + 2100) % 2100 - 90;
          const lado = 16 + r("s") * 46;
          return <div key={i} style={{ position: "absolute", left: x0 + Math.sin(f / 26 + fase) * 24, top: y, width: lado, height: lado, borderRadius: "50%",
            border: `3px solid ${c.foco}`, opacity: 0.18 + 0.2 * r("o") }} />;
        }
        const y = (((y0 + f * v * 2.2) % 2050) + 2050) % 2050 - 80;
        const cols = [c.foco, IF.blanco, IF.exito, IF.azulLuz];
        return <div key={i} style={{ position: "absolute", left: x0 + Math.sin(f / 18 + fase) * 40, top: y, width: 12 + r("w") * 10, height: 6 + r("h") * 6,
          background: cols[i % cols.length], opacity: 0.35, transform: `rotate(${f * (2 + r("r") * 6) + fase * 57}deg)`, borderRadius: 2 }} />;
      })}
    </AbsoluteFill>
  );
};
