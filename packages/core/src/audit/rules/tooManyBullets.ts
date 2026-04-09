import type { DeckSpec, AuditIssue } from '@presentation-studio/schema';

const MAX_BULLETS = 7;

export function tooManyBulletsRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slide of deck.slides) {
    if (slide.bullets.length > MAX_BULLETS) {
      issues.push({
        slide_id: slide.id,
        severity: 'warning',
        code: 'TOO_MANY_BULLETS',
        message: `La slide tiene ${slide.bullets.length} bullets (máx recomendado ${MAX_BULLETS}).`,
        details: { count: slide.bullets.length, threshold: MAX_BULLETS },
      });
    }
  }
  return issues;
}
