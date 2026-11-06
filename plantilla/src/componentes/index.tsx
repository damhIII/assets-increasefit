// Piezas reutilizables para las escenas. Todas leen los colores del clima actual y las constantes IF.
import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { FUENTE, IF, type Clima } from "../marco/datos";
import { RepSVG, puntoDeRep, type PropsRep } from "../rep/Rep";

export type C = Clima & { claridad: number };

/** Colores de Rep a partir del clima actual. */
export const coloresRep = (c: C) => ({ cuerpo: c.cuerpo_rep, lejano: c.cuerpo_rep_lejano, foco: IF.cian, estructura: c.estructura, superficie: c.superficie, alerta: IF.alerta, exito: IF.exito });

/** Lienzo SVG a pantalla completa para una o varias figuras. */
export const Lienzo: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <svg width={1080} height={1920} viewBox="0 0 1080 1920" style={{ position: "absolute", inset: 0, overflow: "visible" }}>{children}</svg>
);

/** Rep con los colores del clima y las fuentes de la marca. */
export const RepClima: React.FC<Omit<PropsRep, "colores"> & { c: C }> = ({ c, ...p }) => (
  <RepSVG colores={coloresRep(c)} fuenteMono={FUENTE.mono} fuenteTitulo={FUENTE.titulos} {...p} />
);

/** Suelo: línea que se desvanece en los extremos + foco de luz bajo Rep. */
export const Suelo: React.FC<{ c: C; y?: number; x?: number; ancho?: number }> = ({ c, y = 1300, x = 540, ancho = 900 }) => (
  <>
    <div style={{ position: "absolute", left: x - ancho / 2, top: y - 300, width: ancho, height: 400, background: `radial-gradient(ellipse 50% 45% at 50% 75%, ${IF.cian}${c.claridad > 0.5 ? "14" : "22"} 0%, transparent 100%)` }} />
    <div style={{ position: "absolute", left: x - ancho / 2, top: y, width: ancho, height: 4, background: `linear-gradient(90deg, transparent, ${c.estructura}, transparent)`, opacity: 0.55 }} />
  </>
);

/** Icono de Lucide coloreado con máscara CSS (public/icons/<nombre>.svg). */
export const Icono: React.FC<{ nombre: string; color: string; size?: number; style?: React.CSSProperties }> = ({ nombre, color, size = 48, style }) => {
  const url = `url(${staticFile(`icons/${nombre}.svg`)})`;
  return <div style={{ width: size, height: size, backgroundColor: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", flexShrink: 0, ...style }} />;
};

/** Entrada estándar: desde abajo con overshoot. */
export const useEntrada = (desde: number, cfg = { damping: 12, stiffness: 170 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ fps, frame: f - desde, config: cfg });
};

/** Chip de texto (errores, cues, etiquetas). tipo: error = cruz roja, ok = check verde, neutro = punto cian. */
export const Chip: React.FC<{ c: C; texto: string; tipo?: "error" | "ok" | "neutro"; desde: number; x: number; y: number; ancho?: number }> = ({ c, texto, tipo = "neutro", desde, x, y, ancho = 520 }) => {
  const e = useEntrada(desde);
  const color = tipo === "error" ? IF.alerta : tipo === "ok" ? IF.exito : IF.cian;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, display: "flex", alignItems: "center", gap: 18, padding: "18px 24px", borderRadius: 18,
      background: c.superficie, border: `2px solid ${color}55`, transform: `translateY(${(1 - e) * 60}px) scale(${0.85 + 0.15 * e})`, opacity: Math.min(1, e) }}>
      <div style={{ width: 44, height: 44, borderRadius: 22, background: color, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icono nombre={tipo === "error" ? "x" : tipo === "ok" ? "check" : "dumbbell"} color={IF.grafito2} size={28} />
      </div>
      <div style={{ fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 36, color: c.texto, lineHeight: 1.15 }}>{texto}</div>
    </div>
  );
};

