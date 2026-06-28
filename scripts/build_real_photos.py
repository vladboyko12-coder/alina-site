#!/usr/bin/env python3
"""Реальные фото интерьеров: thumb + full + assets/real-works.js."""
from pathlib import Path
from PIL import Image, ImageOps
import json

SRC = Path("Новый материал/фото")
THUMB = Path("assets/img/real/thumb")
FULL = Path("assets/img/real/full")
DATA = Path("assets/real-works.js")

try:
    import pillow_heif
    pillow_heif.register_heif_opener()
    HEIC = True
except Exception:
    HEIC = False

def save(src, dst, max_w, q):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        if im.width > max_w:
            h = round(im.height*max_w/im.width)
            im = im.resize((max_w, h), Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "JPEG", quality=q, optimize=True, progressive=True)
        return im.width, im.height

def collect():
    files = sorted(p for p in SRC.iterdir() if p.suffix.lower() in {".jpg",".jpeg"})
    if HEIC:
        for p in sorted(SRC.glob("*.heic")):
            if not p.with_suffix(".jpeg").exists() and not p.with_suffix(".jpg").exists():
                files.append(p)
    return files

if __name__ == "__main__":
    works = []
    for i, src in enumerate(collect(), 1):
        name = f"real-{i:02d}.jpg"
        w, h = save(src, FULL/name, 1600, 80)
        save(src, THUMB/name, 800, 78)
        works.append({"file": name, "w": w, "h": h,
                      "alt": f"Реальное фото готового интерьера, дизайнер Алина Яровая, Калининград — проект {i}"})
        print(f"{name}  {w}x{h}")
    DATA.write_text("window.REAL_WORKS = " + json.dumps(works, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"Готово: {len(works)} фото -> {DATA}")
