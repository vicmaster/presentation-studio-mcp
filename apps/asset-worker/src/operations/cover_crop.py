"""cover_crop - scale-and-crop an image so it fills the target box completely."""

from models import OperationRequest, OperationResponse
from utils.io_utils import load_image, save_image
from utils.image_utils import resize_keep_mode, cover_box


def cover_crop(req: OperationRequest) -> OperationResponse:
    if not req.input_path or not req.output_path:
        return OperationResponse(
            ok=False,
            operation="cover_crop",
            output_path=req.output_path or "",
            error="cover_crop requires input_path and output_path",
        )
    if not req.width or not req.height:
        return OperationResponse(
            ok=False,
            operation="cover_crop",
            output_path=req.output_path,
            error="cover_crop requires width and height",
        )

    target = (int(req.width), int(req.height))
    anchor = req.anchor or "center"
    image = load_image(req.input_path)
    natural = image.size
    scale = max(target[0] / natural[0], target[1] / natural[1])
    scaled_size = (max(1, int(round(natural[0] * scale))), max(1, int(round(natural[1] * scale))))
    scaled = resize_keep_mode(image, scaled_size)
    box = cover_box(natural, target, anchor=anchor)
    # `cover_box` returned coordinates relative to the scaled image; recompute
    # them because the helper assumes the image is already at scaled_size.
    dx = scaled_size[0] - target[0]
    dy = scaled_size[1] - target[1]
    if anchor == "north":
        left, top = dx // 2, 0
    elif anchor == "south":
        left, top = dx // 2, dy
    elif anchor == "east":
        left, top = dx, dy // 2
    elif anchor == "west":
        left, top = 0, dy // 2
    elif anchor == "nw":
        left, top = 0, 0
    elif anchor == "ne":
        left, top = dx, 0
    elif anchor == "sw":
        left, top = 0, dy
    elif anchor == "se":
        left, top = dx, dy
    else:
        left, top = dx // 2, dy // 2
    right = left + target[0]
    bottom = top + target[1]
    cropped = scaled.crop((left, top, right, bottom))

    # Silence the unused-import warning: the helper may be used in tests.
    _ = box

    w, h = save_image(cropped, req.output_path, fmt=req.format, quality=req.quality)
    return OperationResponse(
        ok=True,
        operation="cover_crop",
        output_path=req.output_path,
        width=w,
        height=h,
    )
