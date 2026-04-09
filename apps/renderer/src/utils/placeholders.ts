import type pptxgen from 'pptxgenjs';
import { normalizeColor, lighten } from './colorUtils.js';
import type { Rect } from './geometry.js';

/**
 * Helpers to draw elegant placeholders when an asset is missing. These are
 * not ugly gray boxes; they respect the brand palette and include a subtle
 * icon-ish glyph made of shapes + text.
 */
export interface PlaceholderContext {
  bgColor: string;
  accentColor: string;
  textColor: string;
}

export function drawImagePlaceholder(
  slide: pptxgen.Slide,
  rect: Rect,
  label: string,
  ctx: PlaceholderContext,
): void {
  const bg = normalizeColor(lighten(ctx.accentColor, 0.85));
  slide.addShape('rect', {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    fill: { color: bg },
    line: { color: normalizeColor(ctx.accentColor), width: 1, dashType: 'dash' },
    rectRadius: 0.08,
  });
  slide.addText(
    [
      { text: '⌘\n', options: { fontSize: 22, color: normalizeColor(ctx.accentColor), bold: true } },
      { text: label, options: { fontSize: 11, color: normalizeColor(ctx.textColor) } },
    ],
    {
      x: rect.x,
      y: rect.y,
      w: rect.w,
      h: rect.h,
      align: 'center',
      valign: 'middle',
    },
  );
}

export function drawLogoPlaceholder(
  slide: pptxgen.Slide,
  rect: Rect,
  label: string,
  ctx: PlaceholderContext,
): void {
  slide.addShape('rect', {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    fill: { color: normalizeColor(lighten(ctx.textColor, 0.92)) },
    line: { color: normalizeColor(lighten(ctx.textColor, 0.75)), width: 0.5 },
    rectRadius: 0.04,
  });
  slide.addText(label, {
    x: rect.x,
    y: rect.y,
    w: rect.w,
    h: rect.h,
    align: 'center',
    valign: 'middle',
    fontSize: 10,
    color: normalizeColor(lighten(ctx.textColor, 0.5)),
  });
}
