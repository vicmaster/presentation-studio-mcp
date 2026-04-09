import { z } from 'zod';
import type { PresentationStudioService } from './server.js';

/**
 * A tool descriptor. We use `z.ZodType<Out, Def, unknown>` so schemas with
 * `.default()` (whose input type differs from their output type) still
 * type-check. The handler always sees the fully-parsed OUTPUT shape.
 */
export interface ToolHandler<TOutput = unknown> {
  name: string;
  description: string;
  inputSchema: z.ZodType<TOutput, z.ZodTypeDef, unknown>;
  jsonSchema: Record<string, unknown>;
  handler: (service: PresentationStudioService, input: TOutput) => Promise<unknown>;
}

export class ToolRegistry {
  private readonly tools: Map<string, ToolHandler> = new Map();

  register<T>(tool: ToolHandler<T>): void {
    this.tools.set(tool.name, tool as unknown as ToolHandler);
  }

  list(): Array<{ name: string; description: string; inputSchema: Record<string, unknown> }> {
    return Array.from(this.tools.values()).map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.jsonSchema,
    }));
  }

  async call(
    service: PresentationStudioService,
    name: string,
    input: unknown,
  ): Promise<unknown> {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }
    const parsed = tool.inputSchema.safeParse(input ?? {});
    if (!parsed.success) {
      throw new Error(
        `Invalid input for tool ${name}: ${parsed.error.issues
          .map((i) => `${i.path.join('.')}: ${i.message}`)
          .join('; ')}`,
      );
    }
    return tool.handler(service, parsed.data);
  }
}
