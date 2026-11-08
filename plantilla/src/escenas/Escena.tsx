// Composición por defecto de una escena: lee escena.mascota / dividida / anotaciones / inserto y los dibuja con el kit.
// Si la escena tiene "componente", su .tsx (src/escenas/custom/) se dibuja encima; con "solo_componente" lo sustituye todo.
// Dentro de la escena el frame es LOCAL (0 = inicio de la escena).
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { datos, FUENTE, IF, type Anotacion, type Escena } from "../marco/datos";
import { useClimaEscena, type C } from "../marco/clima";
import { ancla, colocar, fasesDe, Mascota } from "../personaje/Sprite";
import { BurbujaDialogo, BurbujaPensamiento, CajaTachada, Capitulo, Circulo, Dato, Efecto, Etiqueta, Grafica, Inserto, Libreta, Lista, Marca } from "../componentes/kit";
import { CUSTOM } from "./custom";

/** Cámara viva: flota y hace punch-in en un frame local. */
export const Camara: React.FC<{ children: React.ReactNode; punch: number | null; origen: [number, number] }> = ({ children, punch, origen }) => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = punch !== null ? spring({ fps, frame: f - punch, config: { damping: 12, stiffness: 200 } }) : 0;
  const s = 1 + 0.055 * p;
  return (
    <AbsoluteFill style={{ transform: `translateY(${Math.sin(f / 12) * 5}px) rotate(${Math.sin(f / 40) * 0.35}deg) scale(${s})`, transformOrigin: `${origen[0]}px ${origen[1]}px` }}>
      {children}
    </AbsoluteFill>
  );
};

const COLUMNA = new Set(["dato", "lista", "libreta", "grafica"]);

const Custom: React.FC<{ e: Escena; c: C }> = ({ e, c }) => {
  const Comp = e.componente ? CUSTOM[e.componente] : undefined;
  return Comp ? <Comp e={e} c={c} /> : null;
};

