"""Trazo de pincel seco (como la flecha del logo) para cortinillas: degradado hielo -> cian, bordes irregulares y vetas."""
import json, math, random, sys

out = sys.argv[1]
W, H = 2400, 560
rng = random.Random(7)


def ruido(n, amp, suave=6):
    v = [rng.uniform(-1, 1) for _ in range(n)]
    for _ in range(suave):
        v = [(v[max(0, i - 1)] + v[i] + v[min(n - 1, i + 1)]) / 3 for i in range(n)]
    m = max(abs(x) for x in v) or 1
    return [x / m * amp for x in v]


N = 240
xs = [60 + (W - 140) * i / (N - 1) for i in range(N)]
grosor = [(0.25 + 0.75 * min(1, (i / (N - 1)) / 0.35)) * 400 for i in range(N)]   # cola fina, cuerpo ancho
cy = H / 2
r_sup, r_inf = ruido(N, 16, 3), ruido(N, 16, 3)
arriba = [(x, cy - g / 2 + r) for x, g, r in zip(xs, grosor, r_sup)]
abajo = [(x, cy + g / 2 + r) for x, g, r in zip(xs, grosor, r_inf)]
# cabeza redondeada e irregular
cab = [(W - 80 + 50 * math.cos(a) + rng.uniform(-6, 6), cy + 200 * math.sin(a)) for a in [(-math.pi / 2 + k * math.pi / 14) for k in range(15)]]
pts = arriba + cab + abajo[::-1]
d = "M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + " Z"

# vetas: huecos finos horizontales, más abundantes en la cola (pincel que se queda sin pintura)
vetas = []
for k in range(42):
    y = cy + rng.uniform(-0.48, 0.48) * 400
    x0 = rng.uniform(40, W * 0.55)
    largo = rng.uniform(80, 700) * (1.4 if x0 < W * 0.3 else 0.7)
    alto = rng.uniform(1.5, 5)
    vetas.append(f'<rect x="{x0:.0f}" y="{y:.1f}" width="{largo:.0f}" height="{alto:.1f}" rx="{alto / 2:.1f}" fill="black"/>')

svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}">
<defs>
<linearGradient id="g" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#D4F1F9"/><stop offset="0.55" stop-color="#5CCAE8"/><stop offset="1" stop-color="#1FB7DE"/></linearGradient>
<mask id="m"><rect width="{W}" height="{H}" fill="white"/>{"".join(vetas)}</mask>
</defs>
<path d="{d}" fill="url(#g)" mask="url(#m)"/>
</svg>
'''
open(f"{out}/transiciones/trazo_pincel.svg", "w").write(svg)
man = json.load(open(f"{out}/manifest.json"))
man["piezas"].append({"id": "trazo_pincel", "archivo": "transiciones/trazo_pincel.svg", "categoria": "transiciones", "tam": [W, H],
            "uso": "Cortinilla con la estética de la flecha del logo: cruza la pantalla de izquierda a derecha (escala 2-3x y rotación -8°) y tapa el cambio de escena.",
            "tintable": False})
json.dump(man, open(f"{out}/manifest.json", "w"), ensure_ascii=False, indent=1)
print("ok")
