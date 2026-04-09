import { PillowBridge, prepareAssets } from '@presentation-studio/core';
import { absolutize, readJson, writeJson } from '../util/io.js';
import { requireStringFlag, getStringFlag, type ParsedArgs } from '../util/args.js';
import { findRepoRoot } from '../util/repo.js';

export async function prepareAssetsCommand(args: ParsedArgs): Promise<number> {
  const input = absolutize(requireStringFlag(args.flags, 'input'));
  const output = absolutize(getStringFlag(args.flags, 'output') ?? 'tmp/asset-manifest.json');
  const repoRoot = findRepoRoot();
  const plan = readJson<any>(input);
  const pillow = new PillowBridge({ repoRoot });
  try {
    const result = await prepareAssets({ plan, pillow, repoRoot });
    writeJson(output, {
      manifest: result.manifest,
      operation_results: result.operation_results,
      warnings: result.warnings,
    });
    console.log(`✓ Prepared ${result.manifest.assets.length} asset(s)`);
    console.log(`  → ${output}`);
    if (result.warnings.length > 0) {
      console.log('  warnings:');
      for (const w of result.warnings) console.log(`    - ${w}`);
    }
    return 0;
  } catch (err) {
    console.error(`× prepare-assets failed: ${err instanceof Error ? err.message : String(err)}`);
    return 2;
  }
}
