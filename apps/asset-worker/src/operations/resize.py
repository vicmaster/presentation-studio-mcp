"""resize - scale an image to an exact width/height (no aspect preservation)."""

from models import OperationRequest, OperationResponse
from utils.io_utils import load_image, save_image
from utils.image_utils import resize_keep_mode


def resize(req: OperationRequest) -> OperationResponse:
    if not req.input_path or not req.output_path:
        return OperationResponse(
            ok=False,
            operation="resize",
            output_path=req.output_path or "",
            error="resize requires input_path and output_path",
        )
    if not req.width or not req.height:
        return OperationResponse(
            ok=False,
            operation="resize",
            output_path=req.output_path,
            error="resize requires width and height",
        )
    image = load_image(req.input_path)
    result = resize_keep_mode(image, (int(req.width), int(req.height)))
    w, h = save_image(result, req.output_path, fmt=req.format, quality=req.quality)
    return OperationResponse(
        ok=True,
        operation="resize",
        output_path=req.output_path,
        width=w,
        height=h,
    )
