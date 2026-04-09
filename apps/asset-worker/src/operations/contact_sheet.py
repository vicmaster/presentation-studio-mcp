"""contact_sheet - generate a single image showing thumbnails of every input."""

from typing import List

from PIL import Image

from models import OperationRequest, OperationResponse
from utils.color_utils import parse_color
from utils.io_utils import load_image, save_image
from utils.image_utils import resize_keep_mode


def contact_sheet(req: OperationRequest) -> OperationResponse:
    if not req.output_path:
        return OperationResponse(
            ok=False,
            operation="contact_sheet",
            output_path=req.output_path or "",
            error="contact_sheet requires output_path",
        )
    if not req.inputs:
        return OperationResponse(
            ok=False,
            operation="contact_sheet",
            output_path=req.output_path,
            error="contact_sheet requires inputs",
        )
    canvas_w = int(req.width or 1600)
    canvas_h = int(req.height or 1200)
    cols = int(req.columns or 4)
    rows = (len(req.inputs) + cols - 1) // cols
    gap = 24
    cell_w = (canvas_w - gap * (cols + 1)) // cols
    cell_h = (canvas_h - gap * (rows + 1)) // rows

    canvas = Image.new("RGBA", (canvas_w, canvas_h), parse_color(req.background or "#F7F7F8"))
    warnings: List[str] = []

    for i, path in enumerate(req.inputs):
        try:
            img = load_image(path).convert("RGBA")
        except Exception as err:  # noqa: BLE001
            warnings.append(f"Failed to load {path}: {err}")
            continue
        img.thumbnail((cell_w, cell_h))
        c = i % cols
        r = i // cols
        x = gap + c * (cell_w + gap) + (cell_w - img.size[0]) // 2
        y = gap + r * (cell_h + gap) + (cell_h - img.size[1]) // 2
        canvas.paste(img, (x, y), img)

    # If the sheet exceeds the requested canvas, enlarge to match.
    if canvas.size != (canvas_w, canvas_h):
        canvas = resize_keep_mode(canvas, (canvas_w, canvas_h))

    w, h = save_image(canvas, req.output_path, fmt=req.format or "png", quality=req.quality)
    return OperationResponse(
        ok=True,
        operation="contact_sheet",
        output_path=req.output_path,
        width=w,
        height=h,
        warnings=warnings,
    )
