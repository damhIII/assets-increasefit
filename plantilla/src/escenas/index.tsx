// Escenas por defecto de los 6 bloques. Cada video personaliza estas escenas según brief.bloques[].visual.idea,
// la plantilla y las notas de dirección (ver la skill). Dentro de cada escena useCurrentFrame() es LOCAL al bloque.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { brief, FUENTE, IF, type Bloque } from "../marco/datos";
import { useClimaBloque } from "../marco/clima";
import { Chip, DatoConFuente, Etiqueta, Grafica, Lienzo, Libreta, Pasos, RepClima, Sello, Suelo, puntoDeRep, type C } from "../componentes";
import { MOVIMIENTOS, MUSCULOS, duracionRep } from "../rep/esqueleto";
import type { Gesto } from "../rep/Rep";

const PISO = 1300;
const ficha = brief.ficha_tecnica;
const principal = ficha.ejercicios.find((e) => e.rol === "principal")?.movimiento ?? brief.tema.movimiento;
const deError = ficha.ejercicios.find((e) => e.rol === "error")?.movimiento ?? (MOVIMIENTOS[brief.tema.movimiento]?.tipo === "error" ? brief.tema.movimiento : undefined);
const gestos = (b: Bloque) => (b.visual.gesto ? [b.visual.gesto as Gesto] : []);
// articulación que falla en cada movimiento de error (círculo de "telestrator" en el replay)
const FALLA: Record<string, "cintura" | "cadera" | "codo" | "rodilla" | "hombro"> = {
  peso_muerto_redondo: "cintura", curl_ego: "cintura", sentadilla_media: "cadera", dominada_kipping: "cadera",
};

/** Cámara viva: flota y respira; punch-in opcional en un frame. */
const Camara: React.FC<{ children: React.ReactNode; punch?: number }> = ({ children, punch }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = punch !== undefined ? spring({ fps, frame: f - punch, config: { damping: 10, stiffness: 200 } }) : 0;
  const s = punch !== undefined ? 1 + 0.06 * Math.max(0, 1 - Math.abs(1 - p)) : 1;
  return <AbsoluteFill style={{ transform: `translateY(${Math.sin(f / 12) * 6}px) rotate(${Math.sin(f / 40) * 0.4}deg) scale(${s})`, transformOrigin: "540px 1000px" }}>{children}</AbsoluteFill>;
};

const useT = () => useCurrentFrame() / useVideoConfig().fps;

export const EscenaGancho: React.FC<{ b: Bloque }> = ({ b }) => {
  const c = useClimaBloque(b) as C; const t = useT();
  return (
    <Camara punch={4}>
      <Suelo c={c} y={PISO} />
      <Lienzo><RepClima c={c} movimiento={b.visual.rep} t={t} x={540} y={PISO} escala={175} gesto={gestos(b)} /></Lienzo>
      {brief.plantilla === "mito_realidad" ? <Sello tipo="mito" desde={10} x={560} y={600} ancho={420} /> : null}
    </Camara>
  );
};

export const EscenaError: React.FC<{ b: Bloque }> = ({ b }) => {
  const c = useClimaBloque(b) as C; const t = useT();
  const f = useCurrentFrame();
  const dur = b.fin_f - b.ini_f;
  const malo = deError ?? b.visual.rep;
  if (brief.plantilla === "comparacion") {
    const bueno = MOVIMIENTOS[malo]?.correcto ?? principal;
    return (
      <Camara>
        <Img src={staticFile("ui/split_vs.svg")} style={{ position: "absolute", left: 510, top: 600, width: 60, height: 720 }} />
        <div style={{ position: "absolute", left: 60, top: 600, width: 440, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 40, color: IF.alerta }}>ASÍ NO</div>
        <div style={{ position: "absolute", left: 580, top: 600, width: 440, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 40, color: IF.exito }}>ASÍ SÍ</div>
        <Lienzo>
          <RepClima c={c} movimiento={malo} t={t} x={270} y={PISO} escala={128} gesto={["esfuerzo"]} />
          <RepClima c={c} movimiento={bueno} t={t} x={810} y={PISO} escala={128} musculos="auto" />
        </Lienzo>
      </Camara>
    );
  }
  if (brief.plantilla === "replay" && deError) {
    // 0-45 %: la repetición mala a velocidad normal · 45-55 %: congelado + REPLAY · 55-100 %: cámara lenta con el fallo marcado
    const corte = Math.round(dur * 0.45), lento = Math.round(dur * 0.55);
    const tr = f < corte ? t : f < lento ? corte / 30 : corte / 30 + ((f - lento) / 30) * 0.35;
    const enReplay = f >= corte;
    return (
      <Camara>
        <Suelo c={c} y={PISO} />
        <Lienzo>
          <RepClima c={c} movimiento={deError} t={tr} x={560} y={PISO} escala={175} gesto={enReplay ? [] : gestos(b)}
            marcarArticulacion={enReplay && FALLA[deError] ? [{ art: FALLA[deError], radio: 0.34 }] : []} musculos={enReplay ? MOVIMIENTOS[deError].musculos : []} brilloMusculo={1} />
        </Lienzo>
        {enReplay ? (
          <div style={{ position: "absolute", left: 70, top: 600, display: "flex", alignItems: "center", gap: 14, fontFamily: FUENTE.mono, fontWeight: 700, fontSize: 30, color: IF.alerta, letterSpacing: "0.12em" }}>
            <div style={{ width: 22, height: 22, borderRadius: 11, background: IF.alerta, opacity: f % 20 < 10 ? 1 : 0.3 }} /> REPLAY · 0,35×
          </div>
        ) : null}
      </Camara>
    );
  }
  const errores = ficha.errores.slice(0, 3);
  const paso = Math.max(18, Math.floor(dur / (errores.length + 1)));
  return (
    <Camara>
      <Suelo c={c} y={PISO} x={720} ancho={640} />
      <Lienzo><RepClima c={c} movimiento={b.visual.rep} t={t} x={760} y={PISO} escala={160} gesto={gestos(b)} /></Lienzo>
      {errores.map((e, i) => <Chip key={i} c={c} texto={e} tipo="error" desde={12 + i * paso} x={60} y={620 + i * 130} ancho={470} />)}
    </Camara>
  );
};