export const EscenaVideo: React.FC<{ e: Escena; anterior?: Escena }> = ({ e, anterior }) => {
  const c = useClimaEscena(e);
  const local = (o: Anotacion) => Math.max(0, o.en_f - e.ini_f);
  const punch = e.enfasis_f.length ? e.enfasis_f[0] - e.ini_f : null;

  if (e.solo_componente) return <AbsoluteFill><Custom e={e} c={c} /></AbsoluteFill>;

  if (e.pantalla.estilo === "capitulo") {
    return <AbsoluteFill><Capitulo texto={e.pantalla.texto} c={c} /><Custom e={e} c={c} /></AbsoluteFill>;
  }

  // Pantalla dividida: ASÍ NO | ASÍ SÍ
  if (e.dividida) {
    const { no, si } = e.dividida;
    const izq = colocar(fasesDe(no)[0], "general", "izq", false, 0.68, 280);
    const der = colocar(fasesDe(si)[0], "general", "der", false, 0.68, 800);
    return (
      <Camara punch={punch} origen={[540, 1000]}>
        <div style={{ position: "absolute", left: 30, top: 560, width: 495, height: 790, borderRadius: 30, background: `${IF.alerta}1A`, border: `3px solid ${IF.alerta}66` }} />
        <div style={{ position: "absolute", left: 555, top: 560, width: 495, height: 790, borderRadius: 30, background: `${IF.exito}1A`, border: `3px solid ${IF.exito}66` }} />
        <div style={{ position: "absolute", left: 30, top: 585, width: 495, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 44, color: IF.alerta }}>ASÍ NO</div>
        <div style={{ position: "absolute", left: 555, top: 585, width: 495, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 44, color: IF.exito }}>ASÍ SÍ</div>
        <Mascota sprite={no} anim={no.startsWith("ejercicio:") ? "ejercicio" : "temblor"} colocacion={izq} />
        <Mascota sprite={si} anim={si.startsWith("ejercicio:") ? "ejercicio" : "pop"} colocacion={der} desde={6} />
        <Marca tipo="cruz" x={470} y={680} desde={10} size={110} />
        <Marca tipo="check" x={995} y={680} desde={16} size={110} />
        <Custom e={e} c={c} />
      </Camara>
    );
  }

  const v = e.mascota;
  const columna = e.anotaciones.some((o) => COLUMNA.has(o.tipo));
  const info = fasesDe(v?.sprite ?? "gesto_de_pie")[0];
  const col = colocar(info, columna ? "general" : v?.encuadre ?? "general", columna ? "der" : v?.posicion ?? "centro", !!v?.espejo, columna ? 0.82 : 1);
  const continua = !!v && !!anterior?.mascota && anterior.mascota.sprite === v.sprite && anterior.mascota.encuadre === v.encuadre && anterior.mascota.posicion === v.posicion && !anterior.dividida;
  const cabeza = ancla(col, "cabeza");
  const centroX = col.x + (col.w * col.k) / 2;
  const libre = !v ? "der" : centroX > 540 ? "izq" : "der";
  const dur = e.fin_f - e.ini_f;

  const detras = e.anotaciones.map((o, i) => (o.tipo === "lineas_velocidad" || o.tipo === "enfoque" ? <Efecto key={`d${i}`} tipo={o.tipo} a={ancla(col, "centro")} desde={local(o)} c={c} /> : null));
  const delante = e.anotaciones.map((o, i) => {
    const t = local(o);
    switch (o.tipo) {
      case "etiqueta": return <Etiqueta key={i} texto={o.texto ?? ""} a={ancla(col, o.apunta ?? "centro")} desde={t} c={c} />;
      case "tachado": return <CajaTachada key={i} texto={o.texto ?? ""} x={libre === "izq" ? 60 : 540} y={Math.max(580, cabeza[1] - 40)} desde={t} />;
      case "circulo": return <Circulo key={i} a={ancla(col, o.apunta ?? "centro")} desde={t} />;
      case "check": case "cruz": return <Marca key={i} tipo={o.tipo} x={Math.min(990, col.x + col.w * col.k - 30)} y={Math.max(620, cabeza[1] - 60)} desde={t} />;
      case "burbuja_pensamiento": return <BurbujaPensamiento key={i} sprite={o.sprite ?? "gesto_celebrar"} x={libre === "izq" ? Math.max(40, cabeza[0] - 520) : Math.min(580, cabeza[0] + 60)} y={Math.max(560, cabeza[1] - 330)} desde={t} />;
      case "burbuja_dialogo": return <BurbujaDialogo key={i} texto={o.texto ?? ""} espejo={libre === "izq"} x={libre === "izq" ? Math.max(30, cabeza[0] - 520) : Math.min(570, cabeza[0] + 40)} y={Math.max(560, cabeza[1] - 330)} desde={t} />;
      case "dato": return <Dato key={i} texto={o.texto ?? ""} detalle={o.detalle} fuente={o.fuente ?? (o.ilustrativo ? "EJEMPLO ILUSTRATIVO" : undefined)} desde={t} c={c} />;
      case "lista": {
        const n = (o.items ?? []).length || 1;
        return <Lista key={i} items={o.items ?? []} frames={(o.items ?? []).map((_, k) => t + Math.round(((dur - t) * k) / n))} c={c} />;
      }
      case "libreta": {
        const filas = datos.progresion.slice(0, 4);
        return <Libreta key={i} c={c} titulo={o.texto ?? "entreno"} frames={filas.map((_, k) => t + Math.round(((dur - t - 10) * k) / filas.length))} />;
      }
      case "grafica": return <Grafica key={i} c={c} desde={t} />;
      case "rec": case "impacto": case "sudor": case "destello": return <Efecto key={i} tipo={o.tipo} a={cabeza} desde={t} c={c} />;
      default: return null;
    }
  });

  return (
    <Camara punch={punch} origen={cabeza}>
      {v && v.encuadre === "general" && !["cara", "mano", "plano_medio"].includes(info.categoria) ? (
        <div style={{ position: "absolute", left: centroX - 330, top: 1250, width: 660, height: 150, background: `radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,0,0,${c.claridad > 0.5 ? 0.12 : 0.35}) 0%, transparent 100%)` }} />
      ) : null}
      {detras}
      {v ? <Mascota sprite={v.sprite} anim={v.anim} colocacion={col} continua={continua} /> : null}
      {delante}
      {e.inserto ? <Inserto cara={e.inserto.cara} desde={Math.max(0, e.inserto.en_f - e.ini_f)} c={c} x={libre === "izq" ? 250 : 830} /> : null}
      <Custom e={e} c={c} />
    </Camara>
  );
};
