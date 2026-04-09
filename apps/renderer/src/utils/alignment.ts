import type { Rect } from './geometry.js';

export type Align = 'left' | 'center' | 'right';
export type VAlign = 'top' | 'middle' | 'bottom';

/** Map logical alignment to the PptxGenJS-friendly value. */
export function toPptxAlign(align: Align | undefined, fallback: Align = 'left'): Align {
  return align ?? fallback;
}

export function distributeHorizontally(
  target: Rect,
  count: number,
  itemWidth: number,
  gap: number,
): Array<{ x: number; y: number }> {
  const totalWidth = itemWidth * count + gap * (count - 1);
  const startX = target.x + (target.w - totalWidth) / 2;
  return Array.from({ length: count }, (_, i) => ({
    x: startX + i * (itemWidth + gap),
    y: target.y + target.h / 2 - itemWidth / 2,
  }));
}
