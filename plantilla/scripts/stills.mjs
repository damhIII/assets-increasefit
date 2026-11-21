// Fotogramas del video con UN solo bundle y UN solo navegador. Imprime una línea de resumen (--verbose: una por fotograma).
//   npm run revisar                      → revisión automática antes de renderizar (scripts/revisar_video.py):
//                                          · modo revisión (fondo liso, sin subtítulos ni texto en pantalla, decorativos apagados,
//                                            cámara quieta): un fotograma por segundo + el reposo de cada escena → out/revision/revision/
//                                          · modo normal: un fotograma cada 0,5 s → out/revision/normal/ (momentos muertos)
//                                          Imprime una línea por problema y sale con error si hay alguno.
//   npm run stills                       → un PNG por escena + la tarjeta en out/stills/, hoja.jpg y hoja_zonas.jpg
//                                          (hoja_zonas: en rojo lo que tapa Instagram, en naranja los márgenes laterales
//                                           que Instagram puede recortar, en azul el sitio de los subtítulos)
//   npm run stills -- --frames=120,480   → solo esos frames
//   npm run movimiento                   → (opcional, si dudas del ritmo) uno cada 0,5 s en out/movimiento/ + hoja_movimiento.jpg
//   --browser=/usr/bin/google-chrome     (o REMOTION_BROWSER) si no se puede descargar Chrome Headless Shell
//   --concurrencia=N                     fotogramas a la vez (por defecto, uno por CPU hasta 4)
import { bundle } from "@remotion/bundler";
import { openBrowser, renderStill, selectComposition } from "@remotion/renderer";
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const arg = (k) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=")[1];
const verbose = process.argv.includes("--verbose");
const revisar = process.argv.includes("--revisar");
const raiz = process.cwd();
const video = JSON.parse(readFileSync(path.join(raiz, "src/video.json"), "utf-8"));
const { fps, frames: total } = video.video;
const cada = arg("cada") ? Number(arg("cada")) : null;
const pad = (n, k) => String(n).padStart(k, "0");
const serie = (segundos, nombre) => {
  const paso = Math.max(1, Math.round(segundos * fps)), out = [];
  for (let f = 0, i = 0; f < total; f += paso, i++) out.push({ id: nombre(f, i), frame: f });
  return out;
};

// Tandas de fotogramas: { dir, objetivos: [{id, frame}], inputProps }
let tandas;
if (revisar) {
  const rev = serie(1, (f) => `f${pad(f, 5)}`);
  for (const e of video.escenas) {                       // + el reposo de cada escena (cuando ya entró todo)
    const f = Math.min(e.fin_f - 1, e.ini_f + 40);
    if (!rev.some((o) => o.frame === f)) rev.push({ id: `f${pad(f, 5)}`, frame: f });
  }
  rev.sort((a, b) => a.frame - b.frame);
  tandas = [
    { dir: "out/revision/revision", objetivos: rev, inputProps: { revision: "margenes" } },
    { dir: "out/revision/normal", objetivos: serie(0.5, (f) => `f${pad(f, 5)}`), inputProps: {} },
  ];
} else if (cada) {
  tandas = [{ dir: "out/movimiento", objetivos: serie(cada, (_, i) => `f${pad(i, 4)}`), inputProps: {} }];
} else {
  let objetivos = video.escenas.map((e) => ({ id: e.id, frame: Math.min(e.fin_f - 1, e.ini_f + 18) }));
  if (video.tarjeta_resumen) objetivos.push({ id: "resumen", frame: total - 5 });
  if (arg("frames")) objetivos = arg("frames").split(",").map((f) => ({ id: `f${f}`, frame: Number(f) }));
  tandas = [{ dir: "out/stills", objetivos, inputProps: {} }];
}

