import React from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";
import { IF } from "./datos";
import { useClima } from "./clima";

export const BarraProgreso: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const c = useClima();
  const w = (f / Math.max(1, durationInFrames - 1)) * 1080;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: w, height: 8, background: IF.cian,
      boxShadow: c.claridad > 0.5 ? "0 2px 0 rgba(10,14,18,0.25)" : `0 0 18px ${IF.cian}88` }}>
      <div style={{ position: "absolute", right: -9, top: -5, width: 18, height: 18, borderRadius: 9, background: IF.blanco,
        boxShadow: `0 0 ${16 + 10 * Math.sin(f / 3)}px ${IF.cian}`, opacity: 0.85 + 0.15 * Math.sin(f / 3) }} />
    </div>
  );
};
