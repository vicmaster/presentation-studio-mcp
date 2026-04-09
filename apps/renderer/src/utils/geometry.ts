/**
 * Geometry primitives for layouts.
 *
 * Everything is in inches because PptxGenJS uses inches as its native unit.
 * Slide sizes:
 *  - LAYOUT_WIDE: 13.333 x 7.5
 *  - LAYOUT_STANDARD: 10 x 7.5
 *  - LAYOUT_16x10: 13.333 x 8.333
 */
export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SlideCanvas {
  width: number;
  height: number;
  safeMargin: number;
}

export const CANVAS_PRESETS: Record<string, { width: number; height: number }> = {
  LAYOUT_WIDE: { width: 13.333, height: 7.5 },
  LAYOUT_STANDARD: { width: 10, height: 7.5 },
  LAYOUT_16x10: { width: 13.333, height: 8.333 },
};

export function getCanvas(pageSize: string, safeMargin: number): SlideCanvas {
  const preset = CANVAS_PRESETS[pageSize] ?? CANVAS_PRESETS.LAYOUT_WIDE!;
  return { width: preset.width, height: preset.height, safeMargin };
}

/** Inner safe rectangle (canvas minus safe margins). */
export function safeArea(canvas: SlideCanvas): Rect {
  return {
    x: canvas.safeMargin,
    y: canvas.safeMargin,
    w: canvas.width - canvas.safeMargin * 2,
    h: canvas.height - canvas.safeMargin * 2,
  };
}

/** Split a rect horizontally into N equal columns with a gap. */
export function splitColumns(rect: Rect, count: number, gap: number): Rect[] {
  if (count < 1) return [];
  const totalGap = gap * (count - 1);
  const colWidth = (rect.w - totalGap) / count;
  return Array.from({ length: count }, (_, i) => ({
    x: rect.x + i * (colWidth + gap),
    y: rect.y,
    w: colWidth,
    h: rect.h,
  }));
}

/** Split a rect vertically into N equal rows with a gap. */
export function splitRows(rect: Rect, count: number, gap: number): Rect[] {
  if (count < 1) return [];
  const totalGap = gap * (count - 1);
  const rowHeight = (rect.h - totalGap) / count;
  return Array.from({ length: count }, (_, i) => ({
    x: rect.x,
    y: rect.y + i * (rowHeight + gap),
    w: rect.w,
    h: rowHeight,
  }));
}

/** Split a rect into a grid (columns x rows). */
export function splitGrid(
  rect: Rect,
  cols: number,
  rows: number,
  gap: number,
): Rect[] {
  const out: Rect[] = [];
  const colWidth = (rect.w - gap * (cols - 1)) / cols;
  const rowHeight = (rect.h - gap * (rows - 1)) / rows;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out.push({
        x: rect.x + c * (colWidth + gap),
        y: rect.y + r * (rowHeight + gap),
        w: colWidth,
        h: rowHeight,
      });
    }
  }
  return out;
}

export function insetRect(rect: Rect, padding: number): Rect {
  return {
    x: rect.x + padding,
    y: rect.y + padding,
    w: rect.w - padding * 2,
    h: rect.h - padding * 2,
  };
}

export function topBand(rect: Rect, height: number): Rect {
  return { x: rect.x, y: rect.y, w: rect.w, h: Math.min(height, rect.h) };
}

export function bottomBand(rect: Rect, height: number): Rect {
  const h = Math.min(height, rect.h);
  return { x: rect.x, y: rect.y + rect.h - h, w: rect.w, h };
}

export function below(rect: Rect, offset: number): { x: number; y: number } {
  return { x: rect.x, y: rect.y + rect.h + offset };
}

export function isWithin(inner: Rect, outer: Rect): boolean {
  return (
    inner.x >= outer.x - 1e-6 &&
    inner.y >= outer.y - 1e-6 &&
    inner.x + inner.w <= outer.x + outer.w + 1e-6 &&
    inner.y + inner.h <= outer.y + outer.h + 1e-6
  );
}