const browserExecutable = arg("browser") ?? process.env.REMOTION_BROWSER ?? null;
const concurrencia = Math.max(1, Number(arg("concurrencia")) || Math.min(4, os.cpus().length));
const fallo = (e) => {
  const msg = String(e?.message ?? e).split("\n").find((l) => l.trim()) ?? "error desconocido";
  const pista = /remotion\.media|headless shell|ENOTFOUND|download/i.test(msg) ? " (sin descarga de Chrome: añade --browser=/usr/bin/google-chrome o exporta REMOTION_BROWSER)" : "";
  console.error(`✗ el render de fotogramas falló: ${msg}${pista}`);
  process.exit(1);
};
process.on("unhandledRejection", fallo);
process.on("uncaughtException", fallo);
let n = 0;
try {
  const serveUrl = await bundle({ entryPoint: path.join(raiz, "src/index.ts"), publicDir: path.join(raiz, "public") });
  const puppeteerInstance = await openBrowser("chrome", { browserExecutable, logLevel: "error" });
  const composition = await selectComposition({ serveUrl, id: "Video", browserExecutable, puppeteerInstance, inputProps: {}, logLevel: "error" });
  for (const t of tandas) {
    const salida = path.join(raiz, t.dir);
    if (revisar || cada) rmSync(salida, { recursive: true, force: true });     // sin fotogramas viejos de otra pasada
    mkdirSync(salida, { recursive: true });
    const cola = [...t.objetivos];
    const trabajador = async () => {
      for (let o = cola.shift(); o; o = cola.shift()) {
        const output = path.join(salida, `${o.id}.png`);
        await renderStill({ serveUrl, composition, frame: o.frame, output, browserExecutable, puppeteerInstance, inputProps: t.inputProps, logLevel: "error" });
        n++;
        if (verbose) console.log(`${o.id}: frame ${o.frame} → ${path.relative(raiz, output)}`);
      }
    };
    await Promise.all(Array.from({ length: concurrencia }, trabajador));
  }
  await puppeteerInstance.close({ silent: true }).catch(() => {});
} catch (e) {
  fallo(e);
}

if (revisar) {
  // busca scripts/revisar_video.py subiendo desde el proyecto (videos/<BASE> → raíz del repo)
  let dir = raiz, script = process.env.INCREASEFIT_REPO ? path.join(process.env.INCREASEFIT_REPO, "scripts/revisar_video.py") : null;
  for (let k = 0; k < 4 && !(script && existsSync(script)); k++, dir = path.dirname(dir)) script = path.join(dir, "scripts/revisar_video.py");
  if (!existsSync(script)) {
    console.error("✗ no encuentro scripts/revisar_video.py (exporta INCREASEFIT_REPO=<raíz del repo>)");
    process.exit(1);
  }
  const r = spawnSync("python3", [script, raiz], { stdio: "inherit" });
  process.exit(r.status ?? 1);
}

const salida = path.join(raiz, tandas[0].dir), rel = path.relative(raiz, salida);
const objetivos = tandas[0].objetivos;
if (cada) {
  try {
    const cols = 10, filas = Math.ceil(objetivos.length / cols);
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-framerate", "1", "-i", path.join(salida, "f%04d.png"),
      "-vf", `scale=216:384,tile=${cols}x${filas}:padding=4:color=black`, "-frames:v", "1", path.join(salida, "hoja_movimiento.jpg")]);
    console.log(`movimiento: ${n} fotogramas (uno cada ${String(cada).replace(".", ",")} s) → ${rel}/hoja_movimiento.jpg`);
  } catch {
    console.log(`movimiento: ${n} fotogramas en ${rel}/ (sin ffmpeg: no hay hoja)`);
  }
  process.exit(0);
}
try {
  const entradas = objetivos.flatMap((o) => ["-i", path.join(salida, `${o.id}.png`)]);
  const k = objetivos.length, cols = Math.min(5, k);
  const escalas = objetivos.map((_, i) => `[${i}:v]scale=270:480[s${i}]`).join(";");
  const lienzo = objetivos.map((_, i) => `[s${i}]`).join("");
  const pos = objetivos.map((_, i) => `${(i % cols) * 270}_${Math.floor(i / cols) * 480}`).join("|");
  const filtro = k > 1 ? `${escalas};${lienzo}xstack=inputs=${k}:layout=${pos}:fill=black` : "[0:v]scale=270:480";
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...entradas, "-filter_complex", filtro, "-frames:v", "1", path.join(salida, "hoja.jpg")]);
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
  const filtroZ = k > 1 ? `${escalasZ};${lienzo}xstack=inputs=${k}:layout=${pos}:fill=black` : `[0:v]${ZONAS},scale=270:480`;
  execFileSync("ffmpeg", ["-y", "-loglevel", "error", ...entradas, "-filter_complex", filtroZ, "-frames:v", "1", path.join(salida, "hoja_zonas.jpg")]);
  console.log(`stills: ${n} fotogramas → ${rel}/ (hoja.jpg y hoja_zonas.jpg)`);
} catch {
  console.log(`stills: ${n} fotogramas en ${rel}/ (sin ffmpeg: no hay hojas)`);
}
