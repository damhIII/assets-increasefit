"""Etapa 3: manifest.json (catálogo de sprites), personaje.json (ficha) y contactos.png."""
import json, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFont

base = sys.argv[1]
proc = json.load(open(f"{base}/_proceso.json"))

# id: (categoria, vista, mira_a, ejercicio, fase, emocion, descripcion)
M = {
    "gesto_de_pie": ("gesto", "tres_cuartos", "derecha", None, None, "confiado", "De pie relajado, mano en la cadera, mirada al frente."),
    "gesto_brazos_cruzados": ("gesto", "frente", "camara", None, None, "esceptico", "Brazos cruzados, ceja levantada, media sonrisa."),
    "gesto_pensar": ("gesto", "tres_cuartos", "derecha", None, None, "pensativo", "Mano en la barbilla, mirada hacia arriba."),
    "gesto_encoger_hombros": ("gesto", "frente", "camara", None, None, "resignado", "Hombros encogidos, palmas arriba: ¿y qué esperabas?"),
    "gesto_senalar_camara": ("gesto", "frente", "camara", None, None, "confiado", "Señala al espectador con el índice en escorzo."),
    "gesto_senalar_lado": ("gesto", "tres_cuartos", "derecha", None, None, "confiado", "Señala con el brazo extendido hacia la derecha."),
    "gesto_pulgar_arriba": ("gesto", "frente", "camara", None, None, "alegre", "Pulgar arriba, guiño y sonrisa amplia."),
    "gesto_celebrar": ("gesto", "frente", "camara", None, None, "alegre", "Doble bíceps de frente, sonrisa grande."),
    "gesto_sorpresa": ("gesto", "frente", "camara", None, None, "sorpresa", "Manos en las mejillas, boca abierta."),
    "gesto_facepalm": ("gesto", "tres_cuartos", "camara", None, None, "decepcion", "Mano en la frente, cabeza baja."),
    "gesto_celular": ("gesto", "tres_cuartos", "derecha", None, None, "absorto", "Encorvado mirando el celular con las dos manos."),
    "gesto_dolor_hombro": ("gesto", "frente", "camara", None, None, "molestia", "Se sujeta el hombro con mueca de molestia (cómico)."),
    "gesto_agotado_banco": ("gesto", "frente", "camara", None, None, "agotado", "Sentado en un banco, codos en las rodillas, sudando."),
    "gesto_espalda_biceps": ("gesto", "espalda", None, None, None, "orgullo", "De espaldas, doble bíceps: dorsales, trapecio y deltoides marcados."),
    "gesto_caminar": ("gesto", "perfil", "derecha", None, None, "decidido", "Caminando decidido a mitad de paso."),
    "plano_explicando": ("plano_medio", "tres_cuartos", "camara", None, None, "confiado", "Plano medio explicando con la mano abierta."),
    "plano_esceptico": ("plano_medio", "frente", "camara", None, None, "esceptico", "Plano medio, ceja levantada, manos en la cadera."),
    "vest_bata_brazos_cruzados": ("vestuario", "frente", "camara", None, None, "serio", "Con bata de laboratorio, brazos cruzados (modo ciencia)."),
    "vest_bata_senalar": ("vestuario", "tres_cuartos", "derecha", None, None, "alegre", "Con bata de laboratorio, señala a la derecha con un bolígrafo."),
    "dominada_f1": ("ejercicio", "espalda", None, "dominada", 1, "neutral", "Colgado de la barra, brazos extendidos."),
    "dominada_f2": ("ejercicio", "espalda", None, "dominada", 2, "neutral", "Arriba: barbilla a la altura de la barra, codos abajo."),
    "sentadilla_f1": ("ejercicio", "perfil", "derecha", "sentadilla", 1, "confiado", "De pie con la barra en la espalda alta."),
    "sentadilla_f2": ("ejercicio", "perfil", "derecha", "sentadilla", 2, "confiado", "Abajo de la sentadilla, espalda neutra."),
    "peso_muerto_f1": ("ejercicio", "perfil", "derecha", "peso_muerto", 1, "confiado", "Inicio: barra en el suelo junto a las espinillas."),
    "peso_muerto_f2": ("ejercicio", "perfil", "derecha", "peso_muerto", 2, "confiado", "Bloqueo arriba con la barra en los muslos."),
    "curl_f1": ("ejercicio", "perfil", "derecha", "curl", 1, "confiado", "Curl abajo: mancuernas con brazos extendidos."),
    "curl_f2": ("ejercicio", "perfil", "derecha", "curl", 2, "confiado", "Curl arriba: codos quietos junto al cuerpo."),
    "press_banca_f1": ("ejercicio", "perfil_tumbado", "derecha", "press_banca", 1, "neutral", "Press de banca arriba, brazos extendidos."),
    "press_banca_f2": ("ejercicio", "perfil_tumbado", "derecha", "press_banca", 2, "neutral", "Press de banca abajo, barra en el pecho."),
    "remo_f1": ("ejercicio", "perfil", "derecha", "remo", 1, "confiado", "Remo con barra, inicio: brazos colgando."),
    "remo_f2": ("ejercicio", "perfil", "derecha", "remo", 2, "confiado", "Remo con barra, final: barra al ombligo."),
    "press_militar_f1": ("ejercicio", "tres_cuartos", "derecha", "press_militar", 1, "confiado", "Press militar, barra en los hombros."),
    "press_militar_f2": ("ejercicio", "tres_cuartos", "derecha", "press_militar", 2, "confiado", "Press militar, barra bloqueada arriba."),
    "zancada_f1": ("ejercicio", "perfil", "derecha", "zancada", 1, "confiado", "De pie con mancuernas a los costados."),
    "zancada_f2": ("ejercicio", "perfil", "derecha", "zancada", 2, "confiado", "Zancada abajo, rodilla trasera cerca del suelo."),
    "hip_thrust_f1": ("ejercicio", "perfil_tumbado", "izquierda", "hip_thrust", 1, "confiado", "Hip thrust abajo, espalda alta en el banco."),
    "hip_thrust_f2": ("ejercicio", "perfil_tumbado", "izquierda", "hip_thrust", 2, "confiado", "Hip thrust arriba, cadera en línea."),
    "error_sentadilla_media": ("error", "tres_cuartos", "derecha", "sentadilla", None, "esfuerzo", "ERROR: demasiado peso y un cuarto de recorrido."),
    "error_peso_muerto_redondo": ("error", "perfil", "derecha", "peso_muerto", None, "esfuerzo", "ERROR: espalda en C y tirón con los brazos."),
    "error_dominada_balanceo": ("error", "lateral", "derecha", "dominada", None, "esfuerzo", "ERROR: patada y balanceo, media repetición."),
    "error_curl_balanceo": ("error", "perfil", "derecha", "curl", None, "esfuerzo", "ERROR: mancuernas grandes, torso atrás, codos adelante."),
    "error_rodillas_dentro": ("error", "frente", "camara", "sentadilla", None, "molestia", "ERROR: rodillas colapsando hacia dentro."),
    "error_banca_cadera_arriba": ("error", "perfil_tumbado", "derecha", "press_banca", None, "esfuerzo", "ERROR: cadera despegada y barra rebotando."),
    "cara_neutral": ("cara", "tres_cuartos", "derecha", None, None, "neutral", "Busto: neutral."),
    "cara_confiada": ("cara", "tres_cuartos", "derecha", None, None, "confiado", "Busto: sonrisa de lado."),
    "cara_risa": ("cara", "tres_cuartos", "derecha", None, None, "alegre", "Busto: risa abierta."),
    "cara_sorpresa": ("cara", "tres_cuartos", "derecha", None, None, "sorpresa", "Busto: sorpresa."),
    "cara_esceptico": ("cara", "tres_cuartos", "derecha", None, None, "esceptico", "Busto: escéptico, humor seco."),
    "cara_esfuerzo": ("cara", "tres_cuartos", "derecha", None, None, "esfuerzo", "Busto: dientes apretados, sudor."),
    "cara_agotado": ("cara", "tres_cuartos", "derecha", None, None, "agotado", "Busto: agotado."),
    "cara_pensativo": ("cara", "tres_cuartos", "derecha", None, None, "pensativo", "Busto: pensativo."),
    "mano_agarre_barra": ("mano", None, None, None, None, None, "Mano agarrando una barra (inserto)."),
    "mano_mancuerna": ("mano", None, None, None, None, None, "Mano con mancuerna (inserto)."),
    "mano_senalar": ("mano", None, "derecha", None, None, None, "Mano señalando (inserto)."),
    "mano_pulgar": ("mano", None, None, None, None, None, "Pulgar arriba (inserto)."),
    "mano_puno": ("mano", None, None, None, None, None, "Puño cerrado (inserto)."),
    "mano_palma": ("mano", None, None, None, None, None, "Palma abierta (inserto)."),
}
NOTAS = {
    "remo_f1": ("revisar", "El torso está más erguido que en remo_f2: al alternar parece que se inclina más. Conviene regenerar el par."),
    "remo_f2": ("revisar", "Ver remo_f1."),
    "press_banca_f1": ("ok", "Ampliado x1,48 para igualar la escala: algo más suave que el resto."),
    "press_banca_f2": ("ok", "Ampliado x1,48; el disco tapa parte de la cara."),
    "error_banca_cadera_arriba": ("ok", "Ampliado x1,48."),
    "peso_muerto_f1": ("ok", "Barra en tres cuartos (la sentadilla la muestra de canto)."),
}
CORRECTO = {"error_sentadilla_media": "sentadilla", "error_peso_muerto_redondo": "peso_muerto", "error_dominada_balanceo": "dominada",
            "error_curl_balanceo": "curl", "error_rodillas_dentro": "sentadilla", "error_banca_cadera_arriba": "press_banca"}

