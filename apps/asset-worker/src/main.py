"""Entry point for the Pillow asset worker.

Usage:
  - Run as a script with stdin JSON:  `cat op.json | python3 main.py`
  - Or with a JSON string argument:   `python3 main.py '{"operation": ...}'`

The worker reads exactly one OperationRequest, runs it and writes the
OperationResponse as JSON to stdout. Errors are captured and reported inside
the response (ok: false, error: "..."). Stderr is used for non-critical logs.

All modules under src/ use absolute imports. We ensure src/ is on sys.path at
startup so the worker runs the same whether invoked as a script or as part of
a parent process's PYTHONPATH.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

# Ensure the directory containing this file is on sys.path so that
# `from models import ...` and `from utils.foo import ...` work regardless of
# the caller's cwd.
_SRC_DIR = Path(__file__).resolve().parent
if str(_SRC_DIR) not in sys.path:
    sys.path.insert(0, str(_SRC_DIR))

from runner import run  # noqa: E402


def main() -> int:
    if len(sys.argv) > 1 and sys.argv[1] not in ("-", "--stdin"):
        try:
            payload = json.loads(sys.argv[1])
        except json.JSONDecodeError as err:
            print(
                json.dumps(
                    {
                        "ok": False,
                        "operation": "",
                        "output_path": "",
                        "error": f"Invalid JSON argument: {err}",
                    }
                )
            )
            return 1
    else:
        try:
            payload = json.loads(sys.stdin.read() or "{}")
        except json.JSONDecodeError as err:
            print(
                json.dumps(
                    {
                        "ok": False,
                        "operation": "",
                        "output_path": "",
                        "error": f"Invalid JSON on stdin: {err}",
                    }
                )
            )
            return 1

    if not isinstance(payload, dict):
        print(
            json.dumps(
                {
                    "ok": False,
                    "operation": "",
                    "output_path": "",
                    "error": "Payload must be a JSON object",
                }
            )
        )
        return 1

    response = run(payload)
    print(json.dumps(response.to_dict()))
    return 0 if response.ok else 2


if __name__ == "__main__":
    sys.exit(main())
