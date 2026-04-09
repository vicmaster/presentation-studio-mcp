/**
 * @presentation-studio/renderer
 *
 * Public renderer API: registries, layouts, themes and the high-level
 * renderDeck function.
 */
import { LayoutRegistry } from './layoutRegistry.js';
import { ThemeRegistry } from './themeRegistry.js';

// Layouts
import { heroCoverLayout } from './layouts/heroCover.js';
import { sectionDividerLayout } from './layouts/sectionDivider.js';
import { twoColumnTextLayout } from './layouts/twoColumnText.js';
import { imageLeftTextRightLayout } from './layouts/imageLeftTextRight.js';
import { imageRightTextLeftLayout } from './layouts/imageRightTextLeft.js';
import { caseStudyHighlightLayout } from './layouts/caseStudyHighlight.js';
import { metricsGridLayout } from './layouts/metricsGrid.js';
import { logoWallLayout } from './layouts/logoWall.js';
import { quoteSlideLayout } from './layouts/quoteSlide.js';
import { closingCtaLayout } from './layouts/closingCta.js';
import { timelineSlideLayout } from './layouts/timelineSlide.js';
import { comparisonTableLayout } from './layouts/comparisonTable.js';
import { processStepsLayout } from './layouts/processSteps.js';
import { testimonialGridLayout } from './layouts/testimonialGrid.js';
import { capabilitiesGridLayout } from './layouts/capabilitiesGrid.js';

// Themes
import { magmaTheme } from './themes/magma.js';
import { minimalTheme } from './themes/minimal.js';
import { lightCorporateTheme } from './themes/lightCorporate.js';
import { darkEnterpriseTheme } from './themes/darkEnterprise.js';

export { renderDeck } from './renderDeck.js';
export type { RenderDeckOptions, RenderDeckResult } from './renderDeck.js';
export { renderSlide } from './renderSlide.js';
export { LayoutRegistry, ThemeRegistry };
export type { LayoutRenderer, RenderContext, RenderResult } from './layoutRegistry.js';
export type { ThemeDefinition } from './themeRegistry.js';
export { silentLogger, consoleLogger } from './utils/logging.js';
export type { RendererLogger } from './utils/logging.js';

export function createDefaultLayoutRegistry(): LayoutRegistry {
  const registry = new LayoutRegistry();
  registry.register('hero-cover', heroCoverLayout);
  registry.register('section-divider', sectionDividerLayout);
  registry.register('two-column-text', twoColumnTextLayout);
  registry.register('image-left-text-right', imageLeftTextRightLayout);
  registry.register('image-right-text-left', imageRightTextLeftLayout);
  registry.register('case-study-highlight', caseStudyHighlightLayout);
  registry.register('metrics-grid', metricsGridLayout);
  registry.register('logo-wall', logoWallLayout);
  registry.register('quote-slide', quoteSlideLayout);
  registry.register('closing-cta', closingCtaLayout);
  registry.register('timeline-slide', timelineSlideLayout);
  registry.register('comparison-table', comparisonTableLayout);
  registry.register('process-steps', processStepsLayout);
  registry.register('testimonial-grid', testimonialGridLayout);
  registry.register('capabilities-grid', capabilitiesGridLayout);
  // Fallback = two-column-text, which handles title/body/bullets gracefully.
  registry.setFallback(twoColumnTextLayout);
  return registry;
}

export function createDefaultThemeRegistry(): ThemeRegistry {
  const registry = new ThemeRegistry();
  registry.register(magmaTheme);
  registry.register(minimalTheme);
  registry.register(lightCorporateTheme);
  registry.register(darkEnterpriseTheme);
  return registry;
}
