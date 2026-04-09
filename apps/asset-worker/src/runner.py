"""Dispatcher that routes an OperationRequest to the correct operation."""

from models import OperationRequest, OperationResponse
from operations import OPERATIONS


def run(request_dict: dict) -> OperationResponse:
    op_name = request_dict.get("operation")
    if not op_name:
        return OperationResponse(
            ok=False,
            operation="",
            output_path="",
            error="Missing 'operation' field",
        )
    handler = OPERATIONS.get(op_name)
    if not handler:
        return OperationResponse(
            ok=False,
            operation=op_name,
            output_path=request_dict.get("output_path") or "",
            error=f"Unknown operation: {op_name}",
        )
    try:
        request = OperationRequest.from_dict(request_dict)
        return handler(request)
    except FileNotFoundError as err:
        return OperationResponse(
            ok=False,
            operation=op_name,
            output_path=request_dict.get("output_path") or "",
            error=str(err),
        )
    except Exception as err:  # noqa: BLE001
        return OperationResponse(
            ok=False,
            operation=op_name,
            output_path=request_dict.get("output_path") or "",
            error=f"{type(err).__name__}: {err}",
        )
