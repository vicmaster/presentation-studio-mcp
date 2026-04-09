import type { DeckSpec } from '@presentation-studio/schema';
import { createPresentation } from './presentation/createPresentation.js';
import { writePresentation } from './presentation/writePresentation.js';
import { renderSlide } from './renderSlide.js';
import type { LayoutRegistry, RenderContext } from './layoutRegistry.js';
import { ThemeRegistry } from './themeRegistry.js';
import { CANVAS_PRESETS, getCanvas, safeArea } from './utils/geometry.js';
import { spacingForDensity } from './utils/spacing.js';
import { buildTypographyScale } from './utils/typography.js';
import type { RendererLogger } from './utils/logging.js';
import { silentLogger } from './utils/logging.js';

export interface RenderDeckOptions {
  deck: DeckSpec;
  outputPath: string;
  layoutRegistry: LayoutRegistry;
  themeRegistry: ThemeRegistry;
  baseDir: string;
  logger?: RendererLogger;
}

export interface RenderDeckResult {
  output_path: string;
  slide_count: number;
  warnings: string[];
}

/**
 * Top-level rendering pipeline:
 *   DeckSpec -> PptxGenJS -> disk
 *
 * The pipeline is deliberately linear so failures are easy to trace:
 *   1. Build the render context (canvas, typography, colors, spacing).
 *   2. For each slide, resolve its layout and call the renderer.
 *   3. Collect warnings.
 *   4. Write the file.
 */
export async function renderDeck(opts: RenderDeckOptions): Promise<RenderDeckResult> {
  const logger = opts.logger ?? silentLogger;
  const deck = opts.deck;
  const preset = CANVAS_PRESETS[deck.theme.page_size] ?? CANVAS_PRESETS.LAYOUT_WIDE!;
  const safeMargin = 0.5;
  const canvas = getCanvas(deck.theme.page_size, safeMargin);
  const safe = safeArea(canvas);

  // Resolve theme (with a safe fallback to the first registered theme).
  const theme = opts.themeRegistry.resolve(deck.theme.id);
  const colors = theme.buildColors(deck);

  const spacing = spacingForDensity(deck.theme.density);

  const typography = buildTypographyScale({
    headingFont: deck.brand.heading_font,
    bodyFont: deck.brand.body_font,
    textColor: colors.text,
    mutedColor: colors.textMuted,
    accentColor: colors.accent,
  });

  const context: RenderContext = {
    deck,
    canvas,
    safe,
    typography,
    colors,
    spacing,
    baseDir: opts.baseDir,
    logger,
  };

  // Register the layout in the presentation (mainly for documentation).
  const pres = createPresentation(deck);
  pres.defineLayout({ name: 'PS_LAYOUT', width: preset.width, height: preset.height });

  logger.info(`Rendering ${deck.slides.length} slides (${deck.meta.title})`);

  const warnings: string[] = [];
  let rendered = 0;
  for (const slide of deck.slides) {
    if (slide.hidden) {
      warnings.push(`slide "${slide.id}" is hidden, skipped.`);
      continue;
    }
    try {
      const result = renderSlide(pres, slide, opts.layoutRegistry, context);
      warnings.push(...result.warnings);
      rendered += 1;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      warnings.push(`Failed to render slide "${slide.id}": ${msg}`);
      logger.error(`Failed slide "${slide.id}"`, { error: msg });
    }
  }

  const output = await writePresentation(pres, opts.outputPath);
  logger.info(`Rendered ${rendered} slides to ${output}`, { warnings: warnings.length });

  return {
    output_path: output,
    slide_count: rendered,
    warnings,
  };
}
