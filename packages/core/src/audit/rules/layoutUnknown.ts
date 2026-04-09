import type { DeckSpec, AuditIssue } from '@presentation-studio/schema';

export interface LayoutUnknownContext {
  knownLayouts: Set<string>;
}

export function layoutUnknownRule(deck: DeckSpec, ctx: LayoutUnknownContext): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slide of deck.slides) {
    if (!ctx.knownLayouts.has(slide.layout)) {
      issues.push({
        slide_id: slide.id,
        severity: 'warning',
        code: 'LAYOUT_UNKNOWN',
        message: `Layout "${slide.layout}" no está registrado. El renderer usará un fallback.`,
        details: { layout: slide.layout },
      });
    }
  }
  return issues;
}
