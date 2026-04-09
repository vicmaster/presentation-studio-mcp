import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import type { DeckSpec, AuditIssue, AssetRef } from '@presentation-studio/schema';
import { collectSlideAssets } from '@presentation-studio/schema';

const IMAGE_REQUIRED_LAYOUTS = new Set([
  'image-left-text-right',
  'image-right-text-left',
  'logo-wall',
]);

export interface ImageMissingContext {
  baseDir?: string;
}

export function imageMissingRule(
  deck: DeckSpec,
  ctx: ImageMissingContext = {},
): AuditIssue[] {
  const issues: AuditIssue[] = [];
  const base = ctx.baseDir ?? process.cwd();

  for (const slide of deck.slides) {
    const refs = collectSlideAssets(slide);
    if (IMAGE_REQUIRED_LAYOUTS.has(slide.layout) && refs.length === 0) {
      issues.push({
        slide_id: slide.id,
        severity: 'warning',
        code: 'IMAGE_MISSING',
        message: `El layout "${slide.layout}" espera al menos una imagen.`,
        details: { layout: slide.layout },
      });
      continue;
    }
    for (const ref of refs) {
      const missing = !assetExists(ref, base);
      if (missing) {
        issues.push({
          slide_id: slide.id,
          severity: 'warning',
          code: 'IMAGE_MISSING',
          message: `Imagen "${ref.id}" no encontrada en disco: ${ref.path}`,
          details: { asset_id: ref.id, path: ref.path },
        });
      }
    }
  }
  return issues;
}

function assetExists(ref: AssetRef, base: string): boolean {
  try {
    const abs = resolve(base, ref.path);
    return existsSync(abs) && statSync(abs).isFile();
  } catch {
    return false;
  }
}
