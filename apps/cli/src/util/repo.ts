import { existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * Resolve the repository root by walking up from the CLI entry file until we
 * find the pnpm-workspace.yaml. This lets us spawn the Python worker and
 * resolve asset paths regardless of the user's CWD.
 */
export function findRepoRoot(start?: string): string {
  const begin = start ?? dirname(fileURLToPath(import.meta.url));
  let current = begin;
  for (let i = 0; i < 12; i++) {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) return current;
    const parent = resolve(current, '..');
    if (parent === current) break;
    current = parent;
  }
  return process.cwd();
}
