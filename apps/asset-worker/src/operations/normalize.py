"""normalize - convert an image to a standard format/mode with auto-orient."""

from PIL import ImageOps

from models import OperationRequest, OperationResponse
from utils.io_utils import load_image, save_image


def normalize(req: OperationRequest) -> OperationResponse:
    if not req.input_path or not req.output_path:
        return OperationResponse(
            ok=False,
            operation="normalize",
            output_path=req.output_path or "",
            error="normalize requires input_path and output_path",
        )
    image = load_image(req.input_path)
    # Apply EXIF orientation so portrait images don't come out sideways.
    try:
        image = ImageOps.exif_transpose(image)
    except Exception:
        pass
    if image.mode not in ("RGB", "RGBA"):
        image = image.convert("RGBA" if "A" in image.mode else "RGB")
    w, h = save_image(image, req.output_path, fmt=req.format or "png", quality=req.quality)
    return OperationResponse(
        ok=True,
        operation="normalize",
        output_path=req.output_path,
        width=w,
        height=h,
    )
