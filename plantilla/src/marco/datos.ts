// Datos del video. preparar_video.py deja en src/: video.json (escaleta ya sincronizada a frames), paletas.json,
// mascota.json (manifest de la mascota) y sonido.json. No copies números a mano: todo sale de aquí.
import videoJson from "../video.json";
import paletasJson from "../paletas.json";
import mascotaJson from "../mascota.json";
import sonidoJson from "../sonido.json";

export type Anotacion = {
  tipo: "etiqueta" | "tachado" | "circulo" | "check" | "cruz" | "burbuja_pensamiento" | "burbuja_dialogo" | "dato" | "lista"
      | "rec" | "lineas_velocidad" | "impacto" | "sudor" | "destello" | "enfoque" | "libreta" | "grafica" | "icono" | "ficha";
  texto?: string;            // etiqueta, tachado, burbuja_dialogo, dato (la cifra grande), libreta (título)
  detalle?: string;          // dato: texto bajo la cifra
  fuente?: string;           // dato: fuente corta verificada
  ilustrativo?: boolean;     // dato: ejemplo, no estudio
  apunta?: "cabeza" | "manos" | "pies" | "centro";
  sprite?: string;           // burbuja_pensamiento
  items?: string[];          // lista
  icono?: string;            // icono: id de icons/ (Lucide)
  tono?: Tono;               // icono: color (foco del clima por defecto)
  tachado?: boolean;         // icono: se tacha en rojo ("esto no")
  filas?: FilaFicha[];       // ficha: icono + cifra corta por fila
  en_f: number;              // frame GLOBAL en que aparece
};
export type Tono = "foco" | "alerta" | "exito";
export type FilaFicha = { icono: string; texto: string; en_f: number };
export type MascotaEscena = {
  sprite: string;            // id de mascota/manifest.json o "ejercicio:<nombre>" (alterna sus fases)
  anim: "pop" | "ejercicio" | "temblor" | "entrar" | "estatico";
  encuadre: "general" | "medio" | "primer_plano";
  posicion: "centro" | "izq" | "der";
  espejo: boolean;
};
export type Escena = {
  id: string;
  ini_f: number; fin_f: number;               // globales, contiguos
  clima: string;
  transicion: "corte" | "pincel";             // pincel = cortinilla + whoosh al entrar
  pantalla: { texto: string; estilo: "titular" | "capitulo" | "nota" | "ninguno" };
  enfasis_f: number[];                        // frames globales de las palabras de énfasis (punch-in en la primera)
  mascota: MascotaEscena | null;
  dividida: { no: string; si: string } | null;
  inserto: { cara: string; en_f: number } | null;
  anotaciones: Anotacion[];
  componente: string | null;                  // escena a medida (src/escenas/custom/<componente>.tsx)
  solo_componente: boolean;                   // true = solo el componente, sin la composición por defecto
};
// Tarjeta final: tema (chip) → pregunta del gancho → veredicto (color según tono) → pasos para aplicarlo → fuente.
// sincronizar.py convierte el formato antiguo (titulo + lineas) a veredicto + pasos.
export type TarjetaDatos = { tema: string; pregunta: string; veredicto: string; tono: "si" | "no" | "matiz" | ""; pasos: string[]; fuente: string; ini_f: number };
export type Palabra = [string, number, number, number, number, "" | "alerta" | "exito", string];
export type Sfx = { id: string; frame: number; volumen: number };
export type Semana = { semana: number; kg: number; reps: number };
export type DatosVideo = {
  version: number; base: string; audio: string;
  video: { width: number; height: number; fps: number; frames: number; voz_s: number; cola_s: number };
  musica: string | null;
  opciones: { barra_progreso: boolean };
  logos: { increasefit: boolean; oscuro: boolean; isotipo: boolean };
  fuentes: { rol: string; familia: string; css: string | null; stack: string; pesos: number[] }[];
  escenas: Escena[];
  cortinillas: number[];
  tarjeta_resumen: TarjetaDatos | null;
  sfx: Sfx[];
  // palabra SIN puntuación (puede ser "" si era solo un signo), ini_s, fin_s, énfasis 0/1, corte 0/1 (fin de frase o coma),
  // tono ("" | "alerta" | "exito") e icono ("" | id de icons/) que la escaleta pinta en el subtítulo
  subtitulos: Palabra[];
  progresion: Semana[];
};
export type Clima = {
  nombre: string; tipo: "oscuro" | "claro" | "color";   // color = clima azul (la tarjeta azul del feed)
  fondo_a: string; fondo_b: string; tinte: string; superficie: string; estructura: string; acento: string;
  foco: string;              // acento IncreaseFit en este clima: azul luz sobre negro, azul sobre blanco, blanco sobre azul
  texto: string; texto_suave: string; textura: string;
};
export type SpriteInfo = {
  id: string; archivo: string; categoria: string; vista?: string; mira_a?: string; tam: [number, number];
  anclas: { pies: [number, number]; cabeza: [number, number] | null; manos: [number, number][] };
  ejercicio?: string; fase?: number;
};

