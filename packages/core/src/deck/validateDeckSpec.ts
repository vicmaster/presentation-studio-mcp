import { DeckSpecSchema, type DeckSpec } from '@presentation-studio/schema';

export interface ValidationResult {
  ok: boolean;
  deck?: DeckSpec;
  errors: Array<{ path: string; message: string }>;
}

/**
 * Validates that an unknown payload is a DeckSpec. Returns a structured
 * result instead of throwing so consumers can surface errors cleanly.
 */
export function validateDeckSpec(input: unknown): ValidationResult {
  const result = DeckSpecSchema.safeParse(input);
  if (result.success) {
    return { ok: true, deck: result.data, errors: [] };
  }
  return {
    ok: false,
    errors: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  };
}
