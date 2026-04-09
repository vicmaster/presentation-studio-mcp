import type { DeckSpec, AuditIssue } from '@presentation-studio/schema';

export function duplicateSlideIdRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const seen = new Map<string, number>();
  for (const slide of deck.slides) {
    seen.set(slide.id, (seen.get(slide.id) ?? 0) + 1);
  }
  for (const [id, count] of seen) {
    if (count > 1) {
      issues.push({
        slide_id: id,
        severity: 'error',
        code: 'DUPLICATE_SLIDE_ID',
        message: `El id "${id}" aparece ${count} veces.`,
        details: { count },
      });
    }
  }
  return issues;
}
