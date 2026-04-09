import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { AssetOperationResultSchema, type AssetOperation, type AssetOperationResult } from '@presentation-studio/schema';

/**
 * Bridge between Node and the Python Pillow worker.
 *
 * The worker accepts a JSON payload on stdin and emits a JSON response on
 * stdout. We spawn `python3` (overridable via PPT_STUDIO_PYTHON env) and wait
 * for the process to finish.
 *
 * Failure modes:
 *  - missing python executable -> friendly error
 *  - worker exits with non-zero -> error with stderr captured
 *  - invalid JSON response       -> error including the raw stdout
 */
export interface PillowBridgeOptions {
  /** Absolute path to the repository root, so we can find the worker script. */
  repoRoot: string;
  /** Override python executable (default: PPT_STUDIO_PYTHON or "python3"). */
  pythonExecutable?: string;
}

export class PillowBridge {
  private readonly repoRoot: string;
  private readonly pythonExecutable: string;
  private readonly workerPath: string;

  constructor(opts: PillowBridgeOptions) {
    this.repoRoot = opts.repoRoot;
    this.pythonExecutable =
      opts.pythonExecutable ?? process.env.PPT_STUDIO_PYTHON ?? 'python3';
    this.workerPath = resolve(this.repoRoot, 'apps/asset-worker/src/main.py');
    if (!existsSync(this.workerPath)) {
      // Don't throw at construction; throw only when the bridge is used.
    }
  }

  get scriptPath(): string {
    return this.workerPath;
  }

  async run(operation: AssetOperation): Promise<AssetOperationResult> {
    if (!existsSync(this.workerPath)) {
      throw new Error(`Pillow worker not found at ${this.workerPath}`);
    }
    return new Promise((resolveResult, reject) => {
      const child = spawn(this.pythonExecutable, [this.workerPath], {
        cwd: this.repoRoot,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (chunk) => (stdout += chunk.toString('utf8')));
      child.stderr.on('data', (chunk) => (stderr += chunk.toString('utf8')));
      child.on('error', (err) => reject(err));
      child.on('close', (code) => {
        if (code !== 0) {
          reject(
            new Error(
              `Pillow worker exited with code ${code}.\nstderr: ${stderr.slice(0, 2000)}`,
            ),
          );
          return;
        }
        try {
          const parsed = JSON.parse(stdout.trim());
          const validated = AssetOperationResultSchema.parse(parsed);
          resolveResult(validated);
        } catch (err) {
          reject(
            new Error(
              `Pillow worker produced invalid JSON: ${err instanceof Error ? err.message : String(err)}.\nraw: ${stdout.slice(0, 2000)}`,
            ),
          );
        }
      });
      child.stdin.write(JSON.stringify(operation));
      child.stdin.end();
    });
  }

  async runBatch(operations: AssetOperation[]): Promise<AssetOperationResult[]> {
    const results: AssetOperationResult[] = [];
    for (const op of operations) {
      results.push(await this.run(op));
    }
    return results;
  }
}
