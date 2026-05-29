import { EXTRA_DECK_TYPES } from '../constants/cardTypes';
import { MAX_COPIES, MIN_MAIN, MAX_MAIN, MAX_EXTRA, MAX_SIDE } from '../constants/deckRules';
import type { YGOCard, DeckCard, BanFormat } from '../types/ygo';

export function isExtraDeckCard(card: YGOCard): boolean {
  return EXTRA_DECK_TYPES.includes(card.type);
}

export function getCardBanLimit(card: YGOCard, format: BanFormat = 'tcg'): number {
  const info = card.banlist_info;
  if (!info) return MAX_COPIES;
  const status =
    format === 'tcg' ? info.ban_tcg :
    format === 'ocg' ? info.ban_ocg :
    info.ban_goat;
  if (status === 'Banned') return 0;
  if (status === 'Limited') return 1;
  if (status === 'Semi-Limited') return 2;
  return MAX_COPIES;
}

export function canAddCard(
  card: YGOCard,
  zone: DeckCard[],
  format: BanFormat = 'tcg',
): boolean {
  const existing = zone.find(dc => dc.card.id === card.id);
  const currentCount = existing?.count ?? 0;
  return currentCount < getCardBanLimit(card, format);
}

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateDeck(
  main: DeckCard[],
  extra: DeckCard[],
  side: DeckCard[],
): ValidationResult {
  const errors: string[] = [];
  const mainCount = main.reduce((s, dc) => s + dc.count, 0);
  const extraCount = extra.reduce((s, dc) => s + dc.count, 0);
  const sideCount = side.reduce((s, dc) => s + dc.count, 0);

  if (mainCount < MIN_MAIN) errors.push(`Main Deck necesita mínimo ${MIN_MAIN} cartas (tiene ${mainCount})`);
  if (mainCount > MAX_MAIN) errors.push(`Main Deck no puede superar ${MAX_MAIN} cartas`);
  if (extraCount > MAX_EXTRA) errors.push(`Extra Deck no puede superar ${MAX_EXTRA} cartas`);
  if (sideCount > MAX_SIDE) errors.push(`Side Deck no puede superar ${MAX_SIDE} cartas`);

  return { valid: errors.length === 0, errors };
}
