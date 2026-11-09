// Texto en pantalla de cada escena (Y≈300–520). Complementa a la voz, no la repite.
//   titular: "línea 1 / línea 2" → línea 1 Open Sans 400 blanca + línea 2 Open Sans 800 en el foco del clima (eco del "FIT" del logo). Sin "/": una línea 800.
//   nota:    a mano (Kalam), ligeramente girada, como una anotación.
//   capitulo y ninguno: no se dibuja aquí (capitulo es una tarjeta de la escena).
import React from "react";
import { interpolate, interpolateColors, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { datos, FUENTE, IF } from "./datos";
import { useClima } from "./clima";

const ajustar = (txt: string, base: number, factor: number) => Math.min(base, Math.floor(920 / Math.max(1, txt.length * factor)));

export const TextoPantalla: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = useClima();
  const es = datos.escenas;
  const i = es.findIndex((x) => f >= x.ini_f && f < x.fin_f);
  if (i < 0) return null;
  const p = es[i];
  const { texto, estilo } = p.pantalla;
  if (!texto || estilo === "capitulo" || estilo === "ninguno") return null;
  // si la escena anterior tenía el mismo texto, no se repite la entrada
  let k0 = i;
  while (k0 > 0 && es[k0 - 1].pantalla.texto === texto && es[k0 - 1].pantalla.estilo === estilo) k0--;
  const inicio = es[k0].ini_f;
  const sig = es[i + 1];
  const sale = !(sig && sig.pantalla.texto === texto && sig.pantalla.estilo === estilo);
  const local = f - inicio;
  const salida = sale ? interpolate(f, [p.fin_f - 5, p.fin_f], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const entra = (k: number) => {
    const e = spring({ fps, frame: local - k * 4, config: { damping: 14, stiffness: 170 } });
    return { transform: `translateY(${(1 - e) * 60 - salida * 80}px)`, opacity: Math.min(e, 1 - salida) };
  };
  const claro = c.claridad > 0.5;
  const blanco = interpolateColors(c.claridad, [0, 1], [IF.blanco, IF.tinta]);

  if (estilo === "nota") {
    const s = ajustar(texto, 84, 0.5);
    return (
      <div style={{ position: "absolute", top: 330, left: 80, width: 920, textAlign: "center", ...entra(0) }}>
        <span style={{ display: "inline-block", fontFamily: FUENTE.mano, fontWeight: 700, fontSize: s, color: claro ? IF.tinta : IF.hielo, transform: "rotate(-3deg)", lineHeight: 1.1 }}>{texto}</span>
      </div>
    );
  }
  const [l1, l2] = texto.includes("/") ? texto.split("/").map((x) => x.trim().toUpperCase()) : ["", texto.toUpperCase()];
  const s1 = ajustar(l1, 74, 0.6), s2 = ajustar(l2, 96, 0.68);
  const marcador = spring({ fps, frame: local - 8, config: { damping: 16, stiffness: 140 } });
  return (
    <div style={{ position: "absolute", top: 300, left: 80, width: 920, fontFamily: FUENTE.titulos, lineHeight: 1.02 }}>
      {l1 ? <div style={{ fontWeight: 400, fontSize: s1, color: blanco, letterSpacing: "-0.01em", ...entra(0) }}>{l1}</div> : null}
      <div style={{ position: "relative", display: "inline-block", marginTop: 6, ...entra(l1 ? 1 : 0) }}>
        {claro ? <div style={{ position: "absolute", left: -10, right: -10, top: "12%", bottom: "6%", background: c.foco, transformOrigin: "left center", transform: `scaleX(${marcador})` }} /> : null}
        <span style={{ position: "relative", fontWeight: 800, fontSize: s2, color: claro ? IF.blanco : l1 ? c.foco : IF.blanco, letterSpacing: "-0.015em" }}>{l2}</span>
      </div>
    </div>
  );
};
