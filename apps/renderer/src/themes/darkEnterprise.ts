import type { ThemeDefinition } from '../themeRegistry.js';

export const darkEnterpriseTheme: ThemeDefinition = {
  id: 'dark-enterprise',
  name: 'Dark Enterprise',
  description: 'Fondo oscuro, acentos vibrantes, alta presencia para eventos y QBRs.',
  buildColors: (deck) => ({
    background: '0A0A0A',
    surface: '181818',
    text: 'F5F5F5',
    textMuted: 'AAAAAA',
    accent: deck.brand.primary_color.replace('#', '').toUpperCase(),
    primary: deck.brand.primary_color.replace('#', '').toUpperCase(),
    secondary: 'FFFFFF',
  }),
};
