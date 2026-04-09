import type { DeckSpec, AuditIssue } from '@presentation-studio/schema';
import { countSlideWords } from './textDensity.js';

/**
 * Heuristic estimate for when content will simply not fit on the slide canvas.
 * We use word counts scaled by layout complexity. A layout like "hero-cover"
 * with 400 words will overflow even with tiny type; we warn the user in advance.
 */
const MAX_WORDS_PER_LAYOUT: Record<string, number> = {
  'hero-cover': 60,
  'section-divider': 50,
  'two-column-text': 200,
  'image-left-text-right': 160,
  'image-right-text-left': 160,
  'case-study-highlight': 180,
  'metrics-grid': 140,
  'logo-wall': 60,
  'quote-slide': 80,
  'closing-cta': 90,
  'timeline-slide': 170,
  'comparison-table': 220,
  'process-steps': 170,
  'testimonial-grid': 200,
  'capabilities-grid': 180,
};
const HARD_DEFAULT = 200;

export function elementOutOfBoundsRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slide of deck.slides) {
    const max = MAX_WORDS_PER_LAYOUT[slide.layout] ?? HARD_DEFAULT;
    const words = countSlideWords(slide);
    if (words > max) {
      issues.push({
        slide_id: slide.id,
        severity: 'error',
        code: 'ELEMENT_OUT_OF_BOUNDS',
        message: `El contenido de la slide probablemente no cabrá en el canvas (words=${words}, hard=${max}).`,
        details: { word_count: words, hard_limit: max, layout: slide.layout },
      });
    }
    if (slide.items.length > 12) {
      issues.push({
        slide_id: slide.id,
        severity: 'warning',
        code: 'ELEMENT_OUT_OF_BOUNDS',
        message: `La slide tiene ${slide.items.length} items; el grid probablemente se desbordará.`,
        details: { items: slide.items.length },
      });
    }
    if (slide.metrics.length > 6) {
      issues.push({
        slide_id: slide.id,
        severity: 'warning',
        code: 'ELEMENT_OUT_OF_BOUNDS',
        message: `La slide tiene ${slide.metrics.length} métricas; demasiadas para leer cómodamente.`,
        details: { metrics: slide.metrics.length },
      });
    }
  }
  return issues;
}
