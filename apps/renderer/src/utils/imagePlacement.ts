import { existsSync } from 'node:fs';
import { resolve, isAbsolute } from 'node:path';
import type { AssetRef } from '@presentation-studio/schema';
import type { Rect } from './geometry.js';

/**
 * Utilities to place an image inside a target rect using common CSS-like
 * fitting modes.
 *
 * PptxGenJS natively supports {sizing: {type: "cover" | "contain", w, h}} for
 * image placement, but its cover implementation does not always crop well
 * when the aspect ratios differ a lot. We provide a deterministic fallback
 * that computes the final {x, y, w, h} ourselves so layouts stay predictable.
 */
export type ImageFit = 'cover' | 'contain' | 'fill';

export interface PlacedImage {
  x: number;
  y: number;
  w: number;
  h: number;
  sizing?: {
    type: 'cover' | 'contain';
    w: number;
    h: number;
  };
}

export function placeImage(
  target: Rect,
  natural: { width?: number; height?: number } | undefined,
  fit: ImageFit = 'cover',
): PlacedImage {
  if (fit === 'fill' || !natural?.width || !natural?.height) {
    return { ...target };
  }
  const targetRatio = target.w / target.h;
  const naturalRatio = natural.width / natural.height;

  if (fit === 'contain') {
    if (naturalRatio > targetRatio) {
      const w = target.w;
      const h = w / naturalRatio;
      return { x: target.x, y: target.y + (target.h - h) / 2, w, h };
    } else {
      const h = target.h;
      const w = h * naturalRatio;
      return { x: target.x + (target.w - w) / 2, y: target.y, w, h };
    }
  }

  // cover - use pptxgenjs native crop when the aspect differs.
  return {
    ...target,
    sizing: {
      type: 'cover',
      w: target.w,
      h: target.h,
    },
  };
}

/** Resolve an asset's path to an absolute file path on disk, if possible. */
export function resolveImagePath(ref: AssetRef, baseDir: string): string | undefined {
  if (!ref.path) return undefined;
  const abs = isAbsolute(ref.path) ? ref.path : resolve(baseDir, ref.path);
  if (existsSync(abs)) return abs;
  return undefined;
}
