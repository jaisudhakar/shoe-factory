"""Cut the shoe artwork out of the design mockups into web assets.

Usage: python3 tools/extract_assets.py <mockup-dir>
Expects 1.webp..4.webp (1536x1024) in <mockup-dir>; writes to assets/img/.
"""
import os
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC = sys.argv[1]
OUT = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
os.makedirs(OUT, exist_ok=True)


def load(n):
    return Image.open(os.path.join(SRC, f"{n}.webp")).convert("RGB")


def soft_edges(img, band=0.14, lo=26, hi=80, rim=6):
    """Fade the dark studio backdrop to transparent toward the edges while
    keeping bright product pixels (glows, soles) opaque, so the photo has no
    visible rectangle on the page."""
    a = np.asarray(img.convert("RGB"), dtype=np.float32)
    h, w = a.shape[:2]
    lum = a @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    b = band * min(w, h)
    ys = np.minimum(np.arange(h), np.arange(h)[::-1])[:, None]
    xs = np.minimum(np.arange(w), np.arange(w)[::-1])[None, :]
    edge = np.clip(np.minimum(ys, xs) / b, 0, 1)
    edge = edge * edge * (3 - 2 * edge)
    content = np.clip((lum - lo) / (hi - lo), 0, 1)
    content = np.asarray(Image.fromarray((content * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(3)), dtype=np.float32) / 255
    # Even bright content fades out over the outermost few pixels.
    rim = np.clip(np.minimum(ys, xs) / rim, 0, 1)
    alpha = np.maximum(edge, content * rim)
    out = img.convert("RGBA")
    out.putalpha(Image.fromarray((alpha * 255).astype(np.uint8)))
    return out


def patch(img, box, sample_y):
    """Cover a region (e.g. leftover headline text) with the nearby background."""
    x0, y0, x1, y1 = box
    row = img.crop((x0, sample_y, x1, sample_y + 6)).resize((x1 - x0, y1 - y0))
    row = row.filter(ImageFilter.GaussianBlur(8))
    # Fully opaque except a soft rim on sides that are not the image border.
    w, h = img.size
    pad = 14
    m = Image.new("L", (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(m).rectangle((
        -pad if x0 == 0 else pad, -pad if y0 == 0 else pad,
        x1 - x0 + (pad if x1 >= w else -pad), y1 - y0 + (pad if y1 >= h else -pad),
    ), fill=255)
    img.paste(row, (x0, y0), m.filter(ImageFilter.GaussianBlur(pad / 2)))


def save(img, name, q=88, scale=1.0):
    if scale != 1.0:
        img = img.resize((round(img.width * scale), round(img.height * scale)), Image.LANCZOS)
        img = img.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
    img.save(os.path.join(OUT, name), "WEBP", quality=q, method=6)


m2, m3, m4 = load(2), load(3), load(4)

# Exploded hero shoe (mockup 4), with the stray headline / callout dots painted out.
hero = m4.crop((470, 85, 1210, 835))
patch(hero, (0, 155, 250, 295), 145)
patch(hero, (700, 466, 740, 500), 455)
patch(hero, (700, 315, 740, 345), 300)
save(soft_edges(hero, lo=48, hi=110, rim=24), "hero-exploded.webp")

# Hero product shot (mockup 2).
save(soft_edges(m2.crop((160, 110, 990, 730)), band=0.2, lo=40, hi=100, rim=60), "runner-x1.webp")

# Product grid shots (mockup 3).
cards = {
    "runner-x1-card": (380, 300, 715, 530),
    "pulse-low": (760, 300, 1095, 530),
    "nova-high": (1140, 300, 1470, 530),
    "ghost-trail": (380, 680, 715, 905),
    "strato-run": (760, 680, 1095, 905),
    "circuit-pro": (1140, 680, 1470, 905),
}
for name, box in cards.items():
    save(soft_edges(m3.crop(box), band=0.18), f"{name}.webp", scale=2.0)

# Gallery thumbnails (mockup 2, left column) — top, side and outsole views.
thumbs = {
    "x1-pair": (56, 266, 155, 360),
    "x1-side": (56, 378, 155, 472),
    "x1-sole": (56, 490, 155, 584),
}
for name, box in thumbs.items():
    save(m2.crop(box), f"{name}.webp", scale=3.0)

# Tech tiles (mockup 2, bottom row).
tiles = {
    "tech-cushion": (64, 862, 314, 973),
    "tech-carbon": (555, 862, 793, 973),
    "tech-grip": (1035, 862, 1285, 973),
}
for name, box in tiles.items():
    save(m2.crop(box), f"{name}.webp", scale=2.0)

# Rocky terrain corners for the hero floor (mockup 4).
save(m4.crop((0, 700, 470, 930)), "rocks-left.webp", scale=1.5)
save(m4.crop((1210, 700, 1536, 915)), "rocks-right.webp", scale=1.5)
print("done")
