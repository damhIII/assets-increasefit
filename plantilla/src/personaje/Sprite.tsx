// La mascota: sprites PNG de mascota/sprites animados pose a pose.
// colocar() decide escala y posición según el encuadre; puntoEnPantalla() convierte un ancla del sprite a px de pantalla.
// Ejercicios: con 3 fases (f1, fm, f2) la repetición va f1 → fm → f2 → fm. anim "hablar" (solo plano_boca_*): la boca sigue a la voz.
import React from "react";
import { Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ALTURA_PERSONAJE, datos, EJERCICIOS, SPRITES, type MascotaEscena, type SpriteInfo } from "../marco/datos";

export const SUELO = 1340;
const K0 = 800 / ALTURA_PERSONAJE;                     // personaje de pie = 800 px en encuadre general
const CX = { centro: 540, izq: 320, der: 760 } as const;

/** "ejercicio:sentadilla" -> [sentadilla_f1, sentadilla_f2]; un id normal -> [id]. Ids desconocidos -> gesto_de_pie. */
export function fasesDe(sprite: string): SpriteInfo[] {
  if (sprite.startsWith("ejercicio:")) {
    const ej = EJERCICIOS[sprite.slice(10)];
    if (ej?.fases?.length) return ej.fases.map((id) => SPRITES[id]).filter(Boolean);
  }
  return [SPRITES[sprite] ?? SPRITES["gesto_de_pie"]];
}

export type Colocacion = { x: number; y: number; k: number; w: number; h: number; espejo: boolean; info: SpriteInfo };

export function colocar(info: SpriteInfo, encuadre: MascotaEscena["encuadre"], posicion: MascotaEscena["posicion"], espejo = false, escalaExtra = 1, cxForzado?: number): Colocacion {
  const [w, h] = info.tam;
  const cx = cxForzado ?? CX[posicion] ?? 540;
  let k = K0 * escalaExtra;
  const ax = (a: [number, number]) => (espejo ? w - a[0] : a[0]);
  if (info.categoria === "cara" || info.categoria === "mano") {
    k = 1.25 * escalaExtra;
    return { x: cx - (w * k) / 2, y: 930 - (h * k) / 2, k, w, h, espejo, info };
  }
  if (info.categoria === "plano_medio") {
    k = K0 * 1.2 * escalaExtra;
    return { x: cx - (w * k) / 2, y: 1450 - h * k, k, w, h, espejo, info };
  }
  const cab = info.anclas.cabeza;
  if (encuadre === "medio" && cab) {
    k = K0 * 1.55 * escalaExtra;
    return { x: cx - ax(cab) * k, y: 720 - cab[1] * k, k, w, h, espejo, info };
  }
  if (encuadre === "primer_plano" && cab) {
    k = K0 * 2.5 * escalaExtra;
    return { x: 540 - ax(cab) * k, y: 860 - cab[1] * k, k, w, h, espejo, info };
  }
  // general: pies en el suelo, que quepa en la zona de escena (x 50–1030, y 540–SUELO)
  k = Math.min(k, 960 / w, (SUELO - 540) / h);
  const pies = info.anclas.pies;
  let x = cx - ax(pies) * k;
  x = Math.min(Math.max(x, 50), 1030 - w * k);
  return { x, y: SUELO - pies[1] * k, k, w, h, espejo, info };
}

export function puntoEnPantalla(c: Colocacion, a: [number, number] | null | undefined): [number, number] | null {
  if (!a) return null;
  const ax = c.espejo ? c.w - a[0] : a[0];
  return [c.x + ax * c.k, c.y + a[1] * c.k];
}

/** Punto al que apunta una anotación: cabeza, manos (la primera), pies o centro del sprite. */
export function ancla(c: Colocacion, donde: string | undefined): [number, number] {
  const A = c.info.anclas;
  const centro: [number, number] = [c.x + (c.w * c.k) / 2, c.y + (c.h * c.k) / 2];
  if (donde === "cabeza") return puntoEnPantalla(c, A.cabeza) ?? [centro[0], c.y + c.h * c.k * 0.12];
  if (donde === "manos") return puntoEnPantalla(c, A.manos[0]) ?? centro;
  if (donde === "pies") return puntoEnPantalla(c, A.pies) ?? centro;
  return centro;
}

const VOCAL: Record<string, string> = { a: "a", á: "a", e: "e", é: "e", i: "e", í: "e", y: "e", o: "o", ó: "o", u: "u", ú: "u", ü: "u" };

/** Boca (reposo | a | e | o | u) para el segundo `t` de la locución: la letra de la palabra que suena en ese instante
 *  (m, b, p cierran la boca; otra consonante toma la vocal más cercana; entre palabras, reposo). */
