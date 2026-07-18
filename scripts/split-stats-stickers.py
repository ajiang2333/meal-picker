from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "apps" / "miniapp" / "src" / "static" / "stats"
SOURCE = ASSETS / "stats-stickers-source.png"

CROPS = {
    "magic-menu-badge-green.png": (32, 54, 520, 500),
    "skewer-green.png": (606, 64, 1026, 486),
    "drink-green.png": (1120, 58, 1486, 488),
    "cake-green.png": (52, 555, 485, 985),
    "bento-green.png": (545, 550, 1085, 1002),
}

ASSETS.mkdir(parents=True, exist_ok=True)
image = Image.open(SOURCE).convert("RGBA")
for name, bounds in CROPS.items():
    image.crop(bounds).save(ASSETS / name)
