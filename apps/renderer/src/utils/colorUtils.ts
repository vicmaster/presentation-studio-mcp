/**
 * Color helpers used by the renderer.
 *
 * PptxGenJS expects colors as RRGGBB (no leading #). Our schemas store them
 * with the leading #, so we normalize at the boundary.
 */

export function normalizeColor(hex: string): string {
  const v = hex.trim().replace('#', '');
  if (v.length === 3) {
    return (v[0]! + v[0]! + v[1]! + v[1]! + v[2]! + v[2]!).toUpperCase();
  }
  if (v.length === 6) return v.toUpperCase();
  return 'FFFFFF';
}

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const v = normalizeColor(hex);
  return {
    r: parseInt(v.slice(0, 2), 16),
    g: parseInt(v.slice(2, 4), 16),
    b: parseInt(v.slice(4, 6), 16),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number): string => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0').toUpperCase();
  };
  return toHex(r) + toHex(g) + toHex(b);
}

export function mix(a: string, b: string, t: number): string {
  const ra = hexToRgb(a);
  const rb = hexToRgb(b);
  return rgbToHex(
    ra.r * (1 - t) + rb.r * t,
    ra.g * (1 - t) + rb.g * t,
    ra.b * (1 - t) + rb.b * t,
  );
}

export function lighten(hex: string, amount: number): string {
  return mix(hex, 'FFFFFF', Math.max(0, Math.min(1, amount)));
}

export function darken(hex: string, amount: number): string {
  return mix(hex, '000000', Math.max(0, Math.min(1, amount)));
}

export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const channel = (v: number): number => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function isDark(hex: string): boolean {
  return luminance(hex) < 0.35;
}

/**
 * Pick a text color that reads well on top of a background.
 */
export function pickTextOn(bg: string, light = 'FFFFFF', dark = '111111'): string {
  return isDark(bg) ? light : dark;
}
