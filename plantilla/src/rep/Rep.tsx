// Rep: la mascota de IncreaseFit. Figura sin cara, de trazo grueso tipo pincel (como la flecha del logo),
// con una cinta cian en la cabeza cuyas colas ondean. Se dibuja dentro de un <svg> (usa <RepSVG/>) o como capa
// a pantalla completa (<Rep/>). Todo depende del tiempo `t`: determinista.
import React, { useId } from "react";
import { AbsoluteFill } from "remotion";
import { estadoEn, dir, LONGITUDES, MOVIMIENTOS, MUSCULOS, HUESOS, type Vec, type Segmento, type Pose, type Equipo, type Posiciones } from "./esqueleto";

export type ColoresRep = {
  cuerpo: string;      // clima.cuerpo_rep
  lejano: string;      // clima.cuerpo_rep_lejano
  foco: string;        // cian IncreaseFit #1FB7DE (cinta, músculo activo)
  estructura: string;  // clima.estructura (equipo, bordes)
  superficie: string;  // clima.superficie (discos, banco)
  alerta?: string;     // #FF5A4E
  exito?: string;      // #3DD68C
};

export const COLORES_REP_DEFECTO: ColoresRep = {
  cuerpo: "#E9F7FB", lejano: "#7D93A3", foco: "#1FB7DE", estructura: "#8FA6B5", superficie: "#232D38", alerta: "#FF5A4E", exito: "#3DD68C",
};

export type Gesto = "sudor" | "pregunta" | "exclamacion" | "zzz" | "mareo" | "esfuerzo" | "check" | "cruz" | "brillo";

export type PropsRep = {
  movimiento: string;
  t: number;                    // segundos desde que empieza el movimiento (frame / fps)
  x: number; y: number;         // px del punto de suelo bajo Rep
  escala?: number;              // px por unidad del rig (Rep mide ~3,7 u). 150-190 en la zona de escena
  colores?: Partial<ColoresRep>;
  musculos?: string[] | "auto"; // músculos encendidos en cian ("auto" = los del movimiento)
  brilloMusculo?: number;       // 0..1 fija la intensidad; si no, late con la fase concéntrica
  gesto?: Gesto | Gesto[];
  velocidad?: number;           // 0.5 = cámara lenta (repetición "de replay")
  reps?: number;                // se detiene tras N repeticiones
  pose?: Pose;                  // sobrescribe ángulos (para poses a medida)
  espejo?: boolean;             // mira a la izquierda
  pincel?: boolean;             // borde irregular tipo pincel (por defecto true)
  sombra?: boolean;
  carga?: string;               // texto en el disco ("100 kg")
  discos?: number;              // sobrescribe cuántos discos lleva la barra (progresión visible)
  fuenteMono?: string;          // fontFamily para la carga
  fuenteTitulo?: string;        // fontFamily para ?, !, z
  marcarArticulacion?: { art: keyof Posiciones; color?: string; radio?: number }[]; // círculos de "telestrator" (errores)
  opacidad?: number;
};

const ANCHOS: Record<Segmento, number> = {
  torso_bajo: 0.36, torso_alto: 0.42, cuello: 0.14,
  brazo: 0.18, antebrazo: 0.15, brazo2: 0.18, antebrazo2: 0.15,
  muslo: 0.27, pierna: 0.2, pie: 0.12, muslo2: 0.27, pierna2: 0.2, pie2: 0.12,
};
const R_CABEZA = 0.24, R_MANO = 0.09, R_DISCO = 0.48;

