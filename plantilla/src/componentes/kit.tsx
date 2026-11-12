// Piezas del kit gráfico (kit/*.svg) animadas. Todas reciben `desde` en frames LOCALES de la escena.
import React from "react";
import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { datos, FUENTE, IF, type Semana } from "../marco/datos";
import type { C } from "../marco/clima";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const useEntrada = (desde: number, cfg = { damping: 12, stiffness: 180 }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ fps, frame: f - desde, config: cfg });
};

/** SVG blanco del kit teñido con máscara CSS. */
export const Tinta: React.FC<{ src: string; color: string; w: number; h: number; style?: React.CSSProperties }> = ({ src, color, w, h, style }) => {
  const url = `url(${staticFile(src)})`;
  return <div style={{ width: w, height: h, backgroundColor: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", ...style }} />;
};

/** Icono de Lucide coloreado (public/icons/<nombre>.svg). */
export const Icono: React.FC<{ nombre: string; color: string; size?: number; style?: React.CSSProperties }> = ({ nombre, color, size = 48, style }) => {
  const url = `url(${staticFile(`icons/${nombre}.svg`)})`;
  return <div style={{ width: size, height: size, backgroundColor: color, WebkitMaskImage: url, maskImage: url, WebkitMaskSize: "contain", maskSize: "contain", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "center", maskPosition: "center", flexShrink: 0, ...style }} />;
};

/** Etiqueta a mano (Kalam) con flecha curva que se dibuja hasta el punto `a`. */
export const Etiqueta: React.FC<{ texto: string; a: [number, number]; desde: number; c: C }> = ({ texto, a, desde, c }) => {
  const f = useCurrentFrame();
  const e = useEntrada(desde);
  const izq = a[0] > 540;                                   // la etiqueta va al lado libre
  const ly = Math.min(1250, Math.max(580, a[1] - 150));
  const lx = izq ? 70 : 610;
  const ancho = 400;
  const sx = izq ? lx + Math.min(ancho, texto.length * 26 + 30) : lx + 10, sy = ly + 70;
  const ctrl: [number, number] = [(sx + a[0]) / 2, Math.min(sy, a[1]) - 90];
  const d = `M${sx},${sy} Q${ctrl[0]},${ctrl[1]} ${a[0]},${a[1]}`;
  const L = Math.hypot(a[0] - sx, a[1] - sy) * 1.35;
  const p = interpolate(f, [desde + 4, desde + 16], [0, 1], clamp);
  const ang = Math.atan2(a[1] - ctrl[1], a[0] - ctrl[0]);
  const punta = [a[0] - 34 * Math.cos(ang - 0.5), a[1] - 34 * Math.sin(ang - 0.5), a[0] - 34 * Math.cos(ang + 0.5), a[1] - 34 * Math.sin(ang + 0.5)];
  const color = c.claridad > 0.5 ? IF.tinta : IF.blanco;
  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {p > 0 ? <path d={d} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeDasharray={`${L} ${L}`} strokeDashoffset={L * (1 - p)} /> : null}
        {p > 0.95 ? <path d={`M${punta[0]},${punta[1]} L${a[0]},${a[1]} L${punta[2]},${punta[3]}`} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
      <div style={{ position: "absolute", left: lx, top: ly, width: ancho, textAlign: izq ? "right" : "left", fontFamily: FUENTE.mano, fontWeight: 700, fontSize: 58, lineHeight: 1,
        color, textShadow: c.claridad > 0.5 ? "none" : "0 3px 10px rgba(0,0,0,0.6)", transform: `scale(${0.7 + 0.3 * e}) rotate(${izq ? -3 : 3}deg)`, opacity: Math.min(1, e) }}>{texto}</div>
    </>
  );
};

/** Caja blanca con texto que se tacha en rojo (el "Wide Grip" tachado). */
export const CajaTachada: React.FC<{ texto: string; x: number; y: number; desde: number; tacha?: number }> = ({ texto, x, y, desde, tacha }) => {
  const f = useCurrentFrame();
  const e = useEntrada(desde, { damping: 10, stiffness: 220 });
  const t0 = tacha ?? desde + 14;
  const raya = interpolate(f, [t0, t0 + 7], [0, 1], clamp);
  const ancho = Math.min(560, texto.length * 30 + 80);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, height: 110, transform: `scale(${0.6 + 0.4 * e}) rotate(-3deg)`, opacity: Math.min(1, e * 1.5) }}>
      <Img src={staticFile("kit/marcas/caja_etiqueta.svg")} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 46, color: IF.grafito, letterSpacing: "-0.01em" }}>{texto}</div>
      <div style={{ position: "absolute", left: "4%", top: 34, width: "92%", height: 46, clipPath: `inset(0 ${100 - raya * 100}% 0 0)` }}>
        <Tinta src="kit/marcas/tachado.svg" color={IF.alerta} w={ancho * 0.92} h={46} />
      </div>
    </div>
  );
};

