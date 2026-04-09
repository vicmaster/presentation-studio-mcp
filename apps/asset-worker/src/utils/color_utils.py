"""Color utility helpers for the asset worker."""

from typing import Tuple


def parse_color(value: str, default: Tuple[int, int, int, int] = (255, 255, 255, 255)) -> Tuple[int, int, int, int]:
    """Parse a hex color string (#rgb / #rrggbb / #rrggbbaa) into a tuple."""
    if not value:
        return default
    v = value.strip().lstrip("#")
    if len(v) == 3:
        r = int(v[0] * 2, 16)
        g = int(v[1] * 2, 16)
        b = int(v[2] * 2, 16)
        return (r, g, b, 255)
    if len(v) == 6:
        return (int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16), 255)
    if len(v) == 8:
        return (int(v[0:2], 16), int(v[2:4], 16), int(v[4:6], 16), int(v[6:8], 16))
    return default
