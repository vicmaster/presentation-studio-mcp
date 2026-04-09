import type { DeckSpec } from '@presentation-studio/schema';

/**
 * Themes provide style overrides that layer on top of a brand.
 *
 * Brand = identity (colors, fonts, logos).
 * Theme = presentation style (density, backgrounds, finishes).
 */
export interface ThemeResolvedColors {
  background: string;
  surface: string;
  text: string;
  textMuted: string;
  accent: string;
  primary: string;
  secondary: string;
}

export interface ThemeDefinition {
  id: string;
  name: string;
  description: string;
  buildColors: (deck: DeckSpec) => ThemeResolvedColors;
}

export class ThemeRegistry {
  private themes: Map<string, ThemeDefinition> = new Map();

  register(theme: ThemeDefinition): void {
    this.themes.set(theme.id, theme);
  }

  get(id: string): ThemeDefinition | undefined {
    return this.themes.get(id);
  }

  list(): ThemeDefinition[] {
    return Array.from(this.themes.values());
  }

  resolve(id: string): ThemeDefinition {
    const theme = this.themes.get(id);
    if (theme) return theme;
    // Fall back to the first registered theme.
    const first = this.themes.values().next();
    if (first.value) return first.value;
    throw new Error(`No themes registered, cannot resolve "${id}".`);
  }
}
