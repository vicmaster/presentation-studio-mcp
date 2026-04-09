import { mkdirSync } from 'node:fs';
import { dirname, join, resolve, basename, extname } from 'node:path';
import type {
  AssetManifest,
  AssetOperation,
  AssetOperationResult,
  AssetRef,
} from '@presentation-studio/schema';
import { PillowBridge } from './pillowBridge.js';
import { buildAssetManifest, resolveAssetPath, tryReadImageDimensions } from './assetManifest.js';

/**
 * Prepares assets using the Pillow worker.
 *
 * `assetsPlan` is a JSON document (or JS object) describing a list of
 * operations. Each operation references an input file, an output file and
 * operation-specific parameters. The result is an asset manifest whose
 * `assets` array contains both source and processed refs.
 *
 * The plan format is intentionally simple and directly forwarded to the Pillow
 * bridge so users can build advanced pipelines without any new DSL.
 */
export interface AssetsPlan {
  id?: string;
  base_dir?: string;
  operations: AssetOperation[];
  /** Optional metadata assigned to every processed asset. */
  defaults?: {
    role?: AssetRef['role'];
    tags?: string[];
  };
}

export interface PrepareAssetsOptions {
  plan: AssetsPlan;
  pillow: PillowBridge;
  repoRoot: string;
}

export interface PrepareAssetsResult {
  manifest: AssetManifest;
  operation_results: AssetOperationResult[];
  warnings: string[];
}

export async function prepareAssets(opts: PrepareAssetsOptions): Promise<PrepareAssetsResult> {
  const { plan, pillow, repoRoot } = opts;
  const baseDir = plan.base_dir ? resolve(repoRoot, plan.base_dir) : repoRoot;
  const warnings: string[] = [];

  const operation_results: AssetOperationResult[] = [];
  const assetRefs: AssetRef[] = [];

  for (const op of plan.operations) {
    const operation: AssetOperation = {
      ...op,
      input_path: resolveAssetPath(op.input_path, baseDir),
      output_path: resolveAssetPath(op.output_path, baseDir),
    };
    mkdirSync(dirname(operation.output_path), { recursive: true });

    try {
      const result = await pillow.run(operation);
      operation_results.push(result);
      if (!result.ok) {
        warnings.push(`Operation ${operation.operation} failed: ${result.error ?? 'unknown'}`);
        continue;
      }
      const dims = tryReadImageDimensions(result.output_path);
      const id = deriveAssetId(operation.output_path);
      assetRefs.push({
        id,
        path: result.output_path,
        kind: 'image',
        role: plan.defaults?.role ?? 'inline',
        width: result.width ?? dims?.width,
        height: result.height ?? dims?.height,
        alt: undefined,
        tags: plan.defaults?.tags ?? [],
        source: operation.input_path,
        status: 'processed',
        processed_from: operation.input_path,
        processing: {
          operation: operation.operation,
          params: {
            width: operation.width,
            height: operation.height,
            anchor: operation.anchor,
          },
        },
      });
    } catch (err) {
      warnings.push(
        `Operation ${operation.operation} on ${operation.input_path} failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  const manifest = buildAssetManifest({
    id: plan.id ?? `assets-${Date.now()}`,
    baseDir,
    assets: assetRefs,
  });
  return { manifest, operation_results, warnings };
}

function deriveAssetId(outputPath: string): string {
  const base = basename(outputPath);
  const ext = extname(base);
  return base.slice(0, base.length - ext.length).replace(/[^A-Za-z0-9_-]/g, '_');
}

/** Build a default plan for a directory of images (no Pillow processing). */
export function buildManifestFromDirectory(
  baseDir: string,
  files: Array<{ path: string; role?: AssetRef['role']; id?: string }>,
): AssetManifest {
  const assets: AssetRef[] = files.map((f, i) => {
    const abs = resolve(baseDir, f.path);
    const dims = tryReadImageDimensions(abs);
    return {
      id: f.id ?? `asset-${i + 1}`,
      path: f.path,
      kind: 'image',
      role: f.role ?? 'inline',
      width: dims?.width,
      height: dims?.height,
      alt: undefined,
      tags: [],
      source: undefined,
      status: 'source',
    };
  });
  return buildAssetManifest({ id: `dir-${Date.now()}`, baseDir, assets });
}

export { join as joinPath };