/** Lista de pasos del método: cada tarjeta se enciende (cian) cuando la voz la nombra y queda con check verde al pasar. */
export const Pasos: React.FC<{ c: C; pasos: string[]; frames: number[]; x?: number; y?: number; ancho?: number; alto?: number }> = ({ c, pasos, frames, x = 70, y = 600, ancho = 500, alto = 104 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {pasos.map((p, i) => {
        const e = useEntrada(frames[i] - 6);
        const activo = f >= frames[i] && (i === pasos.length - 1 || f < frames[i + 1]);
        const hecho = i < pasos.length - 1 && f >= frames[i + 1];
        const borde = activo ? IF.cian : hecho ? IF.exito : `${c.estructura}55`;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + i * (alto + 18), width: ancho, height: alto, borderRadius: 20, background: c.superficie,
            border: `3px solid ${borde}`, display: "flex", alignItems: "center", gap: 20, padding: "0 22px", boxSizing: "border-box",
            transform: `translateX(${(1 - e) * -80}px) scale(${activo ? 1.04 : 1})`, opacity: Math.min(1, Math.max(0.25, e)),
            boxShadow: activo ? `0 0 34px ${IF.cian}55` : "none" }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: activo ? IF.cian : hecho ? IF.exito : c.acento, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: FUENTE.mono, fontWeight: 700, fontSize: 30, color: IF.grafito2 }}>{hecho ? "✓" : i + 1}</div>
            <div style={{ fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 36, color: c.texto, lineHeight: 1.1 }}>{p}</div>
          </div>
        );
      })}
    </>
  );
};

/** Libreta de entreno: filas semana / kg / reps que se rellenan una a una (progresión ILUSTRATIVA de la ficha). */
export const Libreta: React.FC<{ c: C; titulo: string; filas: { semana: number; kg: number; reps: number }[]; frames: number[]; x?: number; y?: number; ancho?: number; repetir?: boolean }> = ({ c, titulo, filas, frames, x = 70, y = 600, ancho = 500, repetir = false }) => {
  const f = useCurrentFrame();
  const e = useEntrada(frames[0] - 10);
  const kg = (n: number) => `${String(n).replace(".", ",")}`;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, borderRadius: 22, background: c.superficie, border: `2px solid ${c.estructura}44`,
      padding: "22px 26px", boxSizing: "border-box", transform: `translateY(${(1 - e) * 60}px)`, opacity: Math.min(1, e), fontFamily: FUENTE.mono }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: c.texto_suave, fontSize: 24, letterSpacing: "0.12em", marginBottom: 14 }}>
        <Icono nombre="notebook-pen" color={IF.cian} size={30} />{titulo.toUpperCase()}
      </div>
      {filas.map((r, i) => {
        const visible = f >= frames[i];
        const ultima = i === filas.length - 1 || f < frames[i + 1];
        const mismo = repetir || (i > 0 && r.kg === filas[i - 1].kg && r.reps === filas[i - 1].reps);
        const sube = i > 0 && !mismo;
        const k = interpolate(f, [frames[i], frames[i] + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i ? `1px dashed ${c.estructura}44` : "none",
            opacity: visible ? k : 0.18, color: visible && ultima ? IF.cian : c.texto, fontSize: 34, fontWeight: 700 }}>
            <span style={{ color: c.texto_suave, fontWeight: 500, fontSize: 26 }}>SEM {r.semana}</span>
            <span>{visible ? `${kg(r.kg)} kg × ${r.reps}` : "— × —"}</span>
            <span style={{ width: 34, textAlign: "right", color: sube ? IF.exito : mismo ? IF.alerta : c.texto_suave }}>{visible ? (sube ? "↑" : mismo ? "=" : "·") : ""}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 10, fontSize: 18, letterSpacing: "0.14em", color: c.texto_suave }}>EJEMPLO ILUSTRATIVO</div>
    </div>
  );
};

