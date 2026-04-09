import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle } from './_shared.js';
import { normalizeColor } from '../utils/colorUtils.js';

export const timelineSlideLayout: LayoutRenderer = (slide, spec, ctx) => {
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
    warnings.push(`timeline-slide on slide "${spec.id}" has no items.`);
    return { warnings, placed: 0 };
  }

  const visible = items.slice(0, 6);
  const trackY = contentArea.y + (spec.title ? 2.8 : 2);
  const startX = contentArea.x + 0.3;
  const endX = contentArea.x + contentArea.w - 0.3;
  const stepWidth = (endX - startX) / visible.length;
  const lineColor = normalizeColor(ctx.colors.accent);

  // Axis
  slide.addShape('line', {
    x: startX,
    y: trackY,
    w: endX - startX,
    h: 0,
    line: { color: lineColor, width: 2 },
  });

  visible.forEach((item, i) => {
    const cx = startX + stepWidth * i + stepWidth / 2;
    // Node circle
    slide.addShape('ellipse', {
      x: cx - 0.15,
      y: trackY - 0.15,
      w: 0.3,
      h: 0.3,
      fill: { color: lineColor },
      line: { color: lineColor, width: 0 },
    });
    // Title above line
    slide.addText(item.label, {
      x: cx - stepWidth / 2 + 0.1,
      y: trackY - 1.3,
      w: stepWidth - 0.2,
      h: 1,
      ...applyTypeStyle({ ...ctx.typography.body, bold: true, align: 'center' }),
      align: 'center',
      valign: 'bottom',
    });
    // Description below line
    if (item.description) {
      slide.addText(item.description, {
        x: cx - stepWidth / 2 + 0.1,
        y: trackY + 0.25,
        w: stepWidth - 0.2,
        h: 1.4,
        ...applyTypeStyle(ctx.typography.caption),
        align: 'center',
        valign: 'top',
      });
    }
  });

  if (items.length > visible.length) {
    warnings.push(`timeline-slide truncated ${items.length - visible.length} items.`);
  }
  return { warnings, placed: visible.length };
};
