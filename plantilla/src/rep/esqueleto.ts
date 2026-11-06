// Esqueleto de Rep, la mascota de IncreaseFit: cinemática directa + IK de dos huesos.
// Unidades del rig: 1 u ≈ 47 cm (Rep mide ~3,7 u). Eje Y hacia ARRIBA; el origen es el suelo bajo la figura.
// Ángulos absolutos en grados: 0 = hacia delante (+x, Rep mira a la derecha), 90 = arriba, -90 = abajo.
// Nada aleatorio: todo es función pura del tiempo (determinismo de Remotion).
import datos from "./movimientos.json";

export type Vec = [number, number];
export type Segmento =
  | "torso_bajo" | "torso_alto" | "cuello"
  | "brazo" | "antebrazo" | "brazo2" | "antebrazo2"
  | "muslo" | "pierna" | "pie" | "muslo2" | "pierna2" | "pie2";
export type Articulacion =
  | "cadera" | "cintura" | "hombro" | "cabeza"
  | "codo" | "muneca" | "codo2" | "muneca2"
  | "rodilla" | "tobillo" | "punta" | "rodilla2" | "tobillo2" | "punta2";
export type Pose = Partial<Record<Segmento, number>>;
export type Posiciones = Record<Articulacion, Vec>;

export const LONGITUDES: Record<Segmento, number> = {
  torso_bajo: 0.5, torso_alto: 0.56, cuello: 0.42,
  brazo: 0.68, antebrazo: 0.68, brazo2: 0.68, antebrazo2: 0.68,
  muslo: 0.9, pierna: 0.88, pie: 0.3, muslo2: 0.9, pierna2: 0.88, pie2: 0.3,
};

// segmento → [articulación proximal, articulación distal] (árbol con raíz en la cadera)
export const HUESOS: Record<Segmento, [Articulacion, Articulacion]> = {
  torso_bajo: ["cadera", "cintura"], torso_alto: ["cintura", "hombro"], cuello: ["hombro", "cabeza"],
  brazo: ["hombro", "codo"], antebrazo: ["codo", "muneca"], brazo2: ["hombro", "codo2"], antebrazo2: ["codo2", "muneca2"],
  muslo: ["cadera", "rodilla"], pierna: ["rodilla", "tobillo"], pie: ["tobillo", "punta"],
  muslo2: ["cadera", "rodilla2"], pierna2: ["rodilla2", "tobillo2"], pie2: ["tobillo2", "punta2"],
};

export const POSE_BASE: Required<Pose> = {
  torso_bajo: 90, torso_alto: 90, cuello: 90,
  brazo: -92, antebrazo: -88, brazo2: -88, antebrazo2: -86,
  muslo: -90, pierna: -90, pie: 0, muslo2: -90, pierna2: -90, pie2: 0,
};

const rad = (g: number) => (g * Math.PI) / 180;
export const dir = (g: number): Vec => [Math.cos(rad(g)), Math.sin(rad(g))];
const sum = (a: Vec, b: Vec, k = 1): Vec => [a[0] + b[0] * k, a[1] + b[1] * k];
const dist = (a: Vec, b: Vec) => Math.hypot(b[0] - a[0], b[1] - a[1]);
const angulo = (a: Vec, b: Vec) => (Math.atan2(b[1] - a[1], b[0] - a[0]) * 180) / Math.PI;

/** Completa una pose: lo que falte sale de POSE_BASE; los segmentos "2" (lado lejano) copian al cercano si no se dan. */
export function completar(p: Pose): Required<Pose> {
  const out = { ...POSE_BASE } as Required<Pose>;
  for (const k of Object.keys(POSE_BASE) as Segmento[]) {
    if (p[k] !== undefined) out[k] = p[k]!;
    else if (k.endsWith("2") && p[k.slice(0, -1) as Segmento] !== undefined) out[k] = p[k.slice(0, -1) as Segmento]!;
  }
  return out;
}

/** Cinemática directa desde la articulación de anclaje (pies en el suelo, manos en la barra, cadera en el banco...). */
export function fk(pose: Required<Pose>, ancla: Articulacion, posAncla: Vec): Posiciones {
  const pos: Partial<Posiciones> = { [ancla]: posAncla };
  const pendientes = Object.entries(HUESOS) as [Segmento, [Articulacion, Articulacion]][];
  let avance = true;
  while (avance) {
    avance = false;
    for (const [seg, [a, b]] of pendientes) {
      const v = dir(pose[seg]);
      const L = LONGITUDES[seg];
      if (pos[a] && !pos[b]) { pos[b] = sum(pos[a]!, v, L); avance = true; }
      else if (pos[b] && !pos[a]) { pos[a] = sum(pos[b]!, v, -L); avance = true; }
    }
  }
  return pos as Posiciones;
}

