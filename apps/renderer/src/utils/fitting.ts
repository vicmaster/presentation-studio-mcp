/**
 * Text-fitting heuristics. We don't have a real text metrics engine in
 * JavaScript (without canvas) so we estimate whether a given string will fit
 * in a rect based on character width heuristics.
 *
 * This is good enough to shrink titles, clamp body text and pick between
 * two typography variants.
 */

const AVG_CHAR_WIDTH_EMS = 0.55; // approximate for Lato/Inter

export interface FitOptions {
  rectWidthIn: number;
  rectHeightIn: number;
  fontSizePt: number;
  lineHeightMultiple?: number;
}

export function estimatedCharsPerLine(opts: FitOptions): number {
  // 72 pt per inch, and each em ≈ font-size in points.
  const fontSizeIn = opts.fontSizePt / 72;
  const charWidthIn = fontSizeIn * AVG_CHAR_WIDTH_EMS;
  if (charWidthIn <= 0) return 0;
  return Math.max(1, Math.floor(opts.rectWidthIn / charWidthIn));
}

export function estimatedMaxLines(opts: FitOptions): number {
  const lh = opts.lineHeightMultiple ?? 1.2;
  const fontSizeIn = opts.fontSizePt / 72;
  const lineHeightIn = fontSizeIn * lh;
  if (lineHeightIn <= 0) return 0;
  return Math.max(1, Math.floor(opts.rectHeightIn / lineHeightIn));
}

export function fitsText(text: string, opts: FitOptions): boolean {
  const cpl = estimatedCharsPerLine(opts);
  const maxLines = estimatedMaxLines(opts);
  const lines = Math.ceil(text.length / Math.max(1, cpl));
  return lines <= maxLines;
}

/**
 * Try to find the largest font size (within range) at which the text still
 * fits in the given rect. Useful for auto-scaling titles.
 */
export function autoFitFontSize(
  text: string,
  rect: { w: number; h: number },
  opts: { min: number; max: number; lineHeight?: number },
): number {
  for (let size = opts.max; size >= opts.min; size -= 1) {
    if (
      fitsText(text, {
        rectWidthIn: rect.w,
        rectHeightIn: rect.h,
        fontSizePt: size,
        lineHeightMultiple: opts.lineHeight,
      })
    ) {
      return size;
    }
  }
  return opts.min;
}
