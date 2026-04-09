import type { DeckSpec, AuditIssue } from '@presentation-studio/schema';

/**
 * INCONSISTENT_BRAND_USAGE - flags slides whose style_overrides introduce
 * colors that are not in the current brand palette. It is valid to override,
 * but we still warn so the user can double-check.
 */
export function inconsistentBrandUsageRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const palette = new Set(
    [
      deck.brand.primary_color,
      deck.brand.secondary_color,
      deck.brand.accent_color,
      deck.brand.background_color,
      deck.brand.text_color,
    ]
      .filter(Boolean)
      .map((c) => (c as string).toLowerCase()),
  );
  for (const slide of deck.slides) {
    const overrides = slide.style_overrides ?? {};
    for (const [key, value] of Object.entries(overrides)) {
      if (typeof value !== 'string') continue;
      if (!value.startsWith('#')) continue;
      if (!palette.has(value.toLowerCase())) {
        issues.push({
          slide_id: slide.id,
          severity: 'info',
          code: 'INCONSISTENT_BRAND_USAGE',
          message: `Override "${key}" usa un color fuera del brand palette: ${value}.`,
          details: { key, value, palette: Array.from(palette) },
        });
      }
    }
  }
  return issues;
}