export const datos = videoJson as unknown as DatosVideo;
export const PALETAS = paletasJson as unknown as { climas: Record<string, Clima>; reglas_rotacion: { clima_base: string; transicion_frames: number } };
export const CLIMA_BASE = PALETAS.reglas_rotacion.clima_base;
const MASCOTA = mascotaJson as unknown as { altura_personaje_px: number; ejercicios: Record<string, { fases: string[]; errores: string[] }>; sprites: SpriteInfo[] };
export const SPRITES: Record<string, SpriteInfo> = Object.fromEntries(MASCOTA.sprites.map((s) => [s.id, s]));
export const EJERCICIOS = MASCOTA.ejercicios;
export const ALTURA_PERSONAJE = MASCOTA.altura_personaje_px;
export const SONIDO = sonidoJson as unknown as { sfx: { id: string; archivo: string; volumen_sugerido: number }[]; musica: { id: string; archivo: string; volumen_bajo_voz: number; volumen_sin_voz: number }[] };

// Constantes de marca: NO cambian con el clima. Paleta del feed de Instagram.
// azul (#2353F1) es para RELLENOS y para texto sobre blanco; sobre negro no se lee como texto (3,4:1): ahí va azulLuz.
// El acento de cada escena es el `foco` del clima (useClima().foco), no una constante.
export const IF = {
  azul: "#2353F1", azulLuz: "#6A8CFF", azulHondo: "#1D45CF", hielo: "#DCE5FF",
  grafito: "#141414", grafito2: "#050505", tinta: "#111111", negro: "#000000", blanco: "#FFFFFF",
  alerta: "#FF5A4E", exito: "#3DD68C", subFutura: "#6B6B6B", capsula: "rgba(8,8,8,0.72)",
};
const stack = (rol: string, def: string) => datos.fuentes.find((f) => f.rol === rol)?.stack ?? def;
export const FUENTE = {
  titulos: stack("titulos", '"Open Sans", sans-serif'),
  mono: stack("mono", '"JetBrains Mono", monospace'),
  mano: stack("mano", '"Kalam", cursive'),
};

export const escenaEn = (frame: number) => datos.escenas.find((e) => frame >= e.ini_f && frame < e.fin_f) ?? datos.escenas[datos.escenas.length - 1];
export const climaDe = (id: string | undefined) => PALETAS.climas[id ?? CLIMA_BASE] ?? PALETAS.climas[CLIMA_BASE];
/** Frame GLOBAL en que la voz empieza la palabra número `i` del guion (los [n] de scripts/alinear.py). */
export const frameDePalabra = (i: number): number => {
  const w = datos.subtitulos[Math.max(0, Math.min(datos.subtitulos.length - 1, i))];
  return Math.round(w[1] * datos.video.fps);
};
