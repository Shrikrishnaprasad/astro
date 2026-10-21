"""Generate PWA PNG icons (run after changing brand colors)."""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1] / "public"
BG = (22, 25, 37)  # #161925
ACCENT = (110, 231, 160)  # #6ee7a0 (lagna green)
TEXT = (240, 240, 240)


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG + (255,))
    draw = ImageDraw.Draw(img)
    pad = size * 0.12
    draw.rounded_rectangle(
        (pad, pad, size - pad, size - pad),
        radius=size * 0.18,
        fill=(27, 31, 48),
        outline=ACCENT,
        width=max(2, size // 64),
    )
    font_size = int(size * 0.38)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()
    text = "A"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text(
        ((size - tw) / 2, (size - th) / 2 - size * 0.04),
        text,
        fill=ACCENT,
        font=font,
    )
    return img


def main() -> None:
    ROOT.mkdir(parents=True, exist_ok=True)
    for name, size in (
        ("pwa-192x192.png", 192),
        ("pwa-512x512.png", 512),
        ("apple-touch-icon.png", 180),
    ):
        draw_icon(size).save(ROOT / name, optimize=True)
    print(f"Wrote icons to {ROOT}")


if __name__ == "__main__":
    main()
