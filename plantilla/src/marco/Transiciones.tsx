// Transiciones de escena (v9). Dos piezas:
//  · <Transicionar>: envuelve cada escena dentro de su <Sequence>. Aplica la ENTRADA de la escena (zoom, deslizar, iris, fundido)
//    en sus primeros TRANS_SOLAPE frames y, si la escena SIGUIENTE entra con solape (deslizar, iris, fundido), la SALIDA de esta
//    durante los frames extra en que sigue viva debajo (Video.tsx alarga su <Sequence> TRANS_SOLAPE frames).
//  · <CortinaTransicion>: lo que va ENCIMA en el corte (barrido de color, flash). Son decorativos: pueden cruzar los bordes.
// Todo movimiento que cruza los márgenes es transitorio (dura ≤ 10 frames); la posición en reposo de cada escena no cambia.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { CON_SOLAPE, IF, TRANS_SOLAPE, type Escena, type Transicion } from "./datos";
import { MODO_MARGENES } from "./revision";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const salidaSuave = (t: number) => 1 - Math.pow(1 - t, 3);

export const Transicionar: React.FC<{ e: Escena; siguiente?: Escena; children: React.ReactNode }> = ({ e, siguiente, children }) => {
  const f = useCurrentFrame();
  const dur = e.fin_f - e.ini_f;
  const D = TRANS_SOLAPE;
  let style: React.CSSProperties = {};
  const p = salidaSuave(interpolate(f, [0, D], [0, 1], clamp));
  switch (e.transicion) {
    case "zoom": {
      const q = salidaSuave(interpolate(f, [0, 8], [0, 1], clamp));
      style = { transform: `scale(${0.9 + 0.1 * q})`, filter: q < 1 ? `blur(${(1 - q) * 10}px)` : undefined, opacity: 0.3 + 0.7 * q };
      break;
    }
    case "deslizar": style = { transform: `translateX(${(1 - p) * 1080}px)` }; break;
    case "iris": style = { clipPath: `circle(${p * 1300}px at 540px 900px)` }; break;
    case "fundido": style = { opacity: p }; break;
    default: break;
  }
  // salida: solo durante el solape con la siguiente. Las escenas son capas TRANSPARENTES sobre el fondo común, así que la
  // saliente tiene que desaparecer de verdad donde ya está la nueva (si no, se verían las dos a la vez):
  //  · deslizar: se va empujada a la izquierda al mismo ritmo que entra la nueva (borde con borde, sin solaparse)
  //  · iris: se enmascara con el círculo inverso (lo de dentro del círculo ya es la escena nueva)
  //  · fundido: se desvanece mientras la nueva aparece
  if (siguiente && CON_SOLAPE.includes(siguiente.transicion) && f >= dur) {
    const q = salidaSuave(interpolate(f, [dur, dur + D], [0, 1], clamp));
    if (siguiente.transicion === "deslizar") style = { ...style, transform: `${style.transform ?? ""} translateX(${-q * 1080}px)` };
    else if (siguiente.transicion === "iris") {
      const m = `radial-gradient(circle ${q * 1300}px at 540px 900px, transparent 99.5%, #000 100%)`;
      style = { ...style, WebkitMaskImage: m, maskImage: m };
    } else style = { ...style, opacity: (style.opacity as number | undefined ?? 1) * (1 - q) };
  }
  if (MODO_MARGENES) style = {};
  return <AbsoluteFill style={style}>{children}</AbsoluteFill>;
};

/** Overlay del corte: `barrido` (panel azul que cruza la pantalla y destapa la nueva escena) o `flash` (destello blanco).
 *  Va en una <Sequence> que empieza 7 frames antes del corte (barrido) o en el corte (flash). */
export const CortinaTransicion: React.FC<{ tipo: Transicion }> = ({ tipo }) => {
  const f = useCurrentFrame();
  if (MODO_MARGENES) return null;
  if (tipo === "barrido") {
    const x = f < 7 ? interpolate(f, [0, 7], [-1300, -110], { ...clamp, easing: salidaSuave }) : interpolate(f, [7, 15], [-110, 1300], { ...clamp, easing: (t) => t * t });
    return (
      <AbsoluteFill style={{ pointerEvents: "none" }}>
        <div style={{ position: "absolute", top: -200, left: x, width: 1300, height: 2320, background: IF.azul, transform: "skewX(-12deg)" }} />
        <div style={{ position: "absolute", top: -200, left: x - 70, width: 60, height: 2320, background: IF.azulLuz, transform: "skewX(-12deg)" }} />
      </AbsoluteFill>
    );
  }
  if (tipo === "flash") {
    return <AbsoluteFill style={{ background: IF.blanco, opacity: interpolate(f, [0, 1, 6], [0.9, 0.75, 0], clamp), pointerEvents: "none" }} />;
  }
  return null;
};
