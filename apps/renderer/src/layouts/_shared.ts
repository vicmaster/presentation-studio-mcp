import type pptxgen from 'pptxgenjs';
import type { SlideSpec } from '@presentation-studio/schema';
import type { RenderContext } from '../layoutRegistry.js';
import type { Rect } from '../utils/geometry.js';
import { bottomBand, topBand } from '../utils/geometry.js';
import { normalizeColor } from '../utils/colorUtils.js';
import { resolveImagePath } from '../utils/imagePlacement.js';
import type { TypeStyle } from '../utils/typography.js';

/**
 * Shared scaffolding used by every layout: background, footer,
 * page number, title block, kicker badge and notes hook.
 */
export interface ScaffoldOptions {
  slide: pptxgen.Slide;
  spec: SlideSpec;
  ctx: RenderContext;
  slideIndex: number;
  totalSlides: number;
  dark?: boolean;
  hideHeader?: boolean;
}

export function applyScaffold(opts: ScaffoldOptions): { contentArea: Rect; headerArea: Rect } {
  const { slide, spec, ctx, slideIndex, totalSlides, dark = false, hideHeader = false } = opts;

  const bg =
    spec.style_overrides?.background_color ??
    spec.background?.color ??
    (dark ? ctx.colors.secondary : ctx.colors.background);
  slide.background = { color: normalizeColor(bg) };

  if (spec.notes) slide.addNotes(spec.notes);

  // Background image (if any)
  if (spec.background?.image) {
    const path = resolveImagePath(spec.background.image, ctx.baseDir);
    if (path) {
      slide.addImage({
        path,
        x: 0,
        y: 0,
        w: ctx.canvas.width,
        h: ctx.canvas.height,
        sizing: { type: 'cover', w: ctx.canvas.width, h: ctx.canvas.height },
      });
      // Darken overlay so text remains readable
      slide.addShape('rect', {
        x: 0,
        y: 0,
        w: ctx.canvas.width,
        h: ctx.canvas.height,
        fill: { color: '000000', transparency: 55 },
        line: { color: '000000', width: 0 },
      });
    }
  }

  const safe = ctx.safe;

  // Footer band (if enabled)
  if (ctx.deck.theme.show_footer && !hideHeader) {
    const footerRect = bottomBand(safe, 0.25);
    addFooter(slide, footerRect, ctx, slideIndex, totalSlides);
  }

  const contentArea: Rect = {
    x: safe.x,
    y: safe.y,
    w: safe.w,
    h: safe.h - (ctx.deck.theme.show_footer ? 0.4 : 0),
  };

  const headerArea = topBand(contentArea, 0.6);
  return { contentArea, headerArea };
}

function addFooter(
  slide: pptxgen.Slide,
  rect: Rect,
  ctx: RenderContext,
  slideIndex: number,
  totalSlides: number,
): void {
  const text = ctx.deck.theme.footer_text ?? ctx.deck.brand.name;
  slide.addText(text, {
    x: rect.x,
    y: rect.y,
    w: rect.w * 0.7,
    h: rect.h,
    fontFace: ctx.typography.footer.fontFace,
    fontSize: ctx.typography.footer.fontSize,
    color: normalizeColor(ctx.colors.textMuted),
    align: 'left',
    valign: 'middle',
  });
  if (ctx.deck.theme.show_page_numbers) {
    slide.addText(`${slideIndex + 1} / ${totalSlides}`, {
      x: rect.x + rect.w * 0.7,
      y: rect.y,
      w: rect.w * 0.3,
      h: rect.h,
      fontFace: ctx.typography.footer.fontFace,
      fontSize: ctx.typography.footer.fontSize,
      color: normalizeColor(ctx.colors.textMuted),
      align: 'right',
      valign: 'middle',
    });
  }
}

export function applyTypeStyle(style: TypeStyle): Record<string, unknown> {
  return {
    fontFace: style.fontFace,
    fontSize: style.fontSize,
    bold: style.bold,
    italic: style.italic,
    color: normalizeColor(style.color),
    lineSpacingMultiple: style.lineSpacingMultiple,
    charSpacing: style.charSpacing,
  };
}

/**
 * Draws a kicker badge (small uppercase label). Useful above titles.
 */
export function drawKicker(
  slide: pptxgen.Slide,
  ctx: RenderContext,
  rect: Rect,
  text: string,
): void {
  slide.addText(text.toUpperCase(), {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: 0.3,
    ...applyTypeStyle(ctx.typography.kicker),
  });
}

/**
 * Convert the stored logo path to a renderable image if it exists.
 */
export function brandLogoForContext(ctx: RenderContext, preferWhite = false): string | undefined {
  const prefer = preferWhite ? ctx.deck.brand.logo_white_path : ctx.deck.brand.logo_path;
  const fallback = preferWhite ? ctx.deck.brand.logo_path : ctx.deck.brand.logo_white_path;
  const candidate = prefer ?? fallback;
  if (!candidate) return undefined;
  const resolved = resolveImagePath(
    { id: 'brand-logo', path: candidate, kind: 'logo', role: 'logo', tags: [], status: 'source' },
    ctx.baseDir,
  );
  return resolved;
}
