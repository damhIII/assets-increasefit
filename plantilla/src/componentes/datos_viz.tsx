// Piezas para contar ESTUDIOS con imágenes (v9): pictograma, barras, anillo, línea de tiempo y ficha del estudio.
// Reglas comunes:
//  · x, y = esquina superior izquierda; `ancho` = ancho de la caja. Todas se encajan con encajarX dentro de ZONA (x 120–960)
//    y la altura se limita para no bajar de Y≈1330 (suelo; debajo va el texto en pantalla).
//  · Entran con muelle SIN pasarse de su tamaño final (escala ≤ 1): ni el pico del rebote pisa los márgenes laterales.
//  · `desde` (y los frames de cada hito) en frames LOCALES de la escena. Determinismo total.
//  · Cifras de estudios: la composición exige `fuente` verificada o `ilustrativo` (validar_render.py). Aquí solo se dibuja.
import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { encajarX, FUENTE, IF, ZONA, type Tono } from "../marco/datos";
import type { C } from "../marco/clima";
import { colorTono, Icono } from "./kit";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const Y_MAX = 1330;                 // nada de estas piezas baja de aquí (suelo de la escena)

/** Muelle que nunca pasa de 1 (para escalas y posiciones finales seguras). */
const useMuelle = (desde: number, cfg = { damping: 14, stiffness: 170 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return Math.min(1, spring({ fps, frame: f - desde, config: cfg }));
};

/** "61293" → "61.293", 27.5 → "27,5" (formato español, como los subtítulos). */
export const formatoNum = (v: number, dec = 0) => {
  const [ent, frac] = Math.abs(v).toFixed(dec).split(".");
  const miles = ent.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${v < 0 ? "−" : ""}${miles}${frac ? `,${frac}` : ""}`;
};
const decimales = (v: number) => (Number.isInteger(v) ? 0 : Math.min(2, String(v).split(".")[1]?.length ?? 1));

const Fuente: React.FC<{ texto?: string; c: C; centrado?: boolean }> = ({ texto, c, centrado }) =>
  texto ? <div style={{ marginTop: 16, fontFamily: FUENTE.mono, fontSize: 24, color: c.texto_suave, letterSpacing: "0.04em", textAlign: centrado ? "center" : "left",
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{texto}</div> : null;

// ─────────────────────────────────────────────────────────────────────────────
/** Pictograma: `total` figuras (10, 20, 50 o 100) y `cantidad` encendidas en el color del tono. "1 de cada 3", "27 de cada 100".
 *  Es la forma más clara de contar un riesgo o una proporción. Opcional: la cifra grande arriba (`texto`) y un `detalle`. */
export const Pictograma: React.FC<{ total: number; cantidad: number; texto?: string; detalle?: string; fuente?: string; tono?: Tono; icono?: string;
  desde: number; c: C; x?: number; y?: number; ancho?: number }> = ({ total, cantidad, texto, detalle, fuente, tono, icono = "person-standing", desde, c, x = ZONA.izq, y = 600, ancho = 500 }) => {
  const f = useCurrentFrame();
  const e = useMuelle(desde);
  const n = [10, 20, 50, 100].includes(total) ? total : 100;
  const cols = n <= 20 ? 5 : 10;
  const filas = Math.ceil(n / cols);
  const cabecera = (texto ? 130 : 0) + (detalle ? 60 : 0);
  const celda = Math.floor(Math.min(ancho / cols, (Y_MAX - y - cabecera - 60) / filas));
  const w = celda * cols;
  const col = colorTono(tono, c);
  const aparece = 18 / n;                                   // todas las figuras entran en ~18 frames
  const inicioRelleno = desde + 22;
  const relleno = Math.max(1, Math.min(24, cantidad));      // se encienden en ≤24 frames
  const encendidas = interpolate(f, [inicioRelleno, inicioRelleno + relleno], [0, cantidad], clamp);
  const m = texto?.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/);
  const cifra = m ? `${m[1]}${formatoNum(interpolate(f, [inicioRelleno, inicioRelleno + relleno], [0, parseFloat(m[2].replace(",", "."))], clamp), (m[2].split(/[.,]/)[1] ?? "").length)}${m[3]}` : texto;
  return (
    <div style={{ position: "absolute", left: encajarX(x + (ancho - w) / 2, w), top: y, width: w, opacity: e, transform: `translateY(${(1 - e) * 50}px)` }}>
      {texto ? <div style={{ fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: Math.min(120, Math.floor(w / (0.6 * Math.max(3, texto.length)))), lineHeight: 1, whiteSpace: "nowrap", color: col, letterSpacing: "-0.03em", marginBottom: 10 }}>{cifra}</div> : null}
      {detalle ? <div style={{ fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 38, color: c.texto, lineHeight: 1.15, marginBottom: 18 }}>{detalle}</div> : null}
      <div style={{ position: "relative", width: w, height: celda * filas }}>
        {Array.from({ length: n }, (_, i) => {
          const ei = Math.min(1, spring({ fps: 30, frame: f - desde - i * aparece, config: { damping: 15, stiffness: 220 } }));
          const on = i < Math.floor(encendidas + 1e-6);
          const golpe = on ? interpolate(f, [inicioRelleno + (i / Math.max(1, cantidad)) * relleno, inicioRelleno + (i / Math.max(1, cantidad)) * relleno + 6], [0.15, 0], clamp) : 0;
          const lado = celda * 0.86;
          return (
            <div key={i} style={{ position: "absolute", left: (i % cols) * celda + (celda - lado) / 2, top: Math.floor(i / cols) * celda + (celda - lado) / 2,
              width: lado, height: lado, transform: `scale(${(0.4 + 0.6 * ei) * (1 - golpe)})`, opacity: ei }}>
              <Icono nombre={icono} color={on ? col : `${c.texto_suave}66`} size={lado} />
            </div>
          );
        })}
      </div>
      <Fuente texto={fuente} c={c} />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
/** Barras que crecen con su valor real (los grupos de un estudio: "con plan" vs "control"). 2-4 barras; la más alta va en el
 *  color de foco salvo que cada barra traiga su `tono`. El número cuenta mientras la barra sube. */
export const Barras: React.FC<{ barras: { etiqueta: string; valor: number; tono?: Tono; en_f?: number }[]; unidad?: string; fuente?: string;
  desde: number; c: C; x?: number; y?: number; ancho?: number; alto?: number }> = ({ barras, unidad = "", fuente, desde, c, x = ZONA.izq, y = 600, ancho = 500, alto = 340 }) => {
  const f = useCurrentFrame();
  const e = useMuelle(desde);
  const bs = barras.slice(0, 4);
  const max = Math.max(1e-6, ...bs.map((b) => Math.abs(b.valor)));
  const pad = 34;
  const hueco = 26;
  const anchoBarra = (ancho - pad * 2 - hueco * (bs.length - 1)) / bs.length;
  const altoUtil = Math.min(alto, Y_MAX - y - 260);
  return (
    <div style={{ position: "absolute", left: encajarX(x, ancho), top: y, width: ancho, boxSizing: "border-box", padding: `28px ${pad}px 24px`, borderRadius: 34,
      background: c.superficie, border: `3px solid ${c.estructura}44`, boxShadow: "0 24px 60px rgba(0,0,0,0.3)", opacity: e, transform: `translateY(${(1 - e) * 60}px)` }}>
      <div style={{ position: "relative", height: altoUtil + 70, display: "flex", alignItems: "flex-end", gap: hueco }}>
        {bs.map((b, i) => {
          const ini = desde + 8 + i * 6;
          const p = Math.min(1, spring({ fps: 30, frame: f - ini, config: { damping: 18, stiffness: 120 } }));
          const h = Math.max(6, (Math.abs(b.valor) / max) * altoUtil * p);
          const col = b.tono ? colorTono(b.tono, c) : Math.abs(b.valor) === max ? c.foco : c.texto_suave;
          return (
            <div key={i} style={{ width: anchoBarra, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%" }}>
              <div style={{ fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: Math.min(64, anchoBarra / 2.6), color: col, lineHeight: 1, marginBottom: 12, whiteSpace: "nowrap",
                opacity: interpolate(f, [ini, ini + 6], [0, 1], clamp) }}>{formatoNum(b.valor * p, decimales(b.valor))}{unidad}</div>
              <div style={{ width: "100%", height: h, borderRadius: "18px 18px 6px 6px", background: col, boxShadow: `0 0 30px ${col}33` }} />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: hueco, borderTop: `3px solid ${c.estructura}55`, paddingTop: 14 }}>
        {bs.map((b, i) => (
          <div key={i} style={{ width: anchoBarra, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 32, lineHeight: 1.1, color: c.texto }}>{b.etiqueta}</div>
        ))}
      </div>
      <Fuente texto={fuente} c={c} centrado />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
/** Anillo de porcentaje que se dibuja mientras el número del centro cuenta hasta `valor` (0-100). */
export const Anillo: React.FC<{ valor: number; texto?: string; detalle?: string; unidad?: string; fuente?: string; tono?: Tono;
  desde: number; c: C; x?: number; y?: number; ancho?: number }> = ({ valor, texto, detalle, unidad = "%", fuente, tono, desde, c, x = ZONA.izq, y = 600, ancho = 500 }) => {
  const f = useCurrentFrame();
  const e = useMuelle(desde);
  const lado = Math.min(ancho, 440, Y_MAX - y - (detalle ? 150 : 70));
  const grosor = lado * 0.11;
  const r = (lado - grosor) / 2;
  const L = 2 * Math.PI * r;
  const p = interpolate(f, [desde + 6, desde + 36], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const v = Math.max(0, Math.min(100, valor));
  const col = colorTono(tono, c);
  return (
    <div style={{ position: "absolute", left: encajarX(x + (ancho - lado) / 2, lado), top: y, width: lado, opacity: e, transform: `scale(${0.85 + 0.15 * e})`, transformOrigin: "50% 0%" }}>
      <div style={{ position: "relative", width: lado, height: lado }}>
        <svg width={lado} height={lado} style={{ position: "absolute", inset: 0, transform: "rotate(-90deg)" }}>
          <circle cx={lado / 2} cy={lado / 2} r={r} fill="none" stroke={`${c.estructura}40`} strokeWidth={grosor} />
          <circle cx={lado / 2} cy={lado / 2} r={r} fill="none" stroke={col} strokeWidth={grosor} strokeLinecap="round"
            strokeDasharray={`${L} ${L}`} strokeDashoffset={L * (1 - (v / 100) * p)} />
        </svg>
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTE.titulos, fontWeight: 800,
          fontSize: lado * 0.25, color: c.texto, letterSpacing: "-0.03em" }}>{texto ?? `${formatoNum(v * p, decimales(v))}${unidad}`}</div>
      </div>
      {detalle ? <div style={{ marginTop: 18, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 38, color: c.texto, lineHeight: 1.15 }}>{detalle}</div> : null}
      <Fuente texto={fuente} c={c} centrado />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
/** Línea de tiempo: 2-4 hitos que se encienden cada uno en su palabra ("semana 1" → "semana 4", "hoy" → "en 6 meses").
 *  Vertical en la columna (con mascota) u horizontal a lo ancho de la zona (sin mascota). */
export const LineaTiempo: React.FC<{ hitos: { texto: string; icono?: string }[]; frames: number[]; vertical: boolean; desde: number; c: C;
  x?: number; y?: number; ancho?: number }> = ({ hitos, frames, vertical, desde, c, x = ZONA.izq, y = 620, ancho = 500 }) => {
  const f = useCurrentFrame();
  const e = useMuelle(desde);
  const hs = hitos.slice(0, 4);
  const n = hs.length;
  const nodo = 104;
  const alcanzado = (i: number) => Math.min(1, spring({ fps: 30, frame: f - (frames[i] ?? desde), config: { damping: 13, stiffness: 200 } }));
  // progreso de la línea: llega al hito i en su frame
  let prog = 0;
  for (let i = 1; i < n; i++) prog += interpolate(f, [frames[i - 1] ?? desde, frames[i] ?? desde], [0, 1], clamp);
  prog /= Math.max(1, n - 1);
  if (vertical) {
    const paso = Math.min(190, (Y_MAX - y - nodo) / Math.max(1, n - 1));
    const alto = paso * (n - 1);
    return (
      <div style={{ position: "absolute", left: encajarX(x, ancho), top: y, width: ancho, height: alto + nodo, opacity: e }}>
        <div style={{ position: "absolute", left: nodo / 2 - 4, top: nodo / 2, width: 8, height: alto, borderRadius: 4, background: `${c.estructura}40` }} />
        <div style={{ position: "absolute", left: nodo / 2 - 4, top: nodo / 2, width: 8, height: alto * prog, borderRadius: 4, background: c.foco }} />
        {hs.map((h, i) => {
          const a = alcanzado(i);
          return (
            <div key={i} style={{ position: "absolute", left: 0, top: i * paso, width: ancho, height: nodo, display: "flex", alignItems: "center", gap: 26 }}>
              <div style={{ width: nodo, height: nodo, borderRadius: "50%", flexShrink: 0, background: a > 0.5 ? c.foco : c.superficie, border: `5px solid ${a > 0.05 ? c.foco : `${c.estructura}66`}`,
                display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.75 + 0.25 * a})`, boxShadow: a > 0.5 ? `0 0 34px ${c.foco}55` : "none" }}>
                {h.icono ? <Icono nombre={h.icono} color={a > 0.5 ? IF.blanco : c.texto_suave} size={52} />
                  : <span style={{ fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 44, color: a > 0.5 ? IF.blanco : c.texto_suave }}>{i + 1}</span>}
              </div>
              <div style={{ fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 48, lineHeight: 1.05, color: a > 0.05 ? c.texto : c.texto_suave,
                opacity: 0.35 + 0.65 * a, transform: `translateX(${(1 - a) * -24}px)` }}>{h.texto}</div>
            </div>
          );
        })}
      </div>
    );
  }
  const celda = ancho / n;
  return (
    <div style={{ position: "absolute", left: encajarX(x, ancho), top: y, width: ancho, height: nodo + 110, opacity: e }}>
      <div style={{ position: "absolute", left: celda / 2, top: nodo / 2 - 4, width: ancho - celda, height: 8, borderRadius: 4, background: `${c.estructura}40` }} />
      <div style={{ position: "absolute", left: celda / 2, top: nodo / 2 - 4, width: (ancho - celda) * prog, height: 8, borderRadius: 4, background: c.foco }} />
      {hs.map((h, i) => {
        const a = alcanzado(i);
        return (
          <div key={i} style={{ position: "absolute", left: i * celda, top: 0, width: celda, display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
            <div style={{ width: nodo, height: nodo, borderRadius: "50%", background: a > 0.5 ? c.foco : c.superficie, border: `5px solid ${a > 0.05 ? c.foco : `${c.estructura}66`}`,
              display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${0.75 + 0.25 * a})` }}>
              {h.icono ? <Icono nombre={h.icono} color={a > 0.5 ? IF.blanco : c.texto_suave} size={52} />
                : <span style={{ fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 44, color: a > 0.5 ? IF.blanco : c.texto_suave }}>{i + 1}</span>}
            </div>
            <div style={{ width: celda - 10, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: Math.min(44, celda / 4.2), lineHeight: 1.05,
              color: c.texto, opacity: 0.35 + 0.65 * a }}>{h.texto}</div>
          </div>
        );
      })}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
/** Ficha del estudio (la "portada del paper"): tipo de estudio, año, muestra, duración y revista, con la fuente verificada.
 *  Da credibilidad sin leer autores en voz alta. Se dibuja: no es una captura de la revista. */
export const TarjetaEstudio: React.FC<{ tipo: string; anio?: number | string; muestra?: string; duracion?: string; revista?: string; fuente?: string;
  desde: number; c: C; x?: number; y?: number; ancho?: number }> = ({ tipo, anio, muestra, duracion, revista, fuente, desde, c, x = ZONA.izq, y = 600, ancho = 500 }) => {
  const f = useCurrentFrame();
  const e = useMuelle(desde);
  const filas = [["users", muestra], ["calendar-days", duracion], ["book-open", revista]].filter((r) => r[1]) as [string, string][];
  return (
    <div style={{ position: "absolute", left: encajarX(x, ancho), top: y, width: ancho, borderRadius: 30, overflow: "hidden", background: c.superficie,
      border: `3px solid ${c.estructura}44`, boxShadow: "0 24px 60px rgba(0,0,0,0.35)", opacity: e, transform: `translateY(${(1 - e) * 70}px)` }}>
      <div style={{ background: c.foco, padding: "18px 30px", display: "flex", alignItems: "center", gap: 16 }}>
        <Icono nombre="microscope" color={c.claridad > 0.5 || c.azulidad > 0.5 ? IF.blanco : IF.grafito} size={40} />
        <div style={{ fontFamily: FUENTE.mono, fontWeight: 700, fontSize: 24, letterSpacing: "0.22em", color: c.claridad > 0.5 || c.azulidad > 0.5 ? IF.blanco : IF.grafito }}>
          ESTUDIO{anio ? ` · ${anio}` : ""}</div>
      </div>
      <div style={{ padding: "24px 30px 26px" }}>
        <div style={{ fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: Math.min(58, Math.floor((ancho - 60) / (0.56 * Math.max(8, tipo.length / 1.6)))), lineHeight: 1.05, color: c.texto }}>{tipo}</div>
        {filas.map(([ic, t], i) => {
          const ei = Math.min(1, spring({ fps: 30, frame: f - desde - 10 - i * 6, config: { damping: 14, stiffness: 200 } }));
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 20, marginTop: i ? 12 : 22, opacity: ei, transform: `translateX(${(1 - ei) * -40}px)` }}>
              <div style={{ width: 70, height: 70, borderRadius: 20, background: `${c.foco}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Icono nombre={ic} color={c.foco} size={42} />
              </div>
              <div style={{ fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 40, color: c.texto, lineHeight: 1.1 }}>{t}</div>
            </div>
          );
        })}
        <Fuente texto={fuente} c={c} />
      </div>
    </div>
  );
};
