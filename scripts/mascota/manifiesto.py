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
# Hojas 13-26 (noviembre de 2026, gpt-image-2.6-sunburst): poses por tema, errores nuevos, fases intermedias y bocas.
NUEVOS = {
    "gesto_dormir": ("gesto", "perfil_tumbado", "izquierda", None, None, "dormido", "Durmiendo de lado en una cama (la cama forma parte del sprite)."),
    "gesto_bostezo": ("gesto", "tres_cuartos", "derecha", None, None, "cansado", "De pie bostezando, mano tapando la boca."),
    "gesto_despertar": ("gesto", "frente", "camara", None, None, "alegre", "Recién levantado, estira los brazos hacia arriba."),
    "gesto_batido": ("gesto", "tres_cuartos", "derecha", None, None, "neutral", "Bebe de un shaker de proteína."),
    "gesto_comer": ("gesto", "frente", "camara", None, None, "alegre", "Come pollo, arroz y brócoli de un plato."),
    "gesto_creatina": ("gesto", "frente", "camara", None, None, "concentrado", "Echa una cuchara de polvo blanco en un vaso de agua (creatina)."),
    "gesto_cafe": ("gesto", "frente", "camara", None, None, "aliviado", "Taza de café humeante con las dos manos."),
    "correr_f1": ("ejercicio", "perfil", "derecha", "correr", 1, "confiado", "Corriendo de perfil, fase 1 del ciclo."),
    "correr_f2": ("ejercicio", "perfil", "derecha", "correr", 2, "confiado", "Corriendo de perfil, fase 2 del ciclo (piernas cambiadas)."),
    "gesto_jadeo": ("gesto", "tres_cuartos", "derecha", None, None, "agotado", "Manos en las rodillas, sin aliento después del cardio."),
    "estirar_cuadriceps": ("gesto", "perfil", "derecha", None, None, "concentrado", "Estira el cuádriceps a la pata coja (calentamiento, movilidad)."),
    "estirar_hombro": ("gesto", "frente", "camara", None, None, "neutral", "Estira el hombro cruzando el brazo por delante del pecho."),
    "estirar_isquios": ("gesto", "perfil", "derecha", None, None, "esfuerzo", "Inclinado hacia delante tocándose las puntas de los pies."),
    "gesto_libreta": ("gesto", "frente", "camara", None, None, "concentrado", "Anota en su libreta de entrenamiento (medir el progreso)."),
    "gesto_cronometro": ("gesto", "frente", "camara", None, None, "confiado", "Mira un cronómetro: descanso entre series."),
    "gesto_toalla": ("gesto", "frente", "camara", None, None, "relajado", "Toalla al cuello, se seca el sudor."),
    "gesto_agua": ("gesto", "tres_cuartos", "derecha", None, None, "neutral", "Bebe de una botella de agua."),
    "esfuerzo_ultima_rep": ("gesto", "frente", "camara", None, None, "esfuerzo", "Última repetición de curl: dientes apretados, sudor (cerca del fallo)."),
    "gesto_empujar_pared": ("gesto", "perfil", "derecha", None, None, "esfuerzo", "Empuja un muro de ladrillo con todo el cuerpo (estancado)."),
    "gesto_flexionar_mirar": ("gesto", "frente", "camara", None, None, "concentrado", "Flexiona el bíceps y lo mira fijamente (pensar en el músculo)."),
    "gesto_frustrado": ("gesto", "frente", "camara", None, None, "frustrado", "Manos en la cabeza, mirando al suelo."),
    "error_press_militar_arqueo": ("error", "tres_cuartos", "derecha", "press_militar", None, "esfuerzo", "ERROR: barra arriba arqueando la zona lumbar."),
    "error_zancada_rodilla": ("error", "tres_cuartos", "camara", "zancada", None, "molestia", "ERROR: rodilla delantera hacia dentro y torso torcido."),
    "error_hip_thrust_hiperextension": ("error", "perfil_tumbado", "izquierda", "hip_thrust", None, "esfuerzo", "ERROR: hiperextiende la lumbar (costillas arriba)."),
    "plano_boca_reposo": ("plano_medio", "tres_cuartos", "camara", None, None, "confiado", "Plano medio que habla: boca en reposo (base). Con anim 'hablar' alterna las bocas al ritmo de la voz."),
    "plano_boca_a": ("plano_medio", "tres_cuartos", "camara", None, None, "confiado", "Plano medio que habla: boca A (abierta)."),
    "plano_boca_e": ("plano_medio", "tres_cuartos", "camara", None, None, "confiado", "Plano medio que habla: boca E/I (dientes)."),
    "plano_boca_o": ("plano_medio", "tres_cuartos", "camara", None, None, "confiado", "Plano medio que habla: boca O."),
    "plano_boca_u": ("plano_medio", "tres_cuartos", "camara", None, None, "confiado", "Plano medio que habla: boca U."),
}
# Fase intermedia de cada ejercicio: va entre f1 y f2 (la animación hace f1 → fm → f2 → fm).
FM = {ej: vista for ej, vista in (("sentadilla", "perfil"), ("peso_muerto", "perfil"), ("curl", "perfil"), ("press_militar", "tres_cuartos"),
                                    ("dominada", "espalda"), ("zancada", "perfil"), ("press_banca", "perfil_tumbado"), ("hip_thrust", "perfil_tumbado"))}
