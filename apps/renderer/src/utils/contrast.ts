import { luminance } from './colorUtils.js';

/**
 * Returns the WCAG contrast ratio between two colors (e.g. 4.5 means 4.5:1).
 */
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const light = Math.max(la, lb);
  const dark = Math.min(la, lb);
  return (light + 0.05) / (dark + 0.05);
}

export function meetsAA(a: string, b: string): boolean {
  return contrastRatio(a, b) >= 4.5;
}
