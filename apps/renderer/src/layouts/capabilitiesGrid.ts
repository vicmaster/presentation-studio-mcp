import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle, drawKicker } from './_shared.js';
import { splitGrid } from '../utils/geometry.js';
import { normalizeColor, lighten } from '../utils/colorUtils.js';

/**
 * capabilities-grid - the workhorse layout for showcasing offerings.
 *
 * 2x2, 2x3 or 3x2 grid of cards. Each card has a title (label) and
 * an optional description. Highlight cards are styled with the accent color.
 */
export const capabilitiesGridLayout: LayoutRenderer = (slide, spec, ctx) => {
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

  const items = spec.items;
  if (items.length === 0) {
    warnings.push(`capabilities-grid on slide "${spec.id}" has no items.`);
    return { warnings, placed: 0 };
  }

  const visible = items.slice(0, 6);
  const cols =
    visible.length <= 2
      ? visible.length
      : visible.length <= 4
      ? 2
      : 3;
  const rows = Math.ceil(visible.length / cols);
  const gridRect = {
    x: contentArea.x,
    y: titleY + (spec.title ? 1.1 : 0),
    w: contentArea.w,
    h: contentArea.h - ((titleY + (spec.title ? 1.1 : 0)) - contentArea.y),
  };
  const rects = splitGrid(gridRect, cols, rows, ctx.spacing.gap);

  visible.forEach((item, i) => {
    const r = rects[i]!;
    const highlight = item.highlight;
    const bg = highlight ? ctx.colors.accent : lighten(ctx.colors.textMuted, 0.95);
    const fg = highlight ? 'FFFFFF' : ctx.colors.text;
    slide.addShape('rect', {
      x: r.x,
      y: r.y,
      w: r.w,
      h: r.h,
      fill: { color: normalizeColor(bg) },
      line: { color: normalizeColor(lighten(ctx.colors.textMuted, 0.75)), width: 0.5 },
      rectRadius: 0.08,
    });
    slide.addText(item.label, {
      x: r.x + 0.3,
      y: r.y + 0.3,
      w: r.w - 0.6,
      h: 0.7,
      fontFace: ctx.typography.title.fontFace,
      fontSize: 18,
      bold: true,
      color: normalizeColor(fg),
    });
    if (item.description) {
      slide.addText(item.description, {
        x: r.x + 0.3,
        y: r.y + 1.05,
        w: r.w - 0.6,
        h: r.h - 1.2,
        fontFace: ctx.typography.body.fontFace,
        fontSize: 12,
        color: normalizeColor(highlight ? 'EEEEEE' : ctx.colors.textMuted),
        lineSpacingMultiple: 1.3,
        valign: 'top',
      });
    }
  });

  if (items.length > visible.length) {
    warnings.push(`capabilities-grid truncated ${items.length - visible.length} items.`);
  }

  return { warnings, placed: visible.length };
};
