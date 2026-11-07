// Kit gráfico IncreaseFit: anotaciones dibujadas a mano (roughjs, semilla fija = siempre igual).
// Blanco puro = teñible con máscara CSS. Burbujas y etiquetas: relleno blanco + tinta grafito.
const fs = require("fs");
const path = require("path");
const rough = require("roughjs");
const g = rough.generator();

const OUT = process.argv[2];
const TINTA = "#171E26", BLANCO = "#FFFFFF", HIELO = "#D4F1F9", CIAN = "#1FB7DE", ALERTA = "#FF5A4E";
const manifest = [];

function svg(w, h, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">${body}</svg>\n`;
}
function trazos(drawable, extra = "") {
  return g.toPaths(drawable).map((p) =>
    `<path d="${p.d}" fill="${p.fill || "none"}" stroke="${p.stroke}" stroke-width="${p.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"${extra}/>`).join("");
}
function guardar(cat, id, w, h, body, info) {
  const rel = `${cat}/${id}.svg`;
  fs.mkdirSync(path.join(OUT, cat), { recursive: true });
  fs.writeFileSync(path.join(OUT, rel), svg(w, h, body));
  manifest.push({ id, archivo: rel, categoria: cat, tam: [w, h], ...info });
}
const linea = (o) => ({ stroke: BLANCO, strokeWidth: 9, roughness: 1.3, bowing: 1.2, ...o });

// Punta de flecha: dos trazos desde la punta, según la dirección final de la curva
function punta(pts, o) {
  const [x1, y1] = pts[pts.length - 2], [x2, y2] = pts[pts.length - 1];
  const a = Math.atan2(y2 - y1, x2 - x1), L = 52, ab = 0.5;
  return trazos(g.linearPath([[x2 - L * Math.cos(a - ab), y2 - L * Math.sin(a - ab)], [x2, y2], [x2 - L * Math.cos(a + ab), y2 - L * Math.sin(a + ab)]], o));
}
function flecha(id, w, h, pts, uso, seed) {
  const o = linea({ seed });
  guardar("flechas", id, w, h, trazos(g.curve(pts, o)) + punta(pts, { ...o, seed: seed + 1 }),
    { uso, tintable: true, punta: pts[pts.length - 1], origen: pts[0] });
}

// --- Flechas (la punta es el extremo que señala; espejar con scaleX/scaleY para otras direcciones)
flecha("flecha_curva_abajo", 420, 300, [[30, 40], [180, 30], [320, 110], [370, 255]], "De una etiqueta (arriba a la izquierda) hacia el punto señalado (abajo a la derecha).", 11);
flecha("flecha_curva_arriba", 420, 300, [[30, 260], [170, 270], [320, 190], [370, 45]], "De una etiqueta (abajo a la izquierda) hacia arriba a la derecha.", 12);
flecha("flecha_recta", 520, 120, [[25, 70], [260, 55], [480, 60]], "Señalar en horizontal (un dato, una tarjeta).", 13);
flecha("flecha_s", 520, 260, [[25, 200], [170, 60], [330, 210], [480, 70]], "Flecha nerviosa en S: transición entre dos cosas o 'de esto a esto'.", 14);
flecha("flecha_corta", 220, 160, [[25, 125], [110, 120], [180, 40]], "Flecha corta para etiquetas pegadas al personaje.", 15);

