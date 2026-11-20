// Imagen con licencia libre (v9): una ilustración, un diagrama o un objeto descargado con scripts/imagenes.py
// (Openverse / Wikimedia Commons) en briefs/<BASE>/imagenes/. NUNCA personas: la mascota es la única figura humana.
// · Va dentro de un marco (polaroid, celular, círculo o tarjeta) que se queda QUIETO dentro de la zona segura; el movimiento
//   (zoom lento tipo Ken Burns) ocurre DENTRO del marco, recortado: nada se sale hacia los bordes del Reel.
// · Por defecto se tiñe en duotono con los colores del clima (negro → fondo del clima, blanco → foco), para que parezca de la marca.
// · Debajo, el crédito (autor · licencia): las licencias CC BY / BY-SA lo exigen.
import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { encajarX, FUENTE, IF, ZONA } from "../marco/datos";
import type { C } from "../marco/clima";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Marco = "polaroid" | "celular" | "circulo" | "tarjeta";

/** Caja exterior que ocupa cada marco para un ancho de imagen `w` (para encajarla en la zona antes de dibujarla). */
const GIRO = { polaroid: -2.5, celular: 0, circulo: 0, tarjeta: 0 } as const;

export const ImagenMarco: React.FC<{ archivo: string; credito?: string; marco?: Marco; duotono?: boolean; proporcion?: number;
  desde: number; c: C; x?: number; y?: number; ancho?: number; altoMax?: number }> = ({ archivo, credito, marco = "polaroid", duotono = true, proporcion = 0.75,
  desde, c, x = ZONA.izq, y = 600, ancho = 500, altoMax = 700 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = Math.min(1, spring({ fps, frame: f - desde, config: { damping: 15, stiffness: 160 } }));   // sin pasarse de 1
  const zoom = interpolate(f, [desde, desde + 150], [1.0, 1.1], clamp);                                    // Ken Burns dentro del marco
  const deriva = interpolate(f, [desde, desde + 150], [0, -3], clamp);
  // tamaño de la imagen según el marco, para que la caja exterior (girada incluida) quepa en `ancho` y en `altoMax`
  const r = marco === "celular" ? 16 / 9 : marco === "circulo" ? 1 : Math.min(1.4, Math.max(0.55, proporcion));   // alto / ancho de la imagen
  const padL = marco === "polaroid" ? 22 : marco === "celular" ? 18 : marco === "circulo" ? 8 : 6;
  const padB = marco === "polaroid" ? 70 : padL;
  const g = (Math.abs(GIRO[marco]) * Math.PI) / 180;
  let w = ancho - 2 * padL;
  const caja = (wi: number) => {
    const W = wi + 2 * padL, H = wi * r + padL + padB;
    return [W * Math.cos(g) + H * Math.sin(g), W * Math.sin(g) + H * Math.cos(g)];
  };
  while ((caja(w)[0] > ancho || caja(w)[1] > altoMax - (credito && marco !== "polaroid" ? 40 : 0)) && w > 120) w -= 4;
  const W = w + 2 * padL, H = w * r + padL + padB;
  const [cw] = caja(w);
  const left = encajarX(x + (ancho - cw) / 2, cw) + (cw - W) / 2;      // la caja girada queda dentro de la zona

  const radioImg = marco === "circulo" ? "50%" : marco === "celular" ? 34 : marco === "tarjeta" ? 26 : 4;
  const radioMarco = marco === "circulo" ? "50%" : marco === "celular" ? 52 : marco === "tarjeta" ? 32 : 8;
  const fondoMarco = marco === "polaroid" ? "#F6F4EE" : marco === "celular" ? IF.grafito : marco === "circulo" ? c.foco : c.superficie;
  const oscuro = c.claridad > 0.5 ? c.fondo_b : c.fondo_a;
  return (
    <div style={{ position: "absolute", left, top: y, width: W, height: H, opacity: e,
      transform: `translateY(${(1 - e) * 60}px) rotate(${GIRO[marco] * e}deg) scale(${0.88 + 0.12 * e})`, transformOrigin: "50% 50%" }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: radioMarco, background: fondoMarco, boxShadow: "0 26px 60px rgba(0,0,0,0.4)",
        border: marco === "celular" ? `3px solid ${c.estructura}66` : marco === "tarjeta" ? `3px solid ${c.estructura}55` : "none" }} />
      <div style={{ position: "absolute", left: padL, top: padL, width: w, height: w * r, borderRadius: radioImg, overflow: "hidden", background: oscuro }}>
        <Img src={staticFile(archivo)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom}) translateY(${deriva}%)`,
          filter: duotono ? "grayscale(1) contrast(1.12) brightness(1.04)" : "saturate(0.9) contrast(1.05)" }} />
        {duotono ? (
          <>
            <div style={{ position: "absolute", inset: 0, background: c.foco, mixBlendMode: "multiply" }} />
            <div style={{ position: "absolute", inset: 0, background: oscuro, mixBlendMode: "lighten" }} />
          </>
        ) : null}
        {marco === "celular" ? <div style={{ position: "absolute", left: "50%", top: 14, width: 110, height: 28, marginLeft: -55, borderRadius: 14, background: IF.grafito }} /> : null}
      </div>
      {credito ? (
        <div style={{ position: "absolute", left: marco === "polaroid" ? padL : 0, width: marco === "polaroid" ? w : W, top: marco === "polaroid" ? H - padB + 22 : H + 12,
          fontFamily: FUENTE.mono, fontSize: 17, letterSpacing: "0.02em", color: marco === "polaroid" ? "#55534D" : c.texto_suave, textAlign: "center",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{credito}</div>
      ) : null}
    </div>
  );
};
