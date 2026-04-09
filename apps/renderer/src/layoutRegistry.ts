import type pptxgen from 'pptxgenjs';
import type { DeckSpec, SlideSpec } from '@presentation-studio/schema';
import type { Rect, SlideCanvas } from './utils/geometry.js';
import type { TypographyScale } from './utils/typography.js';
import type { RendererLogger } from './utils/logging.js';

/**
 * RenderContext contains everything a layout needs to render a slide.
 * Layouts should never reach outside this context.
 */
export interface RenderContext {
  deck: DeckSpec;
  canvas: SlideCanvas;
  safe: Rect;
  typography: TypographyScale;
  colors: {
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    accent: string;
    primary: string;
    secondary: string;
  };
  spacing: {
    outer: number;
    inner: number;
    gap: number;
  };
  baseDir: string;
  logger: RendererLogger;
}

export interface RenderResult {
  warnings: string[];
  placed: number;
}

export type LayoutRenderer = (
  slide: pptxgen.Slide,
  spec: SlideSpec,
  context: RenderContext,
) => RenderResult;

export class LayoutRegistry {
  private readonly layouts: Map<string, LayoutRenderer> = new Map();
  private fallbackLayout?: LayoutRenderer;

  register(name: string, renderer: LayoutRenderer): void {
    this.layouts.set(name, renderer);
  }

  setFallback(renderer: LayoutRenderer): void {
    this.fallbackLayout = renderer;
  }

  get(name: string): LayoutRenderer | undefined {
    return this.layouts.get(name);
  }

  has(name: string): boolean {
    return this.layouts.has(name);
  }

  list(): string[] {
    return Array.from(this.layouts.keys());
  }

  resolve(name: string): { renderer: LayoutRenderer; isFallback: boolean } {
    const direct = this.layouts.get(name);
    if (direct) return { renderer: direct, isFallback: false };
    if (this.fallbackLayout) {
      return { renderer: this.fallbackLayout, isFallback: true };
    }
    throw new Error(`Layout "${name}" not registered and no fallback is configured.`);
  }
}
