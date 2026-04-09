# presentation-studio-mcp

Herramienta local de nivel producción para **generar, editar, auditar, previsualizar y reutilizar** presentaciones `.pptx` profesionales, expuesta como un servidor **MCP** para que agentes como Claude Code o Codex puedan usarla como motor de presentaciones.

Pensada para brochures, propuestas comerciales, case studies, decks ejecutivos, quarterly reviews y presentaciones institucionales.

> **Open source friendly.** El proyecto viene con la marca MagmaLabs y una
> marca neutral `acme` incluidas como ejemplos, pero cualquiera puede usar sus
> propios brands, templates y ejemplos sin forkear el código. Ver
> [`docs/customization.md`](docs/customization.md) para la guía de white-labeling.

---

## 1. ¿Qué hace esta herramienta?

1. Recibe un brief estructurado o un `deck_spec` parcial.
2. Aplica branding, layouts, reglas visuales y assets.
3. Procesa imágenes localmente con Pillow (crop, resize, overlays, etc.).
4. Genera un archivo `.pptx` real con calidad comercial.
5. Produce un preview manifest útil para revisión por un agente.
6. Corre reglas heurísticas de auditoría (densidad, contraste, bounds...).
7. Permite actualizar slides de forma puntual sin rehacer el deck.
8. Extrae texto e imágenes desde `.pptx` existentes para reutilización.
9. Expone todo como tools y resources vía **MCP** (stdio).

Todo corre **localmente**. No hay dependencias de servicios externos.

---

## 2. Arquitectura

```
apps/
  mcp-server/      # Servidor MCP expuesto por stdio
  renderer/        # Renderer PptxGenJS (layouts, themes, utilities)
  cli/             # CLI para ejecutar el mismo pipeline sin MCP
  asset-worker/    # Worker Python/Pillow para procesamiento de imágenes
packages/
  schema/          # Contratos Zod + tipos TypeScript
  templates/       # DeckTemplates listos (brochure, case-study, ...)
  core/            # Registries, deck builder, audit, extraction, assets
assets/
  brands/          # brand.json por marca (MagmaLabs incluido)
examples/
  brochure/        # brief + deck-spec + assets-plan
  case-study/
  proposal/
  quarterly-review/
tests/             # Tests Vitest
```

El diseño sigue tres principios fundamentales:

1. **Contenido vs Render**. El agente decide qué decir. El renderer decide geometría, espaciado, tipografía y branding.
2. **Fuente de verdad única**: el `DeckSpec`. Todo el pipeline gira en torno a él.
3. **Layouts reutilizables**: cada layout vive como módulo aislado, registrado en un registry.

Ver `docs/architecture.md` para más detalle.

---

## 3. Stack

