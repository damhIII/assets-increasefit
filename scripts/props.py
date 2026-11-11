#!/usr/bin/env python3
"""Objetos (props) en el estilo de la mascota: hojas de props/hojas/ → props/sprites/*.png + props/manifest.json + props/contactos.jpg.

Uso: python3 scripts/props.py

Las hojas se generaron con gpt-image-2.6-sunburst (notebook Generar_assets_IncreaseFit). Para añadir objetos: genera una hoja nueva,
guárdala en props/hojas/ y añádela a HOJAS (nombres en orden: izquierda→derecha; en rejilla, fila de arriba primero) y a META.
"""
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(RAIZ, "scripts", "mascota"))
from segmentar import figuras            # noqa: E402
from procesar import recortar, recortar_alfa, escalar   # noqa: E402

LADO_MAX = 700                            # px del lado mayor del PNG final

HOJAS = [
    ("props_01", True, ["prop_barra", "prop_disco", "prop_mancuerna", "prop_kettlebell", "prop_cuerda_saltar", "prop_munequera"]),
    ("props_02", False, ["prop_banco", "prop_rack", "prop_esterilla"]),
    ("props_03", True, ["prop_shaker", "prop_bote_creatina", "prop_cuchara_polvo", "prop_plato_pollo", "prop_huevos", "prop_taza_cafe"]),
    ("props_04", True, ["prop_cama", "prop_botella_agua", "prop_despertador", "prop_toalla"]),
    ("props_05", True, ["prop_libreta", "prop_lapiz", "prop_bascula", "prop_cinta_metrica", "prop_cronometro", "prop_calendario"]),
    ("props_06", True, ["prop_cerebro", "prop_fibra_muscular", "prop_corazon", "prop_bateria_llena", "prop_bateria_baja", "prop_matraz"]),
]
# id: (categoría, uso, tam_escena = px del lado mayor al dibujarlo junto a la mascota en encuadre general, suelo = se apoya en el suelo)
META = {
    "prop_barra": ("gym", "Barra olímpica cargada: fuerza, cargas, progresión.", 760, True),
    "prop_disco": ("gym", "Disco de pesas suelto: añadir peso, sobrecarga progresiva.", 260, False),
    "prop_mancuerna": ("gym", "Mancuerna: trabajo con mancuernas, curl, entrenar en casa.", 280, False),
    "prop_kettlebell": ("gym", "Kettlebell: pesas, entrenamiento funcional.", 240, True),
    "prop_cuerda_saltar": ("cardio", "Cuerda de saltar: cardio, calentamiento.", 300, False),
    "prop_munequera": ("gym", "Muñequera azul como la de la mascota: detalle de marca.", 180, False),
    "prop_banco": ("gym", "Banco plano: press, hip thrust, descanso.", 620, True),
    "prop_rack": ("gym", "Rack con barra cargada: sentadilla, gimnasio.", 820, True),
    "prop_esterilla": ("gym", "Esterilla enrollada: movilidad, estiramientos, core.", 360, True),
    "prop_shaker": ("nutricion", "Shaker de proteína: proteína, batidos.", 300, False),
    "prop_bote_creatina": ("nutricion", "Bote de suplemento sin etiqueta: creatina, proteína en polvo.", 300, False),
    "prop_cuchara_polvo": ("nutricion", "Cuchara dosificadora con polvo: la dosis (creatina 3-5 g, proteína).", 280, False),
    "prop_plato_pollo": ("nutricion", "Plato de pollo, arroz y brócoli: comida, proteína en la dieta.", 360, False),
    "prop_huevos": ("nutricion", "Huevos, uno partido: proteína, desayuno.", 280, False),
    "prop_taza_cafe": ("nutricion", "Taza de café humeante: cafeína antes de entrenar.", 260, False),
    "prop_cama": ("descanso", "Cama: dormir, recuperación.", 780, True),
    "prop_botella_agua": ("descanso", "Botella de agua: hidratación.", 280, False),
    "prop_despertador": ("descanso", "Despertador: horas de sueño, madrugar.", 260, False),
    "prop_toalla": ("descanso", "Toalla doblada: después de entrenar.", 300, False),
    "prop_libreta": ("medir", "Libreta abierta: registrar kilos y repeticiones.", 340, False),
    "prop_lapiz": ("medir", "Lápiz: anotar el entrenamiento.", 220, False),
    "prop_bascula": ("medir", "Báscula sin números: peso corporal (nunca como meta: el blanco es el error, no el cuerpo).", 320, True),
    "prop_cinta_metrica": ("medir", "Cinta métrica: medir el progreso.", 260, False),
    "prop_cronometro": ("medir", "Cronómetro: descanso entre series, tiempo bajo tensión.", 260, False),
    "prop_calendario": ("medir", "Calendario con un día tachado en rojo: faltar un día, constancia, semanas.", 340, False),
    "prop_cerebro": ("ciencia", "Cerebro: conexión mente-músculo, sistema nervioso, ánimo.", 320, False),
    "prop_fibra_muscular": ("ciencia", "Haz de fibras musculares en sección: hipertrofia, fibras.", 360, False),
    "prop_corazon": ("ciencia", "Corazón anatómico: cardio, salud cardiovascular.", 300, False),
    "prop_bateria_llena": ("ciencia", "Batería llena (azul): energía, recuperado, descansado.", 300, False),
    "prop_bateria_baja": ("ciencia", "Batería casi vacía (rojo): fatiga, sin energía.", 300, False),
    "prop_matraz": ("ciencia", "Matraz con líquido azul: estudios, ciencia, laboratorio.", 300, False),
}