M = {k: v for k, v in M.items() if k in proc}   # los descartados en ajustes.json no están en proc
assert set(M) == set(proc), set(M) ^ set(proc)
sprites = []
for sid, (cat, vista, mira, ej, fase, emo, desc) in M.items():
    p = proc[sid]
    est, nota = NOTAS.get(sid, ("ok", ""))
    item = {"id": sid, "archivo": f"sprites/{sid}.png", "categoria": cat, "descripcion": desc,
            "vista": vista, "mira_a": mira, "emocion": emo, "tam": p["tam"],
            "escala_normalizada": cat not in ("cara", "mano"),
            "anclas": p["anclas"], "hoja": p["hoja"], "estado": est}
    if ej:
        item["ejercicio"] = ej
    if fase:
        item["fase"] = fase
        item["ancla_fase"] = p["ancla_fase"]
    if sid in CORRECTO:
        item["correcto"] = CORRECTO[sid]
    if nota:
        item["nota"] = nota
    sprites.append({k: v for k, v in item.items() if v is not None})

ejercicios = {}
for s in sprites:
    if s["categoria"] == "ejercicio":
        ejercicios.setdefault(s["ejercicio"], {"fases": [], "errores": []})["fases"].append(s["id"])
for s in sprites:
    if s["categoria"] == "error":
        ejercicios.setdefault(s["ejercicio"], {"fases": [], "errores": []})["errores"].append(s["id"])

