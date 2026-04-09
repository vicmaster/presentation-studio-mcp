import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle, brandLogoForContext } from './_shared.js';
import { normalizeColor } from '../utils/colorUtils.js';

export const closingCtaLayout: LayoutRenderer = (slide, spec, ctx) => {
  const warnings: string[] = [];
  const index = ctx.deck.slides.findIndex((s) => s.id === spec.id);
  const { contentArea } = applyScaffold({
    slide,
    spec,
    ctx,
    slideIndex: index,
    totalSlides: ctx.deck.slides.length,
    dark: true,
  });

  // Main headline
  slide.addText(spec.title ?? 'Hablemos', {
    x: contentArea.x,
    y: contentArea.y + contentArea.h * 0.3,
    w: contentArea.w,
    h: 1.6,
    ...applyTypeStyle({ ...ctx.typography.display, color: 'FFFFFF' }),
    valign: 'top',
  });

  if (spec.subtitle) {
    slide.addText(spec.subtitle, {
      x: contentArea.x,
      y: contentArea.y + contentArea.h * 0.55,
      w: contentArea.w,
      h: 0.8,
      ...applyTypeStyle({ ...ctx.typography.subtitle, color: 'DADADA' }),
    });
  }

  // CTA block
  if (spec.cta) {
    const cta = spec.cta;
    const ctaY = contentArea.y + contentArea.h * 0.68;
    slide.addShape('rect', {
      x: contentArea.x,
      y: ctaY,
      w: 4.8,
      h: 0.75,
      fill: { color: normalizeColor(ctx.colors.accent) },
      line: { color: normalizeColor(ctx.colors.accent), width: 0 },
      rectRadius: 0.08,
    });
    slide.addText(cta.label, {
      x: contentArea.x + 0.3,
      y: ctaY,
      w: 4.5,
      h: 0.75,
      fontFace: ctx.typography.cta.fontFace,
      fontSize: 20,
      bold: true,
      color: 'FFFFFF',
      valign: 'middle',
    });
    const details: string[] = [];
    if (cta.email) details.push(cta.email);
    if (cta.url) details.push(cta.url);
    if (cta.contact) details.push(cta.contact);
    if (details.length > 0) {
      slide.addText(details.join(' · '), {
        x: contentArea.x,
        y: ctaY + 0.95,
        w: contentArea.w,
        h: 0.5,
        ...applyTypeStyle({ ...ctx.typography.body, color: 'DADADA' }),
      });
    }
  } else {
    warnings.push(`closing-cta on slide "${spec.id}" has no CTA.`);
  }

  const logoPath = brandLogoForContext(ctx, true);
  if (logoPath) {
    slide.addImage({
      path: logoPath,
      x: contentArea.x + contentArea.w - 2,
      y: contentArea.y,
      w: 1.8,
      h: 0.6,
      sizing: { type: 'contain', w: 1.8, h: 0.6 },
    });
  }

  return { warnings, placed: 1 };
};
