// Renderiza un fotograma por escena (+ la tarjeta resumen) con UN solo bundle y monta una hoja de contactos.
//   npm run stills                       → out/stills/<id>.png y out/stills/hoja.jpg
//   npm run stills -- --frames=120,480   → solo esos frames
//   npm run stills -- --browser=/usr/bin/google-chrome   (si no se puede descargar Chrome Headless Shell)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const raiz = process.cwd();
const video = JSON.parse(readFileSync(path.join(raiz, "src/video.json"), "utf-8"));
let objetivos = video.escenas.map((e) => ({ id: e.id, frame: Math.min(e.fin_f - 1, e.ini_f + 18) }));
if (video.tarjeta_resumen) objetivos.push({ id: "resumen", frame: video.video.frames - 5 });
if (arg("frames")) objetivos = arg("frames").split(",").map((f) => ({ id: `f${f}`, frame: Number(f) }));

const salida = path.join(raiz, "out/stills");
mkdirSync(salida, { recursive: true });
const browserExecutable = arg("browser") ?? process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "public") });
const composition = await selectComposition({ serveUrl, id: "Video", browserExecutable });
for (const o of objetivos) {
  const output = path.join(salida, `${o.id}.png`);
  await renderStill({ serveUrl, composition, frame: o.frame, output, browserExecutable });
  console.log(`${o.id}: frame ${o.frame} → ${path.relative(raiz, output)}`);
}
try {
  const entradas = objetivos.flatMap((o) => ["-i", path.join(salida, `${o.id}.png`)]);
  const n = objetivos.length, cols = Math.min(5, n), filas = Math.ceil(n / cols);
  const escalas = objetivos.map((_, i) => `[${i}:v]scale=270:480[s${i}]`).join(";");
  const lienzo = objetivos.map((_, i) => `[s${i}]`).join("");
  const pos = objetivos.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join("|");
  const filtro = n > 1 ? `${escalas};${lienzo}xstack=inputs=${n}:layout=${pos}:fill=black` : "[0:v]scale=270:480";
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...entradas, "-filter_complex", filtro, "-frames:v", "1", path.join(salida, "hoja.jpg")]);
  console.log(`hoja de contactos (${cols}×${filas}) → out/stills/hoja.jpg`);
} catch {
  console.log("sin ffmpeg: mira los PNG sueltos");
}
