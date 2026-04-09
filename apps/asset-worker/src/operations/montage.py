"""montage - tile multiple images into a grid output."""

from typing import List

from PIL import Image

from models import OperationRequest, OperationResponse
from utils.color_utils import parse_color
from utils.io_utils import load_image, save_image
from utils.image_utils import resize_keep_mode


def montage(req: OperationRequest) -> OperationResponse:
    if not req.output_path:
        return OperationResponse(
            ok=False,
            operation="montage",
            output_path=req.output_path or "",
            error="montage requires output_path",
        )
    if not req.inputs:
        return OperationResponse(
            ok=False,
            operation="montage",
            output_path=req.output_path,
            error="montage requires inputs",
        )
    if not req.width or not req.height:
        return OperationResponse(
            ok=False,
            operation="montage",
            output_path=req.output_path,
            error="montage requires width and height (of each cell)",
        )

    cell_w = int(req.width)
    cell_h = int(req.height)
    cols = int(req.columns or min(4, len(req.inputs)))
    if cols < 1:
        cols = 1
    rows = (len(req.inputs) + cols - 1) // cols

    canvas_w = cols * cell_w
    canvas_h = rows * cell_h
    canvas = Image.new("RGBA", (canvas_w, canvas_h), parse_color(req.background or "", default=(255, 255, 255, 255)))

    warnings: List[str] = []
    for i, path in enumerate(req.inputs):
        try:
            img = load_image(path).convert("RGBA")
        except Exception as err:  # noqa: BLE001
            warnings.append(f"Failed to load {path}: {err}")
            continue
        img = _cover(img, (cell_w, cell_h))
        r = i // cols
        c = i % cols
        canvas.paste(img, (c * cell_w, r * cell_h), img)

    w, h = save_image(canvas, req.output_path, fmt=req.format or "png", quality=req.quality)
    return OperationResponse(
        ok=True,
        operation="montage",
        output_path=req.output_path,
        width=w,
        height=h,
        warnings=warnings,
    )


def _cover(image: Image.Image, target: tuple) -> Image.Image:
    nw, nh = image.size
    tw, th = target
    scale = max(tw / nw, th / nh)
    scaled = resize_keep_mode(image, (max(1, int(round(nw * scale))), max(1, int(round(nh * scale)))))
    dx = (scaled.size[0] - tw) // 2
    dy = (scaled.size[1] - th) // 2
    return scaled.crop((dx, dy, dx + tw, dy + th))
