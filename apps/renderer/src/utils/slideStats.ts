import type { SlideSpec } from '@presentation-studio/schema';

export function countWords(slide: SlideSpec): number {
  const parts: string[] = [];
  if (slide.title) parts.push(slide.title);
  if (slide.subtitle) parts.push(slide.subtitle);
  if (slide.body) parts.push(slide.body);
  parts.push(...slide.bullets);
  for (const item of slide.items) {
    parts.push(item.label);
    if (item.description) parts.push(item.description);
  }
  for (const metric of slide.metrics) {
    parts.push(metric.label, metric.value);
  }
  if (slide.quote) parts.push(slide.quote);
  return parts.join(' ').trim().split(/\s+/).filter(Boolean).length;
}
