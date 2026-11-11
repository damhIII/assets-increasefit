// Capa 1: degradado del clima + brillo de tinte que deriva + textura en movimiento lento + patrón de la escena (fondos/, opcional) + viñeta.
// El patrón (escena.fondo) es un SVG blanco que se pinta con máscara en el color de texto del clima: nunca trae colores propios.
// El clima azul lleva la viñeta muy suave: las tarjetas azules del feed son planas.
import React from "react";
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from "remotion";
import { useClima } from "./clima";
import { climaDe, escenaEn } from "./datos";

export const Fondo: React.FC = () => {
  const f = useCurrentFrame();
  const c = useClima();
  const bx = 540 + Math.sin(f / 70) * 160, by = 760 + Math.cos(f / 90) * 120;
  const escena = escenaEn(f);
  const textura = climaDe(escena.clima).textura || "textures/noise_grain.svg";
  const patron = escena.fondo ? `url(${staticFile(`fondos/${escena.fondo}.svg`)})` : null;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(170deg, ${c.fondo_a} 0%, ${c.fondo_b} 100%)` }}>
      <AbsoluteFill style={{ background: `radial-gradient(circle at ${bx}px ${by}px, ${c.tinte}AA 0%, ${c.tinte}00 55%)` }} />
      {patron ? null : (
        <AbsoluteFill style={{ opacity: c.claridad > 0.5 ? 0.9 : 0.1, transform: `translateY(${(f * 0.3) % 40}px)` }}>
          <Img src={staticFile(textura)} style={{ width: 1080, height: 1960, objectFit: "cover" }} />
        </AbsoluteFill>
      )}
      {patron ? (
        <AbsoluteFill style={{ opacity: 0.075 + 0.03 * c.azulidad, transform: `translateY(${-((f * 0.25) % 1920)}px)` }}>
          <div style={{ width: 1080, height: 3840, backgroundColor: c.texto, WebkitMaskImage: patron, maskImage: patron,
            WebkitMaskSize: "1080px 1920px", maskSize: "1080px 1920px", WebkitMaskRepeat: "repeat", maskRepeat: "repeat" }} />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill style={{ opacity: 0.85 - c.claridad * 0.6 - c.azulidad * 0.6 }}>
        <Img src={staticFile("textures/vignette.svg")} style={{ width: 1080, height: 1920 }} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
