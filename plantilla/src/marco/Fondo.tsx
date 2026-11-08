// Capa 1: degradado del clima + brillo de tinte que deriva + textura en movimiento lento + viñeta.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { useClima } from "./clima";
import { climaDe, escenaEn } from "./datos";

export const Fondo: React.FC = () => {
  const f = useCurrentFrame();
  const c = useClima();
  const bx = 540 + Math.sin(f / 70) * 160, by = 760 + Math.cos(f / 90) * 120;
  const textura = climaDe(escenaEn(f).clima).textura || "textures/noise_grain.svg";
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${c.fondo_a} 0%, ${c.fondo_b} 100%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${bx}px ${by}px, ${c.tinte}AA 0%, ${c.tinte}00 55%)` }} />
      <AbsoluteFill style={{ opacity: c.claridad > 0.5 ? 0.9 : 0.1, transform: `translateY(${(f * 0.3) % 40}px)` }}>
        <Img src={staticFile(textura)} style={{ width: 1080, height: 1960, objectFit: "cover" }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: 0.85 - c.claridad * 0.6 }}>
        <Img src={staticFile("textures/vignette.svg")} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
