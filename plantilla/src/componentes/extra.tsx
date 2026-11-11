// Piezas que usan assets de terceros descargados al repo: mapa muscular (anatomia/) y animaciones Lottie (lottie/).
// Igual que el kit: `desde` en frames LOCALES de la escena; colores siempre del clima o de los tonos de marca.
import React, { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Lottie, type LottieAnimationData } from "@remotion/lottie";
import { FUENTE, LOTTIES, MUSCULOS } from "../marco/datos";
import type { C } from "../marco/clima";
import { colorTono, useEntrada } from "./kit";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
type Tono = "foco" | "alerta" | "exito";

/** Mapa muscular (frente o espalda) con 1-4 músculos que se encienden escalonados en el color del tono y laten. */
export const MapaMuscular: React.FC<{ vista?: "frente" | "espalda"; resaltar: string[]; tono?: Tono; desde: number; c: C; x?: number; y?: number; alto?: number; etiquetas?: boolean }> = ({
  vista = "frente", resaltar, tono, desde, c, x = 60, y = 570, alto = 760, etiquetas = false }) => {
  const f = useCurrentFrame();
  const e = useEntrada(desde);
  const v = MUSCULOS.vistas?.[vista];
  if (!v) return null;
  const [, , vw, vh] = v.viewBox.split(" ").map(Number);
  const ancho = (alto * vw) / vh;
  const color = colorTono(tono, c);
  const latido = 0.82 + 0.18 * Math.sin(f / 5);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, height: alto, transform: `translateY(${(1 - e) * 70}px) scale(${0.92 + 0.08 * e})`, opacity: Math.min(1, e) }}>
      <svg viewBox={v.viewBox} width={ancho} height={alto} style={{ overflow: "visible" }}>
        <path d={v.contorno} fill={c.texto} fillOpacity={0.06} stroke={c.texto} strokeOpacity={0.45} strokeWidth={4} />
        {v.partes.map((p) => {
          const k = resaltar.indexOf(p.id);
          const on = k >= 0 ? interpolate(f, [desde + 8 + k * 7, desde + 16 + k * 7], [0, 1], clamp) : 0;
          return (
            <g key={p.id}>
              {p.d.map((d, i) => (
                <path key={i} d={d} fill={on > 0 ? color : c.texto} fillOpacity={on > 0 ? on * latido : p.musculo ? 0.16 : 0.08}
                  style={on > 0 ? { filter: `drop-shadow(0 0 ${14 * on}px ${color})` } : undefined} />
              ))}
            </g>
          );
        })}
      </svg>
      {etiquetas ? (
        <div style={{ position: "absolute", left: 0, top: alto + 12, width: ancho, textAlign: "center", fontFamily: FUENTE.mono, fontSize: 24, color: c.texto_suave, letterSpacing: "0.06em" }}>
          {vista === "frente" ? "FRENTE" : "ESPALDA"}
        </div>
      ) : null}
    </div>
  );
};

/** Carga un JSON de lottie/ antes de renderizar (delayRender), una vez por id. */
const useLottieData = (id: string) => {
  const [handle] = useState(() => delayRender(`lottie ${id}`));
  const [data, setData] = useState<LottieAnimationData | null>(null);
  useEffect(() => {
    const info = LOTTIES[id];
    if (!info) {
      continueRender(handle);
      return;
    }
    fetch(staticFile(`lottie/${info.archivo}`))
      .then((r) => r.json())
      .then((j) => {
        setData(j as LottieAnimationData);
        continueRender(handle);
      })
      .catch((err) => cancelRender(err));
  }, [handle, id]);
  return data;
};

/** Animación Lottie centrada en (x, y). Las `mono` se tiñen de un solo color (tono o el texto del clima); las de color ya vienen
 *  recoloreadas a la paleta de marca. Entra con rebote en `desde` y, si no es bucle, se queda en su último frame. */
export const LottieAnim: React.FC<{ id: string; x: number; y: number; size?: number; desde: number; c: C; tono?: Tono | "texto" }> = ({ id, x, y, size = 420, desde, c, tono }) => {
  const data = useLottieData(id);
  const e = useEntrada(desde, { damping: 11, stiffness: 200 });
  const info = LOTTIES[id];
  if (!data || !info) return null;
  const color = tono === "texto" || !tono ? c.texto : colorTono(tono, c);
  const fid = `tinte-${id}-${desde}`;
  return (
    <Sequence from={desde} layout="none" name={`lottie ${id}`}>
      {info.mono ? (
        <svg width={0} height={0} style={{ position: "absolute" }}>
          <filter id={fid} colorInterpolationFilters="sRGB">
            <feFlood floodColor={color} />
            <feComposite in2="SourceAlpha" operator="in" />
          </filter>
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, height: size, transform: `scale(${0.6 + 0.4 * e})`, opacity: Math.min(1, e * 1.5),
        filter: info.mono ? `url(#${fid})` : undefined }}>
        <Lottie animationData={data} loop={info.bucle} style={{ width: size, height: size }} />
      </div>
    </Sequence>
  );
};
