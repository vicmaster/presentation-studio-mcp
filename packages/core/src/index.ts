/**
 * @presentation-studio/core
 *
 * Registries, deck builders, audit rules, extraction and asset pipeline.
 * Consumed by the renderer, the CLI and the MCP server.
 */

// Registries
export {
  BrandRegistry,
  MAGMALABS_BRAND,
  createDefaultBrandRegistry,
  type CreateBrandRegistryOptions,
} from './brands/brandRegistry.js';
export {
  TemplateRegistry,
  createDefaultTemplateRegistry,
  type CreateTemplateRegistryOptions,
} from './templates/templateRegistry.js';

// Config
export {
  StudioConfigSchema,
  DEFAULT_STUDIO_CONFIG,
  loadStudioConfig,
  type StudioConfig,
  type LoadStudioConfigOptions,
} from './config/studioConfig.js';

// Deck
export { buildDeckSpecFromBrief, generateDeckId } from './deck/buildDeckSpec.js';
export { normalizeDeckSpec } from './deck/normalizeDeckSpec.js';
export { updateSlideInDeck, type UpdateMode, type UpdateSlideOptions } from './deck/updateDeckSpec.js';
export { validateDeckSpec, type ValidationResult } from './deck/validateDeckSpec.js';

// Audit
export { auditDeck, type AuditContext } from './audit/auditDeck.js';
export { countSlideWords } from './audit/rules/textDensity.js';
export { contrastRatio } from './audit/rules/lowContrastRisk.js';

// Preview
export { buildPreviewManifest } from './preview/buildPreviewManifest.js';

// Extraction
export { extractFromPptx } from './extraction/extractFromPptx.js';
export { readPptxEntries } from './extraction/pptxZip.js';
export { extractTextFromSlideXml, extractCoreMetadata } from './extraction/xmlTextExtractor.js';

// Assets
export {
  buildAssetManifest,
  resolveAssetPath,
  tryReadImageDimensions,
} from './assets/assetManifest.js';
export { PillowBridge } from './assets/pillowBridge.js';
export {
  prepareAssets,
  buildManifestFromDirectory,
  type AssetsPlan,
  type PrepareAssetsOptions,
  type PrepareAssetsResult,
} from './assets/assetPreparation.js';
