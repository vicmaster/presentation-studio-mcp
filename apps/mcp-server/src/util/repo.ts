import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function findRepoRootFromImportMeta(): string {
  const start = dirname(fileURLToPath(import.meta.url));
  let current = start;
  for (let i = 0; i < 12; i++) {
    if (existsSync(resolve(current, 'pnpm-workspace.yaml'))) return current;
    const parent = resolve(current, '..');
    if (parent === current) break;
    current = parent;
  }
  return process.cwd();
}
