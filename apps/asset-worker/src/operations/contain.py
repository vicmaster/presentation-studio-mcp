"""contain - resize an image to fit inside a box while preserving aspect ratio."""

from PIL import Image

from models import OperationRequest, OperationResponse
from utils.io_utils import load_image, save_image
from utils.image_utils import resize_keep_mode
from utils.color_utils import parse_color


def contain(req: OperationRequest) -> OperationResponse:
    if not req.input_path or not req.output_path:
        return OperationResponse(
            ok=False,
            operation="contain",
            output_path=req.output_path or "",
            error="contain requires input_path and output_path",
        )
    if not req.width or not req.height:
        return OperationResponse(
            ok=False,
            operation="contain",
            output_path=req.output_path,
            error="contain requires width and height",
        )

    target_w = int(req.width)
    target_h = int(req.height)

    image = load_image(req.input_path).convert("RGBA")
    nw, nh = image.size
    scale = min(target_w / nw, target_h / nh)
    new_w = max(1, int(round(nw * scale)))
    new_h = max(1, int(round(nh * scale)))
    resized = resize_keep_mode(image, (new_w, new_h))

    bg_color = parse_color(req.background or "", default=(255, 255, 255, 0))
    canvas = Image.new("RGBA", (target_w, target_h), bg_color)
    offset = ((target_w - new_w) // 2, (target_h - new_h) // 2)
    canvas.paste(resized, offset, resized)

    w, h = save_image(canvas, req.output_path, fmt=req.format, quality=req.quality)
    return OperationResponse(
        ok=True,
        operation="contain",
        output_path=req.output_path,
        width=w,
        height=h,
    )