/** Círculo de rotulador que se dibuja alrededor de un punto. */
export const Circulo: React.FC<{ a: [number, number]; desde: number; r?: number; color?: string }> = ({ a, desde, r = 130, color = IF.azulLuz }) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [desde, desde + 10], [0, 1], clamp);
  const w = r * 2.3, h = r * 1.5;
  return (
    <div style={{ position: "absolute", left: a[0] - w / 2, top: a[1] - h / 2, clipPath: `inset(0 ${100 - p * 100}% 0 0)`, transform: "rotate(-6deg)" }}>
      <Tinta src="kit/marcas/circulo_marcador.svg" color={color} w={w} h={h} />
    </div>
  );
};

/** Check verde o cruz roja que cae con golpe. */
export const Marca: React.FC<{ tipo: "check" | "cruz"; x: number; y: number; desde: number; size?: number }> = ({ tipo, x, y, desde, size = 190 }) => {
  const e = useEntrada(desde, { damping: 9, stiffness: 240 });
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, transform: `scale(${2 - e}) rotate(${(1 - e) * -20}deg)`, opacity: Math.min(1, e * 2) }}>
      <Tinta src={`kit/marcas/${tipo}.svg`} color={tipo === "check" ? IF.exito : IF.alerta} w={size} h={size * (tipo === "check" ? 220 / 260 : 1)} />
    </div>
  );
};

/** Nube de pensamiento con un sprite pequeño dentro. */
export const BurbujaPensamiento: React.FC<{ x: number; y: number; sprite: string; desde: number }> = ({ x, y, sprite, desde }) => {
  const e = useEntrada(desde);
  const w = 460, h = w * 450 / 660;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `scale(${0.5 + 0.5 * e})`, transformOrigin: "15% 95%", opacity: Math.min(1, e) }}>
      <Img src={staticFile("kit/burbujas/burbuja_pensamiento.svg")} style={{ position: "absolute", inset: 0, width: w, height: h }} />
      <Img src={staticFile(`mascota/sprites/${sprite}.png`)} style={{ position: "absolute", left: w * 0.5 - 70, top: h * 0.4 - 95, height: 190, objectFit: "contain" }} />
    </div>
  );
};

/** Bocadillo de diálogo con texto a mano. */
export const BurbujaDialogo: React.FC<{ x: number; y: number; texto: string; desde: number; espejo?: boolean }> = ({ x, y, texto, desde, espejo }) => {
  const e = useEntrada(desde);
  const w = 480, h = w * 420 / 640;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h, transform: `scale(${0.5 + 0.5 * e})`, transformOrigin: espejo ? "80% 95%" : "20% 95%", opacity: Math.min(1, e) }}>
      <Img src={staticFile("kit/burbujas/burbuja_dialogo.svg")} style={{ position: "absolute", inset: 0, width: w, height: h, transform: espejo ? "scaleX(-1)" : undefined }} />
      <div style={{ position: "absolute", left: w * 0.1, top: h * 0.12, width: w * 0.8, height: h * 0.55, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center",
        fontFamily: FUENTE.mano, fontWeight: 700, fontSize: Math.min(54, Math.floor(900 / Math.max(10, texto.length))), color: IF.grafito, lineHeight: 1.05 }}>{texto}</div>
    </div>
  );
};

