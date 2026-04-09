"""pad_to_canvas - place an image on a larger background without scaling it up."""

from PIL import Image

from models import OperationRequest, OperationResponse
from utils.color_utils import parse_color
from utils.io_utils import load_image, save_image
from utils.image_utils import resize_keep_mode


def pad_to_canvas(req: OperationRequest) -> OperationResponse:
    if not req.input_path or not req.output_path:
        return OperationResponse(
            ok=False,
            operation="pad_to_canvas",
            output_path=req.output_path or "",
            error="pad_to_canvas requires input_path and output_path",
        )
    if not req.width or not req.height:
        return OperationResponse(
            ok=False,
            operation="pad_to_canvas",
            output_path=req.output_path,
            error="pad_to_canvas requires width and height",
        )
    canvas_w = int(req.width)
    canvas_h = int(req.height)
    image = load_image(req.input_path).convert("RGBA")
    # Shrink if larger; never enlarge (that's contain's job).
    if image.size[0] > canvas_w or image.size[1] > canvas_h:
        nw, nh = image.size
        scale = min(canvas_w / nw, canvas_h / nh)
        image = resize_keep_mode(image, (max(1, int(round(nw * scale))), max(1, int(round(nh * scale)))))

    bg_color = parse_color(req.background or "#FFFFFF", default=(255, 255, 255, 255))
    canvas = Image.new("RGBA", (canvas_w, canvas_h), bg_color)
    offset = ((canvas_w - image.size[0]) // 2, (canvas_h - image.size[1]) // 2)
    canvas.paste(image, offset, image)

    w, h = save_image(canvas, req.output_path, fmt=req.format or "png", quality=req.quality)
    return OperationResponse(
        ok=True,
        operation="pad_to_canvas",
        output_path=req.output_path,
        width=w,
        height=h,
    )