/** IK de dos huesos: articulación media para unir `raiz` con `objetivo`. `pref` elige la solución. */
export function ik2(raiz: Vec, objetivo: Vec, L1: number, L2: number, pref: "adelante" | "atras" | "arriba" | "abajo"): { medio: Vec; fin: Vec } {
  const d = Math.min(Math.max(dist(raiz, objetivo), Math.abs(L1 - L2) + 1e-4), L1 + L2 - 1e-4);
  const a = Math.atan2(objetivo[1] - raiz[1], objetivo[0] - raiz[0]);
  const alfa = Math.acos(Math.min(1, Math.max(-1, (L1 * L1 + d * d - L2 * L2) / (2 * L1 * d))));
  const m1: Vec = [raiz[0] + L1 * Math.cos(a + alfa), raiz[1] + L1 * Math.sin(a + alfa)];
  const m2: Vec = [raiz[0] + L1 * Math.cos(a - alfa), raiz[1] + L1 * Math.sin(a - alfa)];
  const puntua = (m: Vec) => (pref === "adelante" ? m[0] : pref === "atras" ? -m[0] : pref === "arriba" ? m[1] : -m[1]);
  const medio = puntua(m1) >= puntua(m2) ? m1 : m2;
  const ang = Math.atan2(objetivo[1] - medio[1], objetivo[0] - medio[0]);
  return { medio, fin: [medio[0] + L2 * Math.cos(ang), medio[1] + L2 * Math.sin(ang)] };
}

// ---------- Movimientos (datos en movimientos.json) ----------
export type Objetivo = { en?: Articulacion; mundo?: Vec; desplazamiento?: Vec };
export type ReglaIK = { objetivo: Objetivo; pref: "adelante" | "atras" | "arriba" | "abajo" };
export type IK = Partial<Record<"brazo" | "brazo2" | "pierna" | "pierna2", ReglaIK>>;
export type Clave = { t: number; pose: string | Pose; mas?: Pose; ik?: IK; fase?: "excentrica" | "concentrica" | "pausa"; anclaje?: Vec };
export type Equipo = {
  tipo: "barra" | "mancuerna" | "banco" | "barra_fija" | "celular" | "disco_suelo";
  en?: Articulacion; mundo?: Vec; desplazamiento?: Vec; discos?: number; ancho?: number; alto?: number; detras?: boolean;
};
export type Movimiento = {
  nombre: string; descripcion: string; tipo: "ejercicio" | "error" | "gesto";
  correcto?: string; musculos: string[];
  anclaje: { articulacion: Articulacion; pos: Vec };
  ciclo_s: number; claves: Clave[]; ik?: IK; equipo?: Equipo[];
};

export const POSES = datos.poses as unknown as Record<string, Pose & { base?: string }>;
export const MOVIMIENTOS = datos.movimientos as unknown as Record<string, Movimiento>;
export const MUSCULOS = datos.musculos as unknown as Record<string, { nombre: string; partes: { seg: Segmento | "cadera" | "hombro"; lado: number; desde: number; hasta: number }[] }>;

export function resolverPose(p: string | Pose, mas?: Pose): Required<Pose> {
  const cadena = (x: string | Pose): Pose => {
    if (typeof x !== "string") return x;
    const def = POSES[x];
    if (!def) throw new Error(`Pose desconocida: ${x}`);
    const { base, ...resto } = def;
    return { ...(base ? cadena(base) : {}), ...resto };
  };
  return completar({ ...cadena(p), ...(mas || {}) });
}

const suave = (x: number) => x * x * (3 - 2 * x);
const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
const lerpAng = (a: number, b: number, k: number) => {
  let d = ((b - a + 540) % 360) - 180;
  return a + d * k;
};

export type Estado = {
  pos: Posiciones; pose: Required<Pose>; fase: "excentrica" | "concentrica" | "pausa" | "reposo";
  rep: number;          // número de repetición (empieza en 1)
  progreso: number;     // 0..1 dentro de la repetición
  equipo: (Equipo & { p?: Vec })[];
};

function objetivoMundo(o: Objetivo, pos: Posiciones): Vec {
  const base: Vec = o.mundo ? o.mundo : o.en ? pos[o.en] : [0, 0];
  return sum(base, o.desplazamiento || [0, 0]);
}