/** Gráfica de progreso: línea que se dibuja con puntos etiquetados (p. ej. "60×8"). */
export const Grafica: React.FC<{ c: C; valores: number[]; etiquetas: string[]; desde: number; x?: number; y?: number; ancho?: number; alto?: number; titulo?: string }> = ({ c, valores, etiquetas, desde, x = 70, y = 640, ancho = 560, alto = 360, titulo }) => {
  const f = useCurrentFrame();
  const min = Math.min(...valores), max = Math.max(...valores);
  const px = (i: number) => 40 + (i / Math.max(1, valores.length - 1)) * (ancho - 80);
  const py = (v: number) => alto - 50 - ((v - min) / Math.max(1e-6, max - min)) * (alto - 130);
  const prog = interpolate(f, [desde, desde + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const d = valores.map((v, i) => `${i ? "L" : "M"}${px(i)},${py(v)}`).join(" ");
  const largo = valores.reduce((n, v, i) => (i ? n + Math.hypot(px(i) - px(i - 1), py(v) - py(valores[i - 1])) : 0), 0);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, height: alto, borderRadius: 22, background: c.superficie, border: `2px solid ${c.estructura}44` }}>
      {titulo ? <div style={{ position: "absolute", left: 26, top: 18, fontFamily: FUENTE.mono, fontSize: 22, letterSpacing: "0.12em", color: c.texto_suave }}>{titulo}</div> : null}
      <svg width={ancho} height={alto} style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill="none" stroke={IF.cian} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={largo} strokeDashoffset={largo * (1 - prog)} />
        {valores.map((v, i) => {
          const vis = prog >= i / Math.max(1, valores.length - 1) - 0.01;
          return (
            <g key={i} opacity={vis ? 1 : 0}>
              <circle cx={px(i)} cy={py(v)} r={12} fill={i === valores.length - 1 ? IF.cian : c.superficie} stroke={IF.cian} strokeWidth={5} />
              <text x={px(i)} y={py(v) - 26} textAnchor="middle" fontFamily={FUENTE.mono} fontWeight={700} fontSize={24} fill={c.texto}>{etiquetas[i]}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/** Sello MITO / REALIDAD que cae con golpe (ui/sello_*.svg). */
export const Sello: React.FC<{ tipo: "mito" | "realidad"; desde: number; x: number; y: number; ancho?: number; tachado?: number }> = ({ tipo, desde, x, y, ancho = 420, tachado }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ fps, frame: f - desde, config: { damping: 11, stiffness: 240 } });
  const sacude = f - desde > 0 && f - desde < 6 ? Math.sin((f - desde) * 3) * 6 : 0;
  const caida = tachado !== undefined ? interpolate(f, [tachado + 10, tachado + 24], [0, 900], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const raya = tachado !== undefined ? interpolate(f, [tachado, tachado + 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  return (
    <div style={{ position: "absolute", left: x + sacude, top: y + caida, width: ancho, transform: `scale(${2.4 - 1.4 * e}) rotate(${caida / 20}deg)`, opacity: Math.min(1, e * 1.5) }}>
      <Img src={staticFile(`ui/sello_${tipo}.svg`)} style={{ width: "100%" }} />
      {raya > 0 ? <div style={{ position: "absolute", left: "4%", top: "48%", height: 16, width: `${92 * raya}%`, background: IF.blanco, transform: "rotate(-8deg)", borderRadius: 8 }} /> : null}
    </div>
  );
};

/** Dato con fuente: tarjeta grande con el texto del dato y la fuente corta debajo. */
export const DatoConFuente: React.FC<{ c: C; dato: string; fuente: string; desde: number; x?: number; y?: number; ancho?: number }> = ({ c, dato, fuente, desde, x = 70, y = 600, ancho = 940 }) => {
  const e = useEntrada(desde);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, borderRadius: 26, background: c.superficie, borderLeft: `10px solid ${IF.cian}`, padding: "30px 36px", boxSizing: "border-box",
      transform: `translateY(${(1 - e) * 70}px)`, opacity: Math.min(1, e) }}>
      <div style={{ fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 40, lineHeight: 1.25, color: c.texto }}>{dato}</div>
      <div style={{ marginTop: 18, fontFamily: FUENTE.mono, fontSize: 22, color: c.texto_suave, letterSpacing: "0.06em" }}>{fuente}</div>
    </div>
  );
};

/** Etiqueta con línea guía hacia un punto de Rep (músculo o articulación). */
export const Etiqueta: React.FC<{ c: C; texto: string; a: [number, number]; desde: number; lado?: "izq" | "der"; dy?: number }> = ({ c, texto, a, desde, lado = "izq", dy = 0 }) => {
  const e = useEntrada(desde);
  const lx = lado === "izq" ? 90 : 760, ly = a[1] + dy;
  const bx = lado === "izq" ? lx + 230 : lx;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: Math.min(1, e) }}>
        <line x1={bx} y1={ly} x2={bx + (a[0] - bx) * e} y2={ly + (a[1] - ly) * e} stroke={IF.cian} strokeWidth={4} strokeDasharray="10 8" />
        <circle cx={a[0]} cy={a[1]} r={10 * e} fill={IF.cian} />
      </svg>
      <div style={{ position: "absolute", left: lx, top: ly - 26, width: 230, textAlign: lado === "izq" ? "right" : "left", fontFamily: FUENTE.titulos, fontWeight: 800,
        fontSize: 34, color: c.texto, textTransform: "uppercase", opacity: Math.min(1, e), paddingRight: lado === "izq" ? 16 : 0, paddingLeft: lado === "izq" ? 0 : 16, boxSizing: "border-box" }}>{texto}</div>
    </>
  );
};

export { puntoDeRep };
