// Carga las fuentes de la marca (CSS con woff2 en base64, en public/fonts/css) antes del primer frame.
import { useEffect, useState } from "react";
import { continueRender, delayRender, staticFile } from "remotion";
import { datos } from "./datos";

export const useFuentes = () => {
  const [h] = useState(() => delayRender("Cargando fuentes IncreaseFit"));
  useEffect(() => {
    Promise.all(
      datos.fuentes.filter((f) => f.css).map(async (f) => {
        const css = await fetch(staticFile(f.css!)).then((r) => r.text());
        const st = document.createElement("style");
        st.textContent = css;
        document.head.appendChild(st);
        await Promise.all((f.pesos ?? [400, 700]).map((w) => document.fonts.load(`${w} 40px "${f.familia}"`)));
      }),
    ).then(() => continueRender(h)).catch((e) => { console.error("fuentes", e); continueRender(h); });
  }, [h]);
};
