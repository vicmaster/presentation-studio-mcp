"""IO helpers used by every Pillow operation."""

import os
from pathlib import Path
from typing import Optional, Tuple

from PIL import Image


def ensure_parent_dir(path: str) -> None:
    parent = os.path.dirname(os.path.abspath(path))
    if parent:
        os.makedirs(parent, exist_ok=True)


def load_image(path: str) -> Image.Image:
    if not os.path.exists(path):
        raise FileNotFoundError(f"Image not found: {path}")
    image = Image.open(path)
    # Force load so subsequent operations have the pixel data ready.
    image.load()
    return image


def save_image(
    image: Image.Image,
    path: str,
    fmt: Optional[str] = None,
    quality: Optional[int] = None,
) -> Tuple[int, int]:
    ensure_parent_dir(path)
    suffix = Path(path).suffix.lower().lstrip(".")
    save_format = (fmt or suffix or "png").upper()
    if save_format == "JPG":
        save_format = "JPEG"
    kwargs = {}
    if save_format == "JPEG":
        kwargs["quality"] = quality or 90
        # JPEG does not support alpha; composite onto white.
        if image.mode in ("RGBA", "LA"):
            background = Image.new("RGB", image.size, (255, 255, 255))
            background.paste(image, mask=image.split()[-1])
            image = background
        elif image.mode != "RGB":
            image = image.convert("RGB")
    elif save_format == "PNG":
        if image.mode not in ("RGB", "RGBA", "P"):
            image = image.convert("RGBA")
    image.save(path, save_format, **kwargs)
    return image.size