export const EscenaPorQue: React.FC<{ b: Bloque }> = ({ b }) => {
  const c = useClimaBloque(b) as C; const t = useT();
  const dato = brief.datos_citados[0];
  if (dato || brief.plantilla === "dato") {
    return (
      <Camara>
        {dato ? <DatoConFuente c={c} dato={dato.dato} fuente={brief.fuente_en_pantalla || dato.fuente} desde={6} y={600} /> : null}
        <Suelo c={c} y={PISO} x={820} ancho={420} />
        <Lienzo><RepClima c={c} movimiento="senalar" t={t} x={820} y={PISO} escala={110} gesto={gestos(b)} espejo /></Lienzo>
        {brief.plantilla === "mito_realidad" ? <Sello tipo="realidad" desde={20} x={70} y={1060} ancho={460} /> : null}
      </Camara>
    );
  }
  const mov = MOVIMIENTOS[b.visual.rep]?.tipo === "ejercicio" ? b.visual.rep : principal;
  const musc = (ficha.musculos.length ? ficha.musculos : MOVIMIENTOS[mov].musculos).slice(0, 3);
  const props = { movimiento: mov, t, x: 700, y: PISO, escala: 165 };
  return (
    <Camara>
      <Suelo c={c} y={PISO} x={700} ancho={640} />
      <Lienzo><RepClima c={c} {...props} musculos={musc} gesto={gestos(b)} /></Lienzo>
      {musc.map((m, i) => (
        <Etiqueta key={m} c={c} texto={MUSCULOS[m]?.nombre ?? m} a={puntoDeRep(props, { musculo: m })} desde={14 + i * 18} lado="izq" dy={(i - (musc.length - 1) / 2) * 90} />
      ))}
      {brief.plantilla === "mito_realidad" ? <Sello tipo="realidad" desde={16} x={60} y={600} ancho={440} /> : null}
    </Camara>
  );
};

export const EscenaMetodo: React.FC<{ b: Bloque }> = ({ b }) => {
  const c = useClimaBloque(b) as C; const t = useT();
  const f = useCurrentFrame();
  const dur = b.fin_f - b.ini_f;
  const pasos = b.pasos ?? ficha.cues;
  const frames = pasos.map((_, i) => (b.pasos_f?.[i] != null ? (b.pasos_f[i] as number) - b.ini_f : Math.round((dur * (i + 0.3)) / pasos.length)));
  for (let i = 1; i < frames.length; i++) frames[i] = Math.max(frames[i], frames[i - 1] + 12);   // orden y respiro mínimo
  const mov = MOVIMIENTOS[b.visual.rep]?.tipo === "ejercicio" ? b.visual.rep : principal;
  if (brief.plantilla === "progresion") {
    const filas = ficha.progresion_ejemplo.slice(0, 4);
    const ff = filas.map((_, i) => Math.round(10 + (i * (dur - 40)) / filas.length));
    const fila = ff.filter((x) => f >= x).length;                    // semana visible → más discos
    return (
      <Camara>
        <Libreta c={c} titulo={ficha.ejercicios.find((e) => e.movimiento === mov)?.nombre ?? "sentadilla"} filas={filas} frames={ff} x={60} y={590} ancho={520} />
        <Suelo c={c} y={PISO} x={800} ancho={500} />
        <Lienzo><RepClima c={c} movimiento={mov} t={t} x={810} y={PISO} escala={150} musculos="auto" discos={1 + Math.max(0, fila - 1)} carga={filas[Math.max(0, fila - 1)] ? `${String(filas[Math.max(0, fila - 1)].kg).replace(".", ",")} kg` : undefined} /></Lienzo>
        {pasos.slice(0, 4).map((p, i) => <Chip key={i} c={c} texto={p} tipo="ok" desde={frames[i]} x={60 + (i % 2) * 270} y={1040 + Math.floor(i / 2) * 104} ancho={250} />)}
      </Camara>
    );
  }
  return (
    <Camara>
      <Pasos c={c} pasos={pasos.slice(0, 4)} frames={frames} x={60} y={600} ancho={500} />
      <Suelo c={c} y={PISO} x={810} ancho={480} />
      <Lienzo><RepClima c={c} movimiento={mov} t={t} x={820} y={PISO} escala={150} musculos="auto" gesto={gestos(b)} /></Lienzo>
    </Camara>
  );
};

