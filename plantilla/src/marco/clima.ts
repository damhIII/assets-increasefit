// useClima(): colores del clima en el frame actual, fundidos en cada frontera entre escenas de distinto clima.
import { interpolateColors, useCurrentFrame } from "remotion";
import { datos, PALETAS, climaDe, type Clima } from "./datos";

const CLAVES: (keyof Clima)[] = ["fondo_a", "fondo_b", "tinte", "superficie", "estructura", "acento", "foco", "texto", "texto_suave"];
export type C = Clima & { claridad: number; azulidad: number };   // 0-1: cuánto de clima claro / de clima azul (tipo "color") hay en este frame

export function climaEnFrame(frame: number): C {
  const T = PALETAS.reglas_rotacion.transicion_frames;
  const es = datos.escenas;
  let i = es.findIndex((e) => frame >= e.ini_f && frame < e.fin_f);
  if (i < 0) i = es.length - 1;
  const actual = climaDe(es[i].clima);
  let mezcla: { a: Clima; b: Clima; k: number } | null = null;
  const sig = es[i + 1];
  if (sig && frame >= sig.ini_f - T / 2) mezcla = { a: actual, b: climaDe(sig.clima), k: (frame - (sig.ini_f - T / 2)) / T };
  else if (i > 0 && frame < es[i].ini_f + T / 2) mezcla = { a: climaDe(es[i - 1].clima), b: actual, k: (frame - (es[i].ini_f - T / 2)) / T };
  if (!mezcla || mezcla.a === mezcla.b) return { ...actual, claridad: actual.tipo === "claro" ? 1 : 0, azulidad: actual.tipo === "color" ? 1 : 0 };
  const k = Math.min(1, Math.max(0, mezcla.k));
  const out = { ...(k < 0.5 ? mezcla.a : mezcla.b) } as C;
  for (const c of CLAVES) (out as Record<string, unknown>)[c] = interpolateColors(k, [0, 1], [mezcla.a[c] as string, mezcla.b[c] as string]);
  out.claridad = (mezcla.a.tipo === "claro" ? 1 - k : 0) + (mezcla.b.tipo === "claro" ? k : 0);
  out.azulidad = (mezcla.a.tipo === "color" ? 1 - k : 0) + (mezcla.b.tipo === "color" ? k : 0);
  return out;
}

export const useClima = () => climaEnFrame(useCurrentFrame());
/** Dentro de una <Sequence> el frame es local: pasa la escena (su ini_f). */
export const useClimaEscena = (e: { ini_f: number }) => climaEnFrame(useCurrentFrame() + e.ini_f);
