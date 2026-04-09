import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle } from './_shared.js';
import { normalizeColor, lighten } from '../utils/colorUtils.js';

/**
 * comparison-table - two-column comparison (e.g. "Before vs After", "Them vs Us").
 *
 * Uses `items` where each item's label is a dimension and description contains
 * the format "left | right". If no pipe is present, the same description goes
 * to both columns.
 */
export const comparisonTableLayout: LayoutRenderer = (slide, spec, ctx) => {
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

  const rows = spec.items;
  if (rows.length === 0) {
    warnings.push(`comparison-table on slide "${spec.id}" has no rows.`);
    return { warnings, placed: 0 };
  }

  const dimWidth = contentArea.w * 0.34;
  const colWidth = (contentArea.w - dimWidth) / 2;
  const topY = contentArea.y + (spec.title ? 1.1 : 0);
  const rowHeight = Math.min(0.8, (contentArea.h - (topY - contentArea.y) - 0.6) / Math.max(1, rows.length));

  // Header row
  const leftLabel = spec.layout_options?.align === 'right' ? 'Opción B' : 'Opción A';
  const rightLabel = 'Opción B';

  const headerRowY = topY;
  slide.addShape('rect', {
    x: contentArea.x,
    y: headerRowY,
    w: contentArea.w,
    h: 0.55,
    fill: { color: normalizeColor(lighten(ctx.colors.accent, 0.92)) },
    line: { color: normalizeColor(lighten(ctx.colors.accent, 0.6)), width: 0 },
    rectRadius: 0.05,
  });
  slide.addText('Dimensión', {
    x: contentArea.x + 0.15,
    y: headerRowY,
    w: dimWidth - 0.2,
    h: 0.55,
    ...applyTypeStyle({ ...ctx.typography.body, bold: true }),
    valign: 'middle',
  });
  slide.addText(leftLabel, {
    x: contentArea.x + dimWidth,
    y: headerRowY,
    w: colWidth,
    h: 0.55,
    ...applyTypeStyle({ ...ctx.typography.body, bold: true }),
    align: 'center',
    valign: 'middle',
  });
  slide.addText(rightLabel, {
    x: contentArea.x + dimWidth + colWidth,
    y: headerRowY,
    w: colWidth,
    h: 0.55,
    ...applyTypeStyle({ ...ctx.typography.body, bold: true, color: normalizeColor(ctx.colors.accent) }),
    align: 'center',
    valign: 'middle',
  });

  rows.slice(0, 8).forEach((row, i) => {
    const y = headerRowY + 0.6 + i * (rowHeight + 0.06);
    slide.addShape('rect', {
      x: contentArea.x,
      y,
      w: contentArea.w,
      h: rowHeight,
      fill: { color: i % 2 === 0 ? 'FFFFFF' : normalizeColor(lighten(ctx.colors.textMuted, 0.92)) },
      line: { color: normalizeColor(lighten(ctx.colors.textMuted, 0.75)), width: 0.25 },
      rectRadius: 0.04,
    });
    slide.addText(row.label, {
      x: contentArea.x + 0.15,
      y,
      w: dimWidth - 0.2,
      h: rowHeight,
      ...applyTypeStyle(ctx.typography.body),
      valign: 'middle',
    });

    const [leftText, rightText] = (row.description ?? '').split('|').map((s) => s.trim());
    slide.addText(leftText ?? '—', {
      x: contentArea.x + dimWidth,
      y,
      w: colWidth,
      h: rowHeight,
      ...applyTypeStyle(ctx.typography.body),
      align: 'center',
      valign: 'middle',
    });
    slide.addText(rightText ?? leftText ?? '—', {
      x: contentArea.x + dimWidth + colWidth,
      y,
      w: colWidth,
      h: rowHeight,
      ...applyTypeStyle({ ...ctx.typography.body, bold: true }),
      align: 'center',
      valign: 'middle',
    });
  });

  if (rows.length > 8) {
    warnings.push(`comparison-table truncated ${rows.length - 8} rows.`);
  }

  return { warnings, placed: Math.min(rows.length, 8) };
};
