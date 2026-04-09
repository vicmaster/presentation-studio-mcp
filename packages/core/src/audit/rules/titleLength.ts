import type { DeckSpec, AuditIssue } from '@presentation-studio/schema';

const MAX_TITLE_CHARS = 80;
const WARN_TITLE_CHARS = 60;

export function titleLengthRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slide of deck.slides) {
    if (!slide.title) continue;
    const length = slide.title.length;
    if (length > MAX_TITLE_CHARS) {
      issues.push({
        slide_id: slide.id,
        severity: 'error',
        code: 'TITLE_TOO_LONG',
        message: `El título tiene ${length} caracteres (máx recomendado ${MAX_TITLE_CHARS}).`,
        details: { length, threshold: MAX_TITLE_CHARS },
      });
    } else if (length > WARN_TITLE_CHARS) {
      issues.push({
        slide_id: slide.id,
        severity: 'warning',
        code: 'TITLE_TOO_LONG',
        message: `El título tiene ${length} caracteres, considera acortarlo.`,
        details: { length, threshold: WARN_TITLE_CHARS },
      });
    }
  }
  return issues;
}
