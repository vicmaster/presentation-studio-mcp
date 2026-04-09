# Arquitectura

## Pipeline principal

```
Brief  ─►  plan_deck  ─►  DeckSpec skeleton
                               │
                               ▼
         update_slide ◄──► normalize_deck_spec ─►  DeckSpec (strict)
                               │
                               ▼
               ┌───────────────┴───────────────┐
               ▼                               ▼
          render_deck                    audit_deck
               │                               │
               ▼                               ▼
           .pptx file                      AuditReport
                               │
                               ▼
                         preview_deck
                               │
                               ▼
                       PreviewManifest
```

## Capas

1. **schema** (`packages/schema`): define todos los contratos con Zod. Es la fuente de verdad para tipos y validación. Cualquier campo nuevo pasa por aquí primero.
2. **templates** (`packages/templates`): define DeckTemplates reutilizables (brochure, case-study, proposal, etc.). Los templates se consumen en `plan_deck` para generar una estructura inicial.
3. **core** (`packages/core`): lógica de registry (brands, templates), builder de DeckSpec, normalizer, updater, reglas de auditoría, preview manifest builder, extractor de `.pptx` y bridge a Pillow.
4. **renderer** (`apps/renderer`): renderer PptxGenJS. Contiene layouts, themes, utilidades (geometry, typography, colors, spacing, placeholders) y el pipeline `renderDeck`.
5. **cli** (`apps/cli`): cliente local que orquesta core + renderer. Sin MCP.
6. **mcp-server** (`apps/mcp-server`): expone tools y resources vía MCP (stdio).
7. **asset-worker** (`apps/asset-worker`): worker Python/Pillow para procesamiento de imágenes.

## Decisiones

- **Zod como fuente única**: los tipos TypeScript se derivan de los schemas para evitar desincronización.
- **Denormalización de brand en deck**: el deck guarda una copia del brand (no solo el id) para ser portable y no depender del estado del servidor.
- **Fallback layouts**: cualquier layout desconocido cae a `two-column-text` con un warning. Esto evita fallas ruidosas.
- **Render no inventa contenido**: si falta un bullet, la slide queda con ese espacio en blanco y el renderer emite un warning. No se generan textos falsos.
- **Previews no son imágenes**: decidimos no depender de LibreOffice/Keynote headless. Un preview manifest rico es suficiente para que un agente juzgue el deck.
- **Python por proceso**: el worker se spawnea por operación. Simple y robusto; si en el futuro queremos batch pipelines podemos reutilizar el intérprete.
- **MCP con fallback**: si no está el SDK oficial, hay un fallback JSON-RPC 2.0 sobre stdio que implementa los 4 métodos principales.

## Separación estricta de responsabilidades

- El agente (cliente MCP) decide: narrativa, selección de layout, contenido, orden, mensajes clave.
- La herramienta decide: geometría, safe areas, tipografía, colores, consistencia visual, imágenes (contain/cover), placeholders, warnings.
- El worker decide: píxel a píxel el output de imagen (nunca contenido semántico).
