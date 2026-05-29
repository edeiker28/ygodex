export const TYPE_BG: Record<string, string> = {
  'Monster Card': '#2a1800',
  'Effect Monster': '#2a1800',
  'Normal Monster': '#2a1800',
  'Ritual Monster': '#001a2a',
  'Fusion Monster': '#1a0038',
  'Synchro Monster': '#1a1a1a',
  'XYZ Monster': '#e8e0cc',
  'Link Monster': '#001a3a',
  'Pendulum Effect Monster': '#2a1800',
  'Spell Card': '#002a14',
  'Trap Card': '#2a0016',
};

export const TYPE_COLOR: Record<string, string> = {
  'Monster Card': '#f97316',
  'Effect Monster': '#f97316',
  'Normal Monster': '#f97316',
  'Ritual Monster': '#38bdf8',
  'Fusion Monster': '#c084fc',
  'Synchro Monster': '#e2e8f0',
  'XYZ Monster': '#080806',
  'Link Monster': '#60a5fa',
  'Pendulum Effect Monster': '#f97316',
  'Spell Card': '#4ade80',
  'Trap Card': '#f472b6',
};

export const ATTRIBUTE_COLORS: Record<string, string> = {
  LIGHT: '#60a0ff',
  DARK: '#8040cc',
  FIRE: '#ef4444',
  WATER: '#06b6d4',
  EARTH: '#84cc16',
  WIND: '#34d399',
  DIVINE: '#ffd700',
};

export function getTypeBg(type: string): string {
  return TYPE_BG[type] ?? '#2a1800';
}

export function getTypeColor(type: string): string {
  return TYPE_COLOR[type] ?? '#f97316';
}

export function getAttributeColor(attribute?: string): string {
  return attribute ? (ATTRIBUTE_COLORS[attribute] ?? '#8060ff') : '#8060ff';
}
