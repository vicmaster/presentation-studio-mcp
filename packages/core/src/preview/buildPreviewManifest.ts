import type {
  AuditReport,
  DeckSpec,
  PreviewManifest,
  PreviewSlide,
  SlideSpec,
} from '@presentation-studio/schema';
import { collectSlideAssets } from '@presentation-studio/schema';
import { countSlideWords } from '../audit/rules/textDensity.js';

/**
 * Build a preview manifest for a deck.
 *
 * We deliberately do NOT render slide images here. Producing pixel-accurate
 * previews of arbitrary PowerPoint requires LibreOffice or a similar heavy
 * dependency. Instead, we produce a rich, structured proxy that captures
 * everything an agent needs to review the deck:
 *   - per-slide title / layout / density
 *   - asset paths actually used
 *   - a short summary excerpt
 *   - audit issues keyed per slide
 *
 * If the renderer has also produced a `.pptx`, its path is included so the
 * user can open the deck directly.
 */
export interface BuildPreviewManifestOptions {
  deck: DeckSpec;
  audit?: AuditReport;
  deckPptxPath?: string;
}

export function buildPreviewManifest(opts: BuildPreviewManifestOptions): PreviewManifest {
  const { deck, audit, deckPptxPath } = opts;
  const auditBySlide = new Map<string, AuditReport['issues']>();
  if (audit) {
    for (const issue of audit.issues) {
      if (!issue.slide_id) continue;
      const list = auditBySlide.get(issue.slide_id) ?? [];
      list.push(issue);
      auditBySlide.set(issue.slide_id, list);
    }
  }

  const slides: PreviewSlide[] = deck.slides.map((slide, idx) => buildPreviewSlide(slide, idx, auditBySlide));

  return {
    deck_title: deck.meta.title,
    deck_language: deck.meta.language,
    slide_count: deck.slides.length,
    slides,
    preview_paths: [],
    deck_pptx_path: deckPptxPath,
    generated_at: new Date().toISOString(),
  };
}

function buildPreviewSlide(
  slide: SlideSpec,
  idx: number,
  auditBySlide: Map<string, AuditReport['issues']>,
): PreviewSlide {
  const words = countSlideWords(slide);
  const assetRefs = collectSlideAssets(slide);
  const asset_paths = assetRefs.map((a) => a.path);

  let score = words / 180;
  score += slide.items.length / 10;
  score += slide.metrics.length / 8;
  if (assetRefs.length > 0) score += 0.1;
  score = Math.max(0, Math.min(1.5, score));
  const density_score = Math.min(1, score);

  let density_label: PreviewSlide['density_label'];
  if (density_score < 0.3) density_label = 'minimal';
  else if (density_score < 0.65) density_label = 'balanced';
  else if (density_score < 1) density_label = 'dense';
  else density_label = 'overloaded';

  const summary = buildSummary(slide);

  const issues = (auditBySlide.get(slide.id) ?? []).map((i) => ({
    severity: i.severity,
    code: i.code,
    message: i.message,
  }));

  return {
    index: idx,
    slide_id: slide.id,
    layout: slide.layout,
    title: slide.title,
    subtitle: slide.subtitle,
    kicker: slide.kicker,
    summary,
    word_count: words,
    bullet_count: slide.bullets.length,
    item_count: slide.items.length,
    metric_count: slide.metrics.length,
    image_count: slide.images.length + (slide.background?.image ? 1 : 0),
    logo_count: slide.logos.length,
    asset_paths,
    density_score: Number(density_score.toFixed(3)),
    density_label,
    audit_issues: issues,
  };
}

function buildSummary(slide: SlideSpec): string {
  const parts: string[] = [];
  if (slide.title) parts.push(slide.title);
  if (slide.subtitle) parts.push(slide.subtitle);
  if (slide.body) parts.push(truncate(slide.body, 160));
  if (slide.bullets.length > 0) {
    parts.push(slide.bullets.slice(0, 3).map((b) => `• ${truncate(b, 80)}`).join(' '));
  }
  if (slide.items.length > 0) {
    parts.push(slide.items.slice(0, 3).map((i) => i.label).join(' · '));
  }
  if (slide.metrics.length > 0) {
    parts.push(slide.metrics.slice(0, 3).map((m) => `${m.value} ${m.label}`).join(' · '));
  }
  if (slide.quote) parts.push(`"${truncate(slide.quote, 120)}"`);
  return parts.filter(Boolean).join(' — ').slice(0, 400);
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}
