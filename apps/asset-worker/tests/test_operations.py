"""Pytest suite for the Pillow asset worker.

Covers:
  - resize
  - cover_crop
  - contact_sheet
  - invalid input handling
"""

import os
from pathlib import Path

import pytest
from PIL import Image

from runner import run  # noqa: E402


@pytest.fixture()
def tmp_image_factory(tmp_path: Path):
    def _make(name: str, width: int, height: int, color=(200, 30, 30)) -> str:
        path = tmp_path / name
        img = Image.new("RGB", (width, height), color)
        img.save(path)
        return str(path)

    return _make


def test_resize_produces_exact_size(tmp_image_factory, tmp_path: Path):
    src = tmp_image_factory("src.png", 400, 300)
    out = tmp_path / "out.png"
    response = run(
        {
            "operation": "resize",
            "input_path": src,
            "output_path": str(out),
            "width": 100,
            "height": 80,
        }
    )
    assert response.ok is True
    assert response.width == 100
    assert response.height == 80
    assert os.path.exists(out)
    reopened = Image.open(out)
    assert reopened.size == (100, 80)


def test_cover_crop_preserves_exact_target(tmp_image_factory, tmp_path: Path):
    # 16:9 source; crop to 1:1 target.
    src = tmp_image_factory("wide.png", 1600, 900)
    out = tmp_path / "square.png"
    response = run(
        {
            "operation": "cover_crop",
            "input_path": src,
            "output_path": str(out),
            "width": 500,
            "height": 500,
            "anchor": "center",
        }
    )
    assert response.ok is True
    assert response.width == 500
    assert response.height == 500


def test_contact_sheet_combines_inputs(tmp_image_factory, tmp_path: Path):
    inputs = [
        tmp_image_factory("a.png", 200, 200, color=(10, 200, 10)),
        tmp_image_factory("b.png", 200, 200, color=(10, 10, 200)),
        tmp_image_factory("c.png", 200, 200, color=(200, 200, 10)),
    ]
    out = tmp_path / "sheet.png"
    response = run(
        {
            "operation": "contact_sheet",
            "inputs": inputs,
            "output_path": str(out),
            "width": 900,
            "height": 300,
            "columns": 3,
        }
    )
    assert response.ok is True
    assert os.path.exists(out)


def test_missing_operation_field_returns_error():
    response = run({"input_path": "x", "output_path": "y"})
    assert response.ok is False
    assert "Missing 'operation' field" in (response.error or "")


def test_unknown_operation_returns_error():
    response = run({"operation": "nope", "input_path": "x", "output_path": "y"})
    assert response.ok is False
    assert "Unknown operation" in (response.error or "")
