import type { LayoutRenderer } from '../layoutRegistry.js';
import { imageLeftTextRightLayout } from './imageLeftTextRight.js';
import { applyScaffold, applyTypeStyle, drawKicker } from './_shared.js';
import { splitColumns } from '../utils/geometry.js';
import { resolveImagePath } from '../utils/imagePlacement.js';
import { drawImagePlaceholder } from '../utils/placeholders.js';

/**
 * image-right-text-left - mirror of image-left-text-right. We implement it
 * directly (rather than reusing) so the positioning is unambiguous when
 * writing tests.
 */
export const imageRightTextLeftLayout: LayoutRenderer = (slide, spec, ctx) => {
  const warnings: string[] = [];
  const index = ctx.deck.slides.findIndex((s) => s.id === spec.id);
  const { contentArea } = applyScaffold({
    slide,
    spec,
    ctx,
    slideIndex: index,
    totalSlides: ctx.deck.slides.length,
  });

  const [textCol, imageCol] = splitColumns(contentArea, 2, ctx.spacing.gap);
  const imageRect = { x: imageCol!.x, y: imageCol!.y, w: imageCol!.w, h: imageCol!.h };

  const image = spec.images[0];
  if (image) {
    const path = resolveImagePath(image, ctx.baseDir);
    if (path) {
      slide.addImage({
        path,
        x: imageRect.x,
        y: imageRect.y,
        w: imageRect.w,
        h: imageRect.h,
        sizing: { type: 'cover', w: imageRect.w, h: imageRect.h },
        rounding: true,
      });
    } else {
      drawImagePlaceholder(slide, imageRect, image.alt ?? 'image', {
        bgColor: ctx.colors.background,
        accentColor: ctx.colors.accent,
        textColor: ctx.colors.text,
      });
      warnings.push(`image not found: ${image.path}`);
    }
  } else {
    drawImagePlaceholder(slide, imageRect, 'Image', {
      bgColor: ctx.colors.background,
      accentColor: ctx.colors.accent,
      textColor: ctx.colors.text,
    });
    warnings.push(`image-right-text-left on slide "${spec.id}" has no image.`);
  }

  if (spec.kicker) {
    drawKicker(slide, ctx, { x: textCol!.x, y: textCol!.y, w: textCol!.w, h: 0.3 }, spec.kicker);
  }
  const titleY = textCol!.y + (spec.kicker ? 0.35 : 0);
  slide.addText(spec.title ?? '', {
    x: textCol!.x,
    y: titleY,
    w: textCol!.w,
    h: 0.9,
    ...applyTypeStyle(ctx.typography.title),
  });
  if (spec.body) {
    slide.addText(spec.body, {
      x: textCol!.x,
      y: titleY + 1,
      w: textCol!.w,
      h: textCol!.h - 1 - (spec.bullets.length > 0 ? 1.6 : 0),
      ...applyTypeStyle(ctx.typography.body),
      valign: 'top',
    });
  }
  if (spec.bullets.length > 0) {
    slide.addText(
      spec.bullets.map((b) => ({ text: b, options: { bullet: { type: 'bullet' } } })),
      {
        x: textCol!.x,
        y: textCol!.y + textCol!.h - 2.2,
        w: textCol!.w,
        h: 2.0,
        ...applyTypeStyle(ctx.typography.body),
        valign: 'top',
      },
    );
  }

  return { warnings, placed: 1 };
};

// Keep the alias to make the DX easier for contributors.
export const _imageLeftTextRightAlias = imageLeftTextRightLayout;
