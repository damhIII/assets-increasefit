// Escena de un plano (una frase de la voz). Lee plano.visual y plano.overlays y los compone; el frame es LOCAL al plano.
import React from "react";
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { brief, frameDePalabra, FUENTE, IF, type Overlay, type Plano } from "../marco/datos";
import { useClimaPlano } from "../marco/clima";
import { ancla, colocar, fasesDe, Mascota } from "../personaje/Sprite";
import { BurbujaDialogo, BurbujaPensamiento, CajaTachada, Capitulo, Circulo, Dato, Efecto, Etiqueta, Grafica, Inserto, Libreta, Lista, Marca } from "../componentes/kit";
import { EXTRA } from "./extra";

/** Cámara viva: flota y hace punch-in en un frame local. */
const Camara: React.FC<{ children: React.ReactNode; punch: number | null; origen: [number, number] }> = ({ children, punch, origen }) => {
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

export const EscenaPlano: React.FC<{ p: Plano; anterior?: Plano }> = ({ p, anterior }) => {
  const c = useClimaPlano(p);
  const v = p.visual;
  const local = (o: Overlay, i: number) => (o.palabra_f != null ? Math.max(0, o.palabra_f - p.ini_f) : 6 + i * 8);
  const punchGlobal = p.enfasis.map((w) => frameDePalabra(p, w)).find((x) => x !== null) ?? null;
  const punch = punchGlobal !== null ? punchGlobal - p.ini_f : null;
  const Extra = EXTRA[p.id];

  if (p.pantalla.estilo === "capitulo") {
    return <AbsoluteFill><Capitulo texto={p.pantalla.texto} c={c} />{Extra ? <Extra p={p} c={c} /> : null}</AbsoluteFill>;
  }

  // Pantalla dividida: ASÍ NO (sprite) | ASÍ SÍ (sprite_b)
  if (v.sprite_b) {
    const izq = colocar(fasesDe(v.sprite)[0], "general", "izq", false, 0.68, 280);
    const der = colocar(fasesDe(v.sprite_b)[0], "general", "der", false, 0.68, 800);
    return (
      <Camara punch={punch} origen={[540, 1000]}>
        <div style={{ position: "absolute", left: 30, top: 560, width: 495, height: 790, borderRadius: 30, background: `${IF.alerta}1A`, border: `3px solid ${IF.alerta}66` }} />
        <div style={{ position: "absolute", left: 555, top: 560, width: 495, height: 790, borderRadius: 30, background: `${IF.exito}1A`, border: `3px solid ${IF.exito}66` }} />
        <div style={{ position: "absolute", left: 30, top: 585, width: 495, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 44, color: IF.alerta }}>ASÍ NO</div>
        <div style={{ position: "absolute", left: 555, top: 585, width: 495, textAlign: "center", fontFamily: FUENTE.titulos, fontWeight: 800, fontSize: 44, color: IF.exito }}>ASÍ SÍ</div>
        <Mascota sprite={v.sprite} anim={v.sprite.startsWith("error_") ? "temblor" : v.anim} colocacion={izq} />
        <Mascota sprite={v.sprite_b} anim={v.sprite_b.startsWith("ejercicio:") ? "ejercicio" : "pop"} colocacion={der} desde={6} />
        <Marca tipo="cruz" x={470} y={680} desde={10} size={110} />
        <Marca tipo="check" x={995} y={680} desde={16} size={110} />
        {Extra ? <Extra p={p} c={c} /> : null}
      </Camara>
    );
  }

  const columna = p.overlays.some((o) => COLUMNA.has(o.tipo));
  const info = fasesDe(v.sprite)[0];
  const col = colocar(info, columna ? "general" : v.encuadre, columna ? "der" : v.posicion, !!v.espejo, columna ? 0.82 : 1);
  const continua = !!anterior && anterior.visual.sprite === v.sprite && anterior.visual.encuadre === v.encuadre && anterior.visual.posicion === v.posicion && !anterior.visual.sprite_b;
  const cabeza = ancla(col, "cabeza");
  const centroX = col.x + (col.w * col.k) / 2;
  const libre = centroX > 540 ? "izq" : "der";
  const anim = v.sprite.startsWith("ejercicio:") ? "ejercicio" : v.anim;

  const detras = p.overlays.map((o, i) => (o.tipo === "lineas_velocidad" || o.tipo === "enfoque" ? <Efecto key={`d${i}`} tipo={o.tipo} a={ancla(col, "centro")} desde={local(o, i)} c={c} /> : null));
  const delante = p.overlays.map((o, i) => {
    const t = local(o, i);
    switch (o.tipo) {
      case "etiqueta": return <Etiqueta key={i} texto={o.texto ?? ""} a={ancla(col, o.apunta ?? "centro")} desde={t} c={c} />;
      case "tachado": return <CajaTachada key={i} texto={o.texto ?? ""} x={libre === "izq" ? 60 : 540} y={Math.max(580, cabeza[1] - 40)} desde={t} />;
      case "circulo": return <Circulo key={i} a={ancla(col, o.apunta ?? "centro")} desde={t} />;
      case "check": case "cruz": return <Marca key={i} tipo={o.tipo} x={Math.min(990, col.x + col.w * col.k - 30)} y={Math.max(620, cabeza[1] - 60)} desde={t} />;
      case "burbuja_pensamiento": return <BurbujaPensamiento key={i} sprite={o.sprite ?? "gesto_celebrar"} x={libre === "izq" ? Math.max(40, cabeza[0] - 520) : Math.min(580, cabeza[0] + 60)} y={Math.max(560, cabeza[1] - 330)} desde={t} />;
      case "burbuja_dialogo": return <BurbujaDialogo key={i} texto={o.texto ?? ""} espejo={libre === "izq"} x={libre === "izq" ? Math.max(30, cabeza[0] - 520) : Math.min(570, cabeza[0] + 40)} y={Math.max(560, cabeza[1] - 330)} desde={t} />;
      case "dato": return <Dato key={i} texto={o.texto ?? ""} detalle={o.detalle} fuente={brief.fuente_en_pantalla || undefined} desde={t} c={c} />;
      case "lista": {
        const n = (o.items ?? []).length || 1;
        const dur = p.fin_f - p.ini_f;
        return <Lista key={i} items={o.items ?? []} frames={(o.items ?? []).map((_, k) => t + Math.round(((dur - t) * k) / n))} c={c} />;
      }
      case "libreta": {
        const dur = p.fin_f - p.ini_f;
        const nombre = brief.ficha_tecnica.ejercicios[0]?.nombre ?? "entreno";
        return <Libreta key={i} c={c} titulo={nombre} frames={[0, 1, 2, 3].map((k) => t + Math.round(((dur - t - 10) * k) / 4))} />;
      }
      case "grafica": return <Grafica key={i} c={c} desde={t} />;
      case "rec": case "impacto": case "sudor": case "destello": return <Efecto key={i} tipo={o.tipo} a={cabeza} desde={t} c={c} />;
      default: return null;
    }
  });

  return (
    <Camara punch={punch} origen={cabeza}>
      {v.encuadre === "general" && !["cara", "mano", "plano_medio"].includes(info.categoria) ? (
        <div style={{ position: "absolute", left: centroX - 330, top: 1250, width: 660, height: 150, background: `radial-gradient(ellipse 50% 40% at 50% 50%, rgba(0,0,0,${c.claridad > 0.5 ? 0.12 : 0.35}) 0%, transparent 100%)` }} />
      ) : null}
      {detras}
      <Mascota sprite={v.sprite} anim={anim} colocacion={col} continua={continua} />
      {delante}
      {v.inserto ? <Inserto cara={v.inserto} desde={4} c={c} x={libre === "izq" ? 250 : 830} /> : null}
      {Extra ? <Extra p={p} c={c} /> : null}
    </Camara>
  );
};

