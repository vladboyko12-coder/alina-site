#!/usr/bin/env python3
"""Рендер листов чертежей из PDF в JPG + assets/drawings/drawings.js (PyMuPDF)."""
from pathlib import Path
import fitz, json

SRC = Path("Новый материал/Чертежный пакет")
OUT = Path("assets/drawings/img")
DATA = Path("assets/drawings/drawings.js")

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    pdfs = sorted(SRC.glob("*.pdf"), key=lambda p: int(p.stem))
    sheets = []
    for i, pdf in enumerate(pdfs, 1):
        doc = fitz.open(pdf)
        page = doc[0]
        zoom = 1400 / page.rect.width
        pix = page.get_pixmap(matrix=fitz.Matrix(zoom, zoom), alpha=False)
        name = f"sheet-{i:02d}.jpg"
        (OUT/name).write_bytes(pix.tobytes("jpeg", jpg_quality=82))
        sheets.append({"file": name, "w": pix.width, "h": pix.height,
                       "alt": f"Лист чертёжного пакета {i} — рабочий дизайн-проект интерьера, Алина Яровая"})
        print(f"{name}  {pix.width}x{pix.height}")
        doc.close()
    DATA.write_text("window.DRAWINGS = " + json.dumps(sheets, ensure_ascii=False, indent=2) + ";\n", encoding="utf-8")
    print(f"Готово: {len(sheets)} листов -> {DATA}")