/** Cara en un círculo (reacción), arriba a la derecha de la escena. */
export const Inserto: React.FC<{ cara: string; desde: number; c: C; x?: number; y?: number; r?: number }> = ({ cara, desde, c, x = 830, y = 690, r = 150 }) => {
  const e = useEntrada(desde, { damping: 10, stiffness: 200 });
  return (
    <div style={{ position: "absolute", left: x - r, top: y - r, width: r * 2, height: r * 2, transform: `scale(${e})` }}>
      <div style={{ position: "absolute", inset: 8, borderRadius: "50%", overflow: "hidden", background: c.superficie }}>
        <Img src={staticFile(`mascota/sprites/${cara}.png`)} style={{ position: "absolute", left: -r * 0.12, top: r * 0.05, width: r * 2.24 }} />
      </div>
      <Img src={staticFile("kit/burbujas/inserto_circular.svg")} style={{ position: "absolute", inset: -4, width: r * 2 + 8, height: r * 2 + 8 }} />
    </div>
  );
};

/** Cifra grande (cuenta hasta su valor si es numérica) con su explicación y la fuente. */
export const Dato: React.FC<{ texto: string; detalle?: string; fuente?: string; desde: number; c: C; x?: number; y?: number; ancho?: number }> = ({ texto, detalle, fuente, desde, c, x = 70, y = 610, ancho = 560 }) => {
  const f = useCurrentFrame();
  const e = useEntrada(desde);
  const m = texto.match(/^([^\d]*)(\d+(?:[.,]\d+)?)(.*)$/);
  let mostrado = texto;
  if (m) {
    const objetivo = parseFloat(m[2].replace(",", "."));
    const dec = (m[2].split(/[.,]/)[1] ?? "").length;
    const v = interpolate(f, [desde, desde + 22], [0, objetivo], clamp);
    mostrado = `${m[1]}${v.toFixed(dec).replace(".", ",")}${m[3]}`;
  }
  const tam = Math.min(190, Math.floor(ancho / Math.max(1, texto.length * 0.62)));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, transform: `translateY(${(1 - e) * 60}px)`, opacity: Math.min(1, e) }}>
      <div style={{ fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: tam, color: c.foco, lineHeight: 1, letterSpacing: "-0.03em" }}>{mostrado}</div>
      {detalle ? <div style={{ marginTop: 14, fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 40, color: c.texto, lineHeight: 1.2 }}>{detalle}</div> : null}
      {fuente ? <div style={{ marginTop: 16, fontFamily: FUENTE.mono, fontSize: 24, color: c.texto_suave, letterSpacing: "0.04em" }}>{fuente}</div> : null}
    </div>
  );
};

/** Color de un tono: el foco del clima por defecto; alerta (el error) y éxito (lo correcto) no cambian con el clima. */
export const colorTono = (tono: "foco" | "alerta" | "exito" | undefined, c: C) => (tono === "alerta" ? IF.alerta : tono === "exito" ? IF.exito : c.foco);

/** Icono grande en una insignia que salta (overshoot) y flota: la imagen que sustituye a una palabra en pantalla.
 *  `tachado` dibuja una barra roja encima ("esto no"). x, y = centro. */
