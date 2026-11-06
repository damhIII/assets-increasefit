// useClima(): colores del clima en el frame actual, fundidos en cada frontera entre bloques (transicion_frames centrados en ini_f).
import { interpolateColors, useCurrentFrame } from "remotion";
import { brief, PALETAS, climaDe, type Clima } from "./datos";

const CLAVES: (keyof Clima)[] = ["fondo_a", "fondo_b", "tinte", "superficie", "estructura", "acento", "texto", "texto_suave", "cuerpo_rep", "cuerpo_rep_lejano"];

export function climaEnFrame(frame: number): Clima & { claridad: number } {
  const T = PALETAS.reglas_rotacion.transicion_frames;
  const bs = brief.bloques;
  let i = bs.findIndex((b) => frame >= b.ini_f && frame < b.fin_f);
  if (i < 0) i = bs.length - 1;
  const actual = climaDe(bs[i].id);
  let mezcla: { a: Clima; b: Clima; k: number } | null = null;
  const sig = bs[i + 1];
  if (sig && frame >= sig.ini_f - T / 2) mezcla = { a: actual, b: climaDe(sig.id), k: (frame - (sig.ini_f - T / 2)) / T };
  else if (i > 0 && frame < bs[i].ini_f + T / 2) mezcla = { a: climaDe(bs[i - 1].id), b: actual, k: (frame - (bs[i].ini_f - T / 2)) / T };
  if (!mezcla || mezcla.a === mezcla.b) return { ...actual, claridad: actual.tipo === "claro" ? 1 : 0 };
  const k = Math.min(1, Math.max(0, mezcla.k));
  const out = { ...(k < 0.5 ? mezcla.a : mezcla.b) } as Clima & { claridad: number };
  for (const c of CLAVES) (out as Record<string, unknown>)[c] = interpolateColors(k, [0, 1], [mezcla.a[c] as string, mezcla.b[c] as string]);
  out.claridad = (mezcla.a.tipo === "claro" ? 1 - k : 0) + (mezcla.b.tipo === "claro" ? k : 0);
  return out;
}

export const useClima = () => climaEnFrame(useCurrentFrame());

/** Dentro de una escena (Sequence) el frame es local: usa este hook con el bloque para leer el clima correcto. */
export const useClimaBloque = (b: { ini_f: number }) => climaEnFrame(useCurrentFrame() + b.ini_f);
