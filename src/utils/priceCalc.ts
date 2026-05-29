import type { DeckCard, YGOCard } from '../types/ygo';

export function getCardPrice(card: YGOCard): number {
  const priceStr = card.card_prices?.[0]?.tcgplayer_price ?? '0';
  return parseFloat(priceStr) || 0;
}

export function calcDeckPrice(zone: DeckCard[]): number {
  return zone.reduce((sum, dc) => sum + getCardPrice(dc.card) * dc.count, 0);
}

export function calcTotalDeckPrice(
  main: DeckCard[],
  extra: DeckCard[],
  side: DeckCard[],
): number {
  return calcDeckPrice(main) + calcDeckPrice(extra) + calcDeckPrice(side);
}
