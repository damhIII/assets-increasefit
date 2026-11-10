// Subtítulos IncreaseFit: 1-3 palabras a la vez, SOLO palabras (sin signos de puntuación: vienen limpios de sincronizar.py
// y se vuelven a limpiar aquí por si acaso). El fin de frase o coma del guion llega como bandera `corte` para agrupar.
// Karaoke: la palabra que suena se enciende sobre una píldora de color con pop; las de énfasis son más grandes y se quedan
// en color; los tonos (alerta = el error, éxito = lo correcto) y los iconos los pinta la escaleta (bloque "subtitulos").
// La cápsula es siempre oscura: sobre ella el azul de texto es IF.azulLuz y el #2353F1 solo va de relleno (píldora, insignia).
import React, { useMemo } from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { datos, FUENTE, IF, type Palabra } from "./datos";
import { Icono } from "../componentes/kit";

type W = { w: string; a: number; b: number; enf: boolean; corte: boolean; tono: "" | "alerta" | "exito"; icono: string };

/** Solo letras, números, guiones internos y la coma decimal entre dígitos. */
export const soloPalabra = (w: string) =>
  w.replace(/(\d)[.,](\d)/g, "$1\u0000$2").replace(/[^\p{L}\p{N}%\-\u0000]/gu, "").replace(/-{2,}/g, "-").replace(/^-+|-+$/g, "").replace(/\u0000/g, ",");

const MAX_PALABRAS = 3, MAX_LETRAS = 16, PAUSA_S = 0.45, ANTES_S = 0.1;
// Cápsula más opaca que IF.capsula para que también se lea sobre los climas claros; las palabras que vienen, en blanco tenue.
const CAPSULA = "rgba(10,10,10,0.88)", FUTURA = "rgba(255,255,255,0.4)";

function agrupar(subs: Palabra[]): W[][] {
  const ws: W[] = [];
  for (const [w0, a, b, enf, corte, tono, icono] of subs) {
    const w = soloPalabra(String(w0 ?? ""));
    if (!w) {                                   // un signo suelto ("—", "…"): no se dibuja, pero su corte cuenta
      if (ws.length && corte) ws[ws.length - 1].corte = true;
      continue;
    }
    ws.push({ w, a, b, enf: enf === 1, corte: corte === 1, tono: tono ?? "", icono: icono ?? "" });
  }
  const grupos: W[][] = [];
  let g: W[] = [];
  for (const x of ws) {
    const prev = g[g.length - 1];
    const letras = g.reduce((n, y) => n + y.w.length * (y.enf ? 1.2 : 1), 0) + x.w.length * (x.enf ? 1.2 : 1);
    if (prev && (g.length >= MAX_PALABRAS || prev.corte || letras > MAX_LETRAS || x.a - prev.b > PAUSA_S || (x.icono && g.some((y) => y.icono)))) {
      grupos.push(g);
      g = [];
    }
    g.push(x);
  }
  if (g.length) grupos.push(g);
  return grupos;
}

const relleno = (t: W["tono"]) => (t === "alerta" ? IF.alerta : t === "exito" ? IF.exito : IF.azul);
const textoSobre = (t: W["tono"]) => (t ? IF.tinta : IF.blanco);           // blanco sobre azul; tinta sobre rojo o verde (contraste)
const textoMarcado = (t: W["tono"]) => (t === "alerta" ? IF.alerta : t === "exito" ? IF.exito : IF.azulLuz);

const PalabraSub: React.FC<{ p: W; siguiente: number; t: number; f: number; fps: number }> = ({ p, siguiente, t, f, fps }) => {
  const dicha = t >= p.a;
  const actual = dicha && t < Math.min(siguiente, Math.max(p.b + 0.06, p.a + 0.14));
  const marcada = p.enf || !!p.tono;
  const pop = dicha ? spring({ fps, frame: f - Math.round(p.a * fps), config: { damping: 10, stiffness: 280 } }) : 0;
  const base = marcada ? 1.18 : 1;
  const escala = base * (actual ? 1 + (marcada ? 0.14 : 0.08) * pop : 1);
  const color = actual ? textoSobre(p.tono) : dicha ? (marcada ? textoMarcado(p.tono) : IF.blanco) : FUTURA;
  const insignia = p.icono && dicha ? spring({ fps, frame: f - Math.round(p.a * fps) + 2, config: { damping: 8, stiffness: 220 } }) : 0;
  return (
    <span style={{ position: "relative", display: "inline-block", padding: "4px 16px", margin: `0 ${Math.round((escala - 1) * p.w.length * 17)}px`,
      transform: `scale(${escala}) rotate(${actual && marcada ? -2.5 : 0}deg)` }}>
      {actual ? (
        <span style={{ position: "absolute", inset: 0, borderRadius: 18, background: relleno(p.tono), transform: `scaleX(${0.9 + 0.1 * pop}) scaleY(${0.75 + 0.25 * pop})`,
          boxShadow: `0 8px 26px ${relleno(p.tono)}88` }} />
      ) : null}
      <span style={{ position: "relative", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 64, lineHeight: 1.1, textTransform: "uppercase", color,
        letterSpacing: "-0.01em", textShadow: !actual && dicha && marcada ? `0 0 22px ${textoMarcado(p.tono)}66` : "none" }}>{p.w}</span>
      {p.icono ? (
        <span style={{ position: "absolute", left: "50%", top: -86, width: 92, height: 92, marginLeft: -46, borderRadius: 46, background: relleno(p.tono),
          border: `5px solid ${IF.grafito2}`, display: "flex", alignItems: "center", justifyContent: "center", boxSizing: "border-box",
          transform: `scale(${insignia}) rotate(${(1 - insignia) * -25}deg)`, boxShadow: "0 10px 24px rgba(0,0,0,0.45)" }}>
          <Icono nombre={p.icono} color={textoSobre(p.tono)} size={50} />
        </span>
      ) : null}
    </span>
  );
};

export const Subtitulos: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = f / fps;
  const grupos = useMemo(() => agrupar(datos.subtitulos), []);
  const i = grupos.findIndex((g, k) => t >= g[0].a - ANTES_S && (k === grupos.length - 1 || t < grupos[k + 1][0].a - ANTES_S));
  if (i < 0) return null;
  const g = grupos[i];
  if (t > g[g.length - 1].b + 0.8) return null;
  const entrada = spring({ fps, frame: f - Math.round((g[0].a - ANTES_S) * fps), config: { damping: 14, stiffness: 260 } });
  const sigGrupo = grupos[i + 1]?.[0].a ?? Infinity;
  return (
    <div style={{ position: "absolute", top: 1385, left: 0, width: 1080, display: "flex", justifyContent: "center" }}>
      <div style={{ background: CAPSULA, backdropFilter: "blur(16px)", borderRadius: 30, padding: "12px 18px", display: "flex", gap: 6, alignItems: "center",
        maxWidth: 940, flexWrap: "wrap", justifyContent: "center", opacity: Math.min(1, 0.5 + entrada),
        transform: `translateY(${(1 - entrada) * 26}px) scale(${0.9 + 0.1 * entrada})` }}>
        {g.map((p, k) => <PalabraSub key={k} p={p} siguiente={g[k + 1]?.a ?? sigGrupo} t={t} f={f} fps={fps} />)}
      </div>
    </div>
  );
};
