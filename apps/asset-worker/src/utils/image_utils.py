"""Pillow-level shared helpers used across operations."""

from typing import Tuple

from PIL import Image


def ensure_rgba(image: Image.Image) -> Image.Image:
    if image.mode != "RGBA":
        return image.convert("RGBA")
    return image


def resize_keep_mode(image: Image.Image, size: Tuple[int, int]) -> Image.Image:
    resample = getattr(Image, "Resampling", Image).LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS  # type: ignore
    return image.resize(size, resample=resample)


def cover_box(
    natural: Tuple[int, int],
    target: Tuple[int, int],
    anchor: str = "center",
) -> Tuple[int, int, int, int]:
    """
    Compute the crop rectangle (left, top, right, bottom) that, when
    applied after scaling the image to cover `target`, keeps the content
    anchored to the requested side.
    """
    nw, nh = natural
    tw, th = target
    if nw <= 0 or nh <= 0:
        return (0, 0, tw, th)
    scale = max(tw / nw, th / nh)
    scaled_w = int(round(nw * scale))
    scaled_h = int(round(nh * scale))
    # We compute the crop box relative to the already-scaled image.
    dx = scaled_w - tw
    dy = scaled_h - th
    if anchor == "north":
        left, top = dx // 2, 0
    elif anchor == "south":
        left, top = dx // 2, dy
    elif anchor == "east":
        left, top = dx, dy // 2
    elif anchor == "west":
        left, top = 0, dy // 2
    elif anchor == "nw":
        left, top = 0, 0
    elif anchor == "ne":
        left, top = dx, 0
    elif anchor == "sw":
        left, top = 0, dy
    elif anchor == "se":
        left, top = dx, dy
    else:
        left, top = dx // 2, dy // 2
    return (left, top, left + tw, top + th)
