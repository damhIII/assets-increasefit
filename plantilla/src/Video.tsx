// Composición: Fondo → una escena por <Sequence> (EXACTAMENTE ini_f–fin_f) → cortinillas → tarjeta resumen → marco IncreaseFit → sonido.
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { datos, IF } from "./marco/datos";
import { useFuentes } from "./marco/Fuentes";
import { useClima } from "./marco/clima";
import { Fondo } from "./marco/Fondo";
import { BarraProgreso } from "./marco/BarraProgreso";
import { Header } from "./marco/Header";
import { TextoPantalla } from "./marco/TextoPantalla";
import { Subtitulos } from "./marco/Subtitulos";
import { Sonido } from "./marco/Sonido";
import { EscenaVideo } from "./escenas/Escena";
import { CortinillaPincel, TarjetaResumen } from "./componentes/kit";

const Resumen: React.FC = () => {
  const c = useClima();
  const t = datos.tarjeta_resumen!;
  return <TarjetaResumen titulo={t.titulo} lineas={t.lineas} c={c} />;
};

export const Video: React.FC = () => {
  useFuentes();
  const f = useCurrentFrame();
  const tr = datos.tarjeta_resumen;
  const conResumen = tr && f >= tr.ini_f;
  return (
    <AbsoluteFill style={{ background: IF.grafito2 }}>
      <Fondo />
      <AbsoluteFill style={{ opacity: tr ? interpolate(f, [tr.ini_f, tr.ini_f + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1 }}>
        {datos.escenas.map((e, i) => (
          <Sequence key={e.id} from={e.ini_f} durationInFrames={e.fin_f - e.ini_f} name={e.id}>
            <EscenaVideo e={e} anterior={datos.escenas[i - 1]} />
          </Sequence>
        ))}
      </AbsoluteFill>
      {datos.cortinillas.map((F) => (
        <Sequence key={`c${F}`} from={Math.max(0, F - 8)} durationInFrames={16} name="cortinilla">
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
      {datos.opciones?.barra_progreso ? <BarraProgreso /> : null}
      <Sonido />
    </AbsoluteFill>
  );
};
