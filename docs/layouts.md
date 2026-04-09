# Layouts

15 layouts listos para usar. Cada layout respeta safe areas, tokens de espaciado y typography scale del brand.

| id | propósito | campos principales |
| --- | --- | --- |
| `hero-cover` | Portada con título grande y optionally hero image | `title`, `subtitle`, `kicker`, `images[0]` |
| `section-divider` | Separador entre secciones, fondo oscuro | `title`, `subtitle` |
| `two-column-text` | Body + bullets en dos columnas | `title`, `body`, `bullets` |
| `image-left-text-right` | Imagen izquierda, texto derecha | `images[0]`, `title`, `body`, `bullets` |
| `image-right-text-left` | Imagen derecha, texto izquierda | `images[0]`, `title`, `body`, `bullets` |
| `case-study-highlight` | Métrica gigante + quote/body | `title`, `metrics[0]`, `body`, `quote` |
| `metrics-grid` | Hasta 6 métricas en grid | `title`, `metrics` |
| `logo-wall` | Muro de logos de clientes | `title`, `logos` |
| `quote-slide` | Cita grande con autor | `quote`, `quote_author` |
| `closing-cta` | Cierre con CTA prominente | `title`, `subtitle`, `cta` |
| `timeline-slide` | Timeline horizontal | `title`, `items[]` |
| `comparison-table` | Tabla de comparación 2-columnas | `title`, `items[]` (description usa `left \| right`) |
| `process-steps` | Pasos numerados | `title`, `items[]` |
| `testimonial-grid` | Cards de testimonios (label=autor, description=quote) | `title`, `items[]` |
| `capabilities-grid` | Grid de capabilities con highlights | `title`, `items[]` |

## Interfaz común

```ts
type LayoutRenderer = (
  slide: PptxGenJS.Slide,
  spec: SlideSpec,
  context: RenderContext,
) => { warnings: string[]; placed: number };
```

`RenderContext` contiene:

- `deck`: el deck completo (para pageCount, brand, etc.)
- `canvas`: ancho/alto del slide
- `safe`: rectángulo seguro
- `typography`: escala tipográfica del brand
- `colors`: paleta resuelta por el theme
- `spacing`: tokens por densidad
- `baseDir`: path base para resolver imágenes

## Agregar un layout nuevo

1. Crea `apps/renderer/src/layouts/miLayout.ts`.
2. Implementa el tipo `LayoutRenderer`.
3. Usa los utilitarios de `apps/renderer/src/utils/*` (spacing, typography, geometry, etc.).
4. Registra el layout en `apps/renderer/src/index.ts` dentro de `createDefaultLayoutRegistry()`.

## Fallback

Si un layout no está registrado, el renderer usa `two-column-text` como fallback y emite el warning `layout "<name>" unknown, used fallback`. Esto garantiza que un deck siempre genera un `.pptx` aunque un slide pida algo experimental.
