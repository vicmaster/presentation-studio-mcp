import type { DeckSpec, AuditIssue } from '@presentation-studio/schema';
import { countSlideWords } from './textDensity.js';
import { collectSlideAssets } from '@presentation-studio/schema';

export function emptySlideRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slide of deck.slides) {
    const words = countSlideWords(slide);
    const assets = collectSlideAssets(slide).length;
    if (words === 0 && assets === 0) {
      issues.push({
        slide_id: slide.id,
        severity: 'error',
        code: 'EMPTY_SLIDE',
        message: 'La slide no tiene contenido ni assets.',
        details: {},
      });
    }
  }
  return issues;
}
