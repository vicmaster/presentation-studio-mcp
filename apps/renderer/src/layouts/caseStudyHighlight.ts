import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle, drawKicker } from './_shared.js';
import { normalizeColor, lighten } from '../utils/colorUtils.js';
import { splitColumns } from '../utils/geometry.js';

/**
 * case-study-highlight - a single impactful metric + quote + body.
 * Ideal for "star" case study slides inside brochures or QBRs.
 */
export const caseStudyHighlightLayout: LayoutRenderer = (slide, spec, ctx) => {
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
  slide.addText(spec.title ?? '', {
    x: contentArea.x,
    y: titleY,
    w: contentArea.w,
    h: 0.9,
    ...applyTypeStyle(ctx.typography.title),
    valign: 'top',
  });

  // Metric card + body
  const bodyRect = {
    x: contentArea.x,
    y: titleY + 1.1,
    w: contentArea.w,
    h: contentArea.h - (titleY + 1.1 - contentArea.y),
  };
  const [metricCol, textCol] = splitColumns(bodyRect, 2, ctx.spacing.gap);

  // Metric card
  if (spec.metrics.length > 0) {
    const metric = spec.metrics[0]!;
    slide.addShape('rect', {
      x: metricCol!.x,
      y: metricCol!.y,
      w: metricCol!.w,
      h: Math.min(metricCol!.h, 3.2),
      fill: { color: normalizeColor(lighten(ctx.colors.accent, 0.88)) },
      line: { color: normalizeColor(ctx.colors.accent), width: 0.75 },
      rectRadius: 0.1,
    });
    slide.addText(metric.value, {
      x: metricCol!.x + 0.3,
      y: metricCol!.y + 0.3,
      w: metricCol!.w - 0.6,
      h: 1.6,
      ...applyTypeStyle({ ...ctx.typography.metricValue, fontSize: 72 }),
      valign: 'middle',
    });
    slide.addText(metric.label, {
      x: metricCol!.x + 0.3,
      y: metricCol!.y + 1.9,
      w: metricCol!.w - 0.6,
      h: 0.5,
      ...applyTypeStyle(ctx.typography.metricLabel),
    });
    if (metric.detail) {
      slide.addText(metric.detail, {
        x: metricCol!.x + 0.3,
        y: metricCol!.y + 2.4,
        w: metricCol!.w - 0.6,
        h: 0.5,
        ...applyTypeStyle(ctx.typography.caption),
      });
    }
  } else {
    warnings.push(`case-study-highlight on slide "${spec.id}" has no metrics.`);
  }

  // Body / quote column
  if (spec.quote) {
    slide.addText(`"${spec.quote}"`, {
      x: textCol!.x,
      y: textCol!.y,
      w: textCol!.w,
      h: 2,
      ...applyTypeStyle(ctx.typography.quote),
      valign: 'top',
    });
    if (spec.quote_author) {
      slide.addText(`— ${spec.quote_author}`, {
        x: textCol!.x,
        y: textCol!.y + 2.1,
        w: textCol!.w,
        h: 0.5,
        ...applyTypeStyle(ctx.typography.caption),
      });
    }
  }
  if (spec.body) {
    slide.addText(spec.body, {
      x: textCol!.x,
      y: textCol!.y + (spec.quote ? 2.7 : 0),
      w: textCol!.w,
      h: textCol!.h - (spec.quote ? 2.7 : 0),
      ...applyTypeStyle(ctx.typography.body),
      valign: 'top',
    });
  }

  return { warnings, placed: 1 };
};
