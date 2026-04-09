import { existsSync, readFileSync, statSync } from 'node:fs';
import { isAbsolute, resolve } from 'node:path';
import type { AssetManifest, AssetRef } from '@presentation-studio/schema';
import { AssetManifestSchema, AssetRefSchema } from '@presentation-studio/schema';

/**
 * Utilities to build and enrich asset manifests.
 *
 * A manifest is essentially a normalized list of assets alongside a base
 * directory. It is what the renderer consumes when resolving images on disk.
 */
export interface BuildAssetManifestOptions {
  id: string;
  baseDir: string;
  assets: unknown[];
}

export function buildAssetManifest(opts: BuildAssetManifestOptions): AssetManifest {
  const assets: AssetRef[] = (opts.assets ?? []).map((a) =>
    AssetRefSchema.parse(a as Record<string, unknown>),
  );

  // Stat every asset and enrich with existence status.
  for (const asset of assets) {
    const abs = resolveAssetPath(asset.path, opts.baseDir);
    if (existsSync(abs) && statSync(abs).isFile()) {
      asset.status = asset.status === 'processed' ? 'processed' : 'source';
    } else {
      asset.status = 'missing';
    }
  }

  return AssetManifestSchema.parse({
    id: opts.id,
    base_dir: opts.baseDir,
    assets,
    generated_at: new Date().toISOString(),
  });
}

export function resolveAssetPath(path: string, baseDir: string): string {
  if (isAbsolute(path)) return path;
  return resolve(baseDir, path);
}

/** Lightweight header sniff for PNG/JPEG to fill width/height without dependencies. */
export function tryReadImageDimensions(
  filePath: string,
): { width: number; height: number } | undefined {
  try {
    const buf = readFileSync(filePath);
    if (buf.length < 24) return undefined;
    // PNG: 89 50 4e 47 0d 0a 1a 0a, then IHDR at offset 16
    if (
      buf[0] === 0x89 &&
      buf[1] === 0x50 &&
      buf[2] === 0x4e &&
      buf[3] === 0x47
    ) {
      const width = buf.readUInt32BE(16);
      const height = buf.readUInt32BE(20);
      return { width, height };
    }
    // JPEG: start with FF D8; scan segments for SOF0/SOF2
    if (buf[0] === 0xff && buf[1] === 0xd8) {
      let p = 2;
      while (p < buf.length) {
        if (buf[p] !== 0xff) return undefined;
        const marker = buf[p + 1]!;
        p += 2;
        if (marker === 0xd8 || marker === 0xd9) return undefined;
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          // SOF markers
          const height = buf.readUInt16BE(p + 3);
          const width = buf.readUInt16BE(p + 5);
          return { width, height };
        }
        const segLen = buf.readUInt16BE(p);
        p += segLen;
      }
    }
  } catch {
    return undefined;
  }
  return undefined;
}
