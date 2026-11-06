// Hoja de contactos del rig: cada movimiento en 3 momentos de su ciclo. `npm run hoja`.
import React from "react";
import { AbsoluteFill } from "remotion";
import { RepSVG } from "./rep/Rep";
import { MOVIMIENTOS } from "./rep/esqueleto";

export const HojaRig: React.FC = () => {
  const ids = Object.keys(MOVIMIENTOS);
  const cols = 3, celdaW = 1080 / cols, celdaH = 520;
  const momentos = [0.0, 0.3, 0.5];
  return (
    <AbsoluteFill style={{ background: "#171E26" }}>
      <svg width={1080 * 3} height={Math.ceil(ids.length / cols) * celdaH} viewBox={`0 0 ${1080 * 3} ${Math.ceil(ids.length / cols) * celdaH}`}>
        {ids.map((id, i) => {
          const cx = (i % cols) * 1080, cy = Math.floor(i / cols) * celdaH;
          const m = MOVIMIENTOS[id];
          return (
            <g key={id}>
              <rect x={cx + 6} y={cy + 6} width={1068} height={celdaH - 12} fill="none" stroke="#2A3540" strokeWidth={3} />
              <text x={cx + 24} y={cy + 44} fill="#FFFFFF" fontFamily="sans-serif" fontSize={30} fontWeight={700}>{id}</text>
              <line x1={cx + 20} x2={cx + 1060} y1={cy + celdaH - 40} y2={cy + celdaH - 40} stroke="#3A4652" strokeWidth={3} />
              {momentos.map((u, k) => (
                <RepSVG key={k} movimiento={id} t={u * m.ciclo_s} x={cx + 200 + k * 340} y={cy + celdaH - 40} escala={105} musculos="auto" brilloMusculo={1} />
              ))}
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
