import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle } from './_shared.js';
import { splitGrid } from '../utils/geometry.js';
import { normalizeColor, lighten } from '../utils/colorUtils.js';

/**
 * testimonial-grid - 2x2 or 2x3 cards with quote + author.
 * Uses `items` where label is author, description is the quote.
 */
export const testimonialGridLayout: LayoutRenderer = (slide, spec, ctx) => {
  const warnings: string[] = [];
  const index = ctx.deck.slides.findIndex((s) => s.id === spec.id);
  const { contentArea } = applyScaffold({
    slide,
    spec,
    ctx,
    slideIndex: index,
    totalSlides: ctx.deck.slides.length,
  });

  if (spec.title) {
    slide.addText(spec.title, {
      x: contentArea.x,
      y: contentArea.y,
      w: contentArea.w,
      h: 0.9,
      ...applyTypeStyle(ctx.typography.title),
    });
  }

  const items = spec.items;
  if (items.length === 0) {
    warnings.push(`testimonial-grid on slide "${spec.id}" has no items.`);
    return { warnings, placed: 0 };
  }

  const visible = items.slice(0, 6);
  const cols = visible.length <= 2 ? visible.length : 2;
  const rows = Math.ceil(visible.length / cols);
  const gridRect = {
    x: contentArea.x,
    y: contentArea.y + (spec.title ? 1.1 : 0),
    w: contentArea.w,
    h: contentArea.h - (spec.title ? 1.1 : 0),
  };
  const rects = splitGrid(gridRect, cols, rows, ctx.spacing.gap);

  visible.forEach((item, i) => {
    const r = rects[i]!;
    slide.addShape('rect', {
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      fill: { color: normalizeColor(lighten(ctx.colors.textMuted, 0.95)) },
      line: { color: normalizeColor(lighten(ctx.colors.textMuted, 0.75)), width: 0.5 },
      rectRadius: 0.08,
    });
    const quoteText = item.description ?? '';
    slide.addText(`"${quoteText}"`, {
      x: r.x + 0.25,
      y: r.y + 0.25,
      w: r.w - 0.5,
      h: r.h - 1.0,
      ...applyTypeStyle({ ...ctx.typography.body, italic: true }),
      valign: 'top',
    });
    slide.addText(`— ${item.label}`, {
      x: r.x + 0.25,
      y: r.y + r.h - 0.8,
      w: r.w - 0.5,
      h: 0.5,
      ...applyTypeStyle({ ...ctx.typography.body, bold: true }),
    });
  });

  if (items.length > visible.length) {
    warnings.push(`testimonial-grid truncated ${items.length - visible.length} items.`);
  }
  return { warnings, placed: visible.length };
};
