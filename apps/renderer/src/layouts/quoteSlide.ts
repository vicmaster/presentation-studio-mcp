import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle } from './_shared.js';
import { normalizeColor } from '../utils/colorUtils.js';

export const quoteSlideLayout: LayoutRenderer = (slide, spec, ctx) => {
  const warnings: string[] = [];
  const index = ctx.deck.slides.findIndex((s) => s.id === spec.id);
  const { contentArea } = applyScaffold({
    slide,
    spec,
    ctx,
    slideIndex: index,
    totalSlides: ctx.deck.slides.length,
  });

  const quote = spec.quote ?? spec.body;
  if (!quote) {
    warnings.push(`quote-slide on slide "${spec.id}" has no quote or body.`);
    return { warnings, placed: 0 };
  }

  // Giant opening quote mark
  slide.addText('\u201C', {
    x: contentArea.x,
    y: contentArea.y + contentArea.h * 0.12,
    w: 1.2,
    h: 1.4,
    fontFace: ctx.typography.display.fontFace,
    fontSize: 120,
    bold: true,
    color: normalizeColor(ctx.colors.accent),
  });

  slide.addText(quote, {
    x: contentArea.x + 1.2,
    y: contentArea.y + contentArea.h * 0.2,
    w: contentArea.w - 1.2,
    h: contentArea.h * 0.55,
    ...applyTypeStyle({ ...ctx.typography.quote, fontSize: 32 }),
    valign: 'top',
  });

  if (spec.quote_author) {
    slide.addText(`— ${spec.quote_author}`, {
      x: contentArea.x + 1.2,
      y: contentArea.y + contentArea.h * 0.8,
      w: contentArea.w - 1.2,
      h: 0.5,
      ...applyTypeStyle(ctx.typography.caption),
    });
  }

  return { warnings, placed: 1 };
};
