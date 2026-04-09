import type {
  AuditIssue,
  AuditReport,
  AuditSummary,
  DeckSpec,
} from '@presentation-studio/schema';
import { textDensityRule } from './rules/textDensity.js';
import { titleLengthRule } from './rules/titleLength.js';
import { tooManyBulletsRule } from './rules/tooManyBullets.js';
import { imageMissingRule } from './rules/imageMissing.js';
import { imageDistortedRiskRule } from './rules/imageDistortedRisk.js';
import { layoutUnknownRule } from './rules/layoutUnknown.js';
import { elementOutOfBoundsRule } from './rules/elementOutOfBounds.js';
import { lowContrastRiskRule } from './rules/lowContrastRisk.js';
import { emptySlideRule } from './rules/emptySlide.js';
import { closingCtaMissingRule } from './rules/closingCtaMissing.js';
import { duplicateSlideIdRule } from './rules/duplicateSlideId.js';
import { inconsistentBrandUsageRule } from './rules/inconsistentBrandUsage.js';

export interface AuditContext {
  knownLayouts: Set<string>;
  baseDir?: string;
}

/**
 * Runs every audit rule and assembles the report.
 *
 * Ordering is deterministic so test fixtures stay stable.
 */
export function auditDeck(deck: DeckSpec, ctx: AuditContext): AuditReport {
  const issues: AuditIssue[] = [];
  issues.push(...duplicateSlideIdRule(deck));
  issues.push(...layoutUnknownRule(deck, { knownLayouts: ctx.knownLayouts }));
  issues.push(...titleLengthRule(deck));
  issues.push(...tooManyBulletsRule(deck));
  issues.push(...textDensityRule(deck));
  issues.push(...elementOutOfBoundsRule(deck));
  issues.push(...imageMissingRule(deck, { baseDir: ctx.baseDir }));
  issues.push(...imageDistortedRiskRule(deck));
  issues.push(...lowContrastRiskRule(deck));
  issues.push(...emptySlideRule(deck));
  issues.push(...closingCtaMissingRule(deck));
  issues.push(...inconsistentBrandUsageRule(deck));

  const summary: AuditSummary = {
    slides: deck.slides.length,
    info: issues.filter((i) => i.severity === 'info').length,
    warnings: issues.filter((i) => i.severity === 'warning').length,
    errors: issues.filter((i) => i.severity === 'error').length,
  };
  return {
    ok: summary.errors === 0,
    summary,
    issues,
    generated_at: new Date().toISOString(),
  };
}
