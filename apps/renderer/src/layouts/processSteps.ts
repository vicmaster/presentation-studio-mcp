import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle } from './_shared.js';
import { splitColumns } from '../utils/geometry.js';
import { normalizeColor } from '../utils/colorUtils.js';

export const processStepsLayout: LayoutRenderer = (slide, spec, ctx) => {
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
    warnings.push(`process-steps on slide "${spec.id}" has no steps.`);
    return { warnings, placed: 0 };
  }

  const visible = items.slice(0, 6);
  const stepRect = {
    x: contentArea.x,
    y: contentArea.y + (spec.title ? 1.3 : 0),
    w: contentArea.w,
    h: contentArea.h - (spec.title ? 1.3 : 0),
  };
  const cols = splitColumns(stepRect, visible.length, ctx.spacing.gap);

  visible.forEach((step, i) => {
    const r = cols[i]!;
    // Number badge
    slide.addShape('ellipse', {
      x: r.x + r.w / 2 - 0.4,
      y: r.y + 0.1,
      w: 0.8,
      h: 0.8,
      fill: { color: normalizeColor(ctx.colors.accent) },
      line: { color: normalizeColor(ctx.colors.accent), width: 0 },
    });
    slide.addText(String(i + 1), {
      x: r.x + r.w / 2 - 0.4,
      y: r.y + 0.1,
      w: 0.8,
      h: 0.8,
      fontFace: ctx.typography.title.fontFace,
      fontSize: 26,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle',
    });
    // Label
    slide.addText(step.label, {
      x: r.x,
      y: r.y + 1.05,
      w: r.w,
      h: 0.8,
      ...applyTypeStyle({ ...ctx.typography.body, bold: true }),
      align: 'center',
      valign: 'top',
    });
    // Description
    if (step.description) {
      slide.addText(step.description, {
        x: r.x + 0.1,
        y: r.y + 1.85,
        w: r.w - 0.2,
        h: r.h - 1.9,
        ...applyTypeStyle(ctx.typography.caption),
        align: 'center',
        valign: 'top',
      });
    }
  });

  if (items.length > visible.length) {
    warnings.push(`process-steps truncated ${items.length - visible.length} steps.`);
  }

  return { warnings, placed: visible.length };
};
