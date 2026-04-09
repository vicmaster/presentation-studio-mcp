import type { DeckSpec, AuditIssue } from '@presentation-studio/schema';

const CLOSING_LAYOUTS = new Set(['closing-cta']);

/**
 * CTA_MISSING_ON_CLOSING - a deck intended for sales/brochure/case-study should
 * not finish without an explicit call to action. We check that:
 *  - there is at least one slide with layout "closing-cta", AND
 *  - that slide has a .cta block populated.
 */
export function closingCtaMissingRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const type = deck.meta.presentation_type;
  const needsCta = [
    'brochure',
    'case-study',
    'sales-proposal',
    'product-overview',
    'generic',
  ].includes(type);
  if (!needsCta) return issues;

  const closingSlides = deck.slides.filter((s) => CLOSING_LAYOUTS.has(s.layout));
  if (closingSlides.length === 0) {
    issues.push({
      slide_id: null,
      severity: 'warning',
      code: 'CTA_MISSING_ON_CLOSING',
      message: `No hay slide de cierre con layout "closing-cta".`,
      details: { presentation_type: type },
    });
    return issues;
  }
  for (const slide of closingSlides) {
    const hasCta = Boolean(slide.cta && slide.cta.label);
    if (!hasCta) {
      issues.push({
        slide_id: slide.id,
        severity: 'warning',
        code: 'CTA_MISSING_ON_CLOSING',
        message: 'La slide de cierre no tiene un CTA definido.',
        details: {},
      });
    }
  }
  return issues;
}
