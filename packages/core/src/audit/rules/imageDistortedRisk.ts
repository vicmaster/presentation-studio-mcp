import type { DeckSpec, AuditIssue, AssetRef } from '@presentation-studio/schema';
import { collectSlideAssets } from '@presentation-studio/schema';

const TARGET_RATIOS: Record<string, { w: number; h: number }> = {
  'hero-cover': { w: 16, h: 9 },
  'image-left-text-right': { w: 4, h: 3 },
  'image-right-text-left': { w: 4, h: 3 },
  'case-study-highlight': { w: 16, h: 9 },
  'logo-wall': { w: 1, h: 1 },
};

/**
 * Flags images whose intrinsic aspect ratio is very different from the target
 * shape required by the layout. These are candidates for running through the
 * Pillow worker (`cover_crop`) before render.
 *
 * We only warn if we know the intrinsic dimensions (from AssetRef width/height).
 */
export function imageDistortedRiskRule(deck: DeckSpec): AuditIssue[] {
  const issues: AuditIssue[] = [];
  for (const slide of deck.slides) {
    const target = TARGET_RATIOS[slide.layout];
    if (!target) continue;
    const targetRatio = target.w / target.h;
    const refs = collectSlideAssets(slide);
    for (const ref of refs) {
      if (!ref.width || !ref.height) continue;
      const actualRatio = ref.width / ref.height;
      const drift = Math.abs(actualRatio - targetRatio) / targetRatio;
      if (drift > 0.35) {
        issues.push({
          slide_id: slide.id,
          severity: 'warning',
          code: 'IMAGE_DISTORTED_RISK',
          message: `Imagen "${ref.id}" tiene proporción muy distinta al layout. Considera aplicar cover_crop.`,
          details: {
            asset_id: ref.id,
            actual_ratio: Number(actualRatio.toFixed(3)),
            target_ratio: Number(targetRatio.toFixed(3)),
            drift: Number(drift.toFixed(3)),
          },
        });
      }
    }
  }
  return issues;
}
