import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle } from './_shared.js';
import { normalizeColor } from '../utils/colorUtils.js';

/** section-divider - a bold separator between major sections. */
export const sectionDividerLayout: LayoutRenderer = (slide, spec, ctx) => {
  const warnings: string[] = [];
  const { contentArea } = applyScaffold({
    slide,
    spec,
    ctx,
    slideIndex: 0,
    totalSlides: ctx.deck.slides.length,
    dark: true,
  });

  // Big accent bar on the left
  slide.addShape('rect', {
    x: contentArea.x,
    y: contentArea.y + contentArea.h / 2 - 0.1,
    w: 0.9,
    h: 0.2,
    fill: { color: normalizeColor(ctx.colors.accent) },
    line: { color: normalizeColor(ctx.colors.accent), width: 0 },
  });

  slide.addText(spec.title ?? '', {
    x: contentArea.x + 1.1,
    y: contentArea.y + contentArea.h / 2 - 0.9,
    w: contentArea.w - 1.1,
    h: 1.2,
    ...applyTypeStyle({
      ...ctx.typography.display,
      color: 'FFFFFF',
      fontSize: 48,
    }),
    valign: 'top',
  });

  if (spec.subtitle) {
    slide.addText(spec.subtitle, {
      x: contentArea.x + 1.1,
      y: contentArea.y + contentArea.h / 2 + 0.5,
      w: contentArea.w - 1.1,
      h: 1,
      ...applyTypeStyle({
        ...ctx.typography.subtitle,
        color: 'E5E5E5',
      }),
    });
  }

  return { warnings, placed: 1 };
};
