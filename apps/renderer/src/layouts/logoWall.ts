import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle } from './_shared.js';
import { splitGrid } from '../utils/geometry.js';
import { resolveImagePath } from '../utils/imagePlacement.js';
import { drawLogoPlaceholder } from '../utils/placeholders.js';

export const logoWallLayout: LayoutRenderer = (slide, spec, ctx) => {
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

  const logos = spec.logos.length > 0 ? spec.logos : spec.images.filter((i) => i.role === 'logo');
  if (logos.length === 0) {
    warnings.push(`logo-wall on slide "${spec.id}" has no logos.`);
    return { warnings, placed: 0 };
  }

  const wallRect = {
    x: contentArea.x,
    y: contentArea.y + (spec.title ? 1.1 : 0),
    w: contentArea.w,
    h: contentArea.h - (spec.title ? 1.1 : 0),
  };

  // Choose grid dimensions dynamically.
  const count = Math.min(logos.length, 12);
  const cols = count <= 4 ? count : count <= 6 ? 3 : count <= 9 ? 3 : 4;
  const rows = Math.ceil(count / cols);
  const rects = splitGrid(wallRect, cols, rows, ctx.spacing.gap);
  for (let i = 0; i < count; i++) {
    const logo = logos[i]!;
    const r = rects[i]!;
    const path = resolveImagePath(logo, ctx.baseDir);
    if (path) {
      slide.addImage({
        path,
        x: r.x + 0.15,
        y: r.y + 0.15,
        w: r.w - 0.3,
        h: r.h - 0.3,
        sizing: { type: 'contain', w: r.w - 0.3, h: r.h - 0.3 },
      });
    } else {
      drawLogoPlaceholder(slide, r, logo.alt ?? logo.id, {
        bgColor: ctx.colors.background,
        accentColor: ctx.colors.accent,
        textColor: ctx.colors.text,
      });
      warnings.push(`logo not found: ${logo.path}`);
    }
  }

  if (logos.length > count) {
    warnings.push(`logo-wall truncated ${logos.length - count} logos on slide "${spec.id}".`);
  }

  return { warnings, placed: count };
};