manifest = {
    "version": 1,
    "unidades": "px del PNG; anclas en coordenadas del propio sprite (origen arriba a la izquierda)",
    "altura_personaje_px": 900,
    "notas": [
        "Escala común: un personaje de pie mide 900 px de la coronilla a la suela en todos los sprites salvo cara_* y mano_* (insertos a su tamaño).",
        "Las fases de un ejercicio (f1, f2) tienen el mismo tamaño de lienzo y su ancla_fase en el mismo punto: se alternan sin mover nada.",
        "anclas.pies = centro de las suelas; anclas.cabeza = cinta; anclas.manos = muñequeras visibles. Son automáticas y aproximadas; null o lista vacía = no detectado.",
        "mira_a indica hacia dónde mira: para que mire al otro lado, espejar en horizontal (scaleX(-1)).",
    ],
    "ejercicios": ejercicios,
    "sprites": sprites,
}
json.dump(manifest, open(f"{base}/manifest.json", "w"), ensure_ascii=False, indent=1)

# --- Paleta medida en los sprites (mediana por zona)
def tonos():
    piel, cian, tinta = [], [], []
    for s in ["gesto_de_pie", "gesto_brazos_cruzados", "gesto_celebrar"]:
        a = np.array(Image.open(f"{base}/sprites/{s}.png").convert("RGBA")).astype(int)
        op = a[:, :, 3] > 200
        r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
        mx, mn = a[:, :, :3].max(2), a[:, :, :3].min(2)
        sat = (mx - mn) / np.maximum(mx, 1)
        piel.append(a[op & (mx > 190) & (sat < 0.15) & (b >= r)][:, :3])
        cian.append(a[op & (b > 150) & (r < 90) & (sat > 0.6)][:, :3])
        tinta.append(a[op & (mx < 50)][:, :3])
    hexa = lambda arr: "#%02X%02X%02X" % tuple(int(v) for v in np.median(np.concatenate(arr), 0))
    return {"piel_hielo": hexa(piel), "cian_cinta": hexa(cian), "tinta_contorno": hexa(tinta)}

