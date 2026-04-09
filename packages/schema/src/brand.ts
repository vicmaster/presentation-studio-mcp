import { z } from 'zod';

/**
 * BrandKit - a reusable brand definition used to theme decks.
 *
 * Brands can be registered via `brand.json` files or programmatically.
 */
export const HexColorSchema = z
  .string()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Expected hex color like #RRGGBB or #RGB');
export type HexColor = z.infer<typeof HexColorSchema>;

export const BrandColorsSchema = z.object({
  primary: HexColorSchema,
  secondary: HexColorSchema,
  accent: HexColorSchema.optional(),
  background: HexColorSchema,
  surface: HexColorSchema.optional(),
  text: HexColorSchema,
  text_muted: HexColorSchema.optional(),
  success: HexColorSchema.optional(),
  warning: HexColorSchema.optional(),
  danger: HexColorSchema.optional(),
});
export type BrandColors = z.infer<typeof BrandColorsSchema>;

export const BrandFontsSchema = z.object({
  heading: z.string().min(1),
  body: z.string().min(1),
  mono: z.string().optional(),
});
export type BrandFonts = z.infer<typeof BrandFontsSchema>;

export const BrandLogoPathsSchema = z.object({
  primary: z.string().optional(),
  white: z.string().optional(),
  dark: z.string().optional(),
  favicon: z.string().optional(),
  placeholder_cover: z.string().optional(),
  placeholder_image: z.string().optional(),
});
export type BrandLogoPaths = z.infer<typeof BrandLogoPathsSchema>;

export const BrandSpacingRulesSchema = z.object({
  safe_margin_inches: z.number().min(0).max(2).default(0.5),
  inner_gap_inches: z.number().min(0).max(2).default(0.3),
  section_gap_inches: z.number().min(0).max(2).default(0.5),
});
export type BrandSpacingRules = z.infer<typeof BrandSpacingRulesSchema>;

export const BrandImageTreatmentSchema = z.object({
  default_fit: z.enum(['cover', 'contain', 'fill']).default('cover'),
  rounded: z.boolean().default(true),
  rounded_radius_pct: z.number().min(0).max(50).default(6),
  shadow: z.boolean().default(false),
});
export type BrandImageTreatment = z.infer<typeof BrandImageTreatmentSchema>;

export const BrandPageBackgroundsSchema = z.object({
  light: HexColorSchema.optional(),
  dark: HexColorSchema.optional(),
  accent: HexColorSchema.optional(),
});
export type BrandPageBackgrounds = z.infer<typeof BrandPageBackgroundsSchema>;

export const BrandKitSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  description: z.string().default(''),
  colors: BrandColorsSchema,
  fonts: BrandFontsSchema,
  logo_paths: BrandLogoPathsSchema.default({}),
  spacing_rules: BrandSpacingRulesSchema.default({
    safe_margin_inches: 0.5,
    inner_gap_inches: 0.3,
    section_gap_inches: 0.5,
  }),
  border_radius: z.number().min(0).max(1).default(0.08),
  shadow_style: z.enum(['none', 'soft', 'medium', 'strong']).default('soft'),
  preferred_layouts: z.array(z.string()).default([]),
  image_treatment_rules: BrandImageTreatmentSchema.default({
    default_fit: 'cover',
    rounded: true,
    rounded_radius_pct: 6,
    shadow: false,
  }),
  default_theme: z.string().default('magma'),
  page_backgrounds: BrandPageBackgroundsSchema.default({}),
});
export type BrandKit = z.infer<typeof BrandKitSchema>;

/**
 * Lightweight brand reference used inside a deck_spec.
 * It is a denormalized snapshot so that decks remain portable.
 */
export const DeckBrandRefSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  primary_color: HexColorSchema,
  secondary_color: HexColorSchema,
  accent_color: HexColorSchema.optional(),
  background_color: HexColorSchema,
  text_color: HexColorSchema,
  heading_font: z.string().min(1),
  body_font: z.string().min(1),
  logo_path: z.string().optional(),
  logo_white_path: z.string().optional(),
});
export type DeckBrandRef = z.infer<typeof DeckBrandRefSchema>;
