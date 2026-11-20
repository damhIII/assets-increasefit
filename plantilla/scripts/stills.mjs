// Renderiza un fotograma por escena (+ la tarjeta resumen) con UN solo bundle y monta una hoja de contactos.
//   npm run stills                       → out/stills/<id>.png, out/stills/hoja.jpg y out/stills/hoja_zonas.jpg
//                                          (hoja_zonas: en rojo lo que tapa Instagram, en naranja los márgenes laterales
//                                           que Instagram puede recortar, en azul el sitio de los subtítulos)
//   npm run stills -- --frames=120,480   → solo esos frames
//   npm run stills -- --browser=/usr/bin/google-chrome   (si no se puede descargar Chrome Headless Shell)
//   npm run stills -- --cada=0.5         → un fotograma cada 0,5 s en out/movimiento/ + out/movimiento/hoja_movimiento.jpg
//                                          (para juzgar el RITMO: huecos muertos, cortes, entradas)
//   npm run margenes                     → modo revisión de la ZONA SEGURA: fondo negro, decorativos apagados, cámara quieta,
//                                          un fotograma por segundo en out/margenes/ y scripts/revisar_margenes.py los analiza
//                                          (sale con error si algo se mete en los márgenes laterales o en los botones)
import { bundle } from "@remotion/bundler";
import { renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const raiz = process.cwd();
const video = JSON.parse(readFileSync(path.join(raiz, "src/video.json"), "utf-8"));
const margenes = process.argv.includes("--margenes");
const cada = arg("cada") ? Number(arg("cada")) : margenes ? 1.0 : null;
let objetivos = video.escenas.map((e) => ({ id: e.id, frame: Math.min(e.fin_f - 1, e.ini_f + 18) }));
if (video.tarjeta_resumen) objetivos.push({ id: "resumen", frame: video.video.frames - 5 });
if (arg("frames")) objetivos = arg("frames").split(",").map((f) => ({ id: `f${f}`, frame: Number(f) }));
if (cada) {
  const paso = Math.max(1, Math.round(cada * video.video.fps));
  objetivos = [];
  const tarjeta = video.tarjeta_resumen?.ini_f ?? Infinity;
  for (let f = 0, i = 0; f < video.video.frames; f += paso, i++) objetivos.push({ id: `${margenes && f >= tarjeta ? "tarjeta_" : ""}f${String(i).padStart(4, "0")}`, frame: f });
  // en modo márgenes, además el fotograma de reposo de cada escena (cuando ya entró todo)
  if (margenes) for (const e of video.escenas) objetivos.push({ id: `escena_${e.id}`, frame: Math.min(e.fin_f - 1, e.ini_f + 40) });
}
const inputProps = margenes ? { revision: "margenes" } : {};

const salida = path.join(raiz, margenes ? "out/margenes" : cada ? "out/movimiento" : "out/stills");
mkdirSync(salida, { recursive: true });
const browserExecutable = arg("browser") ?? process.env.REMOTION_BROWSER ?? null;
const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "public") });
const composition = await selectComposition({ serveUrl, id: "Video", browserExecutable, inputProps });
for (const o of objetivos) {
  const output = path.join(salida, `${o.id}.png`);
  await renderStill({ serveUrl, composition, frame: o.frame, output, browserExecutable, inputProps });
  console.log(`${o.id}: frame ${o.frame} → ${path.relative(raiz, output)}`);
}
if (margenes) {
  // busca scripts/revisar_margenes.py subiendo desde el proyecto (videos/<BASE> → raíz del repo)
  let dir = raiz, script = null;
  for (let k = 0; k < 4 && !script; k++, dir = path.dirname(dir)) {
    const cand = path.join(dir, "scripts/revisar_margenes.py");
    if (existsSync(cand)) script = cand;
  }
  if (!script) { console.log("no encuentro scripts/revisar_margenes.py: ejecútalo a mano sobre out/margenes"); process.exit(0); }
  try {
    execFileSync("python3", [script, salida], { stdio: "inherit" });
  } catch {
    process.exit(1);
  }
  process.exit(0);
}
if (cada) {
  try {
    const cols = 10, filas = Math.ceil(objetivos.length / cols);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "1", "-i", path.join(salida, "f%04d.png"),
      "-vf", `scale=216:384,tile=${cols}x${filas}:padding=4:color=black`, "-frames:v", "1", path.join(salida, "hoja_movimiento.jpg")]);
    console.log(`hoja de movimiento (${objetivos.length} fotogramas, uno cada ${cada} s) → out/movimiento/hoja_movimiento.jpg`);
  } catch {
    console.log("sin ffmpeg: mira los PNG sueltos");
  }
  process.exit(0);
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
  // Misma hoja con las zonas de la interfaz de Instagram encima (px sobre 1080×1920): arriba nombre y foto de perfil,
  // abajo nombre/descripción/audio, a la derecha la columna de botones. En naranja, los márgenes laterales que Instagram
  // puede recortar al adaptar el Reel a la pantalla (MARGEN = MARGEN_LADOS de src/marco/datos.ts). En azul, los subtítulos.
  const MARGEN = 120;
  const ZONAS = [
    "drawbox=x=0:y=0:w=1080:h=260:color=red@0.35:t=fill",
    "drawbox=x=0:y=1540:w=1080:h=380:color=red@0.35:t=fill",
    "drawbox=x=900:y=1100:w=180:h=440:color=red@0.35:t=fill",
    `drawbox=x=0:y=260:w=${MARGEN}:h=1280:color=orange@0.35:t=fill`,
    `drawbox=x=${1080 - MARGEN}:y=260:w=${MARGEN}:h=840:color=orange@0.35:t=fill`,
    `drawbox=x=${MARGEN}:y=300:w=${1080 - 2 * MARGEN}:h=200:color=0x1FB7DE@0.9:t=6`,
  ].join(",");
  const escalasZ = objetivos.map((_, i) => `[${i}:v]${ZONAS},scale=270:480[s${i}]`).join(";");
  const filtroZ = n > 1 ? `${escalasZ};${lienzo}xstack=inputs=${n}:layout=${pos}:fill=black` : `[0:v]${ZONAS},scale=270:480`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...entradas, "-filter_complex", filtroZ, "-frames:v", "1", path.join(salida, "hoja_zonas.jpg")]);
  console.log("zonas de Instagram encima → out/stills/hoja_zonas.jpg");
} catch {
  console.log("sin ffmpeg: mira los PNG sueltos");
}