personaje = {
    "nombre": "por definir",
    "concepto": "A · Atleta de tinta (cómic semi-realista)",
    "descripcion": ("atleta masculino musculoso pero creíble (no culturista exagerado), proporciones de 7 cabezas, estilo cómic "
                    "semi-realista con sombreado suave en dos tonos. Piel estilizada en color hielo pálido (no un tono de piel humano "
                    "realista) con contorno grueso de tinta grafito hecho con trazo de pincel seco. Cara expresiva: ojos grandes con "
                    "pupila marcada, cejas muy expresivas, boca capaz de sonrisa de lado. Cinta cian en la frente con dos colas cortas "
                    "que caen atrás, muñequeras cian, pantalón corto grafito con una franja cian lateral, torso desnudo con músculos "
                    "bien definidos pero limpios, zapatillas grafito."),
    "paleta_medida": tonos(),
    "referencias": {"concepto": "referencias/concepto_elegido.png", "modelo": "referencias/hoja_modelo.png",
                    "expresiones": "referencias/hoja_expresiones.png", "manos": "referencias/hoja_manos.png"},
    "generar_mas": {
        "como": "Hoja de 3-4 poses con fondo transparente, adjuntando las tres hojas de referencia; luego scripts/mascota/procesar.py la corta y normaliza.",
        "prompt_base": ("Hoja de sprites para animación 2D del personaje de las imágenes adjuntas. Mismo personaje exacto en todas las figuras: "
                        "proporciones, colores, cinta, ropa, rostro y estilo de línea de pincel.\n\nDescripción: {descripcion}\n\nReglas:\n"
                        "- Fondo totalmente transparente. Sin suelo, sombras proyectadas, escenario, marcos ni líneas divisorias.\n"
                        "- Figuras separadas por mucho espacio vacío: ninguna parte de una figura toca ni se superpone con otra.\n"
                        "- Todas las figuras al mismo tamaño de personaje, completas dentro de la imagen, nada cortado.\n"
                        "- Contorno limpio y cerrado, sin halos ni bordes blancos. Sombreado de cómic suave en dos tonos, luz desde arriba a la izquierda.\n"
                        "- Manos con cinco dedos; el equipo pasa por dentro de la mano con un agarre creíble.\n"
                        "- Equipo en gris acero neutro, sin marcas.\n- Sin texto, letras, números ni logos.\n\nDistribución: {distribucion}"),
    },
    "reglas": [
        "Personaje original de IncreaseFit: no imitar personajes ni estilos de otras cuentas.",
        "El humor sale de lo que le pasa al personaje; nunca se ridiculizan cuerpos.",
        "Los sprites de categoría 'error' solo se usan para enseñar lo que no se debe hacer.",
    ],
}
json.dump(personaje, open(f"{base}/personaje.json", "w"), ensure_ascii=False, indent=1)

# --- Hoja de contactos limpia (fondo grafito de la marca)
try:
    fuente = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 26)
except OSError:
    fuente = ImageFont.load_default()
CW, CH, COLS = 420, 560, 8
orden = [s["id"] for s in sprites]
filas = (len(orden) + COLS - 1) // COLS
hoja = Image.new("RGBA", (CW * COLS, CH * filas), (23, 30, 38, 255))
d = ImageDraw.Draw(hoja)
for k, sid in enumerate(orden):
    cx, cy = (k % COLS) * CW, (k // COLS) * CH
    im = Image.open(f"{base}/sprites/{sid}.png")
    f = min((CW - 30) / im.size[0], (CH - 70) / im.size[1])
    im = im.resize((max(1, round(im.size[0] * f)), max(1, round(im.size[1] * f))), Image.LANCZOS)
    hoja.alpha_composite(im, (cx + (CW - im.size[0]) // 2, cy + CH - 20 - im.size[1]))
    est = next(s["estado"] for s in sprites if s["id"] == sid)
    d.text((cx + 12, cy + 10), sid, fill=(255, 178, 36) if est != "ok" else (212, 241, 249), font=fuente)
hoja.convert("RGB").save(f"{base}/contactos.jpg", quality=86)
print(len(sprites), "sprites ·", sum(s["estado"] != "ok" for s in sprites), "a revisar")
