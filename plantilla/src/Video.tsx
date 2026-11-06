// Composición principal: capas Fondo → escena del bloque (una <Sequence> por bloque con EXACTAMENTE ini_f–fin_f) → marco IncreaseFit.
import React from "react";
import { AbsoluteFill, Audio, Sequence, staticFile } from "remotion";
import { brief } from "./marco/datos";
import { useFuentes } from "./marco/Fuentes";
import { Fondo } from "./marco/Fondo";
import { BarraProgreso } from "./marco/BarraProgreso";
import { Header } from "./marco/Header";
import { Titular } from "./marco/Titular";
import { Subtitulos } from "./marco/Subtitulos";
import { ESCENAS } from "./escenas";

export const Video: React.FC = () => {
  useFuentes();
  return (
    <AbsoluteFill style={{ background: "#0A0E12" }}>
      <Fondo />
      {brief.bloques.map((b) => {
        const Escena = ESCENAS[b.id];
        return (
          <Sequence key={b.id} from={b.ini_f} durationInFrames={b.fin_f - b.ini_f} name={b.id}>
            <Escena b={b} />
          </Sequence>
        );
      })}
      <Header />
      <Titular />
      <Subtitulos />
      <BarraProgreso />
      {brief.audio ? <Audio src={staticFile(brief.audio)} /> : null}
    </AbsoluteFill>
  );
};
