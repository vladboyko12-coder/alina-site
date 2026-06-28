#!/usr/bin/env python3
"""Готовит hero-рендер и портрет Алины для веба (Pillow)."""
from pathlib import Path
from PIL import Image, ImageOps

SRC = Path("Новый материал")
OUT = Path("assets/img")

def save_jpeg(src, dst, max_w, quality=82):
    with Image.open(src) as im:
        im = ImageOps.exif_transpose(im).convert("RGB")
        if im.width > max_w:
            h = round(im.height * max_w / im.width)
            im = im.resize((max_w, h), Image.LANCZOS)
        dst.parent.mkdir(parents=True, exist_ok=True)
        im.save(dst, "JPEG", quality=quality, optimize=True, progressive=True)
        print(f"{dst}  {im.width}x{im.height}  {dst.stat().st_size//1024} КБ")

if __name__ == "__main__":
    save_jpeg(SRC/"Заменить заставку"/"3350003.jpg", OUT/"hero.jpg", 1600, 82)
    save_jpeg(SRC/"портрет"/"12 (3).jpg", OUT/"about"/"alina.jpg", 900, 82)