| Capa | Tecnología |
| --- | --- |
| Runtime | Node.js ≥18.17, TypeScript (ESM), pnpm workspaces |
| Render PPTX | [PptxGenJS](https://github.com/gitbrent/PptxGenJS) |
| Procesamiento de imágenes | Python 3 + Pillow |
| Validación de contratos | Zod |
| Tests | Vitest (TS) + pytest (Python) |
| Lint / format | ESLint + Prettier |
| MCP | `@modelcontextprotocol/sdk` (con fallback stdio JSON-RPC) |

---

## 4. Instalación

```bash
# 1. Clona el repo y entra a la carpeta
cd presentation-studio-mcp

# 2. Instala dependencias TypeScript
pnpm install

# 3. Instala dependencias Python del asset worker
cd apps/asset-worker
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cd ../..
```

> El worker Python solo se necesita si quieres ejecutar `prepare_assets`. El render básico (`render_deck`, `audit_deck`, `preview_deck`, `extract_from_pptx`, `update_slide`) funciona sin Pillow.

---

## 5. Uso rápido

### 5.1 Ejecutar el servidor MCP

```bash
pnpm dev:mcp
```

Esto arranca `@presentation-studio/mcp-server` por stdio. En un cliente MCP compatible podrás ver los tools y resources registrados.

### 5.2 Usar la CLI

```bash
# Renderizar un deck de ejemplo
pnpm cli render --input examples/brochure/deck-spec.json --output tmp/brochure.pptx

# Auditar
pnpm cli audit --input examples/brochure/deck-spec.json

# Generar un preview manifest
pnpm cli preview --input examples/case-study/deck-spec.json --output tmp/case-study-preview.json

# Extraer contenido de un .pptx
pnpm cli extract --input tmp/brochure.pptx --output tmp/extracted

# Preparar assets con Pillow (requiere el worker instalado)
pnpm cli prepare-assets --input examples/brochure/assets-plan.json

# Listar templates y brands
pnpm cli list-templates
pnpm cli list-brands

# Validar un deck spec
pnpm cli validate-deck --input examples/proposal/deck-spec.json
```

---

## 6. ¿Qué es un `deck_spec`?

Un `deck_spec` es un documento JSON que describe una presentación completa:

```json
{
  "meta": { "title": "...", "language": "es", "presentation_type": "brochure" },
  "brand": { "id": "magmalabs", "primary_color": "#f84848", ... },
  "theme": { "id": "magma", "page_size": "LAYOUT_WIDE", "density": "balanced" },
  "assets": [ ... ],
  "slides": [
    { "id": "cover", "layout": "hero-cover", "title": "...", "images": [...] }
  ]
}
```

Los campos obligatorios se validan con Zod y cualquier extra pasa por `normalize_deck_spec` que rellena defaults razonables.

Más detalles en `docs/deck-spec.md`.

---

## 7. Layouts disponibles

15 layouts listos, cada uno en un módulo independiente:

`hero-cover`, `section-divider`, `two-column-text`, `image-left-text-right`, `image-right-text-left`, `case-study-highlight`, `metrics-grid`, `logo-wall`, `quote-slide`, `closing-cta`, `timeline-slide`, `comparison-table`, `process-steps`, `testimonial-grid`, `capabilities-grid`.

Si el deck pide un layout que no existe, el renderer hace fallback a `two-column-text` y emite un warning. Ver `docs/layouts.md` para detalles de cada uno.

### Agregar un nuevo layout

1. Crea `apps/renderer/src/layouts/mi-layout.ts` implementando el tipo `LayoutRenderer`.
2. Regístralo en `apps/renderer/src/index.ts` dentro de `createDefaultLayoutRegistry()`.

---

## 8. Brands y themes

Los brands viven en `assets/brands/<brand-id>/brand.json` y el registry los carga al arrancar. El proyecto incluye dos ejemplos:

- **MagmaLabs** — brand real, registrado también por código como default.
- **Acme Inc** — brand neutral de ejemplo para onboarding open source.

Puedes desactivar la carga de MagmaLabs y/o usar tu propia marca editando `presentation-studio.config.json` (ver sección 9 abajo).

Cambiar de brand es tan simple como usar un `brand.id` distinto en tu `deck_spec`. Los themes (`magma`, `minimal`, `light-corporate`, `dark-enterprise`) se resuelven en `ThemeRegistry`.

### Agregar una nueva brand (comando)

```bash
pnpm cli init-brand \
  --id mycompany \
  --name "My Company" \
  --primary "#FF6600" \
  --heading-font "Inter" \
  --body-font "Inter"
```

Crea `assets/brands/mycompany/brand.json` listo para usar. Puedes editarlo a mano después — el registry lo recarga en cada invocación del CLI / MCP.

---

## 9. Customización y open source (white-label)

El proyecto está diseñado para ser reutilizable por cualquiera sin forkear el código. Todo lo relacionado con MagmaLabs es **opt-in**.

Crea un `presentation-studio.config.json` en la raíz:

```json
{
  "default_brand_id": "acme",
  "brands_dir": "assets/brands",
  "templates_dir": "my-templates",
  "load_builtin_brand": false,
  "load_builtin_templates": false,
  "organization_name": "Acme Inc"
}
```

- `load_builtin_brand: false` → **no** registra MagmaLabs al arrancar.
- `load_builtin_templates: false` → **no** registra los 7 templates del paquete.
- `templates_dir` → directorio con `*.json` templates que se cargan automáticamente.

Guía completa en [`docs/customization.md`](docs/customization.md): cómo agregar tus layouts, tus themes, cómo borrar todo rastro de MagmaLabs, cómo scaffoldear brands/templates con la CLI, y cómo deployar el proyecto como tu propio producto.

```bash
# Scaffold rápido de brand y template
pnpm cli init-brand --id acme --name "Acme Inc" --primary "#0066FF"
pnpm cli init-template --id my-pitch --name "Pitch Deck" --output my-templates/pitch.json
```

El ejemplo `examples/neutral-brochure/` usa el brand `acme` y está **libre** de cualquier contenido de MagmaLabs.

---

## 10. Sistema de templates

Un template describe un flujo recomendado de slides para un tipo de presentación. Se usan en `plan_deck` para sugerir una estructura completa a partir de un Brief.

Templates registrados por defecto: `brochure-enterprise`, `brochure-premium`, `case-study-modern`, `sales-proposal`, `exec-update`, `quarterly-review`, `training-deck`.

También puedes cargar tus propios templates como JSON (ver sección 9).

Ver `packages/templates/src/` para ver cada definición built-in.

---

## 10. Worker Pillow

El worker vive en `apps/asset-worker/` y expone 9 operaciones: `resize`, `contain`, `cover_crop`, `normalize`, `overlay`, `montage`, `thumbnail`, `contact_sheet`, `pad_to_canvas`.

Contrato IO:

```json
// entrada
{ "operation": "cover_crop", "input_path": "/tmp/a.jpg", "output_path": "/tmp/b.png", "width": 1600, "height": 900 }
// salida
{ "ok": true, "operation": "cover_crop", "output_path": "/tmp/b.png", "width": 1600, "height": 900, "warnings": [] }
```

El bridge Node (`PillowBridge`) spawnea `python3` (override: `PPT_STUDIO_PYTHON`) y gestiona errores. Documentado en `docs/asset-worker.md`.

---

## 11. MCP: tools y resources

### Tools (13)

| Tool | Descripción |
| --- | --- |
| `create_brief` | Valida/normaliza un Brief |
| `plan_deck` | Construye un DeckSpec skeleton desde un Brief + template |
| `normalize_deck_spec` | Normaliza un deck parcial a uno válido |
| `prepare_assets` | Ejecuta un plan de assets via Pillow |
| `render_deck` | Genera `.pptx` |
| `preview_deck` | Produce un preview manifest rico |
| `audit_deck` | Ejecuta reglas de auditoría |
| `update_slide` | Modifica (merge/replace) o inserta una slide |
| `extract_from_pptx` | Extrae texto/media desde un `.pptx` existente |
| `list_templates` | Lista templates registrados |
| `list_brands` | Lista brands registradas |
| `get_deck_spec` | Devuelve el deck actual en memoria |
| `save_deck_spec` | Persiste el deck actual a disco |

### Resources (8)

- `brand://magmalabs/default`
- `template://brochure/enterprise`
- `template://case-study/modern`
- `template://proposal/sales`
- `template://quarterly/review`
- `deck://current/spec`
- `deck://current/audit`
- `deck://current/previews`

Ver `docs/mcp-tools.md` para ejemplos de request/response.

---

## 12. Ejemplos completos

Cada ejemplo en `examples/` incluye `brief.json`, `deck-spec.json` y un README de assets.

```bash
pnpm cli render --input examples/brochure/deck-spec.json --output tmp/brochure.pptx
pnpm cli render --input examples/case-study/deck-spec.json --output tmp/case-study.pptx
pnpm cli render --input examples/proposal/deck-spec.json --output tmp/proposal.pptx
pnpm cli render --input examples/quarterly-review/deck-spec.json --output tmp/qbr.pptx
```

Abre el `.pptx` resultante con PowerPoint, Keynote o LibreOffice Impress.

---

## 13. Tests

```bash
# TypeScript
pnpm test

# Python
cd apps/asset-worker
pytest
```

Los tests TypeScript cubren: schemas, normalización, auditoría (densidad, slide vacía, layout desconocido, CTA faltante), update de slide, render básico con assertion sobre el `.pptx` generado y un round-trip de extracción.

Los tests Python cubren: resize, cover_crop, contact_sheet e input inválido.

---

## 14. Limitaciones actuales (honestidad intencional)

- **No renderizamos miniaturas reales de slides**. Para preservar simplicidad y no depender de LibreOffice/Headless PowerPoint, `preview_deck` devuelve un manifest estructurado en vez de imágenes. Es suficiente para que un agente revise el deck, pero no reemplaza a ver la slide renderizada. Se documenta en `docs/architecture.md`.
- **La extracción desde `.pptx`** recupera textos, títulos aproximados, notas y media. NO reconstruye layout/colores/tipografía. Es reutilización realista, no round-trip perfecto.
- **Las estimaciones de densidad y overflow son heurísticas**. No usan un motor de métricas tipográficas. Funcionan bien en la práctica pero pueden ser imperfectas con fuentes muy anchas/estrechas.
- **El servidor MCP** usa el SDK oficial si está instalado y tiene un fallback JSON-RPC 2.0 sobre stdio en caso contrario. El fallback implementa los 4 métodos principales (`tools/list`, `tools/call`, `resources/list`, `resources/read`), pero no soporta streaming ni resources de binarios.
- **Pillow se invoca por proceso**. Cada operación spawnea un intérprete Python. Para batches muy grandes esto tiene overhead; se puede optimizar a future con un worker persistente.

---

## 15. Próximos pasos recomendados

1. Integrar un motor headless (LibreOffice) para renderizar previews PNG reales.
2. Añadir más templates sector-específicos (fintech, retail, salud).
3. Agregar validación de fonts disponibles en el sistema.
4. Generar JSON Schemas exportables a partir de los Zod schemas para clientes sin Zod.
5. Persistir sesiones MCP entre reinicios (hoy se pierde el deck actual si reinicias).

---

## Licencia

MIT (o la que el usuario decida — añade `LICENSE` si vas a distribuir).
