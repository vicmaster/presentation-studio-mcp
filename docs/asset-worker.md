# Asset Worker (Pillow)

El asset worker es un proceso Python que expone operaciones de procesamiento de imágenes al renderer y al MCP server.

## Arquitectura

- Vive en `apps/asset-worker/`.
- Lee JSON por stdin (o argumento de línea de comandos).
- Escribe JSON por stdout.
- stderr para logs no críticos.

```
Node → PillowBridge → spawn(python3, apps/asset-worker/src/main.py)
                      stdin: request JSON
                      stdout: response JSON
```

## Operaciones

| operation | parámetros obligatorios | comportamiento |
| --- | --- | --- |
| `resize` | `input_path`, `output_path`, `width`, `height` | Redimensiona al tamaño exacto (no preserva aspecto) |
| `contain` | `input_path`, `output_path`, `width`, `height` | Cabe dentro del box, preserva aspecto, rellena con `background` |
| `cover_crop` | `input_path`, `output_path`, `width`, `height` | Escala cubriendo y recorta (anchor opcional) |
| `normalize` | `input_path`, `output_path` | Auto-orient EXIF + convierte a RGB/RGBA |
| `overlay` | `input_path`, `output_path`, `overlay_path` | Composita una imagen sobre otra con opacidad opcional |
| `montage` | `output_path`, `inputs`, `width`, `height` | Grid de imágenes con `columns` configurable |
| `thumbnail` | `input_path`, `output_path`, `width`, `height` | Shrink (nunca upscale) |
| `contact_sheet` | `output_path`, `inputs` | Hoja de contacto con padding |
| `pad_to_canvas` | `input_path`, `output_path`, `width`, `height` | Centra sobre un lienzo mayor sin ampliar |

Todas las operaciones aceptan `format` (png/jpg/webp) y `quality` (1–100).

## Contrato IO

### Request

```json
{
  "operation": "cover_crop",
  "input_path": "/tmp/source.jpg",
  "output_path": "/tmp/output.png",
  "width": 1600,
  "height": 900,
  "anchor": "center"
}
```

### Response

```json
{
  "ok": true,
  "operation": "cover_crop",
  "output_path": "/tmp/output.png",
  "width": 1600,
  "height": 900,
  "warnings": []
}
```

Si falla:

```json
{
  "ok": false,
  "operation": "resize",
  "output_path": "",
  "warnings": [],
  "error": "FileNotFoundError: /tmp/nope.jpg"
}
```

## Invocación desde Node

```ts
import { PillowBridge } from '@presentation-studio/core';
const bridge = new PillowBridge({ repoRoot: '/path/to/repo' });
const result = await bridge.run({
  operation: 'cover_crop',
  input_path: '/tmp/source.jpg',
  output_path: '/tmp/output.png',
  width: 1600,
  height: 900,
});
```

## Configuración del binario Python

Por defecto se usa `python3`. Puedes sobrescribirlo:

```bash
PPT_STUDIO_PYTHON=/usr/local/bin/python3.11 pnpm dev:mcp
```

## Tests

```bash
cd apps/asset-worker
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
pip install pytest
pytest
```
