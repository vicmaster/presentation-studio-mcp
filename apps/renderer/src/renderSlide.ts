import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '@presentation-studio/schema';
import type { LayoutRegistry, RenderContext, RenderResult } from './layoutRegistry.js';

/**
 * Render one slide using the layout registered under `slide.layout`.
 * If the layout is unknown, the registry fallback is used (and a warning
 * is reported).
 */
export function renderSlide(
  pres: pptxgen,
  slide: SlideSpec,
  registry: LayoutRegistry,
  context: RenderContext,
): RenderResult {
  const warnings: string[] = [];
  const pSlide = pres.addSlide();
  const { renderer, isFallback } = registry.resolve(slide.layout);
  if (isFallback) {
    warnings.push(`layout "${slide.layout}" unknown, used fallback for slide "${slide.id}".`);
  }
  const result = renderer(pSlide, slide, context);
  warnings.push(...result.warnings);
  return { warnings, placed: result.placed };
}
