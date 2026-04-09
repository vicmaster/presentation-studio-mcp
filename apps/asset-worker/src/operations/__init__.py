"""Pillow operations exposed by the asset worker.

This file lives inside a regular Python package (it has an __init__.py), so we
use relative imports here. The sibling modules (resize.py, cover_crop.py, ...)
themselves reach back up to `models` and `utils.*` via absolute imports rooted
at `apps/asset-worker/src`, which `main.py` prepends to `sys.path` on startup.
"""

from .resize import resize
from .contain import contain
from .cover_crop import cover_crop
from .normalize import normalize
from .overlay import overlay
from .montage import montage
from .thumbnail import thumbnail
from .contact_sheet import contact_sheet
from .pad_to_canvas import pad_to_canvas

OPERATIONS = {
    "resize": resize,
    "contain": contain,
    "cover_crop": cover_crop,
    "normalize": normalize,
    "overlay": overlay,
    "montage": montage,
    "thumbnail": thumbnail,
    "contact_sheet": contact_sheet,
    "pad_to_canvas": pad_to_canvas,
}