export const IconoPop: React.FC<{ nombre: string; x: number; y: number; desde: number; c: C; tono?: "foco" | "alerta" | "exito"; tachado?: boolean; size?: number }> = ({ nombre, x, y, desde, c, tono, tachado, size = 220 }) => {
  const f = useCurrentFrame();
  const e = useEntrada(desde, { damping: 8, stiffness: 200 });
  const col = colorTono(tono, c);
  const flota = Math.sin((f - desde) / 14) * 6;
  const barra = interpolate(f, [desde + 10, desde + 18], [0, 1], clamp);
  const L = size * 0.95;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2 + flota, width: size, height: size, transform: `scale(${e}) rotate(${(1 - e) * -30}deg)`, opacity: Math.min(1, e * 2) }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: c.superficie, border: `6px solid ${col}`, boxShadow: `0 18px 40px rgba(0,0,0,0.35), 0 0 40px ${col}33` }} />
      <Icono nombre={nombre} color={col} size={size * 0.52} style={{ position: "absolute", left: size * 0.24, top: size * 0.24 }} />
      {tachado ? (
        <svg width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={`M${size * 0.17},${size * 0.83} L${size * 0.83},${size * 0.17}`} stroke={IF.alerta} strokeWidth={size * 0.075} strokeLinecap="round"
            strokeDasharray={`${L} ${L}`} strokeDashoffset={L * (1 - barra)} />
        </svg>
      ) : null}
    </div>
  );
};

/** Ficha de un estudio contada con iconos: cada fila = icono + cifra corta ("100", "8 sem", "5 g"), que entra en su frame local.
 *  Abajo, la fuente verificada (JetBrains Mono) o EJEMPLO ILUSTRATIVO. Va en la columna izquierda (la mascota pasa a la derecha). */
export const FichaEstudio: React.FC<{ filas: { icono: string; texto: string }[]; frames: number[]; fuente?: string; c: C; x?: number; y?: number; ancho?: number }> = ({ filas, frames, fuente, c, x = 60, y = 600, ancho = 560 }) => {
  const f = useCurrentFrame();
  const e = useEntrada(Math.max(0, (frames[0] ?? 0) - 4));
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, borderRadius: 34, background: c.superficie, border: `3px solid ${c.estructura}44`, padding: "26px 34px",
      boxSizing: "border-box", transform: `translateY(${(1 - e) * 70}px)`, opacity: Math.min(1, e), boxShadow: "0 24px 60px rgba(0,0,0,0.3)" }}>
      {filas.slice(0, 4).map((r, i) => {
        const ei = spring({ fps: 30, frame: f - (frames[i] ?? 0), config: { damping: 10, stiffness: 220 } });
        return (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 28, padding: "16px 0", borderTop: i ? `2px dashed ${c.estructura}33` : "none",
            transform: `translateX(${(1 - ei) * -70}px) scale(${0.85 + 0.15 * ei})`, transformOrigin: "left center", opacity: Math.min(1, ei * 1.5) }}>
            <div style={{ width: 104, height: 104, borderRadius: 26, background: `${c.foco}22`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Icono nombre={r.icono} color={c.foco} size={64} />
            </div>
            <div style={{ fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: Math.min(84, Math.floor(700 / Math.max(3, r.texto.length))), color: c.texto, lineHeight: 1, letterSpacing: "-0.02em" }}>{r.texto}</div>
          </div>
        );
      })}
      {fuente ? <div style={{ marginTop: 14, fontFamily: FUENTE.mono, fontSize: 24, color: c.texto_suave, letterSpacing: "0.04em" }}>{fuente}</div> : null}
    </div>
  );
};

/** Checklist: cada ítem aparece y se marca a su tiempo (frames locales). */
export const Lista: React.FC<{ items: string[]; frames: number[]; c: C; x?: number; y?: number; ancho?: number }> = ({ items, frames, c, x = 60, y = 600, ancho = 560 }) => {
  const f = useCurrentFrame();
  return (
    <>
      {items.slice(0, 5).map((it, i) => {
        const e = spring({ fps: 30, frame: f - frames[i], config: { damping: 12, stiffness: 180 } });
        const marcado = f >= frames[i] + 8;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + i * 128, width: ancho, display: "flex", alignItems: "center", gap: 22,
            transform: `translateX(${(1 - e) * -90}px)`, opacity: Math.min(1, e) }}>
            <Img src={staticFile(`kit/marcas/${marcado ? "casilla_marcada" : "casilla"}.svg`)} style={{ width: 96, height: 90, flexShrink: 0 }} />
            <div style={{ fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 42, color: c.texto, lineHeight: 1.1 }}>{it}</div>
          </div>
        );
      })}
    </>
  );
};