export const RepSVG: React.FC<PropsRep> = (p) => {
  const uid = useId().replace(/:/g, "");
  const c = { ...COLORES_REP_DEFECTO, ...(p.colores || {}) };
  const s = p.escala ?? 165;
  const sx = p.espejo ? -1 : 1;
  const est = estadoEn(p.movimiento, Math.max(0, p.t), { velocidad: p.velocidad, reps: p.reps, pose: p.pose });
  const { pos, pose } = est;
  const P = (v: Vec): Vec => [p.x + sx * v[0] * s, p.y - v[1] * s];
  const linea = (a: Vec, b: Vec, w: number, color: string, extra: React.SVGProps<SVGLineElement> = {}) => {
    const [x1, y1] = P(a), [x2, y2] = P(b);
    return <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={w * s} strokeLinecap="round" {...extra} />;
  };

  // --- músculos
  const ids = p.musculos === "auto" ? MOVIMIENTOS[p.movimiento]?.musculos ?? [] : p.musculos ?? [];
  const latido = p.brilloMusculo ?? (est.fase === "concentrica" ? 1 : est.fase === "pausa" ? 0.85 : 0.55 + 0.15 * Math.sin(p.t * 5));
  const resaltados: Partial<Record<string, React.ReactNode[]>> = {};
  for (const mid of ids) {
    const m = MUSCULOS[mid];
    if (!m) continue;
    for (const parte of m.partes) {
      const seg = parte.seg as Segmento;
      if (!HUESOS[seg]) continue;
      const [ja, jb] = HUESOS[seg];
      const A = pos[ja], B = pos[jb];
      const d: Vec = [B[0] - A[0], B[1] - A[1]];
      const n: Vec = [-d[1] / Math.hypot(...d), d[0] / Math.hypot(...d)];
      const off = parte.lado * ANCHOS[seg] * 0.2;
      const a: Vec = [A[0] + d[0] * parte.desde + n[0] * off, A[1] + d[1] * parte.desde + n[1] * off];
      const b: Vec = [A[0] + d[0] * parte.hasta + n[0] * off, A[1] + d[1] * parte.hasta + n[1] * off];
      const w = ANCHOS[seg] * (parte.lado === 0 ? 0.55 : 0.5);
      (resaltados[seg] ||= []).push(
        <g key={`${mid}-${seg}-${parte.lado}`} opacity={latido}>
          {linea(a, b, w * 1.9, c.foco, { opacity: 0.35, filter: `url(#brillo-${uid})` })}
          {linea(a, b, w, c.foco)}
        </g>,
      );
    }
  }

  const seg = (k: Segmento, color: string) => (
    <g key={k}>
      {k.startsWith("pie") ? linea(
        [pos[HUESOS[k][0]][0] - dir(pose[k])[0] * 0.09, pos[HUESOS[k][0]][1] - dir(pose[k])[1] * 0.09], pos[HUESOS[k][1]], ANCHOS[k], color)
        : linea(pos[HUESOS[k][0]], pos[HUESOS[k][1]], ANCHOS[k], color)}
      {resaltados[k]}
    </g>
  );

  // --- cabeza + cinta
  const H = pos.cabeza;
  const [hx, hy] = P(H);
  const angCuello = pose.cuello;
  const rotCinta = -(angCuello - 90) * sx;
  const ondas = (k: number) => Math.sin(p.t * 7 + k) * 0.05;
  const raizCola: Vec = [H[0] - (dir(angCuello - 90)[0]) * R_CABEZA * 0.92 + dir(angCuello)[0] * 0.06, H[1] - dir(angCuello - 90)[1] * R_CABEZA * 0.92 + dir(angCuello)[1] * 0.06];
  // las colas salen hacia atrás pero nunca apuntan hacia arriba: la gravedad manda
  const angAtras = Math.min(215, Math.max(165, ((angCuello + 90) % 360 + 360) % 360));
  const cola = (largo: number, caida: number, fase: number) => {
    const b = dir(angAtras + 180);
    const pts: Vec[] = [0, 0.33, 0.66, 1].map((u, i) => [
      raizCola[0] - b[0] * largo * u + ondas(fase + i) * (i > 0 ? 1 : 0),
      raizCola[1] - b[1] * largo * u - caida * u * u + ondas(fase + i + 1.3) * (i > 0 ? 1 : 0),
    ]);
    const q = pts.map(P);
    return `M${q[0][0]},${q[0][1]} C${q[1][0]},${q[1][1]} ${q[2][0]},${q[2][1]} ${q[3][0]},${q[3][1]}`;
  };

  // --- equipo
  const equipo = (e: Equipo & { p?: Vec }, i: number) => {
    if (!e.p) return null;
    const [ex, ey] = P(e.p);
    switch (e.tipo) {
      case "barra": {
        const n = Math.max(1, p.discos ?? e.discos ?? 2);
        const r = R_DISCO * s;
        return (
          <g key={i}>
            {Array.from({ length: n }).map((_, k) => (
              <circle key={k} cx={ex - sx * (n - 1 - k) * 0.035 * s} cy={ey} r={r} fill={c.superficie} stroke={c.estructura} strokeWidth={0.028 * s} />
            ))}
            <circle cx={ex} cy={ey} r={r * 0.7} fill="none" stroke={c.estructura} strokeOpacity={0.45} strokeWidth={0.018 * s} />
            <circle cx={ex} cy={ey} r={r * 0.16} fill={c.estructura} />
            <circle cx={ex} cy={ey} r={r * 0.07} fill={c.superficie} />
            {p.carga ? (
              <text x={ex} y={ey + r * 0.52} textAnchor="middle" fontFamily={p.fuenteMono ?? "monospace"} fontWeight={700} fontSize={0.13 * s} fill={c.estructura}>{p.carga}</text>
            ) : null}
          </g>
        );
      }
      case "mancuerna": {
        const r = (0.13 + 0.025 * ((e.discos ?? 1) - 1)) * s;
        return (
          <g key={i}>
            <circle cx={ex} cy={ey} r={r} fill={c.superficie} stroke={c.estructura} strokeWidth={0.024 * s} />
            <circle cx={ex} cy={ey} r={r * 0.32} fill={c.estructura} />
          </g>
        );
      }
      case "banco": {
        const w = (e.ancho ?? 1.4) * s, h = (e.alto ?? 0.95) * s;
        const x0 = sx > 0 ? ex : ex - w;
        return (
          <g key={i}>
            <rect x={x0} y={ey - h} width={w} height={0.13 * s} rx={0.05 * s} fill={c.superficie} stroke={c.estructura} strokeWidth={0.024 * s} />
            <rect x={x0 + w * 0.12} y={ey - h + 0.13 * s} width={0.07 * s} height={h - 0.13 * s} fill={c.estructura} opacity={0.75} />
            <rect x={x0 + w * 0.88 - 0.07 * s} y={ey - h + 0.13 * s} width={0.07 * s} height={h - 0.13 * s} fill={c.estructura} opacity={0.75} />
            <rect x={x0 + w * 0.06} y={ey - 0.05 * s} width={w * 0.88} height={0.05 * s} rx={0.02 * s} fill={c.estructura} opacity={0.75} />
          </g>
        );
      }
      case "barra_fija": {
        const poste = ex - sx * 1.5 * s;
        return (
          <g key={i} stroke={c.estructura} strokeWidth={0.06 * s} strokeLinecap="round" fill="none">
            <line x1={poste} y1={p.y} x2={poste} y2={ey} />
            <line x1={poste} y1={ey} x2={ex + sx * 0.25 * s} y2={ey} />
            <circle cx={ex} cy={ey} r={0.06 * s} fill={c.estructura} />
          </g>
        );
      }
      case "celular": {
        const ang = -(pose.antebrazo) * sx;
        return (
          <g key={i} transform={`translate(${ex},${ey}) rotate(${ang + 90 * sx})`}>
            <rect x={-0.07 * s} y={-0.14 * s} width={0.14 * s} height={0.26 * s} rx={0.03 * s} fill={c.superficie} stroke={c.estructura} strokeWidth={0.015 * s} />
            <rect x={-0.055 * s} y={-0.12 * s} width={0.11 * s} height={0.2 * s} rx={0.02 * s} fill={c.foco} opacity={0.75 + 0.25 * Math.sin(p.t * 9)} />
          </g>
        );
      }
      case "disco_suelo": {
        const r = R_DISCO * s;
        return <circle key={i} cx={ex} cy={ey - r} r={r} fill={c.superficie} stroke={c.estructura} strokeWidth={0.028 * s} />;
      }
      default:
        return null;
    }
  };
  const detras = est.equipo.filter((e) => e.detras || e.tipo === "banco");
  const medio = est.equipo.filter((e) => !e.detras && e.tipo !== "banco" && e.tipo !== "celular" && e.tipo !== "mancuerna");
  const delante = est.equipo.filter((e) => !e.detras && (e.tipo === "celular" || e.tipo === "mancuerna"));

  // --- gestos
  const gestos = ([] as Gesto[]).concat(p.gesto ?? []);
  const arriba = P([H[0], H[1] + R_CABEZA + 0.3]);
  const fT = p.fuenteTitulo ?? "sans-serif";
  const gesto = (g: Gesto) => {
    const t = p.t;
    switch (g) {
      case "sudor":
        return (
          <g key={g}>
            {[0, 1, 2].map((k) => {
              const u = ((t * 0.9 + k / 3) % 1);
              const [gx, gy] = P([H[0] + (k - 1) * 0.16 * sx + 0.18, H[1] + 0.12 - u * 0.5]);
              return <path key={k} transform={`translate(${gx},${gy}) scale(${0.0016 * s})`} d="M0,-30 C12,-10 18,2 18,12 A18,18 0 0 1 -18,12 C-18,2 -12,-10 0,-30Z" fill="#9FDFF5" opacity={1 - u} />;
            })}
          </g>
        );
      case "pregunta":
      case "exclamacion": {
        const salto = Math.abs(Math.sin(t * 4)) * 0.08 * s;
        return <text key={g} x={arriba[0]} y={arriba[1] - salto} textAnchor="middle" fontFamily={fT} fontWeight={800} fontSize={0.5 * s} fill={g === "pregunta" ? c.foco : c.alerta}>{g === "pregunta" ? "?" : "!"}</text>;
      }
      case "zzz":
        return (
          <g key={g}>
            {[0, 1, 2].map((k) => {
              const u = (t * 0.5 + k / 3) % 1;
              const [zx, zy] = P([H[0] + 0.25 + u * 0.4, H[1] + 0.25 + u * 0.7]);
              return <text key={k} x={zx} y={zy} fontFamily={fT} fontWeight={800} fontSize={(0.16 + 0.12 * u) * s} fill={c.estructura} opacity={1 - u}>z</text>;
            })}
          </g>
        );
      case "mareo":
        return (
          <g key={g}>
            {[0, 1, 2].map((k) => {
              const a = t * 3 + (k * Math.PI * 2) / 3;
              const [mx, my] = P([H[0] + Math.cos(a) * 0.32, H[1] + R_CABEZA + 0.08 + Math.sin(a) * 0.07]);
              return <path key={k} transform={`translate(${mx},${my}) scale(${0.0012 * s})`} d="M0,-40 L10,-12 L40,-12 L16,6 L25,36 L0,18 L-25,36 L-16,6 L-40,-12 L-10,-12Z" fill={c.foco} />;
            })}
          </g>
        );
      case "esfuerzo":
        return (
          <g key={g} stroke={c.alerta} strokeWidth={0.035 * s} strokeLinecap="round" opacity={0.6 + 0.4 * Math.sin(t * 18)}>
            {[-50, -15, 20].map((a, k) => {
              const d1 = dir(pose.cuello + a), r1 = R_CABEZA + 0.08, r2 = R_CABEZA + 0.22;
              const [x1, y1] = P([H[0] + d1[0] * r1, H[1] + d1[1] * r1]);
              const [x2, y2] = P([H[0] + d1[0] * r2, H[1] + d1[1] * r2]);
              return <line key={k} x1={x1} y1={y1} x2={x2} y2={y2} />;
            })}
          </g>
        );
      case "check":
      case "cruz": {
        const pop = Math.min(1, t * 4);
        const r = 0.2 * s * (0.6 + 0.4 * pop);
        return (
          <g key={g} transform={`translate(${arriba[0]},${arriba[1] - 0.05 * s})`}>
            <circle r={r} fill={g === "check" ? c.exito : c.alerta} />
            <path d={g === "check" ? `M${-r * 0.45},0 L${-r * 0.1},${r * 0.35} L${r * 0.5},${-r * 0.35}` : `M${-r * 0.4},${-r * 0.4} L${r * 0.4},${r * 0.4} M${r * 0.4},${-r * 0.4} L${-r * 0.4},${r * 0.4}`}
              stroke="#FFFFFF" strokeWidth={r * 0.22} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </g>
        );
      }
      case "brillo":
        return (
          <g key={g}>
            {[0, 1, 2].map((k) => {
              const a = (k * 2.1 + 0.6);
              const u = (Math.sin(t * 5 + k * 2) + 1) / 2;
              const [bx, by] = P([H[0] + Math.cos(a) * 0.5, H[1] + Math.sin(a) * 0.45 + 0.1]);
              return <path key={k} transform={`translate(${bx},${by}) scale(${(0.0009 + 0.0007 * u) * s})`} d="M0,-50 Q6,-6 50,0 Q6,6 0,50 Q-6,6 -50,0 Q-6,-6 0,-50Z" fill={c.foco} opacity={0.5 + 0.5 * u} />;
            })}
          </g>
        );
    }
  };

  const cadera = P(pos.cadera);
  return (
    <g opacity={p.opacidad ?? 1}>
      <defs>
        <filter id={`pincel-${uid}`} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency={0.9 / Math.max(1, s / 120)} numOctaves={2} seed={7} />
          <feDisplacementMap in="SourceGraphic" scale={0.018 * s} xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id={`brillo-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={0.05 * s} />
        </filter>
        <clipPath id={`cabeza-${uid}`}><circle cx={hx} cy={hy} r={R_CABEZA * s} /></clipPath>
      </defs>
      {p.sombra !== false ? <ellipse cx={cadera[0]} cy={p.y + 0.02 * s} rx={0.75 * s} ry={0.07 * s} fill="#000" opacity={0.28} /> : null}
      {detras.map(equipo)}
      <g filter={p.pincel === false ? undefined : `url(#pincel-${uid})`}>
        {(["muslo2", "pierna2", "pie2", "brazo2", "antebrazo2"] as Segmento[]).map((k) => seg(k, c.lejano))}
        {(() => { const [mx, my] = P(pos.muneca2); return <circle cx={mx} cy={my} r={R_MANO * s} fill={c.lejano} />; })()}
      </g>
      {medio.map(equipo)}
      <g filter={p.pincel === false ? undefined : `url(#pincel-${uid})`}>
        {seg("torso_bajo", c.cuerpo)}
        {seg("torso_alto", c.cuerpo)}
        {seg("cuello", c.cuerpo)}
        <path d={cola(0.55, 0.12, 0)} stroke={c.foco} strokeWidth={0.075 * s} strokeLinecap="round" fill="none" />
        <path d={cola(0.42, 0.24, 1.7)} stroke={c.foco} strokeWidth={0.06 * s} strokeLinecap="round" fill="none" opacity={0.85} />
        <circle cx={hx} cy={hy} r={R_CABEZA * s} fill={c.cuerpo} />
        <g clipPath={`url(#cabeza-${uid})`}>
          <rect x={hx - R_CABEZA * s * 1.2} y={hy - R_CABEZA * s * 0.45} width={R_CABEZA * s * 2.4} height={R_CABEZA * s * 0.36} fill={c.foco} transform={`rotate(${rotCinta},${hx},${hy})`} />
        </g>
        {seg("muslo", c.cuerpo)}
        {seg("pierna", c.cuerpo)}
        {seg("pie", c.cuerpo)}
      </g>
      {delante.filter((e) => e.en === "muneca2").map(equipo)}
      <g filter={p.pincel === false ? undefined : `url(#pincel-${uid})`}>
        {seg("brazo", c.cuerpo)}
        {seg("antebrazo", c.cuerpo)}
        {(() => { const [mx, my] = P(pos.muneca); return <circle cx={mx} cy={my} r={R_MANO * s} fill={c.cuerpo} />; })()}
      </g>
      {delante.filter((e) => e.en !== "muneca2").map(equipo)}
      {(p.marcarArticulacion || []).map((m, i) => {
        const [mx, my] = P(pos[m.art]);
        const r = (m.radio ?? 0.3) * s;
        return <circle key={i} cx={mx} cy={my} r={r * (1 + 0.06 * Math.sin(p.t * 10))} fill="none" stroke={m.color ?? c.alerta} strokeWidth={0.045 * s} strokeDasharray={`${0.12 * s} ${0.07 * s}`} />;
      })}
      {gestos.map(gesto)}
    </g>
  );
};

/** Punto en pantalla (px) de un músculo o una articulación de Rep, para colocar etiquetas y flechas. */
export function puntoDeRep(p: Pick<PropsRep, "movimiento" | "t" | "x" | "y" | "escala" | "velocidad" | "reps" | "pose" | "espejo">, que: { musculo?: string; articulacion?: keyof Posiciones }): [number, number] {
  const s = p.escala ?? 165, sx = p.espejo ? -1 : 1;
  const est = estadoEn(p.movimiento, Math.max(0, p.t), { velocidad: p.velocidad, reps: p.reps, pose: p.pose });
  let v: Vec = est.pos.cadera;
  if (que.articulacion) v = est.pos[que.articulacion];
  else if (que.musculo && MUSCULOS[que.musculo]) {
    const parte = MUSCULOS[que.musculo].partes[0];
    const seg = parte.seg as Segmento;
    if (HUESOS[seg]) {
      const [a, b] = HUESOS[seg];
      const k = (parte.desde + parte.hasta) / 2;
      v = [est.pos[a][0] + (est.pos[b][0] - est.pos[a][0]) * k, est.pos[a][1] + (est.pos[b][1] - est.pos[a][1]) * k];
    }
  }
  return [p.x + sx * v[0] * s, p.y - v[1] * s];
}

/** Rep a pantalla completa (1080x1920). Para varias figuras en una misma escena usa <RepSVG/> dentro de tu propio <svg>. */
export const Rep: React.FC<PropsRep & { ancho?: number; alto?: number }> = ({ ancho = 1080, alto = 1920, ...p }) => (
  <AbsoluteFill>
    <svg width={ancho} height={alto} viewBox={`0 0 ${ancho} ${alto}`} style={{ overflow: "visible" }}>
      <RepSVG {...p} />
    </svg>
  </AbsoluteFill>
);

export { LONGITUDES };
