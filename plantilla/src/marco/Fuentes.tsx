// Carga las fuentes de la marca (CSS con woff2 en base64, en public/fonts/css) antes del primer frame y comprueba que
// cargaron de verdad (Open Sans 800, JetBrains Mono y Kalam, con todos los pesos de brand/fuentes.json). Si alguna falla, el
// render se cancela con un error claro (cancelRender) en vez de salir con la serif del navegador.
import { useEffect, useState } from "react";
import { cancelRender, continueRender, delayRender, staticFile } from "remotion";
import { datos } from "./datos";

/** ¿Está cargada `familia` en ese peso? document.fonts.check() también da true si la familia ni siquiera existe (cae a una
 *  fuente del sistema), así que además se busca una cara de esa familia ya cargada cuyo rango de pesos incluya `peso`. */
const cargada = (familia: string, peso: number) => {
  if (!document.fonts.check(`${peso} 40px "${familia}"`)) return false;
  let ok = false;
  document.fonts.forEach((ff) => {
    if (ok || ff.status !== "loaded" || ff.family.replace(/["']/g, "") !== familia) return;
    const [a, b = a] = String(ff.weight).split(/\s+/).map((w) => (w === "normal" ? 400 : w === "bold" ? 700 : Number(w)));
    ok = peso >= a && peso <= b;
  });
  return ok;
};

export const useFuentes = () => {
  const [h] = useState(() => delayRender("Cargando fuentes IncreaseFit"));
  useEffect(() => {
    const fuentes = datos.fuentes.filter((f) => f.css);
    Promise.all(
      fuentes.map(async (f) => {
        const r = await fetch(staticFile(f.css!));
        if (!r.ok) throw new Error(`no se pudo leer ${f.css} (HTTP ${r.status})`);
        const st = document.createElement("style");
        st.textContent = await r.text();
        document.head.appendChild(st);
        await Promise.all((f.pesos ?? [400, 700]).map((w) => document.fonts.load(`${w} 40px "${f.familia}"`)));
      }),
    )
      .then(() => {
        const faltan = fuentes.flatMap((f) => (f.pesos ?? [400, 700]).filter((w) => !cargada(f.familia, w)).map((w) => `${f.familia} ${w}`));
        if (faltan.length) throw new Error(`no cargaron ${faltan.join(", ")}`);
        continueRender(h);
      })
      .catch((e) => cancelRender(new Error(`Fuentes IncreaseFit: ${e instanceof Error ? e.message : String(e)}. `
        + "Sin ellas el video saldría con la serif del navegador: repite python3 scripts/preparar_video.py (copia public/fonts/css).")));
  }, [h]);
};
