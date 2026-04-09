import type { LayoutRenderer } from '../layoutRegistry.js';
import { applyScaffold, applyTypeStyle, brandLogoForContext } from './_shared.js';
import { resolveImagePath } from '../utils/imagePlacement.js';
import { drawImagePlaceholder } from '../utils/placeholders.js';
import { normalizeColor } from '../utils/colorUtils.js';
import type { Rect } from '../utils/geometry.js';

/**
 * hero-cover - the opening slide. Big title, supporting subtitle,
 * optional background image, optional brand logo.
 */
export const heroCoverLayout: LayoutRenderer = (slide, spec, ctx) => {
  const warnings: string[] = [];
  const hasBgImage = Boolean(spec.background?.image);
  const useDark = hasBgImage || ctx.deck.theme.background_style === 'dark';

  const { contentArea } = applyScaffold({
    slide,
    spec,
    ctx,
    slideIndex: 0,
    totalSlides: ctx.deck.slides.length,
    dark: useDark,
    hideHeader: true,
  });

  const titleColor = useDark ? 'FFFFFF' : ctx.colors.text;
  const subtitleColor = useDark ? 'E5E5E5' : ctx.colors.textMuted;

  // If the spec provides an image (not in `background`) we treat it as the hero image.
  const heroImage = spec.images[0];
  const heroRect: Rect = {
    x: contentArea.x,
    y: contentArea.y,
    w: contentArea.w,
    h: contentArea.h,
  };

  if (!hasBgImage && heroImage) {
    const imagePath = resolveImagePath(heroImage, ctx.baseDir);
    if (imagePath) {
      slide.addImage({
        path: imagePath,
        x: heroRect.x + heroRect.w * 0.55,
        y: heroRect.y + 0.2,
        w: heroRect.w * 0.45,
        h: heroRect.h - 0.6,
        sizing: {
          type: 'cover',
          w: heroRect.w * 0.45,
          h: heroRect.h - 0.6,
        },
        rounding: true,
      });
    } else {
      drawImagePlaceholder(
        slide,
        { x: heroRect.x + heroRect.w * 0.55, y: heroRect.y + 0.2, w: heroRect.w * 0.45, h: heroRect.h - 0.6 },
        heroImage.alt ?? 'hero image',
        {
          bgColor: ctx.colors.background,
          accentColor: ctx.colors.accent,
          textColor: ctx.colors.text,
        },
      );
      warnings.push(`hero image not found: ${heroImage.path}`);
    }
  }

  const textW = hasBgImage || !heroImage ? contentArea.w : contentArea.w * 0.5;
  const kickerRect: Rect = {
    x: contentArea.x,
    y: contentArea.y + contentArea.h * 0.35,
    w: textW,
    h: 0.3,
  };
  if (spec.kicker) {
    slide.addText(spec.kicker.toUpperCase(), {
      x: kickerRect.x,
      y: kickerRect.y,
      w: kickerRect.w,
      h: kickerRect.h,
      ...applyTypeStyle({
        ...ctx.typography.kicker,
        color: normalizeColor(ctx.colors.accent),
      }),
    });
  }

  // Title
  const titleRect: Rect = {
    x: contentArea.x,
    y: kickerRect.y + 0.3,
    w: textW,
    h: 2.4,
  };
  slide.addText(spec.title ?? ctx.deck.meta.title, {
    x: titleRect.x,
    y: titleRect.y,
    w: titleRect.w,
    h: titleRect.h,
    ...applyTypeStyle({
      ...ctx.typography.display,
      color: titleColor,
    }),
    valign: 'top',
  });

  // Subtitle
  if (spec.subtitle) {
    slide.addText(spec.subtitle, {
      x: contentArea.x,
      y: titleRect.y + 1.4,
      w: textW,
      h: 1.4,
      ...applyTypeStyle({
        ...ctx.typography.subtitle,
        color: subtitleColor,
      }),
      valign: 'top',
    });
  }

  // Brand logo (top-left corner)
  const logoPath = brandLogoForContext(ctx, useDark);
  if (logoPath) {
    slide.addImage({
      path: logoPath,
      x: contentArea.x,
      y: contentArea.y,
      w: 1.6,
      h: 0.55,
      sizing: { type: 'contain', w: 1.6, h: 0.55 },
    });
  }

  return { warnings, placed: 1 };
};
