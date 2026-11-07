// Capas extra por plano para ESTE video (las añade Claude al dirigir). Se dibujan encima de la escena por defecto del plano.
// Clave = plano.id ("p03"). El frame dentro del componente es LOCAL al plano. Ejemplo:
//
//   export const EXTRA: Record<string, React.FC<{ p: Plano; c: C }>> = {
//     p03: ({ c }) => <div style={{ position: "absolute", left: 80, top: 600, color: c.texto }}>…</div>,
//   };
import type React from "react";
import type { Plano } from "../marco/datos";
import type { C } from "../marco/clima";

export const EXTRA: Record<string, React.FC<{ p: Plano; c: C }>> = {};
