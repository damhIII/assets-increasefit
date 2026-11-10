// Composición: Fondo → una escena por <Sequence> (EXACTAMENTE ini_f–fin_f) → cortinillas → tarjeta resumen → marco IncreaseFit
// (isotipo arriba, subtítulos bajo el isotipo, texto en pantalla abajo) → sonido.
import React from "react";
import { AbsoluteFill, interpolate, Sequence, useCurrentFrame } from "remotion";
import { datos, IF } from "./marco/datos";
import { useFuentes } from "./marco/Fuentes";
import { climaEnFrame, type C } from "./marco/clima";
import { Fondo } from "./marco/Fondo";
import { BarraProgreso } from "./marco/BarraProgreso";
import { Header } from "./marco/Header";
import { TextoPantalla } from "./marco/TextoPantalla";
import { Subtitulos } from "./marco/Subtitulos";
import { Sonido } from "./marco/Sonido";
import { EscenaVideo } from "./escenas/Escena";
import { CortinillaPincel, TarjetaResumen } from "./componentes/kit";

// El clima se calcula con el frame GLOBAL (dentro de la <Sequence> useCurrentFrame es local y daría el de la 1.ª escena).
const Resumen: React.FC<{ c: C }> = ({ c }) => {
  const t = datos.tarjeta_resumen!;
  return <TarjetaResumen c={c} tema={t.tema} pregunta={t.pregunta} veredicto={t.veredicto} tono={t.tono} pasos={t.pasos} fuente={t.fuente} />;
};

export const Video: React.FC = () => {
  useFuentes();
  const f = useCurrentFrame();
  const tr = datos.tarjeta_resumen;
  const conResumen = tr && f >= tr.ini_f;
  const ultima = datos.subtitulos[datos.subtitulos.length - 1];
  const vozActiva = !!ultima && f / datos.video.fps <= ultima[2] + 0.05;
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
          <Resumen c={climaEnFrame(f)} />
        </Sequence>
      ) : null}
      <Header />
      {conResumen ? null : <TextoPantalla />}
      {/* Con la tarjeta en pantalla: si la voz ya terminó, fuera subtítulos; si aún habla (tarjeta con "desde"), bajan bajo la tarjeta */}
      {conResumen && !vozActiva ? null : <Subtitulos top={conResumen ? 1470 : undefined} />}
      {datos.opciones?.barra_progreso ? <BarraProgreso /> : null}
      <Sonido />
    </AbsoluteFill>
  );
};
