"""Tiny stderr logger for the asset worker."""

import sys
from typing import Optional


def log(message: str, level: str = "info", extra: Optional[str] = None) -> None:
    line = f"[asset-worker/{level}] {message}"
    if extra:
        line += f" {extra}"
    print(line, file=sys.stderr)
