"""overlay - composite one image on top of another with optional opacity."""

from PIL import Image

from models import OperationRequest, OperationResponse
from utils.io_utils import load_image, save_image


def overlay(req: OperationRequest) -> OperationResponse:
    if not req.input_path or not req.output_path:
        return OperationResponse(
            ok=False,
            operation="overlay",
            output_path=req.output_path or "",
            error="overlay requires input_path and output_path",
        )
    if not req.overlay_path:
        return OperationResponse(
            ok=False,
            operation="overlay",
            output_path=req.output_path,
            error="overlay requires overlay_path",
        )

    base = load_image(req.input_path).convert("RGBA")
    over = load_image(req.overlay_path).convert("RGBA")
    target_w = int(req.width or base.size[0])
    target_h = int(req.height or base.size[1])

    if base.size != (target_w, target_h):
        base = base.resize((target_w, target_h))
    if over.size != (target_w, target_h):
        # Scale the overlay to the target while preserving aspect using cover.
        ow, oh = over.size
        scale = max(target_w / ow, target_h / oh)
        over = over.resize((max(1, int(round(ow * scale))), max(1, int(round(oh * scale)))))
        # center-crop
        dx = (over.size[0] - target_w) // 2
        dy = (over.size[1] - target_h) // 2
        over = over.crop((dx, dy, dx + target_w, dy + target_h))

    opacity = max(0.0, min(1.0, req.opacity if req.opacity is not None else 1.0))
    if opacity < 1.0:
        alpha = over.split()[-1].point(lambda p: int(p * opacity))
        over.putalpha(alpha)

    composite = Image.alpha_composite(base, over)
    w, h = save_image(composite, req.output_path, fmt=req.format or "png", quality=req.quality)
    return OperationResponse(
        ok=True,
        operation="overlay",
        output_path=req.output_path,
        width=w,
        height=h,
    )