// --- Marcas
{
  const o = linea({ seed: 21, roughness: 1.6, strokeWidth: 10 });
  guardar("marcas", "circulo_marcador", 640, 420, trazos(g.ellipse(320, 210, 580, 350, o)) + trazos(g.ellipse(325, 205, 560, 365, { ...o, seed: 22, strokeWidth: 6 })),
    { uso: "Rodear un detalle (articulación, dato). Con stroke-dasharray + dashoffset se 'dibuja' en pantalla.", tintable: true });
  guardar("marcas", "tachado", 640, 90, trazos(g.curve([[20, 55], [220, 40], [430, 52], [620, 32]], { ...o, seed: 23, strokeWidth: 12 })),
    { uso: "Tachar un texto (la caja de 'Wide Grip'): se estira al ancho del texto.", tintable: true, color_sugerido: ALERTA });
  guardar("marcas", "subrayado", 640, 80, trazos(g.curve([[20, 40], [180, 58], [360, 30], [620, 48]], { ...o, seed: 24, strokeWidth: 11 })),
    { uso: "Subrayar la palabra clave.", tintable: true, color_sugerido: CIAN });
  guardar("marcas", "check", 260, 220, trazos(g.linearPath([[30, 120], [100, 190], [235, 30]], { ...o, seed: 25, strokeWidth: 16 })),
    { uso: "Bien hecho / paso cumplido.", tintable: true, color_sugerido: "#3DD68C" });
  guardar("marcas", "cruz", 240, 240, trazos(g.line(35, 35, 205, 205, { ...o, seed: 26, strokeWidth: 16 })) + trazos(g.line(205, 35, 35, 205, { ...o, seed: 27, strokeWidth: 16 })),
    { uso: "Así no / error.", tintable: true, color_sugerido: ALERTA });
  const caja = { stroke: TINTA, strokeWidth: 6, roughness: 1.1, fill: BLANCO, fillStyle: "solid", seed: 28 };
  guardar("marcas", "caja_etiqueta", 620, 170, trazos(g.rectangle(14, 14, 592, 142, caja)),
    { uso: "Caja blanca de etiqueta (texto en Kalam o Open Sans encima). Estirar con preserveAspectRatio='none'.", tintable: false });
  guardar("marcas", "casilla", 140, 140, trazos(g.rectangle(18, 18, 104, 104, { ...caja, seed: 29 })), { uso: "Checklist: casilla vacía.", tintable: false });
  guardar("marcas", "casilla_marcada", 160, 150, trazos(g.rectangle(18, 28, 104, 104, { ...caja, seed: 29 })) +
    trazos(g.linearPath([[38, 80], [70, 115], [145, 14]], { stroke: CIAN, strokeWidth: 14, roughness: 1.2, seed: 30 })), { uso: "Checklist: casilla marcada (check cian).", tintable: false });
}

// --- Burbujas e insertos (relleno blanco, tinta grafito)
{
  const o = { stroke: TINTA, strokeWidth: 7, roughness: 1.0, fill: BLANCO, fillStyle: "solid" };
  const dialogo = "M80 40 Q40 40 40 90 L40 250 Q40 300 90 300 L210 300 L150 390 L290 300 L540 300 Q590 300 590 250 L590 90 Q590 40 540 40 Z";
  guardar("burbujas", "burbuja_dialogo", 640, 420, trazos(g.path(dialogo, { ...o, seed: 41 })),
    { uso: "Diálogo con cola abajo a la izquierda (espejar para el otro lado). Zona de texto ≈ x 70–560, y 70–270.", tintable: false });
  let nube = "";
  const cx = 330, cy = 180, n = 11;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    nube += trazos(g.circle(cx + Math.cos(a) * 225, cy + Math.sin(a) * 115, 150 + (i % 3) * 18, { ...o, seed: 50 + i }));
  }
  nube += trazos(g.ellipse(cx, cy, 470, 230, { ...o, stroke: "none", seed: 70 }));
  nube += trazos(g.circle(150, 360, 60, { ...o, seed: 71 })) + trazos(g.circle(95, 415, 36, { ...o, seed: 72 }));
  guardar("burbujas", "burbuja_pensamiento", 660, 450, nube,
    { uso: "Pensamiento: dentro va un sprite pequeño o un texto (como la mascota imaginando la dominada). Centro ≈ (330, 180).", tintable: false });
  guardar("burbujas", "inserto_circular", 520, 520,
    `<circle cx="260" cy="260" r="232" fill="none" stroke="${BLANCO}" stroke-width="22"/>` + trazos(g.circle(260, 260, 486, { stroke: TINTA, strokeWidth: 8, roughness: 0.8, seed: 73 })),
    { uso: "Marco del inserto circular (una cara_* reaccionando). Recortar el contenido con un círculo de radio 230 centrado en (260, 260).", tintable: false });
}

