import { mkdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

export function ensureDirForFile(filePath: string): void {
  const dir = dirname(filePath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}
