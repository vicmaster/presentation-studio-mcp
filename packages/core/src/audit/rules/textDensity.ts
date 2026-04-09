import type { DeckSpec, AuditIssue, SlideSpec } from '@presentation-studio/schema';

/**
 * TEXT_DENSITY_HIGH - heuristic word count per slide.
 *
 * Thresholds are tuned per layout. They are not a hard science, but they catch
 * obviously overloaded slides before they reach PowerPoint.
 */
const DENSITY_THRESHOLDS: Record<string, number> = {
  'hero-cover': 40,
  'section-divider': 30,
  'two-column-text': 140,
  'image-left-text-right': 100,
  'image-right-text-left': 100,
  'case-study-highlight': 120,
  'metrics-grid': 90,
  'logo-wall': 30,
  'quote-slide': 50,
  'closing-cta': 60,
  'timeline-slide': 110,
  'comparison-table': 140,
  'process-steps': 110,
  'testimonial-grid': 130,
  'capabilities-grid': 120,
};
const DEFAULT_THRESHOLD = 120;

export function countSlideWords(slide: SlideSpec): number {
  const parts: string[] = [];
  if (slide.title) parts.push(slide.title);
  if (slide.subtitle) parts.push(slide.subtitle);
  if (slide.kicker) parts.push(slide.kicker);
  if (slide.body) parts.push(slide.body);
  for (const b of slide.bullets) parts.push(b);
  for (const it of slide.items) {
    parts.push(it.label);
    if (it.description) parts.push(it.description);
  }
  for (const m of slide.metrics) {
    parts.push(m.label, m.value);
    if (m.detail) parts.push(m.detail);
  }
  if (slide.quote) parts.push(slide.quote);
  if (slide.quote_author) parts.push(slide.quote_author);
  if (slide.cta?.label) parts.push(slide.cta.label);
  return parts.join(' ').trim().split(/\s+/).filter(Boolean).length;
}

export function textDensityRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slide of deck.slides) {
    const words = countSlideWords(slide);
    const threshold = DENSITY_THRESHOLDS[slide.layout] ?? DEFAULT_THRESHOLD;
    if (words > threshold) {
      issues.push({
        slide_id: slide.id,
        severity: words > threshold * 1.4 ? 'error' : 'warning',
        code: 'TEXT_DENSITY_HIGH',
        message: `La slide tiene ${words} palabras, por encima del umbral (${threshold}) para el layout "${slide.layout}".`,
        details: { word_count: words, threshold, layout: slide.layout },
      });
    }
  }
  return issues;
}