// --- Efectos (blanco, teñibles)
{
  const o = linea({ strokeWidth: 7, roughness: 0.6 });
  let v = "";
  const filas = [[40, 380], [130, 260], [210, 420], [300, 200], [380, 330], [470, 240]];
  filas.forEach(([y, l], i) => { v += trazos(g.line(600 - l, y, 600, y, { ...o, seed: 80 + i })); });
  guardar("efectos", "lineas_velocidad", 620, 520, v, { uso: "Detrás del personaje que se mueve (a la derecha). Espejar para el otro lado.", tintable: true });

  let r = "";
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2 + (i % 2) * 0.04;
    const r0 = 520 + (i % 3) * 70, r1 = 1300;
    r += trazos(g.line(540 + Math.cos(a) * r0, 960 + Math.sin(a) * r0 * 1.15, 540 + Math.cos(a) * r1, 960 + Math.sin(a) * r1 * 1.15, { ...o, strokeWidth: 5 + (i % 4) * 2, seed: 100 + i }));
  }
  guardar("efectos", "lineas_enfoque", 1080, 1920, r, { uso: "Líneas de enfoque de manga a pantalla completa para un momento dramático (centro libre).", tintable: true, opacidad_sugerida: 0.35 });

  const imp = [[[40, 150], [95, 115]], [[70, 70], [120, 60]], [[150, 20], [160, 70]]];
  guardar("efectos", "marcas_impacto", 200, 200, imp.map(([a, b], i) => trazos(g.line(a[0], a[1], b[0], b[1], { ...o, strokeWidth: 10, seed: 140 + i }))).join(""),
    { uso: "Tres rayitas junto a la cabeza: sorpresa, dolor, '¡!'.", tintable: true });
  guardar("efectos", "lineas_temblor", 180, 260,
    trazos(g.arc(140, 130, 160, 200, -Math.PI / 2.3, Math.PI / 2.3, false, { ...o, strokeWidth: 8, seed: 150 })) +
    trazos(g.arc(140, 130, 250, 240, -Math.PI / 2.6, Math.PI / 2.6, false, { ...o, strokeWidth: 8, seed: 151 })),
    { uso: "Temblor o vibración al lado de un brazo/barra que no aguanta. Espejar para el otro lado.", tintable: true });
  const estrella = (cx, cy, R, r2) => { let d = ""; for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r2 : R; d += `${i ? "L" : "M"}${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)} `; } return d + "Z"; };
  guardar("efectos", "destello", 240, 240, `<path d="${estrella(120, 120, 110, 22)}" fill="${BLANCO}"/><path d="${estrella(200, 45, 34, 8)}" fill="${BLANCO}"/>`,
    { uso: "Brillo de logro (celebrar, récord).", tintable: true, color_sugerido: HIELO });
  const gota = (x, y, s) => `<path d="M${x} ${y} C${x + 22 * s} ${y + 38 * s} ${x + 30 * s} ${y + 58 * s} ${x} ${y + 72 * s} C${x - 30 * s} ${y + 58 * s} ${x - 22 * s} ${y + 38 * s} ${x} ${y} Z" fill="${HIELO}" stroke="${TINTA}" stroke-width="6" stroke-linejoin="round"/>`;
  guardar("efectos", "gotas_sudor", 200, 200, gota(60, 20, 1.1) + gota(140, 80, 0.8) + gota(90, 120, 0.6), { uso: "Sudor de esfuerzo o nervios, junto a la cabeza.", tintable: false });
}

// --- Marco REC (pantalla completa)
{
  const o = linea({ strokeWidth: 10, roughness: 0.7 });
  const L = 150, m = 70, W = 1080, H = 1920;
  const esq = [[[m, m + L], [m, m], [m + L, m]], [[W - m - L, m], [W - m, m], [W - m, m + L]], [[m, H - m - L], [m, H - m], [m + L, H - m]], [[W - m - L, H - m], [W - m, H - m], [W - m, H - m - L]]];
  let b = esq.map((p, i) => trazos(g.linearPath(p, { ...o, seed: 160 + i }))).join("");
  b += `<circle cx="${m + 70}" cy="${m + 85}" r="18" fill="${ALERTA}"/><text x="${m + 102}" y="${m + 99}" font-family="JetBrains Mono, monospace" font-weight="700" font-size="40" fill="${ALERTA}">REC</text>`;
  guardar("marcos", "marco_rec", W, H, b, { uso: "Visor de cámara del celular ('alguien te está grabando la técnica'). Hacer parpadear el punto rojo.", tintable: false });
}

const NOTAS = [
  "SVG dibujados a mano (roughjs con semilla fija: se regeneran idénticos con scripts/kit/).",
  "tintable=true: son blancos puros; colorearlos con máscara CSS (mask-image + background-color), igual que los iconos. Si no, usar con <Img>.",
  "Las flechas apuntan en una dirección: espejar con scaleX(-1) / scaleY(-1). 'punta' y 'origen' están en px del SVG.",
  "Para 'dibujar' un trazo en pantalla: stroke-dasharray = longitud del path y animar stroke-dashoffset de esa longitud a 0.",
  "Texto manuscrito de etiquetas: fuente Kalam (fonts/css/kalam__400-700.css).",
];
fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify({ version: 1, notas: NOTAS, piezas: manifest }, null, 1));
console.log(manifest.length, "piezas");
