// Composición: Fondo → un plano por <Sequence> (EXACTAMENTE ini_f–fin_f) → cortinillas → tarjeta resumen → marco IncreaseFit → sonido.
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { brief } from "./marco/datos";
import { useFuentes } from "./marco/Fuentes";
import { useClima } from "./marco/clima";
import { Fondo } from "./marco/Fondo";
import { BarraProgreso } from "./marco/BarraProgreso";
import { Header } from "./marco/Header";
import { TextoPantalla } from "./marco/TextoPantalla";
import { Subtitulos } from "./marco/Subtitulos";
import { Sonido, cambiosDeBloque } from "./marco/Sonido";
import { EscenaPlano } from "./escenas/Plano";
import { CortinillaPincel, TarjetaResumen } from "./componentes/kit";

const Resumen: React.FC = () => {
  const c = useClima();
  const t = brief.tarjeta_resumen!;
  return <TarjetaResumen titulo={t.titulo} lineas={t.lineas} c={c} />;
};

export const Video: React.FC = () => {
  useFuentes();
  const f = useCurrentFrame();
  const tr = brief.tarjeta_resumen;
  const conResumen = tr && f >= tr.ini_f;
  return (
    <AbsoluteFill style={{ background: "#0A0E12" }}>
      <Fondo />
      <AbsoluteFill style={{ opacity: tr ? interpolate(f, [tr.ini_f, tr.ini_f + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1 }}>
        {brief.planos.map((p, i) => (
          <Sequence key={p.id} from={p.ini_f} durationInFrames={p.fin_f - p.ini_f} name={`${p.id} · ${p.bloque}`}>
            <EscenaPlano p={p} anterior={brief.planos[i - 1]} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {cambiosDeBloque().map((F) => (
        <Sequence key={`c${F}`} from={F - 8} durationInFrames={16} name="cortinilla">
          <CortinillaPincel />
        </Sequence>
      ))}
      {tr ? (
        <Sequence from={tr.ini_f} name="tarjeta resumen">
          <Resumen />
        </Sequence>
      ) : null}
      <Header />
      {conResumen ? null : <TextoPantalla />}
      <Subtitulos />
      {brief.opciones?.barra_progreso ? <BarraProgreso /> : null}
      <Sonido />
    </AbsoluteFill>
  );
};
