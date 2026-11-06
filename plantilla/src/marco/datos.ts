// Datos del video: src/brief.json (lo deja scripts/preparar_video.py) y src/paletas.json (copia de brand/paletas.json).
import briefJson from "../brief.json";
import paletasJson from "../paletas.json";

export type Bloque = {
  id: "gancho" | "error" | "por_que" | "metodo" | "resultado" | "cta";
  ini_f: number; fin_f: number; ini_s: number; fin_s: number;
  titular: [string, string]; texto: string; palabras?: [number, number] | null;
  pasos?: string[]; pasos_f?: (number | null)[];
  visual: { rep: string; gesto: string; idea: string };
};
export type Brief = {
  version: number; marca: string; base: string; audio: string;
  video: { width: number; height: number; fps: number; frames: number; voz_s: number; cola_s: number };
  serie_header: string; cta: string; cta_con_entrega: boolean; plantilla: string;
  logos: { increasefit: boolean; oscuro: boolean; isotipo: boolean };
  tema: { id: number; variante: number; titulo: string; tesis: string; gancho: string; metodo: string; movimiento: string };
  fuente_en_pantalla: string; datos_citados: { dato: string; fuente: string; corta: string }[];
  notas_direccion: string; climas: Record<string, string>;
  fuentes: { rol: string; familia: string; css: string | null; stack: string }[];
  ficha_tecnica: {
    ejercicios: { movimiento: string; nombre: string; rol: string }[]; musculos: string[];
    prescripcion: Record<string, string>; cues: string[]; errores: string[];
    progresion_ejemplo: { semana: number; kg: number; reps: number }[]; vocabulario: string[];
  };
  bloques: Bloque[];
  subtitulos: [string, number, number][];
  palabras: [string, number, number][];
};
export type Clima = {
  nombre: string; tipo: "oscuro" | "claro";
  fondo_a: string; fondo_b: string; tinte: string; superficie: string; estructura: string; acento: string;
  texto: string; texto_suave: string; cuerpo_rep: string; cuerpo_rep_lejano: string; textura: string; bloques: string[];
};

export const brief = briefJson as unknown as Brief;
export const PALETAS = paletasJson as unknown as { climas: Record<string, Clima>; reglas_rotacion: { clima_base: string; transicion_frames: number } };
export const CLIMA_BASE = PALETAS.reglas_rotacion.clima_base;

// Constantes de marca: NO cambian con el clima
export const IF = {
  cian: "#1FB7DE", hielo: "#D4F1F9", grafito: "#171E26", grafito2: "#0A0E12", negro: "#000000", blanco: "#FFFFFF",
  alerta: "#FF5A4E", exito: "#3DD68C", subFutura: "#5E7180", capsula: "rgba(10,14,18,0.72)",
};
const stack = (rol: string, def: string) => brief.fuentes.find((f) => f.rol === rol)?.stack ?? def;
export const FUENTE = { titulos: stack("titulos", '"Open Sans", sans-serif'), mono: stack("mono", '"JetBrains Mono", monospace') };

export const bloque = (id: Bloque["id"]) => brief.bloques.find((b) => b.id === id)!;
export const bloqueEn = (frame: number) => brief.bloques.find((b) => frame >= b.ini_f && frame < b.fin_f) ?? brief.bloques[brief.bloques.length - 1];
export const climaDe = (id: string) => PALETAS.climas[brief.climas?.[id] ?? CLIMA_BASE] ?? PALETAS.climas[CLIMA_BASE];