/** Efectos del kit alrededor del personaje. */
export const Efecto: React.FC<{ tipo: "lineas_velocidad" | "impacto" | "sudor" | "destello" | "enfoque" | "rec"; a: [number, number]; desde: number; c: C }> = ({ tipo, a, desde, c }) => {
  const f = useCurrentFrame();
  const e = useEntrada(desde, { damping: 9, stiffness: 220 });
  const col = c.claridad > 0.5 ? IF.tinta : IF.blanco;
  if (tipo === "enfoque") return <div style={{ position: "absolute", inset: 0, opacity: 0.3 * Math.min(1, e), transform: `scale(${1.05 + 0.02 * Math.sin(f / 3)})` }}><Tinta src="kit/efectos/lineas_enfoque.svg" color={col} w={1080} h={1920} /></div>;
  if (tipo === "rec") {
    return (
      <div style={{ position: "absolute", inset: 0, opacity: Math.min(1, e) }}>
        <Img src={staticFile("kit/marcos/marco_rec.svg")} style={{ width: 1080, height: 1920 }} />
        <div style={{ position: "absolute", left: 122, top: 137, width: 36, height: 36, borderRadius: 18, background: IF.alerta, opacity: f % 30 < 15 ? 1 : 0.15 }} />
      </div>
    );
  }
  if (tipo === "lineas_velocidad") return <div style={{ position: "absolute", left: a[0] - 560, top: a[1] - 220, opacity: 0.55 * Math.min(1, e), transform: `translateX(${(f % 8) * -4}px)` }}><Tinta src="kit/efectos/lineas_velocidad.svg" color={col} w={420} h={350} /></div>;
  if (tipo === "impacto") return <div style={{ position: "absolute", left: a[0] + 70, top: a[1] - 170, transform: `scale(${e})` }}><Tinta src="kit/efectos/marcas_impacto.svg" color={col} w={130} h={130} /></div>;
  if (tipo === "destello") return <div style={{ position: "absolute", left: a[0] + 60, top: a[1] - 200, transform: `scale(${e * (1 + 0.1 * Math.sin(f / 4))}) rotate(${f * 2}deg)` }}><Tinta src="kit/efectos/destello.svg" color={IF.hielo} w={150} h={150} /></div>;
  return <Img src={staticFile("kit/efectos/gotas_sudor.svg")} style={{ position: "absolute", left: a[0] + 80, top: a[1] - 120 + Math.min(20, Math.max(0, f - desde) * 0.6), width: 120, opacity: Math.min(1, e) }} />;
};

/** Tarjeta de capítulo ("ERROR 1: agarre demasiado ancho"): número grande translúcido + frase. */
export const Capitulo: React.FC<{ texto: string; c: C }> = ({ texto, c }) => {
  const f = useCurrentFrame();
  const e = useEntrada(0, { damping: 13, stiffness: 160 });
  const [rotulo, frase] = texto.includes(":") ? texto.split(/:(.*)/s).map((s) => s.trim()) : [texto, ""];
  return (
    <div style={{ position: "absolute", left: 50, top: 560, width: 980, height: 760, borderRadius: 36, background: c.superficie, border: `3px solid ${c.estructura}44`, overflow: "hidden",
      transform: `scale(${0.92 + 0.08 * e + f * 0.0006})`, opacity: Math.min(1, e) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: Math.min(230, Math.floor(1700 / Math.max(4, rotulo.length))),
        color: c.texto, opacity: 0.13, letterSpacing: "0.02em", textTransform: "uppercase", transform: `translateX(${-f * 0.8}px)` }}>{rotulo}</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 300, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: Math.min(80, Math.floor(1500 / Math.max(10, frase.length || rotulo.length))),
        color: c.texto, lineHeight: 1.08 }}>{frase || rotulo}</div>
      <div style={{ position: "absolute", left: 60, right: 60, top: 620, display: "flex", justifyContent: "center", fontFamily: FUENTE.mono, fontWeight: 700, fontSize: 30, color: c.foco, letterSpacing: "0.3em", textTransform: "uppercase" }}>{frase ? rotulo : ""}</div>
    </div>
  );
};

