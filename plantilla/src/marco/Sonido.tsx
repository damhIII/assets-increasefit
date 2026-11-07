// Pista de audio: locución (manda), música en bucle con ducking bajo la voz, y efectos en sus frames (brief.sfx).
import React, { useMemo } from "react";
import { Audio, Sequence, staticFile } from "remotion";
import { brief, SONIDO } from "./datos";

/** Frames (globales) donde empieza un bloque nuevo. */
export const cambiosDeBloque = () => brief.planos.filter((p, i) => i > 0 && p.bloque !== brief.planos[i - 1].bloque).map((p) => p.ini_f);

export const Sonido: React.FC = () => {
  const fps = brief.video.fps;
  const total = brief.video.frames;
  // 1 = hay voz en ese frame (con márgenes), suavizado para que la música baje y suba sin saltos
  const voz = useMemo(() => {
    const v = new Float32Array(total);
    for (const [, a, b] of brief.subtitulos) {
      for (let f = Math.max(0, Math.floor((a - 0.15) * fps)); f < Math.min(total, Math.ceil((b + 0.3) * fps)); f++) v[f] = 1;
    }
    const s = new Float32Array(total);
    const R = 6;
    for (let f = 0; f < total; f++) {
      let n = 0, m = 0;
      for (let k = -R; k <= R; k++) if (f + k >= 0 && f + k < total) { n += v[f + k]; m++; }
      s[f] = n / m;
    }
    return s;
  }, [fps, total]);
  const pista = SONIDO.musica.find((m) => m.id === brief.musica);
  const archivoSfx = (id: string) => SONIDO.sfx.find((s) => s.id === id)?.archivo;
  // whoosh automático en cada cambio de bloque (con la cortinilla), salvo que ya haya un efecto pegado
  const auto = cambiosDeBloque().filter((F) => !brief.sfx.some((s) => Math.abs(s.frame - F) < 6)).map((F) => ({ id: "whoosh_corto", frame: F - 6, volumen: 0.45 }));
  return (
    <>
      {brief.audio ? <Audio src={staticFile(brief.audio)} /> : null}
      {pista ? (
        <Audio src={staticFile(`sonido/${pista.archivo}`)} loop
          volume={(f) => {
            const k = voz[Math.min(total - 1, Math.max(0, f))] ?? 0;
            const fin = Math.min(1, Math.max(0, (total - f) / 20));      // fundido final de 20 frames
            return (pista.volumen_sin_voz + (pista.volumen_bajo_voz - pista.volumen_sin_voz) * k) * fin;
          }} />
      ) : null}
      {[...brief.sfx, ...auto].map((s, i) => {
        const a = archivoSfx(s.id);
        return a ? (
          <Sequence key={i} from={Math.max(0, s.frame)} name={`sfx ${s.id}`} layout="none">
            <Audio src={staticFile(`sonido/${a}`)} volume={s.volumen} />
          </Sequence>
        ) : null;
      })}
    </>
  );
};