_orden = {}
for _k, _v in M.items():
    _orden[_k] = _v
    if _k.endswith("_f1") and _k[:-3] in FM:
        _ej = _k[:-3]
        _orden[f"{_ej}_fm"] = ("ejercicio", FM[_ej], _v[2], _ej, 1.5, _v[5], "Fase intermedia, a mitad de recorrido entre f1 y f2.")
_orden.update(NUEVOS)
M = _orden

NOTAS = {
    "press_banca_f1": ("ok", "Ampliado x1,48 para igualar la escala: algo más suave que el resto."),
    "press_banca_f2": ("ok", "Ampliado x1,48; el disco tapa parte de la cara."),
    "error_banca_cadera_arriba": ("ok", "Ampliado x1,48."),
    "peso_muerto_f1": ("ok", "Barra en tres cuartos (la sentadilla la muestra de canto)."),
}
CORRECTO = {"error_press_militar_arqueo": "press_militar", "error_zancada_rodilla": "zancada", "error_hip_thrust_hiperextension": "hip_thrust",
            "error_sentadilla_media": "sentadilla", "error_peso_muerto_redondo": "peso_muerto", "error_dominada_balanceo": "dominada",
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
        "Las fases de un ejercicio (f1, fm, f2) tienen el mismo tamaño de lienzo y su ancla_fase en el mismo punto: se alternan sin mover nada. fm (fase 1.5) es la intermedia: la plantilla hace f1 → fm → f2 → fm.",
        "plano_boca_*: la misma cara con 5 bocas (reposo, a, e, o, u). Con la mascota en plano_boca_reposo y anim 'hablar', la plantilla elige la boca según la palabra que suena.",
        "anclas.pies = centro de las suelas; anclas.cabeza = cinta; anclas.manos = muñequeras visibles. Son automáticas y aproximadas; null o lista vacía = no detectado.",
        "mira_a indica hacia dónde mira: para que mire al otro lado, espejar en horizontal (scaleX(-1)).",
    ],
    "ejercicios": ejercicios,
    "sprites": sprites,
}
json.dump(manifest, open(f"{base}/manifest.json", "w"), ensure_ascii=False, indent=1)

# --- Paleta medida en los sprites (mediana por zona)
def tonos():
    piel, azul, tinta = [], [], []
    for s in ["gesto_de_pie", "gesto_brazos_cruzados", "gesto_celebrar"]:
        a = np.array(Image.open(f"{base}/sprites/{s}.png").convert("RGBA")).astype(int)
        op = a[:, :, 3] > 200
        r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
        mx, mn = a[:, :, :3].max(2), a[:, :, :3].min(2)
        sat = (mx - mn) / np.maximum(mx, 1)
        piel.append(a[op & (mx > 190) & (sat < 0.15) & (b >= r)][:, :3])
        azul.append(a[op & (b > 150) & (r < 90) & (sat > 0.6)][:, :3])
        tinta.append(a[op & (mx < 50)][:, :3])
    hexa = lambda arr: "#%02X%02X%02X" % tuple(int(v) for v in np.median(np.concatenate(arr), 0))
    return {"piel_hielo": hexa(piel), "azul_cinta": hexa(azul), "tinta_contorno": hexa(tinta)}

personaje = {
    "nombre": "por definir",
    "concepto": "A · Atleta de tinta (cómic semi-realista)",
    "descripcion": ("atleta masculino musculoso pero creíble (no culturista exagerado), proporciones de 7 cabezas, estilo cómic "
                    "semi-realista con sombreado suave en dos tonos. Piel estilizada en color hielo pálido (no un tono de piel humano "
                    "realista) con contorno grueso de tinta grafito hecho con trazo de pincel seco. Cara expresiva: ojos grandes con "
                    "pupila marcada, cejas muy expresivas, boca capaz de sonrisa de lado. Cinta azul eléctrico (#2353F1) en la frente con dos colas cortas "
                    "que caen atrás, muñequeras azules, pantalón corto grafito con una franja azul lateral, torso desnudo con músculos "
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