/** Libreta de entreno (progresión ILUSTRATIVA: escaleta.progresion). */
export const Libreta: React.FC<{ c: C; titulo: string; frames: number[]; filas?: Semana[]; x?: number; y?: number; ancho?: number }> = ({ c, titulo, frames, filas: propias, x = 60, y = 600, ancho = 540 }) => {
  const f = useCurrentFrame();
  const filas = (propias ?? datos.progresion).slice(0, 4);
  const e = useEntrada(frames[0] - 8);
  const kg = (n: number) => String(n).replace(".", ",");
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, borderRadius: 22, background: c.superficie, border: `2px solid ${c.estructura}44`, padding: "22px 26px", boxSizing: "border-box",
      transform: `translateY(${(1 - e) * 60}px)`, opacity: Math.min(1, e), fontFamily: FUENTE.mono }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, color: c.texto_suave, fontSize: 24, letterSpacing: "0.12em", marginBottom: 14 }}><Icono nombre="notebook-pen" color={c.foco} size={30} />{titulo.toUpperCase()}</div>
      {filas.map((r, i) => {
        const vis = f >= (frames[i] ?? 0);
        const mismo = i > 0 && r.kg === filas[i - 1].kg && r.reps === filas[i - 1].reps;
        return (
          <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: i ? `1px dashed ${c.estructura}44` : "none", opacity: vis ? 1 : 0.18, color: c.texto, fontSize: 34, fontWeight: 700 }}>
            <span style={{ color: c.texto_suave, fontWeight: 500, fontSize: 26 }}>SEM {r.semana}</span>
            <span>{vis ? `${kg(r.kg)} kg × ${r.reps}` : "— × —"}</span>
            <span style={{ width: 34, textAlign: "right", color: i === 0 ? c.texto_suave : mismo ? IF.alerta : IF.exito }}>{vis && i ? (mismo ? "=" : "↑") : ""}</span>
          </div>
        );
      })}
      <div style={{ marginTop: 10, fontSize: 18, letterSpacing: "0.14em", color: c.texto_suave }}>EJEMPLO ILUSTRATIVO</div>
    </div>
  );
};

