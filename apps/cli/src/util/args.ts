/**
 * Minimal CLI argv parser. Keeping it dependency-free to avoid bloat for
 * such a small surface.
 *
 * Supports:
 *   --key value
 *   --key=value
 *   --flag          (boolean)
 *   positional args (everything that isn't a flag or its value)
 */
export interface ParsedArgs {
  positional: string[];
  flags: Record<string, string | boolean>;
}

export function parseArgs(argv: string[]): ParsedArgs {
  const positional: string[] = [];
  const flags: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const tok = argv[i]!;
    if (tok.startsWith('--')) {
      const body = tok.slice(2);
      const eq = body.indexOf('=');
      if (eq !== -1) {
        flags[body.slice(0, eq)] = body.slice(eq + 1);
        continue;
      }
      const next = argv[i + 1];
      if (next !== undefined && !next.startsWith('--')) {
        flags[body] = next;
        i += 1;
      } else {
        flags[body] = true;
      }
    } else if (tok.startsWith('-') && tok.length === 2) {
      flags[tok.slice(1)] = true;
    } else {
      positional.push(tok);
    }
  }
  return { positional, flags };
}

export function requireStringFlag(flags: Record<string, string | boolean>, name: string): string {
  const v = flags[name];
  if (typeof v !== 'string' || v.length === 0) {
    throw new Error(`--${name} is required`);
  }
  return v;
}

export function getStringFlag(
  flags: Record<string, string | boolean>,
  name: string,
  fallback?: string,
): string | undefined {
  const v = flags[name];
  if (typeof v === 'string') return v;
  return fallback;
}

export function getBoolFlag(flags: Record<string, string | boolean>, name: string): boolean {
  return flags[name] === true || flags[name] === 'true';
}
