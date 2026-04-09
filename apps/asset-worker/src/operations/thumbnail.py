"""thumbnail - scale an image down while preserving aspect ratio (never up)."""

from PIL import Image

from models import OperationRequest, OperationResponse
from utils.io_utils import load_image, save_image


def thumbnail(req: OperationRequest) -> OperationResponse:
    if not req.input_path or not req.output_path:
        return OperationResponse(
            ok=False,
            operation="thumbnail",
            output_path=req.output_path or "",
            error="thumbnail requires input_path and output_path",
        )
    if not req.width or not req.height:
        return OperationResponse(
            ok=False,
            operation="thumbnail",
            output_path=req.output_path,
            error="thumbnail requires width and height (max box)",
        )

    image = load_image(req.input_path)
    resample = getattr(Image, "Resampling", Image).LANCZOS if hasattr(Image, "Resampling") else Image.LANCZOS  # type: ignore
    image.thumbnail((int(req.width), int(req.height)), resample)
    w, h = save_image(image, req.output_path, fmt=req.format, quality=req.quality)
    return OperationResponse(
        ok=True,
        operation="thumbnail",
        output_path=req.output_path,
        width=w,
        height=h,
    )