/** Gráfica de la progresión que se dibuja (fuerza estimada, sube aunque el kg se repita). */
export const Grafica: React.FC<{ c: C; desde: number; filas?: Semana[]; x?: number; y?: number; ancho?: number; alto?: number }> = ({ c, desde, filas: propias, x = 60, y = 620, ancho = 560, alto = 380 }) => {
  const f = useCurrentFrame();
  const filas = propias ?? datos.progresion;
  const valores = filas.map((r) => r.kg * (1 + r.reps / 30));
  const min = Math.min(...valores), max = Math.max(...valores);
  const px = (i: number) => 40 + (i / Math.max(1, valores.length - 1)) * (ancho - 80);
  const py = (v: number) => alto - 50 - ((v - min) / Math.max(1e-6, max - min)) * (alto - 130);
  const prog = interpolate(f, [desde, desde + 36], [0, 1], clamp);
  const d = valores.map((v, i) => `${i ? "L" : "M"}${px(i)},${py(v)}`).join(" ");
  const largo = valores.reduce((n, v, i) => (i ? n + Math.hypot(px(i) - px(i - 1), py(v) - py(valores[i - 1])) : 0), 0);
  return (
    <div style={{ position: "absolute", left: x, top: y, width: ancho, height: alto, borderRadius: 22, background: c.superficie, border: `2px solid ${c.estructura}44` }}>
      <div style={{ position: "absolute", left: 26, top: 18, fontFamily: FUENTE.mono, fontSize: 20, letterSpacing: "0.12em", color: c.texto_suave }}>EJEMPLO ILUSTRATIVO</div>
      <svg width={ancho} height={alto} style={{ position: "absolute", inset: 0 }}>
        <path d={d} fill="none" stroke={c.foco} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={largo} strokeDashoffset={largo * (1 - prog)} />
        {valores.map((v, i) => (prog >= i / Math.max(1, valores.length - 1) - 0.01 ? (
          <g key={i}>
            <circle cx={px(i)} cy={py(v)} r={12} fill={i === valores.length - 1 ? c.foco : c.superficie} stroke={c.foco} strokeWidth={5} />
            <text x={px(i)} y={py(v) - 26} textAnchor="middle" fontFamily={FUENTE.mono} fontWeight={700} fontSize={24} fill={c.texto}>{`${String(filas[i].kg).replace(".", ",")}×${filas[i].reps}`}</text>
          </g>) : null))}
      </svg>
    </div>
  );
};

/** Tarjeta final para guardar. Cuenta la conclusión del Reel en orden: el TEMA (chip) → la PREGUNTA del gancho →
 *  el VEREDICTO (la respuesta corta, coloreada por `tono`) → CÓMO APLICARLO (2-3 pasos numerados) → la fuente.
 *  Debajo, la mascota con el pulgar y el logo. Acepta el formato antiguo (titulo + lineas) para escaletas viejas. */