function evaluarClave(m: Movimiento, c: Clave) {
  const pose = resolverPose(c.pose, c.mas);
  const pos = fk(pose, m.anclaje.articulacion, c.anclaje || m.anclaje.pos);
  const ik = { ...(m.ik || {}), ...(c.ik || {}) };
  const objetivos: Partial<Record<keyof IK, Vec>> = {};
  for (const k of Object.keys(ik) as (keyof IK)[]) objetivos[k] = objetivoMundo(ik[k]!.objetivo, pos);
  return { pose, objetivos, ik, ancla: c.anclaje || m.anclaje.pos };
}

/**
 * Estado del movimiento en el segundo `t` (desde que empieza). `velocidad` > 1 acelera.
 * `reps`: si se da, tras esas repeticiones se queda en la última clave (útil para "una sola rep").
 */
export function estadoEn(id: string, t: number, opciones: { velocidad?: number; reps?: number; pose?: Pose } = {}): Estado {
  const m = MOVIMIENTOS[id];
  if (!m) throw new Error(`Movimiento desconocido: ${id}. Disponibles: ${Object.keys(MOVIMIENTOS).join(", ")}`);
  const vel = opciones.velocidad ?? 1;
  const ciclos = Math.max(0, (t * vel) / m.ciclo_s);
  let rep = Math.floor(ciclos) + 1;
  let u = ciclos - Math.floor(ciclos);
  if (opciones.reps !== undefined && ciclos >= opciones.reps) { rep = opciones.reps; u = 0.999999; }
  const cl = m.claves;
  let i = 0;
  while (i < cl.length - 2 && u >= cl[i + 1].t) i++;
  const a = cl[i], b = cl[i + 1];
  const k = suave(Math.min(1, Math.max(0, (u - a.t) / Math.max(1e-6, b.t - a.t))));
  const A = evaluarClave(m, a), B = evaluarClave(m, b);
  const pose = {} as Required<Pose>;
  for (const s of Object.keys(POSE_BASE) as Segmento[]) pose[s] = lerpAng(A.pose[s], B.pose[s], k);
  if (opciones.pose) Object.assign(pose, completar({ ...pose, ...opciones.pose }));
  const ancla: Vec = [lerp(A.ancla[0], B.ancla[0], k), lerp(A.ancla[1], B.ancla[1], k)];
  const pos = fk(pose, m.anclaje.articulacion, ancla);

  // IK de extremidades: el objetivo se interpola en el mundo entre claves
  const ik = { ...A.ik, ...B.ik };
  for (const ext of Object.keys(ik) as (keyof IK)[]) {
    const oa = A.objetivos[ext] ?? B.objetivos[ext]!, ob = B.objetivos[ext] ?? oa;
    const obj: Vec = [lerp(oa[0], ob[0], k), lerp(oa[1], ob[1], k)];
    const regla = ik[ext]!;
    if (ext === "brazo" || ext === "brazo2") {
      const [codo, muneca] = ext === "brazo" ? (["codo", "muneca"] as const) : (["codo2", "muneca2"] as const);
      const r = ik2(pos.hombro, obj, LONGITUDES.brazo, LONGITUDES.antebrazo, regla.pref);
      pos[codo] = r.medio; pos[muneca] = r.fin;
      pose[ext] = angulo(pos.hombro, r.medio); pose[ext === "brazo" ? "antebrazo" : "antebrazo2"] = angulo(r.medio, r.fin);
    } else {
      const [rod, tob, pun, pie] = ext === "pierna" ? (["rodilla", "tobillo", "punta", "pie"] as const) : (["rodilla2", "tobillo2", "punta2", "pie2"] as const);
      const r = ik2(pos.cadera, obj, LONGITUDES.muslo, LONGITUDES.pierna, regla.pref);
      pos[rod] = r.medio; pos[tob] = r.fin; pos[pun] = sum(r.fin, dir(pose[pie]), LONGITUDES.pie);
      pose[ext === "pierna" ? "muslo" : "muslo2"] = angulo(pos.cadera, r.medio); pose[ext] = angulo(r.medio, r.fin);
    }
  }

  const fase = (b.fase ?? (a.fase === "pausa" ? "pausa" : "reposo")) as Estado["fase"];
  const equipo = (m.equipo || []).map((e) => ({ ...e, p: e.mundo ? sum(e.mundo, e.desplazamiento || [0, 0]) : e.en ? sum(pos[e.en], e.desplazamiento || [0, 0]) : undefined }));
  return { pos, pose, fase, rep, progreso: u, equipo };
}

/** Segundos que dura una repetición a una velocidad dada (para sincronizar contadores con la voz). */
export const duracionRep = (id: string, velocidad = 1) => MOVIMIENTOS[id].ciclo_s / velocidad;
export const listaMovimientos = () => Object.entries(MOVIMIENTOS).map(([id, m]) => ({ id, nombre: m.nombre, tipo: m.tipo, musculos: m.musculos }));