export const EscenaResultado: React.FC<{ b: Bloque }> = ({ b }) => {
  const c = useClimaBloque(b) as C; const t = useT();
  const f = useCurrentFrame();
  const filas = ficha.progresion_ejemplo;
  const valores = filas.map((r) => r.kg * (1 + r.reps / 30));            // fuerza estimada (Epley): sube aunque el kg se repita
  const kg = (n: number) => String(n).replace(".", ",");
  const deltaKg = filas[filas.length - 1].kg - filas[0].kg;
  const deltaReps = filas[filas.length - 1].reps - filas[0].reps;
  const kpi = deltaKg > 0 ? `+${kg(Math.round(interpolate(f, [8, 30], [0, deltaKg], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * 2) / 2)} KG` : `+${Math.round(interpolate(f, [8, 30], [0, deltaReps], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }))} REPS`;
  return (
    <Camara>
      <Grafica c={c} valores={valores} etiquetas={filas.map((r) => `${kg(r.kg)}×${r.reps}`)} desde={4} x={60} y={600} ancho={560} alto={380} titulo="TU LIBRETA" />
      <div style={{ position: "absolute", left: 60, top: 1010, fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 120, color: IF.cian, lineHeight: 1 }}>{kpi}</div>
      <div style={{ position: "absolute", left: 66, top: 1140, fontFamily: FUENTE.mono, fontSize: 22, color: c.texto_suave, letterSpacing: "0.14em" }}>EN {filas.length} SEMANAS · EJEMPLO ILUSTRATIVO</div>
      <Suelo c={c} y={PISO} x={840} ancho={420} />
      <Lienzo><RepClima c={c} movimiento={b.visual.rep} t={t} x={850} y={PISO} escala={140} gesto={gestos(b)} musculos={b.visual.rep === "flex" ? ["biceps"] : "auto"} /></Lienzo>
    </Camara>
  );
};

export const EscenaCTA: React.FC<{ b: Bloque }> = ({ b }) => {
  const c = useClimaBloque(b) as C; const t = useT();
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = spring({ fps, frame: f, config: { damping: 13, stiffness: 150 } });
  const latido = 1 + Math.sin(f / 5) * 0.05;
  const palabra = brief.cta.toUpperCase();
  const tam = Math.min(140, Math.floor(820 / Math.max(1, palabra.length * 0.72)));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, top: 470, width: 900, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 400, fontSize: 64, color: IF.blanco,
        transform: `translateY(${(1 - e) * 60}px)`, opacity: Math.min(1, e) }}>COMENTA</div>
      <div style={{ position: "absolute", left: 540, top: 640, transform: `translate(-50%, 0) scale(${(0.6 + 0.4 * e) * latido})`, background: IF.cian, borderRadius: 36,
        padding: "26px 56px", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: tam, color: IF.grafito2, whiteSpace: "nowrap", boxShadow: `0 0 60px ${IF.cian}66` }}>{palabra}</div>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 525, top: 860 + i * 34 - ((f * 2) % 34), width: 0, height: 0, borderLeft: "16px solid transparent", borderRight: "16px solid transparent",
          borderBottom: `18px solid ${IF.cian}`, opacity: 0.25 + 0.25 * i }} />
      ))}
      {brief.logos.increasefit ? (
        <Img src={staticFile("logo_increasefit.png")} style={{ position: "absolute", left: 540 - 280, top: 1210, width: 560, opacity: interpolate(f, [10, 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }} />
      ) : (
        <div style={{ position: "absolute", left: 0, top: 1210, width: 1080, textAlign: "center", fontFamily: FUENTE.titulos, fontSize: 80 }}><span style={{ color: IF.blanco }}>INCREASE</span><span style={{ color: IF.cian, fontWeight: 800 }}>FIT</span></div>
      )}
      <Lienzo><RepClima c={c} movimiento={b.visual.rep} t={t} x={940} y={1330} escala={88} gesto={gestos(b)} sombra={false} /></Lienzo>
    </AbsoluteFill>
  );
};

export const ESCENAS: Record<Bloque["id"], React.FC<{ b: Bloque }>> = {
  gancho: EscenaGancho, error: EscenaError, por_que: EscenaPorQue, metodo: EscenaMetodo, resultado: EscenaResultado, cta: EscenaCTA,
};
void duracionRep;