export function bocaEn(t: number): string {
  const w = datos.subtitulos.find((p) => t >= p[1] && t < p[2]);
  if (!w) return "reposo";
  const letras = String(w[0]).toLowerCase().replace(/[^a-záéíóúüñ]/g, "");
  if (!letras) return "reposo";
  const i = Math.min(letras.length - 1, Math.floor(((t - w[1]) / Math.max(0.05, w[2] - w[1])) * letras.length));
  const c = letras[i];
  if ("mbp".includes(c)) return "reposo";
  if (VOCAL[c]) return VOCAL[c];
  for (let d = 1; d < letras.length; d++) {
    const sig = letras[i + d], ant = letras[i - d];
    if (sig && VOCAL[sig]) return VOCAL[sig];
    if (ant && VOCAL[ant]) return VOCAL[ant];
  }
  return "e";
}

type Props = {
  sprite: string; anim: MascotaEscena["anim"]; colocacion: Colocacion; continua?: boolean; desde?: number; filtro?: string;
  ini?: number;                                        // frame GLOBAL en que empieza la escena (para anim "hablar")
};

/** Dibuja el sprite con su animación. El frame es local a la escena (dentro de su <Sequence>). */
export const Mascota: React.FC<Props> = ({ sprite, anim, colocacion: c, continua = false, desde = 0, filtro, ini = 0 }) => {
  const local = useCurrentFrame();
  const f = local - desde;
  const { fps } = useVideoConfig();
  let fases = fasesDe(sprite);
  if (anim === "hablar" && sprite.startsWith("plano_boca")) {
    const t = (local + ini) / fps;
    fases = [SPRITES[`plano_boca_${bocaEn(t)}`] ?? fases[0]];
  }
  const esEjercicio = fases.length > 1 || anim === "ejercicio";
  // 2 fases: f1 ↔ f2 cada 13 frames. 3 fases: f1 → fm → f2 → fm cada 9 frames (una repetición ≈ 1,2 s).
  const orden = fases.length > 2 ? [...fases.keys(), ...[...fases.keys()].slice(1, -1).reverse()] : [...fases.keys()];
  const periodo = fases.length > 2 ? 9 : 13;
  const paso = esEjercicio && fases.length > 1 ? Math.floor(Math.max(0, f) / periodo) % orden.length : 0;
  const idx = orden[paso] ?? 0;
  const prev = orden[(paso + orden.length - 1) % orden.length] ?? 0;
  const desdeCambio = Math.max(0, f) % periodo;

  const e = continua ? 1 : spring({ fps, frame: f, config: { damping: 11, stiffness: 190 } });
  const respira = 1 + 0.007 * Math.sin(f / 13);
  let dx = 0, rot = 0;
  if (anim === "temblor") { dx = Math.sin(f * 2.4) * 5; rot = Math.sin(f * 1.7) * 0.6; }
  if (anim === "entrar" && !continua) dx = (1 - spring({ fps, frame: f, config: { damping: 14, stiffness: 120 } })) * (c.x + c.w * c.k / 2 > 540 ? 700 : -700);
  const sx = (anim === "pop" || anim === "ejercicio" || anim === "hablar") && !continua ? 0.86 + 0.14 * e : 1;
  const squash = esEjercicio && desdeCambio < 3 ? 0.03 * (1 - desdeCambio / 3) : 0;
  const pies = puntoEnPantalla(c, c.info.anclas.pies) ?? [c.x + c.w * c.k / 2, c.y + c.h * c.k];
  const origen = `${pies[0] - c.x}px ${pies[1] - c.y}px`;
  const img = (s: SpriteInfo, op: number, key: string) => (
    <Img key={key} src={staticFile(`mascota/${s.archivo}`)} style={{ position: "absolute", left: 0, top: 0, width: c.w * c.k, height: c.h * c.k, opacity: op,
      transform: c.espejo ? "scaleX(-1)" : undefined }} />
  );
  return (
    <div style={{ position: "absolute", left: c.x + dx, top: c.y, width: c.w * c.k, height: c.h * c.k, transformOrigin: origen,
      transform: `scale(${sx * (1 + squash)}, ${sx * respira * (1 - squash)}) rotate(${rot}deg)`, opacity: anim === "entrar" ? 1 : Math.min(1, e * 1.4),
      filter: filtro ?? "drop-shadow(0 18px 24px rgba(0,0,0,0.35))" }}>
      {esEjercicio && fases.length > 1 && desdeCambio < 4 && f > 4 ? img(fases[prev], 0.28 * (1 - desdeCambio / 4), "estela") : null}
      {img(fases[idx], 1, "pose")}
    </div>
  );
};
