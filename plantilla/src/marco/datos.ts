// Datos del video. preparar_video.py deja en src/: brief.json, paletas.json, mascota.json (manifest de la mascota) y sonido.json.
import briefJson from "../brief.json";
import paletasJson from "../paletas.json";
import mascotaJson from "../mascota.json";
import sonidoJson from "../sonido.json";

export type Overlay = {
  tipo: "etiqueta" | "tachado" | "circulo" | "check" | "cruz" | "burbuja_pensamiento" | "burbuja_dialogo" | "dato" | "lista"
      | "rec" | "lineas_velocidad" | "impacto" | "sudor" | "destello" | "enfoque" | "libreta" | "grafica";
  texto?: string;            // etiqueta, tachado, burbuja_dialogo, dato (la cifra grande)
  detalle?: string;          // dato: texto bajo la cifra
  apunta?: "cabeza" | "manos" | "pies" | "centro";
  sprite?: string;           // burbuja_pensamiento: sprite dentro de la nube
  items?: string[];          // lista
  palabra_f?: number;        // frame (global) en que aparece; si falta, al empezar el plano + 6
};
export type Visual = {
  sprite: string;            // id de mascota/manifest.json o "ejercicio:<nombre>" (alterna sus fases)
  anim: "pop" | "ejercicio" | "temblor" | "entrar" | "estatico";
  encuadre: "general" | "medio" | "primer_plano";
  posicion: "centro" | "izq" | "der";
  espejo?: boolean;
  sprite_b?: string | null;  // pantalla dividida: izquierda = sprite (ASÍ NO), derecha = sprite_b (ASÍ SÍ)
  inserto?: string | null;   // cara_* en un círculo arriba a la derecha
};
export type Plano = {
  id: string; bloque: string;
  ini_f: number; fin_f: number; ini_s: number; fin_s: number;
  voz: string; palabras?: [number, number] | null;
  pantalla: { texto: string; estilo: "titular" | "capitulo" | "nota" | "ninguno" };
  enfasis: string[];
  clima: string;
  visual: Visual;
  overlays: Overlay[];
};
export type Sfx = { id: string; frame: number; volumen: number };
export type Brief = {
  version: number; marca: string; base: string; audio: string;
  video: { width: number; height: number; fps: number; frames: number; voz_s: number; cola_s: number };
  serie_header: string; formato: string; musica: string | null;
  tema: { id: number; titulo: string; tesis: string };
  aprendizaje: string;
  gancho: { texto: string; tipo: string; alternativas: string[] };
  fuente_en_pantalla: string; datos_citados: { dato: string; fuente: string; corta: string; url?: string }[];
  notas_direccion: string;
  logos: { increasefit: boolean; oscuro: boolean; isotipo: boolean };
  fuentes: { rol: string; familia: string; css: string | null; stack: string; pesos: number[] }[];
  ficha_tecnica: {
    ejercicios: { sprite: string; nombre: string; rol: string }[];
    prescripcion: Record<string, string>; cues: string[]; errores: string[];
    progresion_ejemplo: { semana: number; kg: number; reps: number }[]; vocabulario: string[];
  };
  opciones: { barra_progreso: boolean };
  planos: Plano[];
  tarjeta_resumen: { titulo: string; lineas: string[]; ini_f: number } | null;
  sfx: Sfx[];
  subtitulos: [string, number, number][];
  palabras: [string, number, number][];
};
export type Clima = {
  nombre: string; tipo: "oscuro" | "claro";
  fondo_a: string; fondo_b: string; tinte: string; superficie: string; estructura: string; acento: string;
  texto: string; texto_suave: string; textura: string;
};
export type SpriteInfo = {
  id: string; archivo: string; categoria: string; vista?: string; mira_a?: string; tam: [number, number];
  anclas: { pies: [number, number]; cabeza: [number, number] | null; manos: [number, number][] };
  ejercicio?: string; fase?: number;
};

export const brief = briefJson as unknown as Brief;
export const PALETAS = paletasJson as unknown as { climas: Record<string, Clima>; reglas_rotacion: { clima_base: string; transicion_frames: number } };
export const CLIMA_BASE = PALETAS.reglas_rotacion.clima_base;
const MASCOTA = mascotaJson as unknown as { altura_personaje_px: number; ejercicios: Record<string, { fases: string[]; errores: string[] }>; sprites: SpriteInfo[] };
export const SPRITES: Record<string, SpriteInfo> = Object.fromEntries(MASCOTA.sprites.map((s) => [s.id, s]));
export const EJERCICIOS = MASCOTA.ejercicios;
export const ALTURA_PERSONAJE = MASCOTA.altura_personaje_px;
export const SONIDO = sonidoJson as unknown as { sfx: { id: string; archivo: string; volumen_sugerido: number }[]; musica: { id: string; archivo: string; volumen_bajo_voz: number; volumen_sin_voz: number }[] };

// Constantes de marca: NO cambian con el clima
export const IF = {
  cian: "#1FB7DE", hielo: "#D4F1F9", grafito: "#171E26", grafito2: "#0A0E12", negro: "#000000", blanco: "#FFFFFF",
  alerta: "#FF5A4E", exito: "#3DD68C", subFutura: "#5E7180", capsula: "rgba(10,14,18,0.72)",
};
const stack = (rol: string, def: string) => brief.fuentes.find((f) => f.rol === rol)?.stack ?? def;
export const FUENTE = {
  titulos: stack("titulos", '"Open Sans", sans-serif'),
  mono: stack("mono", '"JetBrains Mono", monospace'),
  mano: stack("mano", '"Kalam", cursive'),
};

export const planoEn = (frame: number) => brief.planos.find((p) => frame >= p.ini_f && frame < p.fin_f) ?? brief.planos[brief.planos.length - 1];
export const climaDe = (id: string | undefined) => PALETAS.climas[id ?? CLIMA_BASE] ?? PALETAS.climas[CLIMA_BASE];
/** Primer frame (global) en que la voz dice una palabra del plano que empieza por `clave`; null si no aparece. */
export const frameDePalabra = (p: Plano, clave: string): number | null => {
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
  const k = norm(clave).slice(0, 5);
  if (!k) return null;
  const w = brief.subtitulos.find(([txt, a]) => a * brief.video.fps >= p.ini_f - 1 && a * brief.video.fps < p.fin_f && norm(txt).startsWith(k));
  return w ? Math.round(w[1] * brief.video.fps) : null;
};
