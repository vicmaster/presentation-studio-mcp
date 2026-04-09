"""Shared dataclasses describing the worker's IO contract.

The worker accepts a JSON payload with one top-level `operation` key and
returns a JSON payload with `ok` and operation-specific fields.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class OperationRequest:
    operation: str
    input_path: Optional[str] = None
    output_path: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    anchor: Optional[str] = None
    background: Optional[str] = None
    inputs: Optional[List[str]] = None
    columns: Optional[int] = None
    overlay_path: Optional[str] = None
    opacity: Optional[float] = None
    format: Optional[str] = None
    quality: Optional[int] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "OperationRequest":
        return cls(
            operation=data.get("operation", ""),
            input_path=data.get("input_path"),
            output_path=data.get("output_path"),
            width=data.get("width"),
            height=data.get("height"),
            anchor=data.get("anchor"),
            background=data.get("background"),
            inputs=data.get("inputs"),
            columns=data.get("columns"),
            overlay_path=data.get("overlay_path"),
            opacity=data.get("opacity"),
            format=data.get("format"),
            quality=data.get("quality"),
        )


@dataclass
class OperationResponse:
    ok: bool
    operation: str
    output_path: str
    width: Optional[int] = None
    height: Optional[int] = None
    warnings: List[str] = field(default_factory=list)
    error: Optional[str] = None

    def to_dict(self) -> Dict[str, Any]:
        data: Dict[str, Any] = {
            "ok": self.ok,
            "operation": self.operation,
            "output_path": self.output_path,
            "warnings": self.warnings,
        }
        if self.width is not None:
            data["width"] = self.width
        if self.height is not None:
            data["height"] = self.height
        if self.error is not None:
            data["error"] = self.error
        return data
