import { z } from 'zod';

/**
 * Audit types.
 *
 * Audit rules are heuristic checks that run against a DeckSpec and surface
 * warnings / errors the agent can act on before rendering.
 */
export const AuditSeveritySchema = z.enum(['info', 'warning', 'error']);
export type AuditSeverity = z.infer<typeof AuditSeveritySchema>;

export const AuditCodeSchema = z.enum([
  'TEXT_DENSITY_HIGH',
  'TITLE_TOO_LONG',
  'TOO_MANY_BULLETS',
  'IMAGE_MISSING',
  'IMAGE_DISTORTED_RISK',
  'LAYOUT_UNKNOWN',
  'ELEMENT_OUT_OF_BOUNDS',
  'LOW_CONTRAST_RISK',
  'EMPTY_SLIDE',
  'CTA_MISSING_ON_CLOSING',
  'DUPLICATE_SLIDE_ID',
  'INCONSISTENT_BRAND_USAGE',
]);
export type AuditCode = z.infer<typeof AuditCodeSchema>;

export const AuditIssueSchema = z.object({
  slide_id: z.string().nullable(),
  severity: AuditSeveritySchema,
  code: AuditCodeSchema,
  message: z.string().min(1),
  details: z.record(z.unknown()).default({}),
});
export type AuditIssue = z.infer<typeof AuditIssueSchema>;

export const AuditSummarySchema = z.object({
  slides: z.number().int().nonnegative(),
  info: z.number().int().nonnegative(),
  warnings: z.number().int().nonnegative(),
  errors: z.number().int().nonnegative(),
});
export type AuditSummary = z.infer<typeof AuditSummarySchema>;

export const AuditReportSchema = z.object({
  ok: z.boolean(),
  summary: AuditSummarySchema,
  issues: z.array(AuditIssueSchema),
  generated_at: z.string(),
});
export type AuditReport = z.infer<typeof AuditReportSchema>;
