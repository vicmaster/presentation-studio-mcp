import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle, drawKicker } from './_shared.js';
import { splitColumns } from '../utils/geometry.js';
import { normalizeColor } from '../utils/colorUtils.js';

/**
 * two-column-text - title on top, body content split across two columns.
 * Column 1: body paragraph. Column 2: bullets. If only one is present, the
 * available column takes the full width.
 */
export const twoColumnTextLayout: LayoutRenderer = (slide, spec, ctx) => {
  const warnings: string[] = [];
  const index = ctx.deck.slides.findIndex((s) => s.id === spec.id);
  const { contentArea } = applyScaffold({
    slide,
    spec,
    ctx,
    slideIndex: index,
    totalSlides: ctx.deck.slides.length,
  });

  // kicker (optional)
  if (spec.kicker) {
    drawKicker(slide, ctx, { x: contentArea.x, y: contentArea.y, w: contentArea.w, h: 0.3 }, spec.kicker);
  }

  // Title
  const titleY = contentArea.y + (spec.kicker ? 0.35 : 0);
  slide.addText(spec.title ?? '', {
    x: contentArea.x,
    y: titleY,
    w: contentArea.w,
    h: 0.9,
    ...applyTypeStyle(ctx.typography.title),
    valign: 'top',
  });

  // Divider
  slide.addShape('rect', {
    x: contentArea.x,
    y: titleY + 1,
    w: 0.6,
    h: 0.04,
    fill: { color: normalizeColor(ctx.colors.accent) },
    line: { color: normalizeColor(ctx.colors.accent), width: 0 },
  });

  const bodyTop = titleY + 1.2;
  const bodyRect = {
    x: contentArea.x,
    y: bodyTop,
    w: contentArea.w,
    h: contentArea.h - (bodyTop - contentArea.y),
  };

  const hasBody = Boolean(spec.body && spec.body.trim().length > 0);
  const hasBullets = spec.bullets.length > 0;

  if (hasBody && hasBullets) {
    const [leftCol, rightCol] = splitColumns(bodyRect, 2, ctx.spacing.gap);
    slide.addText(spec.body!, {
      x: leftCol!.x,
      y: leftCol!.y,
      w: leftCol!.w,
      h: leftCol!.h,
      ...applyTypeStyle(ctx.typography.body),
      valign: 'top',
    });
    slide.addText(
      spec.bullets.map((b) => ({ text: b, options: { bullet: { type: 'bullet' } } })),
      {
        x: rightCol!.x,
        y: rightCol!.y,
        w: rightCol!.w,
        h: rightCol!.h,
        ...applyTypeStyle(ctx.typography.body),
        valign: 'top',
      },
    );
  } else if (hasBody) {
    slide.addText(spec.body!, {
      x: bodyRect.x,
      y: bodyRect.y,
      w: bodyRect.w,
      h: bodyRect.h,
      ...applyTypeStyle(ctx.typography.body),
      valign: 'top',
    });
  } else if (hasBullets) {
    slide.addText(
      spec.bullets.map((b) => ({ text: b, options: { bullet: { type: 'bullet' } } })),
      {
        x: bodyRect.x,
        y: bodyRect.y,
        w: bodyRect.w,
        h: bodyRect.h,
        ...applyTypeStyle(ctx.typography.body),
        valign: 'top',
      },
    );
  } else {
    warnings.push(`two-column-text on slide "${spec.id}" has no body or bullets.`);
  }

  return { warnings, placed: 1 };
};
