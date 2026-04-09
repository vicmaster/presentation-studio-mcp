import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle, drawKicker } from './_shared.js';
import { splitGrid } from '../utils/geometry.js';
import { normalizeColor, lighten } from '../utils/colorUtils.js';

/**
 * metrics-grid - up to 6 numerical highlights arranged in a grid. Also used
 * when the slide contains `items` rather than true metrics (label+value).
 */
export const metricsGridLayout: LayoutRenderer = (slide, spec, ctx) => {
  const warnings: string[] = [];
  const index = ctx.deck.slides.findIndex((s) => s.id === spec.id);
  const { contentArea } = applyScaffold({
    slide,
    spec,
    ctx,
    slideIndex: index,
    totalSlides: ctx.deck.slides.length,
  });

  if (spec.kicker) {
    drawKicker(slide, ctx, { x: contentArea.x, y: contentArea.y, w: contentArea.w, h: 0.3 }, spec.kicker);
  }
  const titleY = contentArea.y + (spec.kicker ? 0.35 : 0);
  if (spec.title) {
    slide.addText(spec.title, {
      x: contentArea.x,
      y: titleY,
      w: contentArea.w,
      h: 0.9,
      ...applyTypeStyle(ctx.typography.title),
    });
  }

  const items = spec.metrics.length > 0
    ? spec.metrics.map((m) => ({ value: m.value, label: m.label, detail: m.detail }))
    : spec.items.map((it) => ({ value: it.label, label: it.description ?? '', detail: undefined }));

  if (items.length === 0) {
    warnings.push(`metrics-grid on slide "${spec.id}" has no metrics or items.`);
    return { warnings, placed: 0 };
  }

  const visibleItems = items.slice(0, 6);
  const cols = visibleItems.length <= 2 ? visibleItems.length : visibleItems.length <= 4 ? 2 : 3;
  const rows = Math.ceil(visibleItems.length / cols);
  const gridRect = {
    x: contentArea.x,
    y: titleY + (spec.title ? 1.2 : 0),
    w: contentArea.w,
    h: contentArea.h - ((titleY + (spec.title ? 1.2 : 0)) - contentArea.y),
  };
  const rects = splitGrid(gridRect, cols, rows, ctx.spacing.gap);

  visibleItems.forEach((item, i) => {
    const r = rects[i]!;
    slide.addShape('rect', {
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      fill: { color: normalizeColor(lighten(ctx.colors.accent, 0.92)) },
      line: { color: normalizeColor(lighten(ctx.colors.accent, 0.5)), width: 0.5 },
      rectRadius: 0.08,
    });
    slide.addText(item.value, {
      x: r.x + 0.2,
      y: r.y + 0.2,
      w: r.w - 0.4,
      h: r.h * 0.55,
      ...applyTypeStyle(ctx.typography.metricValue),
      valign: 'middle',
    });
    slide.addText(item.label, {
      x: r.x + 0.2,
      y: r.y + r.h * 0.6,
      w: r.w - 0.4,
      h: r.h * 0.25,
      ...applyTypeStyle(ctx.typography.metricLabel),
    });
    if (item.detail) {
      slide.addText(item.detail, {
        x: r.x + 0.2,
        y: r.y + r.h * 0.85,
        w: r.w - 0.4,
        h: 0.3,
        ...applyTypeStyle(ctx.typography.caption),
      });
    }
  });

  if (items.length > visibleItems.length) {
    warnings.push(`metrics-grid on slide "${spec.id}" truncated ${items.length - visibleItems.length} extra items.`);
  }

  return { warnings, placed: visibleItems.length };
};
