/**
 * Spacing tokens - all dimensions are in inches.
 *
 * Layouts should ALWAYS use these tokens instead of hardcoded numbers so the
 * whole system scales consistently when densities change.
 */
export const SPACING = {
  xxs: 0.05,
  xs: 0.1,
  sm: 0.18,
  md: 0.3,
  lg: 0.5,
  xl: 0.75,
  xxl: 1.0,
} as const;

export type SpacingKey = keyof typeof SPACING;

export function spacing(key: SpacingKey): number {
  return SPACING[key];
}

export function spacingForDensity(density: 'minimal' | 'balanced' | 'dense'): {
  outer: number;
  inner: number;
  gap: number;
} {
  switch (density) {
    case 'minimal':
      return { outer: SPACING.xl, inner: SPACING.lg, gap: SPACING.lg };
    case 'dense':
      return { outer: SPACING.md, inner: SPACING.sm, gap: SPACING.sm };
    case 'balanced':
    default:
      return { outer: SPACING.lg, inner: SPACING.md, gap: SPACING.md };
  }
}
