import type { Rect } from './geometry.js';
import { isWithin } from './geometry.js';

/**
 * Checks that every placed rect lives inside the safe area. Produces warnings
 * instead of throwing, so the renderer can keep going and emit diagnostics.
 */
export function assertInsideSafeArea(
  safe: Rect,
  placed: Array<{ id: string; rect: Rect }>,
  warnings: string[],
): void {
  for (const { id, rect } of placed) {
    if (!isWithin(rect, safe)) {
      warnings.push(
        `Element "${id}" is outside the safe area (${rect.x.toFixed(2)},${rect.y.toFixed(2)} ${rect.w.toFixed(2)}x${rect.h.toFixed(2)}).`,
      );
    }
  }
}