export const TarjetaResumen: React.FC<{
  c: C; tema?: string; pregunta?: string; veredicto?: string; tono?: "si" | "no" | "matiz" | ""; pasos?: string[]; fuente?: string;
  titulo?: string; lineas?: string[];
}> = ({ c, tema, pregunta, veredicto, tono, pasos, fuente, titulo, lineas }) => {
  const f = useCurrentFrame();
  const ent = (k: number, cfg = { damping: 13, stiffness: 170 }) => spring({ fps: 30, frame: f - k, config: cfg });
  const claro = c.claridad > 0.5;
  const v = (veredicto || titulo || "").trim();
  const ps = (pasos && pasos.length ? pasos : lineas || []).slice(0, 3);
  const colorV = tono === "si" ? (claro ? "#138A55" : IF.exito) : tono === "no" ? (claro ? "#C93A30" : IF.alerta) : c.foco;
  const tamV = v.length <= 22 ? 82 : v.length <= 44 ? 70 : 60;
  const tamP = (pregunta || "").length <= 34 ? 46 : 40;
  const e = ent(0, { damping: 14, stiffness: 150 });
  const sube = (k: number, dx = 0, dy = 40) => {
    const x = ent(k);
    return { transform: `translate(${(1 - x) * dx}px, ${(1 - x) * dy}px)`, opacity: Math.min(1, x) };
  };
  const linea = ent(16, { damping: 18, stiffness: 120 });
  const m = ent(14, { damping: 10, stiffness: 190 });
  return (
    <div style={{ position: "absolute", left: 60, top: 320, width: 900, display: "flex", flexDirection: "column", gap: 22 }}>{/* x 60–960 · Y≈320–1530 (zonas de Instagram) */}
      <div style={{ borderRadius: 40, background: c.superficie, border: `3px solid ${c.foco}66`, boxShadow: "0 30px 80px rgba(0,0,0,0.45)",
        padding: "42px 54px 40px", boxSizing: "border-box", transform: `translateY(${(1 - e) * 200}px) scale(${0.9 + 0.1 * e})`, opacity: Math.min(1, e) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
          <div style={{ fontFamily: FUENTE.mono, fontWeight: 700, fontSize: 24, letterSpacing: "0.3em", color: c.foco }}>GUÁRDALO</div>
          {tema ? (
            <div style={{ fontFamily: FUENTE.mono, fontWeight: 700, fontSize: 22, letterSpacing: "0.12em", textTransform: "uppercase", color: c.texto,
              border: `2px solid ${c.foco}88`, borderRadius: 999, padding: "6px 18px", ...sube(4, 30, 0) }}>{tema}</div>
          ) : null}
        </div>
        {pregunta ? (
          <div style={{ marginTop: 26, fontFamily: FUENTE.titulos, fontWeight: 600, fontSize: tamP, color: c.texto_suave, lineHeight: 1.15, ...sube(6) }}>{pregunta}</div>
        ) : null}
        <div style={{ marginTop: pregunta ? 10 : 22, fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: tamV, color: pregunta ? colorV : c.texto,
          lineHeight: 1.04, letterSpacing: "-0.01em", ...sube(10, 0, 50) }}>{v}</div>
        {ps.length ? (
          <>
            <div style={{ marginTop: 30, height: 3, background: `${c.estructura}44`, transformOrigin: "left center", transform: `scaleX(${linea})` }} />
            <div style={{ marginTop: 24, fontFamily: FUENTE.mono, fontWeight: 700, fontSize: 22, letterSpacing: "0.25em", color: c.texto_suave, ...sube(18, 0, 20) }}>CÓMO APLICARLO</div>
            <div style={{ marginTop: 18 }}>
              {ps.map((l, i) => {
                const k = 22 + i * 6;
                const pop = ent(k, { damping: 9, stiffness: 220 });
                return (
                  <div key={i} style={{ display: "flex", gap: 22, alignItems: "flex-start", marginBottom: i < ps.length - 1 ? 20 : 0, ...sube(k, -60, 0) }}>
                    <div style={{ flexShrink: 0, width: 54, height: 54, marginTop: 2, borderRadius: 27, background: c.foco, color: c.fondo_a, display: "flex",
                      alignItems: "center", justifyContent: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 30, transform: `scale(${pop})` }}>{i + 1}</div>
                    <div style={{ fontFamily: FUENTE.titulos, fontWeight: 700, fontSize: 46, color: c.texto, lineHeight: 1.12 }}>{l}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
        {fuente ? (
          <div style={{ marginTop: 24, fontFamily: FUENTE.mono, fontSize: 22, color: c.texto_suave, letterSpacing: "0.04em", ...sube(24 + ps.length * 6, 0, 10) }}>Fuente: {fuente}</div>
        ) : null}
      </div>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 30 }}>
        <Img src={staticFile("mascota/sprites/gesto_pulgar_arriba.png")} style={{ height: 260, transformOrigin: "50% 100%", transform: `scale(${m})`,
          filter: "drop-shadow(0 14px 18px rgba(0,0,0,0.4))" }} />
        {datos.logos.increasefit ? (
          <Img src={staticFile(claro && datos.logos.oscuro ? "logo_increasefit_oscuro.png" : "logo_increasefit.png")}
            style={{ height: 70, marginBottom: 40, ...sube(26, 40, 0) }} />
        ) : null}
      </div>
    </div>
  );
};

/** Cortinilla con el trazo de pincel (estética de la flecha del logo). Frame local 0 = centro del corte. */
export const CortinillaPincel: React.FC = () => {
  const f = useCurrentFrame();
  const x = interpolate(f, [0, 16], [-2900, 1500], clamp);
  return (
    <div style={{ position: "absolute", left: x, top: 640, transform: "rotate(-9deg) scale(2.1)", transformOrigin: "left center" }}>
      <Img src={staticFile("kit/transiciones/trazo_pincel.svg")} style={{ width: 1400, height: 327 }} />
    </div>
  );
};