def main():
    os.makedirs(f"{RAIZ}/props/sprites", exist_ok=True)
    items = []
    for hid, rejilla, nombres in HOJAS:
        im, lab, gs = figuras(f"{RAIZ}/props/hojas/{hid}.png", len(nombres), rejilla)
        assert len(gs) == len(nombres), hid
        for n, g in zip(nombres, gs):
            img = recortar_alfa(recortar(im, lab, g))
            f = min(1.0, LADO_MAX / max(img.size))
            img = escalar(img, f)
            img.save(f"{RAIZ}/props/sprites/{n}.png", optimize=True)
            cat, uso, tam, suelo = META[n]
            items.append({"id": n, "archivo": f"sprites/{n}.png", "categoria": cat, "uso": uso, "tam": list(img.size),
                          "tam_escena": tam, "suelo": suelo, "hoja": hid})
    manifest = {"version": 1,
                "notas": ["Objetos dibujados en el estilo de la mascota (tinta grafito, gris acero, detalles azul/rojo de marca). Sin texto ni marcas.",
                          "tam_escena: px del lado mayor al dibujarlo junto a la mascota en encuadre general (más grande que el tamaño real para que se lea).",
                          "suelo: true = se apoya en el suelo (Y=1340) al lado de la mascota; false = flota junto a ella como un icono.",
                          "En la escaleta: {\"tipo\": \"prop\", \"prop\": \"<id>\", \"apunta\"?, \"escala\"?, \"en\": n}. En escenas a medida: <PropObjeto> de componentes/extra.tsx."],
                "props": items}
    json.dump(manifest, open(f"{RAIZ}/props/manifest.json", "w"), ensure_ascii=False, indent=1)

    try:
        fuente = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 22)
    except OSError:
        fuente = ImageFont.load_default()
    CW, CH, COLS = 360, 330, 6
    filas = (len(items) + COLS - 1) // COLS
    hoja = Image.new("RGBA", (CW * COLS, CH * filas), (23, 30, 38, 255))
    d = ImageDraw.Draw(hoja)
    for k, it in enumerate(items):
        cx, cy = (k % COLS) * CW, (k // COLS) * CH
        im = Image.open(f"{RAIZ}/props/{it['archivo']}")
        f = min((CW - 40) / im.size[0], (CH - 70) / im.size[1])
        im = im.resize((max(1, round(im.size[0] * f)), max(1, round(im.size[1] * f))), Image.LANCZOS)
        hoja.alpha_composite(im, (cx + (CW - im.size[0]) // 2, cy + CH - 15 - im.size[1]))
        d.text((cx + 10, cy + 8), it["id"], fill=(212, 241, 249), font=fuente)
    hoja.convert("RGB").save(f"{RAIZ}/props/contactos.jpg", quality=86)
    print(f"{len(items)} props → props/sprites · props/manifest.json · props/contactos.jpg")


if __name__ == "__main__":
    main()
