import type { ThemeDefinition } from '../themeRegistry.js';

export const lightCorporateTheme: ThemeDefinition = {
  id: 'light-corporate',
  name: 'Light Corporate',
  description: 'Fondo claro, acentos azules, tipografía seria y alta legibilidad.',
  buildColors: (deck) => ({
    background: 'FFFFFF',
    surface: 'F1F4F8',
    text: '0A2540',
    textMuted: '425466',
    accent: deck.brand.primary_color.replace('#', '').toUpperCase(),
    primary: deck.brand.primary_color.replace('#', '').toUpperCase(),
    secondary: '0A2540',
  }),
};
